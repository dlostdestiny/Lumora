describe('conditions', () => {
  const L = LUM;
  const night = new Date(2026, 10, 1, 22), day = new Date(2026, 10, 1, 12);
  it('night condition uses injected now', () => {
    assert.eq(L.cond.check({ realTime: 'night' }, { now: night }), true);
    assert.eq(L.cond.check({ realTime: 'night' }, { now: day }), false);
    assert.eq(L.cond.check({ realTime: 'day' }, { now: day }), true);
  });
  it('nested all/any/not', () => {
    const ctx = { now: night, run: { number: 3, flags: { a: true }, healedInAct: {}, team: [], relics: [], items: {} } };
    assert.eq(L.cond.check({ all: [{ realTime: 'night' }, { any: [{ runFlag: 'x' }, { runFlag: 'a' }] }, { not: { runNumber: { min: 4 } } }] }, ctx), true);
    assert.eq(L.cond.check({ all: [{ realTime: 'night' }, { runFlag: 'x' }] }, ctx), false);
  });
  it('team, heal and meta conditions', () => {
    const glut = [TH.mon('glimmi', 5), TH.mon('glutaro', 15), TH.mon('lumini', 5)];
    const run = { number: 1, act: 'act1', flags: {}, healedInAct: {}, team: glut, relics: ['lehrbuch'], items: { fangkugel: 1 } };
    const meta = { flags: {}, bossesDefeated: ['fenna'], fragments: [1, 2], scenesSeen: ['intro_first'] };
    const c = (cond) => L.cond.check(cond, { run, meta, now: day });
    assert.eq(c({ teamTypeCount: { type: 'glut', min: 3 } }), true);
    assert.eq(c({ noHealInAct: 'act1' }), true);
    run.healedInAct.act1 = true;
    assert.eq(c({ noHealInAct: 'act1' }), false);
    assert.eq(c({ bossDefeated: 'fenna' }), true);
    assert.eq(c({ fragments: 3 }), false);
    assert.eq(c({ sceneSeen: 'intro_first' }), true);
    assert.eq(c({ hasRelic: 'lehrbuch' }), true);
    assert.eq(c({ hasItem: 'superkugel' }), false);
    assert.eq(c({ act: 'act1' }), true);
  });
  it('chance uses rng', () => {
    const rng = L.rng.create(1);
    let hits = 0;
    for (let i = 0; i < 1000; i++) if (L.cond.check({ chance: 0.25 }, { rng })) hits++;
    assert.ok(hits > 180 && hits < 320);
  });
  it('unknown condition throws', () => {
    assert.throws(() => L.cond.check({ foo: 1 }, {}), /Unbekannte Bedingung/);
  });
  it('empty condition is true', () => {
    assert.eq(L.cond.check(null, {}), true);
  });
});

describe('capture', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12), night = new Date(2026, 10, 1, 23);
  it('chance at full hp common fangkugel = 1/3', () => {
    assert.near(L.capture.chance({ target: TH.mon('summsel', 5), ball: 'fangkugel', battle: null, now: day }), 1 / 3);
  });
  it('sleep doubles', () => {
    const t = TH.mon('summsel', 5);
    t.status = 'schlaf';
    assert.near(L.capture.chance({ target: t, ball: 'fangkugel', battle: null, now: day }), 2 / 3);
  });
  it('rarity lowers chance', () => {
    assert.near(L.capture.chance({ target: TH.mon('pilzpuff', 5), ball: 'fangkugel', battle: null, now: day }), 0.2);
  });
  it('mondkugel strong at night', () => {
    const t = TH.mon('summsel', 5);
    const n = L.capture.chance({ target: t, ball: 'mondkugel', battle: null, now: night });
    const d = L.capture.chance({ target: t, ball: 'mondkugel', battle: null, now: day });
    assert.ok(n > d * 3);
  });
  it('clamped to 0.95', () => {
    const t = TH.mon('summsel', 5);
    t.hp = 1;
    t.status = 'schlaf';
    assert.eq(L.capture.chance({ target: t, ball: 'superkugel', battle: null, now: day }), 0.95);
  });
  it('capture consumes ball and can succeed', () => {
    const e = TH.mon('summsel', 5);
    e.hp = 1;
    e.status = 'schlaf';
    const b = TH.battle([TH.mon('glimmi', 5)], [e], { player: { items: { superkugel: 5 } }, seed: 9 });
    let ev = [];
    for (let i = 0; i < 5 && b.state === 'choose'; i++) ev = L.battle.step(b, { type: 'capture', ball: 'superkugel' });
    assert.eq(b.state, 'captured');
    assert.eq(b.captured, e);
    assert.ok(ev.some((x) => x.t === 'captureTry' && x.success));
    assert.ok((b.sides[0].items.superkugel || 0) < 5);
  });
  it('capture with full team yields pendingRelease', () => {
    const e = TH.mon('summsel', 5);
    e.hp = 1;
    e.status = 'schlaf';
    const team = [TH.mon('glimmi', 5), TH.mon('plitsch', 5), TH.mon('knospi', 5), TH.mon('moosling', 5)];
    const b = TH.battle(team, [e], { player: { items: { superkugel: 9 } }, seed: 9 });
    for (let i = 0; i < 8 && b.state === 'choose'; i++) L.battle.step(b, { type: 'capture', ball: 'superkugel' });
    assert.eq(b.state, 'captured');
    assert.eq(b.pendingRelease, true);
    assert.eq(b.sides[0].team.length, 4);
  });
  it('boss not capturable', () => {
    const b = TH.battle([TH.mon('glimmi', 5)], [TH.mon('dornkoenigin', 5)], { player: { items: { fangkugel: 3 } } });
    assert.ok(!L.battle.legal(b, 0).some((a) => a.type === 'capture'));
  });
});
