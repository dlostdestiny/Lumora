describe('sets, curses, shop, quests, daily, weather', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const fresh = () => L.save.freshMeta();
  const newRun = (seed, extra) => L.run.create(Object.assign({ seed, starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day }, extra || {}));

  it('relic set becomes active only with all pieces', () => {
    assert.eq(L.relicSets.active(['heilmoos', 'ersthelfer']).length, 0);
    assert.eq(L.relicSets.active(['heilmoos', 'ersthelfer', 'rindenschild']).map((s) => s.id), ['waldhueter']);
  });
  it('active set hooks reach the battle', () => {
    const b = TH.battle([TH.mon('glimmi', 10)], [TH.mon('moosling', 10)]);
    b.sides[0].relics = ['schaerfstein', 'typprisma', 'jagdhorn'];
    assert.ok(L.battle.handlers(b, 0).some((h) => h.source === 'set'));
  });
  it('locked set relics only appear after unlock', () => {
    const run = newRun('s1');
    assert.ok(L.relics.available(run).every((r) => r.id !== 'jagdhorn'));
    run.unlocks = ['set_jaeger'];
    assert.ok(L.relics.available(run).some((r) => r.id === 'jagdhorn'));
  });
  it('curse hooks hurt the player and can be purged at a spring', () => {
    const run = newRun('c1');
    L.curses.add(run, 'vergessen');
    assert.ok(L.run.teamHandlers(run, 'modifyExp').some((h) => h.source === 'curse'));
    run.pending = { kind: 'spring', spring: { options: L.nodes.springOptions(run, { layer: 2 }) }, layer: 2 };
    assert.ok(run.pending.spring.options.indexOf('purge') >= 0);
    L.nodes.spring(run, 'purge', { curse: 'vergessen' });
    assert.eq(run.curses, []);
  });
  it('curses change shop prices', () => {
    const run = newRun('c2');
    assert.eq(L.curses.mod(run, 'shopPriceMult', 100), 100);
    L.curses.add(run, 'wucherpreise');
    assert.eq(Math.round(L.curses.mod(run, 'shopPriceMult', 100)), 140);
  });
  it('fluchbrecher blessing blocks curses', () => {
    const run = newRun('c3', { blessing: 'fluchbrecher', unlocks: ['segen_fluchbrecher'] });
    L.curses.add(run, 'ruhelos');
    assert.eq(run.curses, []);
  });
  it('crystal shop: cost, requirement, perks on new run', () => {
    const m = fresh();
    m.crystals = 100;
    assert.ok(/Sparschwein/.test(L.unlocks.blocker(m, 'lottes_rabatt')));
    L.unlocks.buy(m, 'rucksack');
    assert.eq(m.crystals, 40);
    assert.ok(L.unlocks.blocker(m, 'rucksack'));
    const run = L.run.create({ seed: 'u1', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    assert.eq(run.items.fangkugel, 4);
  });
  it('unlocked starters and blessings are offered', () => {
    const m = fresh();
    assert.eq(L.unlocks.starters(m), ['glimmi', 'plitsch', 'knospi']);
    m.unlocks.starter_lumini = 1;
    assert.ok(L.unlocks.starters(m).indexOf('lumini') >= 0);
    assert.ok(L.unlocks.blessings([]).every((b) => !b.unlock));
    assert.ok(L.unlocks.blessings(['segen_reliktfund']).some((b) => b.id === 'reliktfund'));
  });
  it('each act offers three quests; progress counts from acceptance', () => {
    const run = newRun('q1');
    assert.eq(run.questOffer.length, 3);
    run.questOffer = ['kampfgeist'];
    run.stats.battlesWon = 2;
    L.quests.accept(run, 'kampfgeist');
    assert.eq(L.quests.progress(run, run.quests[0]), 0);
    run.stats.battlesWon = 8;
    const gold = run.gold;
    assert.eq(L.quests.check(run).length, 1);
    assert.ok(run.gold > gold && run.quests[0].done);
    assert.eq(L.quests.check(run), []);
  });
  it('daily setup is the same for everybody on a day', () => {
    assert.eq(JSON.stringify(L.daily.setup('2026-11-01')), JSON.stringify(L.daily.setup('2026-11-01')));
    const run = L.daily.createRun('2026-11-01', fresh(), day);
    assert.eq(run.daily, '2026-11-01');
    assert.eq(run.unlocks, []);
    assert.ok(run.curses.length >= 1);
  });
  it('only the first daily attempt counts', () => {
    const m = fresh();
    const run = L.daily.createRun('2026-11-01', m, day);
    run.finished = 'defeat';
    assert.eq(L.daily.record(m, run), 15);
    assert.eq(L.daily.record(m, run), 0);
    assert.ok(L.daily.played(m, '2026-11-01'));
    assert.eq(L.daily.streak(m, day), 1);
  });
  it('a discarded daily run counts as a defeat (no second first try)', () => {
    const m = fresh();
    const run = L.daily.createRun('2026-11-01', m, day);
    L.daily.abandon(m, run);
    assert.ok(L.daily.played(m, '2026-11-01'));
    assert.eq(m.daily['2026-11-01'].result, 'defeat');
    assert.eq(m.runs, 1);
    const again = L.daily.createRun('2026-11-01', m, day);
    again.finished = 'victory';
    assert.eq(L.daily.record(m, again), 0);
  });
  it('discarding a normal or already finished run changes nothing', () => {
    const m = fresh();
    L.daily.abandon(m, newRun('ab1'));
    L.daily.abandon(m, null);
    assert.eq(m.runs, 0);
    assert.eq(Object.keys(m.daily), []);
  });
  it('chronicle keeps finished runs, newest first', () => {
    const m = fresh();
    for (let i = 0; i < 3; i++) { const run = newRun('ch' + i); run.finished = 'defeat'; L.progress.finishRun(m, run); }
    assert.eq(m.chronicle.length, 3);
    assert.eq(m.chronicle[0].seed, 'ch2');
  });
  it('weather zones set node weather', () => {
    let found = null;
    for (let i = 0; i < 20 && !found; i++) { const run = newRun('w' + i); if (run.map.weather.length) found = run; }
    assert.ok(found, 'kein Lauf mit Wetter');
    const zone = found.map.weather[0];
    const node = Object.values(found.map.nodes).find((n) => n.layer === zone.from);
    assert.eq(node.data.weather, zone.weather);
  });
});

describe('challenge modes', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const mk = (mode, blessing) => L.run.create({ seed: 'm' + mode, starter: 'glimmi', blessing: blessing || 'goldbeutel', meta: null, now: day, mode });
  it('solo keeps only the starter', () => {
    const run = mk('solo', 'zweiter_gefaehrte');
    assert.eq(run.teamSize, 1);
    assert.eq(run.team.length, 1);
  });
  it('one type blocks catching other types', () => {
    const run = mk('monotyp');
    assert.ok(L.modes.allows(run, 'glutaro'));
    assert.ok(!L.modes.allows(run, 'tropfling'));
  });
  it('no healing removes resting at springs', () => {
    const run = mk('ohneheilung');
    assert.ok(L.nodes.springOptions(run, { layer: 3 }).indexOf('heal') < 0);
  });
  it('modes pay more crystals', () => {
    const m = L.save.freshMeta(), m2 = L.save.freshMeta();
    const a = mk(null), b = mk('solo');
    a.crystals = b.crystals = 20; a.finished = b.finished = 'defeat';
    assert.ok(L.progress.finishRun(m2, b).crystals > L.progress.finishRun(m, a).crystals);
  });
});

