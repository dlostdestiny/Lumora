// Belohnungen nach Kämpfen: 1 aus 3 (bzw. 4 mit Weitblick) wählen.
(function (L) {
  const R = () => L.registry;
  const ITEM_POOL = ['heiltrank', 'superheiltrank', 'allheiler', 'beleber', 'fangkugel', 'superkugel', 'eisbonbon'];
  const HELD_POOL = ['glutfeder', 'tropfenperle', 'blattbrosche', 'funkenring', 'kieselschale', 'schattenschleier', 'beerenbeutel', 'frostkristall', 'windfeder', 'magnetkern', 'fokusband', 'kraftband', 'schutzweste', 'flinkschuh', 'scharfklaue', 'lebensorb'];

  function scrollPool() {
    return R().all('move').filter((m) => !m.hidden && !m.ancient && !m.signature && m.type && m.id !== 'dornenwirbel' && m.id !== 'irrlichtschein');
  }
  function relicPool(run, taken, rarity) {
    return L.relics.available(run, taken).filter((r) => !rarity || r.rarity === rarity);
  }

  function make(kind, run, rng, taken, layer) {
    switch (kind) {
      case 'gold': return { kind: 'gold', amount: rng.int(20, 40) };
      case 'item': { const id = rng.pick(ITEM_POOL); return { kind: 'item', item: id, count: id === 'fangkugel' ? 2 : 1 }; }
      case 'held': return { kind: 'item', item: rng.pick(HELD_POOL), count: 1 };
      case 'move': {
        const pool = scrollPool().filter((m) => taken.indexOf(m.id) < 0);
        const m = rng.pick(pool);
        taken.push(m.id);
        return { kind: 'move', move: m.id };
      }
      case 'relic': case 'rareRelic': {
        let pool = relicPool(run, taken, kind === 'rareRelic' ? 'rare' : null);
        if (!pool.length) pool = relicPool(run, taken, null);
        if (!pool.length) return { kind: 'gold', amount: 60 };
        const r = rng.pick(pool);
        taken.push(r.id);
        return { kind: 'relic', relic: r.id };
      }
      case 'monster': {
        const v = L.encounters.variant(run);
        const pool = v.encounters.filter((e) => !e.condition && taken.indexOf(e.species) < 0 && L.modes.allows(run, e.species));
        if (!pool.length || run.mode === 'solo') return make('gold', run, rng, taken, layer);
        const e = rng.weighted(pool);
        taken.push(e.species);
        return { kind: 'monster', species: e.species, level: L.encounters.levelAt(run, layer || 0) };
      }
      case 'egg': {
        if (taken.indexOf('egg') >= 0) return make('gold', run, rng, taken, layer);
        taken.push('egg');
        return { kind: 'egg', egg: L.eggs.roll(run, rng) };
      }
      case 'cursed': {
        let pool = relicPool(run, taken, 'rare');
        if (!pool.length) pool = relicPool(run, taken, null);
        const curse = L.curses.random(run, rng);
        if (!pool.length || !curse) return make('gold', run, rng, taken, layer);
        const rel = rng.pick(pool);
        taken.push(rel.id);
        return { kind: 'cursed', relic: rel.id, curse };
      }
      case 'hiddenMonster': {
        const e = rng.weighted(L.encounters.act(run).hidden.encounters.filter((x) => R().get('species', x.species).rarity !== 'unique' && L.cond.check(x.condition, { run })));
        return { kind: 'monster', species: e.species, level: L.encounters.levelAt(run, layer || 0) + 2 };
      }
    }
    throw new Error('Unbekannte Belohnung ' + kind);
  }

  const WEIGHTS = {
    battle: [['gold', 30], ['item', 30], ['move', 25], ['monster', 15], ['cursed', 6], ['egg', 5]],
    elite: [['relic', 40], ['move', 30], ['monster', 30], ['cursed', 14], ['egg', 12]],
  };

  function roll(run, source, rng, layer) {
    const taken = [];
    if (source === 'boss') return [0, 1, 2].map(() => make('rareRelic', run, rng, taken, layer));
    if (source === 'hidden') return [make('hiddenMonster', run, rng, taken, layer), make('rareRelic', run, rng, taken, layer), make('held', run, rng, taken, layer)];
    let count = 3;
    if (run.blessing && R().has('blessing', run.blessing)) count = R().get('blessing', run.blessing).rewardChoices || 3;
    count += L.echo.of(run).extraRewards;
    const out = [];
    const used = {};
    for (let i = 0; i < count; i++) {
      const options = WEIGHTS[source].map(([k, w]) => ({ k, weight: used[k] && k !== 'move' ? w / 4 : w }));
      const k = rng.weighted(options).k;
      used[k] = true;
      out.push(make(k, run, rng, taken, layer));
    }
    return out;
  }

  // Wendet eine Belohnung an. opts: { mon: Team-Index, replaceIndex } für Schriftrollen.
  function apply(run, reward, opts) {
    opts = opts || {};
    const res = { pendingRelease: null, offers: [] };
    switch (reward.kind) {
      case 'gold': run.gold += reward.amount; break;
      case 'item': run.items[reward.item] = (run.items[reward.item] || 0) + (reward.count || 1); break;
      case 'relic': if (run.relics.indexOf(reward.relic) < 0) run.relics.push(reward.relic); break;
      case 'egg':
        run.eggs = (run.eggs || []).concat([reward.egg]);
        break;
      case 'cursed':
        if (run.relics.indexOf(reward.relic) < 0) run.relics.push(reward.relic);
        L.curses.add(run, reward.curse);
        break;
      case 'move': {
        const m = run.team[opts.mon];
        if (!m) throw new Error('Kein Monster gewählt');
        if (m.moves.some((x) => x.id === reward.move)) throw new Error('Kennt die Attacke schon');
        L.mon.learn(m, reward.move, m.moves.length < 4 ? null : opts.replaceIndex);
        break;
      }
      case 'monster': {
        const mon = L.encounters.makeMon(run, L.run.rng(run), reward.species, reward.level, {});
        if (run.team.length >= run.teamSize) res.pendingRelease = mon;
        else run.team.push(mon);
        res.mon = mon;
        break;
      }
      default: throw new Error('Unbekannte Belohnung ' + reward.kind);
    }
    return res;
  }

  L.rewards = { roll, apply, ITEM_POOL, HELD_POOL };
})(globalThis.LUM);
