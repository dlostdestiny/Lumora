// Ein Lauf: Team, Items, Gold, Karte, Position. Reines JSON, wird nach jedem Schritt gespeichert.
(function (L) {
  const R = () => L.registry;

  function acts() { return R().all('act').filter((a) => !a.side).sort((a, b) => a.order - b.order); }

  // Zufall, der seinen Zustand im Lauf mitschreibt (wichtig fürs Speichern).
  function rng(run) {
    const r = L.rng.create(1);
    r.setState(run.rngState);
    const next = r.next;
    r.next = function () {
      r.setState(run.rngState);
      const v = next();
      run.rngState = r.getState();
      return v;
    };
    return r;
  }

  function startAct(run) {
    const a = run.sideAct ? R().get('act', run.sideAct) : acts()[run.actIndex];
    const r = rng(run);
    run.act = a.id;
    run.variant = r.pick(a.variants).id;
    run.map = L.mapgen.generate(a, a.variants.find((v) => v.id === run.variant), r);
    run.position = null;
    run.visited = [];
    // Ereignisse vorab verteilen, damit der Kompass sie zeigen kann und Neuladen nichts ändert.
    const v = L.encounters.variant(run);
    const evIds = v.events.filter((id) => {
      const e = R().get('event', id);
      if (e.condition && !L.cond.check(e.condition, { run })) return false;
      if (e.rare && !r.chance(e.rare)) return false;
      return !e.variants || e.variants.indexOf(run.variant) >= 0;
    });
    let pool = r.shuffle(evIds);
    for (const n of Object.values(run.map.nodes).sort((x, y) => x.layer - y.layer || x.col - y.col)) {
      if (n.kind !== 'event') continue;
      if (!pool.length) pool = r.shuffle(evIds);
      n.data.event = pool.shift();
    }
    // Wetterzonen: Ebenen-Bänder mit eigenem Wetter (Kämpfe dort beginnen mit diesem Wetter)
    run.map.weather = [];
    const wpool = a.weatherPool || [];
    const top = a.map.layers - 2;
    for (let from = 1; from <= top && wpool.length; from += 3) {
      if (!r.chance(L.config.weatherZoneChance)) continue;
      const to = Math.min(top, from + 2);
      const id = r.pick(wpool);
      run.map.weather.push({ from, to, weather: id });
      for (const n of Object.values(run.map.nodes)) if (n.layer >= from && n.layer <= to) n.data.weather = id;
    }
    // Nebenaufträge: 1 aus 3 zu Beginn des Akts
    if (L.quests) run.questOffer = L.quests.offer(run, r);
  }

  function create(o) {
    const meta = o.meta || null;
    const seed = o.seed !== undefined ? o.seed : String(Date.now());
    const run = {
      version: 1,
      seed,
      rngState: L.rng.create(seed).getState(),
      number: (meta ? meta.runs : 0) + 1,
      starter: o.starter,
      blessing: o.blessing || null,
      echo: o.echo || 0,
      actIndex: 0, act: null, variant: null, map: null, position: null, visited: [],
      team: [], items: { fangkugel: 3, heiltrank: 2 }, relics: [], gold: 50, crystals: 0,
      teamSize: L.config.teamSize,
      flags: {}, healedInAct: {}, pending: null, finished: null,
      unlocks: o.unlocks !== undefined ? o.unlocks.slice() : (L.unlocks ? L.unlocks.forRun(meta) : []),
      curses: [], quests: [], questOffer: null, daily: o.daily || null, mode: o.mode || null, eggs: [], path: o.path || null,
      talents: o.talents !== undefined ? o.talents.slice() : (L.rank ? L.rank.forRun(meta) : []),
      rank: o.rank !== undefined ? o.rank : (meta && L.rank ? L.rank.level(meta) : 1),
      knownFragments: meta ? (meta.fragments || []).slice() : [], foundFragments: [],
      mastery: L.mastery && meta ? L.mastery.forRun(meta) : {},
      ghosts: meta && !o.daily ? (meta.ghosts || []).slice(-6) : [], ghostsUsed: [],
      stats: { battlesWon: 0, caught: [], shinies: 0, startedAt: o.now ? o.now.getTime() : 0 },
    };
    const r = rng(run);
    const bless = run.blessing ? R().get('blessing', run.blessing) : null;
    const level = 5 + ((bless && bless.starterLevelBonus) || 0);
    run.team.push(L.mon.create({ species: o.starter, level, rng: r }));
    if (L.mastery) run.team[0].bond = Math.max(run.team[0].bond || 0, L.mastery.startBond(run, o.starter));
    if (bless && bless.apply) bless.apply(run, r);
    if (L.unlocks) L.unlocks.applyPerks(run);
    if (L.rank) L.rank.applyStart(run);
    const path = L.paths && L.paths.of(run.path);
    if (path && path.start) path.start(run);
    if (L.companions && o.companion !== false && !o.daily && o.mode !== 'solo') {
      const comp = L.companions.forRun(meta, r);
      if (comp && L.modes.allows(run, comp.mon.species)) { run.team.push(comp.mon); run.companionKind = comp.kind; }
    }
    const mode = L.modes && L.modes.of(run);
    if (mode && mode.apply) mode.apply(run);
    const em = L.echo.of(run);
    if (em.startItemsMinus) for (const id of ['fangkugel', 'heiltrank']) run.items[id] = Math.max(0, run.items[id] - em.startItemsMinus);
    if (em.startRareRelic) {
      const pool = L.relics.available(run).filter((x) => x.rarity === 'rare');
      if (pool.length) run.relics.push(r.pick(pool).id);
    }
    startAct(run);
    return run;
  }

  function choices(run) {
    if (run.pending || run.finished) return [];
    if (!run.position) return run.map.start.slice();
    return run.map.nodes[run.position].links.slice();
  }

  function enter(run, nodeId, now) {
    if (choices(run).indexOf(nodeId) < 0) throw new Error('Knoten ist nicht offen: ' + nodeId);
    const node = run.map.nodes[nodeId];
    const r = rng(run);
    const p = { node: nodeId, kind: node.kind, layer: node.layer };
    const E = L.encounters;
    switch (node.kind) {
      case 'battle': p.battle = E.wildSetup(run, r, now, node.layer, { weather: node.data.weather }); break;
      case 'elite': p.battle = node.data.double ? E.doubleElite(run, r, node.layer) : E.elite(run, r, node.layer); break;
      case 'rival': p.battle = E.rival(run, r, node.layer); break;
      case 'boss': p.battle = E.boss(run, r); break;
      case 'arena': p.arenaRound = 0; p.battle = E.arena(run, r, node.layer, 0); break;
      case 'spring': p.spring = { options: L.nodes.springOptions(run, node) }; break;
      case 'shop': p.shop = L.nodes.shopStock(run, r); break;
      case 'event': p.event = node.data.event; break;
      case 'hidden': {
        const a = E.act(run);
        if (L.fragments && L.fragments.find(run, 'hid_' + run.act)) p.fragment = 'hid_' + run.act;
        if (r.chance(0.5)) {
          const e = r.weighted(a.hidden.encounters.filter((x) => L.cond.check(x.condition, { run })));
          p.battle = E.wildSetup(run, r, now, node.layer, { species: e.species, levelOffset: 2, shinyFactor: 5, rewardSource: 'hidden' });
        } else {
          p.rewards = L.rewards.roll(run, 'hidden', r, node.layer);
        }
        break;
      }
      default: throw new Error('Unbekannte Knotenart ' + node.kind);
    }
    if (p.battle && node.data.weather) p.battle.weather = node.data.weather;
    run.pending = p;
    return p;
  }

  function makeBattle(run, now) {
    const setup = run.pending && run.pending.battle;
    if (!setup) throw new Error('Kein Kampf offen');
    const enemyTeam = JSON.parse(JSON.stringify(setup.team));
    const battle = L.battle.create({
      player: { team: run.team, items: run.items, relics: run.relics, curses: run.curses || [], talents: run.talents || [], unlocks: run.unlocks || [], path: run.path || null, blessing: run.blessing },
      enemy: { team: enemyTeam, kind: setup.kind, trainer: setup.trainer, affixes: setup.affixes, phases: setup.phases, items: Object.assign({}, setup.items) },
      weather: setup.weather,
      doubles: !!setup.double,
      rng: L.rng.create(rng(run).int(1, 2147483646)),
      run,
      now,
    });
    battle.setup = setup;
    return battle;
  }

  function teamHandlers(run, name) {
    return L.battle.teamHandlers({ team: run.team, relics: run.relics, curses: run.curses || [], talents: run.talents || [], unlocks: run.unlocks || [], path: run.path || null, blessing: run.blessing }, name);
  }

  function resolveBattle(run, battle, meta) {
    const setup = battle.setup || run.pending.battle;
    const r = rng(run);
    const summary = { result: battle.result, gold: 0, crystals: 0, exp: {}, offers: [], captured: null, pendingRelease: false, firstCatch: false };
    for (const m of battle.sides[1].team) if (meta && L.progress && !m.clone) L.progress.seen(meta, m);
    for (const m of run.team) delete m._types;
    // Status und Kampf-Flags der eigenen Monster bleiben, flüchtige Werte sind ohnehin weg.
    if (battle.result === 'lost') {
      run.finished = 'defeat';
      run.stats.lostTo = { kind: setup.kind, name: setup.trainerName || null, species: (battle.sides[1].team[battle.sides[1].active] || battle.sides[1].team[0]).species, layer: run.pending.layer, act: run.act };
      run.pending.battleDone = true;
      return summary;
    }
    const src = setup.rewardSource;
    let baseGold = src === 'boss' ? 100 : src === 'elite' ? r.int(40, 60) : r.int(15, 25);
    if (setup.double) baseGold = Math.floor(baseGold * L.config.doubleEliteGold);
    summary.gold = Math.floor(L.hooks.run(teamHandlers(run, 'modifyGold'), 'modifyGold', { run }, baseGold) * L.echo.of(run).goldMult);
    const baseCrystals = src === 'boss' ? 10 : src === 'elite' ? (setup.double ? 6 : 3) : 1;
    summary.crystals = Math.floor(L.hooks.run(teamHandlers(run, 'modifyCrystals'), 'modifyCrystals', { run }, baseCrystals));

    const rw = L.battle.rewards(battle);
    summary.exp = rw.exp;
    for (const m of run.team) if (rw.exp[m.uid]) summary.offers.push(...L.mon.gainExp(m, rw.exp[m.uid]));

    const healFrac = L.hooks.run(teamHandlers(run, 'modifyHealAfterBattle'), 'modifyHealAfterBattle', { run }, L.echo.of(run).postBattleHeal === null ? L.config.postBattleHeal : L.echo.of(run).postBattleHeal);
    const inArena = run.pending.kind === 'arena' && (run.pending.arenaRound || 0) < L.config.arenaRounds - 1;
    if (healFrac > 0 && run.mode !== 'ohneheilung' && !inArena) for (const m of run.team) if (m.hp > 0) L.mon.heal(m, healFrac);

    if (battle.result === 'captured' && battle.captured) {
      const mon = battle.captured;
      while (run.team.some((m) => m.uid === mon.uid)) mon.uid = 'm' + r.int(100000, 999999) + r.int(100, 999);
      mon.bond = L.mastery ? L.mastery.startBond(run, mon.species) : 0;
      summary.captured = mon;
      run.stats.caught.push(mon.species);
      if (mon.shiny) run.stats.shinies++;
      if (meta && L.progress) {
        const c = L.progress.caught(meta, mon);
        summary.firstCatch = c.firstCatch;
        L.progress.track(meta, 'caught');
        if (mon.shiny) L.progress.track(meta, 'shinyCaught');
        if (c.firstCatch) summary.crystals += 5;
        if (c.firstShiny) summary.crystals += 15;
      }
      if (run.team.length >= run.teamSize) {
        summary.pendingRelease = true;
        run.pending.release = mon;
      } else run.team.push(mon);
    }
    run.gold += summary.gold;
    run.crystals += summary.crystals;
    run.stats.battlesWon++;
    run.stats.goldEarned = (run.stats.goldEarned || 0) + summary.gold;
    if (setup.kind === 'elite') run.stats.elites = (run.stats.elites || 0) + 1;
    if (setup.ghost) run.stats.ghosts = (run.stats.ghosts || 0) + 1;
    if (setup.double) run.stats.doubles = (run.stats.doubles || 0) + 1;
    if (!run.team.some((m) => m.hp <= 0)) run.stats.flawless = (run.stats.flawless || 0) + 1;
    if ((run.curses || []).length) run.stats.cursedWins = (run.stats.cursedWins || 0) + 1;
    if (meta && L.progress) L.progress.track(meta, 'battlesWon');
    if (setup.kind === 'boss') run.flags['boss_' + run.act] = true;
    if (setup.kind === 'boss' && setup.trainer) run.stats.bossTrainers = (run.stats.bossTrainers || []).concat([setup.trainer]);
    if (setup.kind === 'boss' && !run.flags.finale && L.fragments && L.fragments.find(run, 'boss_' + run.act)) run.pending.fragment = 'boss_' + run.act;
    run.pending.battleDone = true;
    run.pending.summary = { gold: summary.gold, crystals: summary.crystals };
    run.pending.offers = summary.offers.filter((o) => o.kind === 'learn' || o.kind === 'evolve');
    if (setup.kind !== 'boss') run.pending.rewards = L.rewards.roll(run, src, r, run.pending.layer);
    if (run.pending.kind === 'arena') {
      const p = run.pending;
      p.arenaRound = (p.arenaRound || 0) + 1;
      if (p.arenaRound < L.config.arenaRounds) {
        // Nächste Runde direkt hinterher
        p.battle = L.encounters.arena(run, r, p.layer, p.arenaRound);
        p.battleDone = false;
        p.introDone = true;
        delete p.rewards;
        summary.arenaNext = p.arenaRound + 1;
      } else {
        run.gold += 80;
        summary.gold += 80;
        p.rewards = [L.rewards.roll(run, 'boss', r, p.layer)[0]].concat(L.rewards.roll(run, 'elite', r, p.layer).slice(0, 2));
        run.stats.arenas = (run.stats.arenas || 0) + 1;
      }
    }
    return summary;
  }

  // Neues Monster bei vollem Team: index = Platz, der ersetzt wird; null = neues Monster freilassen.
  function release(run, index) {
    const mon = run.pending && run.pending.release;
    if (!mon) return;
    if (index !== null && index !== undefined) {
      returnHeld(run, run.team[index]);
      run.team[index] = mon;
    }
    run.pending.release = null;
  }

  // Getragenes Item kommt beim Freilassen zurück in die Tasche.
  function returnHeld(run, mon) {
    if (mon && mon.held) {
      run.items[mon.held] = (run.items[mon.held] || 0) + 1;
      mon.held = null;
    }
  }

  function removeFromTeam(run, index) {
    returnHeld(run, run.team[index]);
    run.team.splice(index, 1);
  }

  function complete(run) {
    const p = run.pending;
    if (!p) throw new Error('Kein offener Knoten');
    run.position = p.node;
    run.visited.push(p.node);
    run.pending = null;
    const quests = L.quests ? L.quests.check(run) : [];
    if (quests.length) run.questsDone = (run.questsDone || []).concat(quests.map((x) => x.quest.id));
    if (p.kind === 'boss' && run.sideAct === 'act4') {
      // Vael besiegt: Der Ursprung des Schleiers ist gelöst, der Lauf ist gewonnen
      run.flags.jenseits = true;
      run.finished = 'victory';
      return { actChanged: false, victory: true, quests };
    }
    if (p.kind === 'boss' && p.node === 'FINALE') {
      run.flags.trueEnd = true;
      if (run.mode === 'jenseits') {
        // Ardan-Szenen hängen an runFlag 'finale' und sollen in Akt 4 nicht noch einmal laufen
        run.flags.finale = false;
        run.flags.finaleDone = true;
        return Object.assign(enterAct4(run), { quests });
      }
      run.finished = 'victory';
      return { actChanged: false, victory: true, trueEnd: true, quests };
    }
    if (p.kind === 'boss' && run.actIndex === acts().length - 1 && run.team.some((m) => m.species === 'stellio') && !run.flags.finale) {
      run.flags.finale = true;
      for (const m of run.team) { m.hp = L.mon.maxHp(m); m.status = null; }
      run.pending = { node: 'FINALE', kind: 'boss', layer: p.layer + 1, battle: L.encounters.finale(run, rng(run)) };
      return { actChanged: false, victory: false, finale: true, quests };
    }
    if (p.kind === 'boss' && run.mode === 'jenseits' && !run.sideAct && run.actIndex === acts().length - 1) return Object.assign(enterAct4(run), { quests });
    if (p.kind === 'boss' && run.mode === 'turm') {
      run.tower.block++;
      run.sideLevelBonus = (run.tower.block - 1) * 6;
      run.flags = Object.assign({}, run.flags);
      startAct(run);
      for (const m of run.team) if (m.hp > 0) m.hp = Math.min(L.mon.maxHp(m), m.hp + Math.floor(L.mon.maxHp(m) * 0.5));
      return { actChanged: true, victory: false, quests };
    }
    if (p.kind === 'boss' && run.sideAct) {
      // Nebenakt geschafft: zurück in den Hauptlauf
      run.flags.nebenaktDone = true;
      if (run.relics.indexOf('perle_der_tiefe') < 0) run.relics.push('perle_der_tiefe');
      run.sideAct = null;
      run.sideLevelBonus = 0;
      startAct(run);
      for (const m of run.team) { m.hp = L.mon.maxHp(m); m.status = null; }
      return { actChanged: true, victory: false, quests };
    }
    if (p.kind === 'boss' && run.flags.nebenakt && !run.flags.nebenaktDone && run.actIndex < acts().length - 1) {
      // In den Nebenakt: Gegner passend zum Fortschritt
      run.actIndex++;
      run.sideAct = 'tiefe';
      run.sideLevelBonus = run.actIndex >= 2 ? 9 : 0;
      startAct(run);
      for (const m of run.team) { m.hp = L.mon.maxHp(m); m.status = null; }
      return { actChanged: true, victory: false, quests };
    }
    if (p.kind === 'boss') {
      const list = acts();
      run.actIndex++;
      if (run.actIndex >= list.length) {
        run.finished = 'victory';
        return { actChanged: false, victory: true, quests };
      }
      startAct(run);
      for (const m of run.team) { m.hp = L.mon.maxHp(m); m.status = null; }
      return { actChanged: true, victory: false, quests };
    }
    return { actChanged: false, victory: false, quests };
  }

  // Modus „Jenseits des Schleiers“: Nach dem letzten Haupt-Akt folgt Akt 4 (actIndex bleibt beim letzten Haupt-Akt).
  function enterAct4(run) {
    run.sideAct = 'act4';
    run.sideLevelBonus = 0;
    startAct(run);
    for (const m of run.team) { m.hp = L.mon.maxHp(m); m.status = null; }
    return { actChanged: true, victory: false };
  }

  // Nach dem Neuladen: Ein offener, nicht beendeter Kampf beginnt von vorn (pending bleibt).
  function resume(run) {
    if (run.pending && run.pending.battle && !run.pending.battleDone) return { restartBattle: true };
    return { restartBattle: false };
  }

  L.run = { create, rng, choices, enter, makeBattle, resolveBattle, release, removeFromTeam, complete, resume, startAct, acts, teamHandlers };
})(globalThis.LUM);
