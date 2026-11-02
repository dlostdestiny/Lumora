// Knoten-Inhalte: Quellen, Shop, Ereignisse.
(function (L) {
  const R = () => L.registry;

  // ---- Quelle ----
  function secretFor(run, choice) {
    return (L.encounters.act(run).secrets || []).find((s) => (s.option || 'irrlicht') === choice) || null;
  }
  function springOptions(run, node) {
    const opts = run.mode === 'ohneheilung' ? ['train', 'upgrade'] : ['heal', 'train', 'upgrade'];
    if ((run.curses || []).length) opts.push('purge');
    const a = L.encounters.act(run);
    const isLast = node.layer === a.map.layers - 2;
    for (const s of a.secrets || []) {
      const where = s.at === 'spring' || (s.at === 'lastSpring' && isLast);
      if (where && !run.flags['secret_' + s.id] && L.cond.check(s.condition, { run })) opts.push(s.option || 'irrlicht');
    }
    return opts;
  }

  function spring(run, choice, opts) {
    const p = run.pending;
    if (!p || p.kind !== 'spring') throw new Error('Keine Quelle offen');
    if (p.spring.options.indexOf(choice) < 0) throw new Error('Option nicht verfügbar: ' + choice);
    opts = opts || {};
    const res = { offers: [] };
    if (choice === 'heal') {
      const f = L.curses.mod(run, 'springHeal', L.echo.of(run).springHeal);
      for (const m of run.team) { m.hp = Math.max(m.hp, Math.floor(L.mon.maxHp(m) * f)); m.status = null; }
      run.healedInAct[run.act] = true;
    } else if (choice === 'train') {
      const m = run.team[opts.mon];
      if (!m) throw new Error('Kein Monster gewählt');
      res.offers = L.mon.gainExp(m, L.mon.expForLevel(Math.min(L.config.maxLevel, m.level + 2)) - m.exp);
      p.offers = res.offers.filter((o) => o.kind === 'learn' || o.kind === 'evolve');
    } else if (choice === 'upgrade') {
      const m = run.team[opts.mon];
      const mv = m && m.moves[opts.move];
      if (!mv) throw new Error('Keine Attacke gewählt');
      if (mv.upgrade) throw new Error('Attacke ist schon verbessert');
      if (opts.choice !== 'a' && opts.choice !== 'b') throw new Error('Verbesserung a oder b wählen');
      mv.upgrade = opts.choice;
    } else if (choice === 'purge') {
      const id = opts.curse || run.curses[0];
      if (!L.curses.has(run, id)) throw new Error('Diesen Fluch hast du nicht');
      L.curses.remove(run, id);
    } else if (secretFor(run, choice)) {
      const secret = secretFor(run, choice);
      run.flags['secret_' + secret.id] = true;
      p.kind = 'battle';
      p.secret = secret.id;
      p.battle = L.encounters.fromSpec(run, L.run.rng(run), { team: [{ species: secret.species, levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }, p.layer);
    }
    p.springDone = choice;
    return res;
  }

  // ---- Shop ----
  function shopStock(run, rng) {
    const price = (p) => Math.round(L.curses.mod(run, 'shopPriceMult', p * L.echo.of(run).shopPriceMult) * (L.unlocks && L.unlocks.runHas(run, 'lottes_rabatt') ? 0.9 : 1));
    const stock = [];
    const items = rng.shuffle(L.rewards.ITEM_POOL.concat(L.rewards.HELD_POOL)).slice(0, 4);
    for (const id of items) stock.push({ kind: 'item', id, price: price(R().get('item', id).price), sold: false });
    const relics = rng.shuffle(L.relics.available(run)).slice(0, 2);
    for (const r of relics) stock.push({ kind: 'relic', id: r.id, price: price(r.rarity === 'rare' ? 180 : 120), sold: false });
    const moves = rng.shuffle(R().all('move').filter((m) => !m.hidden && !m.ancient && !m.signature && m.type && m.id !== 'dornenwirbel' && m.id !== 'irrlichtschein')).slice(0, 2);
    for (const m of moves) stock.push({ kind: 'move', id: m.id, price: price(60), sold: false });
    if ((run.curses || []).length) stock.push({ kind: 'purge', id: 'purge', price: price(L.curses.PURGE_PRICE), sold: false });
    return stock;
  }

  function buy(run, index, opts) {
    const p = run.pending;
    if (!p || p.kind !== 'shop') throw new Error('Kein Shop offen');
    const e = p.shop[index];
    if (!e) throw new Error('Unbekannte Ware');
    if (e.sold) throw new Error('Schon verkauft');
    if (run.gold < e.price) throw new Error('Nicht genug Gold');
    if (e.kind === 'item') L.rewards.apply(run, { kind: 'item', item: e.id, count: 1 });
    else if (e.kind === 'relic') L.rewards.apply(run, { kind: 'relic', relic: e.id });
    else if (e.kind === 'purge') {
      const id = (opts && opts.curse) || (run.curses || [])[0];
      if (!L.curses.has(run, id)) throw new Error('Kein Fluch zum Reinigen');
      L.curses.remove(run, id);
    } else if (e.kind === 'move') {
      if (!opts || opts.mon === undefined) throw new Error('Monster für die Schriftrolle wählen');
      L.rewards.apply(run, { kind: 'move', move: e.id }, opts);
    }
    run.gold -= e.price;
    e.sold = true;
  }

  // ---- Ereignisse ----
  function optionAvailable(run, eventId, index, now) {
    const o = R().get('event', eventId).options[index];
    return !!o && L.cond.check(o.condition, { run, now });
  }

  function event(run, eventId, index, now) {
    const p = run.pending;
    if (!p || p.kind !== 'event') throw new Error('Kein Ereignis offen');
    if (p.eventDone) throw new Error('Ereignis ist schon erledigt');
    if (!optionAvailable(run, eventId, index, now)) throw new Error('Option nicht verfügbar');
    const ev = R().get('event', eventId);
    const r = L.run.rng(run);
    const res = { texts: [], battle: null, offers: [] };
    const level = L.encounters.levelAt(run, p.layer);
    const alive = () => run.team.filter((m) => m.hp > 0);
    const api = {
      run, rng: r, level,
      text: (t) => res.texts.push(t),
      heal: (f) => { for (const m of alive()) L.mon.heal(m, f); },
      damageTeam: (f) => { for (const m of alive()) m.hp = Math.max(1, m.hp - Math.floor(L.mon.maxHp(m) * f)); },
      gold: (d) => { run.gold = Math.max(0, run.gold + d); },
      item: (id, n) => { run.items[id] = (run.items[id] || 0) + (n || 1); },
      relic: (id) => {
        let rid = id;
        if (id === 'random') {
          const pool = L.relics.available(run);
          if (!pool.length) { run.gold += 50; return '50 Gold'; }
          rid = r.pick(pool).id;
        }
        if (run.relics.indexOf(rid) < 0) run.relics.push(rid);
        return R().get('relic', rid).name;
      },
      addMon: (species, lv) => {
        // Stellio (wahres Ende) schließt sich in jedem Herausforderungs-Modus an
        if (species !== 'stellio' && (!L.modes.allows(run, species) || run.teamSize <= 1)) { run.gold += 40; res.texts.push('(Herausforderung: Es kann sich nicht anschließen. Du bekommst 40 Gold.)'); return; }
        const mon = L.encounters.makeMon(run, r, species, Math.max(1, lv), {});
        if (run.team.length >= run.teamSize) p.release = mon;
        else run.team.push(mon);
        res.newMon = mon;
      },
      battle: (spec) => {
        p.kind = 'battle';
        p.battle = L.encounters.fromSpec(run, r, spec, p.layer);
        res.battle = p.battle;
      },
      teachMove: (moveId) => { res.offers.push({ kind: 'teach', move: moveId }); },
      bond: (d) => { for (const m of run.team) m.bond = Math.min(100, m.bond + d); },
      poisonFirst: () => { const m = alive()[0]; if (m && !m.status) m.status = 'gift'; },
      burnFirst: () => { const m = alive()[0]; if (m && !m.status) m.status = 'brand'; },
      crystals: (n) => { run.crystals += n; },
      removeWeakest: () => {
        if (run.team.length <= 1) return null;
        let w = 1;
        for (let i = 2; i < run.team.length; i++) if (run.team[i].level < run.team[w].level) w = i;
        const mon = run.team[w];
        L.run.removeFromTeam(run, w);
        return R().get('species', mon.species).name;
      },
      removeRelic: () => {
        if (!run.relics.length) return null;
        const id = r.pick(run.relics);
        run.relics = run.relics.filter((x) => x !== id);
        return R().get('relic', id).name;
      },
      rareMonster: (lv) => {
        const pool = L.encounters.variant(run).encounters.filter((e) => !e.condition && ['rare', 'veryRare'].indexOf(R().get('species', e.species).rarity) >= 0);
        const all = pool.length ? pool : L.encounters.variant(run).encounters.filter((e) => !e.condition);
        const sp = r.weighted(all).species;
        api.addMon(sp, lv);
        return R().get('species', sp).name;
      },
      // Wetter auf dem Rest der Karte ändern (null = klar)
      upcomingWeather: (id) => {
        const from = p.layer + 1, top = run.map.layers - 2;
        run.map.weather = (run.map.weather || []).filter((z) => z.to < from);
        for (const n of Object.values(run.map.nodes)) if (n.layer >= from && n.layer <= top) { if (id) n.data.weather = id; else delete n.data.weather; }
        if (id && from <= top) run.map.weather.push({ from, to: top, weather: id });
      },
      egg: () => { const e = L.eggs.roll(run, r); run.eggs = (run.eggs || []).concat([e]); return e; },
      fragment: (prefix) => { const id = prefix + run.act; if (L.fragments.find(run, id)) p.fragment = id; },
      trainFirst: (levels) => {
        const m = alive()[0];
        if (m) res.offers.push(...L.mon.gainExp(m, L.mon.expForLevel(Math.min(L.config.maxLevel, m.level + levels)) - m.exp));
      },
      flag: (id) => { run.flags[id] = true; },
      rareRelic: () => {
        const pool = L.relics.available(run).filter((x) => x.rarity === 'rare');
        if (!pool.length) return api.relic('random');
        const rel = r.pick(pool);
        run.relics.push(rel.id);
        return rel.name;
      },
      curse: (id) => {
        const cid = id === 'random' ? L.curses.random(run, r) : id;
        if (!cid) return null;
        L.curses.add(run, cid);
        return R().get('curse', cid).name;
      },
      purge: () => { const c = (run.curses || [])[0]; if (!c) return null; L.curses.remove(run, c); return R().get('curse', c).name; },
    };
    ev.options[index].effect(api);
    p.eventDone = true;
    run.stats.events = (run.stats.events || 0) + 1;
    p.eventResult = { texts: res.texts, option: index };
    p.offers = res.offers.filter((o) => o.kind === 'learn' || o.kind === 'evolve' || o.kind === 'teach');
    return res;
  }

  L.nodes = { secretFor, springOptions, spring, shopStock, buy, event, optionAvailable };
})(globalThis.LUM);