describe('arena and trade', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('the arena has three rounds without healing, then a big reward', () => {
    const run = L.run.create({ seed: 'arena', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    const node = run.map.nodes[L.run.choices(run)[0]];
    node.kind = 'arena';
    L.run.enter(run, node.id, day);
    for (let round = 0; round < 3; round++) {
      assert.eq(run.pending.battle.arenaRound, round);
      const b = L.run.makeBattle(run, day);
      b.result = 'won';
      run.team[0].hp = 10;
      L.run.resolveBattle(run, b, null);
      if (round < 2) { assert.ok(!run.pending.battleDone); assert.eq(run.team[0].hp, 10); }
    }
    assert.ok(run.pending.battleDone && run.pending.rewards.length === 3);
  });
});

describe('echo tower', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('the tower is endless: each guardian leads to a harder block', () => {
    const run = L.run.create({ seed: 'turm', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, mode: 'turm' });
    assert.eq(run.act, 'echoturm');
    const lv1 = L.encounters.enemyLevel(run, 0);
    run.pending = { node: 'BOSS', kind: 'boss', layer: 7 };
    const res = L.run.complete(run);
    assert.ok(res.actChanged && !res.victory && !run.finished);
    assert.eq(run.tower.block, 2);
    assert.eq(L.encounters.enemyLevel(run, 0), lv1 + 6);
    assert.eq(L.encounters.boss(run, L.rng.create(1)).trainer, 'maris');
  });
  it('the best floor is saved and pays crystals', () => {
    const m = L.save.freshMeta();
    const run = L.run.create({ seed: 'turm2', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day, mode: 'turm' });
    run.tower.block = 3;
    run.finished = 'defeat';
    L.progress.finishRun(m, run);
    assert.eq(m.stats.towerBest, 16);
  });
});

describe('ghost battles', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('a won run leaves a ghost that later appears as an elite', () => {
    const m = L.save.freshMeta();
    const r1 = L.run.create({ seed: 'g1', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    r1.finished = 'victory';
    L.progress.finishRun(m, r1);
    assert.eq(m.ghosts.length, 1);
    const r2 = L.run.create({ seed: 'g2', starter: 'knospi', blessing: 'goldbeutel', meta: m, now: day });
    const g = L.encounters.ghost(r2, L.rng.create(3), 6);
    assert.ok(g.ghost && /^Echo von/.test(g.trainerName));
    assert.eq(g.team[0].species, 'glimmi');
    assert.eq(r2.ghostsUsed.length, 1);
  });
});
