describe('true ending: fragments, Stellio, Ardan', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const fresh = () => L.save.freshMeta();
  const newRun = (meta, seed) => L.run.create({ seed: seed || 'te', starter: 'glimmi', blessing: 'goldbeutel', meta, now: day, rank: 20 });
  const toAct = (run, n) => { while (run.actIndex < n) { run.pending = { node: 'BOSS', kind: 'boss', layer: 12 }; L.run.complete(run); } };

  it('nine fragments, found once and kept between runs', () => {
    assert.eq(L.fragments.ALL.length, 9);
    const m = fresh();
    const run = newRun(m);
    assert.ok(L.fragments.find(run, 'hid_act1'));
    assert.ok(!L.fragments.find(run, 'hid_act1'));
    run.finished = 'defeat';
    L.progress.finishRun(m, run);
    assert.eq(m.fragments, ['hid_act1']);
    assert.ok(L.fragments.has(newRun(m, 'te2'), 'hid_act1'));
  });
  it('a hidden path gives the act fragment', () => {
    const run = newRun(fresh());
    const hid = run.map.nodes[L.run.choices(run)[0]];
    hid.kind = 'hidden';
    L.run.enter(run, hid.id, day);
    assert.eq(run.pending.fragment, 'hid_act1');
  });
  it('the star rift only opens with all nine fragments', () => {
    const m = fresh();
    const run = newRun(m);
    const ev = L.registry.get('event', 'sternenriss');
    assert.ok(!L.cond.check(ev.condition, { run }));
    m.fragments = L.fragments.ALL.slice();
    assert.ok(L.cond.check(ev.condition, { run: newRun(m, 'te3') }));
  });
  it('without Stellio the run ends after Sola, with Stellio Ardan follows', () => {
    const plain = newRun(fresh(), 'p');
    toAct(plain, 2);
    plain.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    assert.ok(L.run.complete(plain).victory);

    const run = newRun(fresh(), 's');
    toAct(run, 2);
    run.team.push(TH.mon('stellio', 30));
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    const res = L.run.complete(run);
    assert.ok(res.finale && !res.victory);
    assert.eq(run.pending.battle.trainer, 'ardan');
    assert.eq(L.story.next(run, null, 'bossPre'), 'ardan_pre');
    const end = L.run.complete(run);
    assert.ok(end.victory && end.trueEnd);
    const m = fresh();
    L.progress.finishRun(m, run);
    assert.ok(m.flags.trueEnd);
  });
  it('Stellio survives one knockout per battle', () => {
    const st = TH.mon('stellio', 20);
    st.hp = 1;
    const b = TH.battle([st], [TH.mon('lavarisk', 40, { moves: ['felsbrocken'] })]);
    L.battle.step(b, { type: 'move', index: 0 });
    assert.ok(b.flags['echo_' + st.uid]);
  });
  it('mode "Ein Typ": Stellio still joins at the star rift', () => {
    const m = fresh();
    m.fragments = L.fragments.ALL.slice();
    const run = L.run.create({ seed: 'mono', starter: 'plitsch', blessing: 'goldbeutel', meta: m, now: day, rank: 20, mode: 'monotyp' });
    assert.ok(!L.modes.allows(run, 'stellio'));
    run.pending = { kind: 'event', layer: 5, node: 'X' };
    const before = run.team.length;
    L.nodes.event(run, 'sternenriss', 0, day);
    assert.ok(run.team.some((x) => x.species === 'stellio') || (run.pending.release && run.pending.release.species === 'stellio'));
    assert.ok(run.team.length === before + 1 || run.pending.release);
  });
  it('mode jenseits: no "true end" credits before act 4, a transition scene instead', () => {
    const run = L.run.create({ seed: 'jen', starter: 'glimmi', blessing: 'goldbeutel', meta: fresh(), now: day, rank: 20, mode: 'jenseits' });
    toAct(run, 2);
    run.flags.finale = true;
    const id = L.story.next(run, null, 'actOutro');
    assert.ok(id !== 'true_end');
    assert.eq(id, 'jenseits_riss');
    const plain = L.run.create({ seed: 'jen2', starter: 'glimmi', blessing: 'goldbeutel', meta: fresh(), now: day, rank: 20, mode: 'jenseits' });
    toAct(plain, 2);
    assert.eq(L.story.next(plain, null, 'actOutro'), 'jenseits_riss');
    const normal = newRun(fresh(), 'nrm');
    toAct(normal, 2);
    normal.flags.finale = true;
    assert.eq(L.story.next(normal, null, 'actOutro'), 'true_end');
    // mit Stellio, aber noch vor Ardan: keine Abschluss-Szene
    const pre = L.run.create({ seed: 'jen3', starter: 'glimmi', blessing: 'goldbeutel', meta: fresh(), now: day, rank: 20, mode: 'jenseits' });
    toAct(pre, 2);
    pre.team.push(TH.mon('stellio', 30));
    assert.eq(L.story.next(pre, null, 'actOutro'), null);
  });
  it('scene conditions only use known condition kinds', () => {
    assert.ok(L.cond.KINDS.indexOf('mode') >= 0 && L.cond.KINDS.indexOf('notMode') >= 0);
    assert.eq(L.registry.validate(), []);
  });
});
