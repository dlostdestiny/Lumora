describe('act 4: Jenseits des Schleiers', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const newRun = (seed, mode) => L.run.create({ seed, starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, rank: 20, mode: mode || null });
  const boss = (run) => { run.pending = { node: 'BOSS', kind: 'boss', layer: 12 }; return L.run.complete(run); };
  const toAct3 = (run) => { while (run.actIndex < 2) boss(run); };

  it('act 4 is a side act and not part of a normal run', () => {
    const a = L.registry.get('act', 'act4');
    assert.ok(a.side);
    assert.eq(a.variants.length, 2);
    assert.eq(a.levelRange, [33, 43]);
    assert.ok(L.run.acts().every((x) => x.id !== 'act4'));
    const run = newRun('n4');
    toAct3(run);
    assert.ok(boss(run).victory);
  });
  it('in the mode the run continues into act 4 after Sola, and is won after Vael', () => {
    const run = newRun('j4', 'jenseits');
    assert.eq(run.mode, 'jenseits');
    toAct3(run);
    const res = boss(run);
    assert.ok(res.actChanged && !res.victory);
    assert.eq(run.act, 'act4');
    assert.eq(run.actIndex, 2);
    assert.eq(L.encounters.act(run).id, 'act4');
    const last = boss(run);
    assert.ok(last.victory);
    assert.ok(run.flags.jenseits);
    assert.eq(run.finished, 'victory');
  });
  it('after the finale against Ardan the mode also leads into act 4', () => {
    const run = newRun('f4', 'jenseits');
    toAct3(run);
    run.flags.finale = true;
    run.pending = { node: 'FINALE', kind: 'boss', layer: 13 };
    const res = L.run.complete(run);
    assert.ok(res.actChanged && !res.victory);
    assert.eq(run.act, 'act4');
    assert.ok(run.flags.trueEnd);
    assert.ok(!run.flags.finale);
  });
  it('the mode only opens after the true end', () => {
    const md = L.registry.get('mode', 'jenseits');
    const meta = L.save.freshMeta();
    meta.flags = meta.flags || {};
    assert.ok(!L.modes.open(meta, md));
    meta.flags.trueEnd = true;
    assert.ok(L.modes.open(meta, md));
  });
  it('enemies in act 4 are level 33 to 43', () => {
    const run = newRun('lv4', 'jenseits');
    toAct3(run);
    boss(run);
    assert.eq(L.encounters.enemyLevel(run, 0), 33);
    assert.eq(L.encounters.enemyLevel(run, run.map.layers - 1), 43);
  });
  it('act 4 has new monsters with frost, wind and metal and a branching evolution', () => {
    const a = L.registry.get('act', 'act4');
    const ids = {};
    for (const v of a.variants) for (const e of v.encounters) ids[e.species] = true;
    const types = {};
    for (const id of Object.keys(ids)) for (const t of L.registry.get('species', id).types) types[t] = true;
    assert.ok(types.frost && types.wind && types.metall);
    assert.eq(L.registry.get('species', 'zahnradwicht').evolves.length, 2);
    assert.ok(L.registry.get('species', 'velumora').rarity === 'boss');
  });
  it('vael has two phases: a blizzard and a signature move', () => {
    const t = L.registry.get('trainer', 'vael');
    assert.ok(t.boss);
    assert.eq(t.phases[0].weather, 'schneesturm');
    assert.ok(L.registry.get('move', t.phases[0].addMove).signature);
    assert.ok(L.registry.all('scene').some((s) => s.trigger === 'bossPre' && s.condition && s.condition.act === 'act4'));
    assert.eq(L.registry.get('act', 'act4').elites.length, 3);
  });
  it('a run through act 4 can be played: a battle on the map works', () => {
    const run = newRun('play4', 'jenseits');
    toAct3(run);
    boss(run);
    const first = run.map.nodes[run.map.start[0]];
    L.run.enter(run, first.id, day);
    assert.ok(run.pending);
    if (run.pending.battle && run.pending.battle.team) assert.ok(run.pending.battle.team[0].level >= 32);
  });
  it('winning act 4 sets the meta flag and the achievement', () => {
    const meta = L.save.freshMeta();
    const run = newRun('m4', 'jenseits');
    run.flags.jenseits = true;
    run.finished = 'victory';
    L.progress.finishRun(meta, run);
    assert.ok(meta.flags.jenseits);
    assert.ok(L.registry.get('achievement', 'jenseits').value(meta) === 1);
  });
});
