describe('rank, talents and new starters', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const fresh = () => L.save.freshMeta();

  it('rank grows with experience, one point per rank', () => {
    const m = fresh();
    assert.eq(L.rank.level(m), 1);
    assert.eq(L.rank.points(m), 0);
    m.rankXp = L.rank.xpToNext(1) + L.rank.xpToNext(2);
    assert.eq(L.rank.level(m), 3);
    assert.eq(L.rank.points(m), 2);
  });
  it('further runs give more rank experience, echo gives a bonus', () => {
    const run = L.run.create({ seed: 'rx', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    const early = L.rank.runXp(run);
    run.actIndex = 1;
    run.flags.boss_act1 = true;
    const later = L.rank.runXp(run);
    assert.ok(later > early + 50);
    run.echo = 2;
    assert.ok(L.rank.runXp(run) > later);
  });
  it('finishing a run adds rank experience', () => {
    const m = fresh();
    const run = L.run.create({ seed: 'rf', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    run.finished = 'defeat';
    const res = L.progress.finishRun(m, run);
    assert.ok(res.rankXp > 0 && m.rankXp === res.rankXp);
  });
  it('talents cost points, respect max and reach new runs', () => {
    const m = fresh();
    m.rankXp = 5000;
    L.rank.learn(m, 'kugelvorrat');
    L.rank.learn(m, 'scharfe_krallen');
    assert.eq(L.rank.spent(m), 2);
    L.rank.learn(m, 'zweite_chance');
    assert.ok(!L.rank.canLearn(m, 'zweite_chance'));
    const run = L.run.create({ seed: 'rt', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    assert.eq(run.items.fangkugel, 4);
    assert.eq(run.items.beleber, 1);
    const b = L.run.makeBattle(Object.assign(run, { pending: { battle: L.encounters.wildSetup(run, L.run.rng(run), day, 0) } }), day);
    assert.ok(L.battle.handlers(b, 0).some((h) => h.source === 'talent'));
  });
  it('the daily run ignores talents', () => {
    const m = fresh();
    m.rankXp = 5000;
    L.rank.learn(m, 'kugelvorrat');
    assert.eq(L.daily.createRun('2026-11-01', m, day).talents, []);
  });
  it('new starters unlock with rank and evolve at 12', () => {
    const m = fresh();
    assert.eq(L.rank.starters(m), []);
    m.rankXp = 100000;
    assert.eq(L.rank.starters(m), ['zapfi', 'kiesi', 'nachtmiez']);
    for (const id of ['zapfi', 'kiesi', 'nachtmiez']) {
      const sp = L.registry.get('species', id);
      assert.eq(sp.evolves[0].level, 12);
      const sum = sp.base.hp + sp.base.atk + sp.base.def + sp.base.spe;
      assert.ok(sum >= 300 && sum <= 330, id + ' ' + sum);
    }
  });
});

describe('mastery album', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('team members earn mastery, higher levels start with more bond', () => {
    const m = L.save.freshMeta();
    for (let i = 0; i < 3; i++) {
      const run = L.run.create({ seed: 'ma' + i, starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
      run.finished = 'defeat';
      L.progress.finishRun(m, run);
    }
    assert.eq(L.mastery.of(m, 'glimmi'), 1);
    const run = L.run.create({ seed: 'ma9', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    assert.eq(run.team[0].bond, L.mastery.LEVELS[1].bond);
  });
  it('victory gives more points', () => {
    const m = L.save.freshMeta();
    const run = L.run.create({ seed: 'mv', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    run.finished = 'victory';
    L.progress.finishRun(m, run);
    assert.eq(L.mastery.points(m, 'glimmi'), 3);
  });
});

describe('hidden abilities', () => {
  const L = LUM;
  it('a monster with its hidden ability uses it in battle', () => {
    const m = TH.mon('flockling', 25);
    m.hiddenAbility = true;
    assert.eq(L.mon.abilityId(m), 'frostpelz');
    const b = TH.battle([m], [TH.mon('moosling', 25)]);
    assert.ok(L.battle.handlers(b, 0).some((h) => h.source === 'ability' && h.name === 'onHit'));
  });
  it('most species have a hidden ability, legends and bosses do not roll one', () => {
    const withHidden = L.registry.all('species').filter((s) => s.hiddenAbility).length;
    assert.ok(withHidden >= 40, String(withHidden));
    assert.ok(!L.registry.get('species', 'wispelin').hiddenAbility);
  });
});

describe('Bannträger paths', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('the art can be used once per battle and costs the turn', () => {
    const run = L.run.create({ seed: 'p1', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, path: 'kaempfer' });
    run.pending = { battle: L.encounters.wildSetup(run, L.run.rng(run), day, 0) };
    const b = L.run.makeBattle(run, day);
    L.battle.start(b);
    assert.ok(L.battle.legal(b, 0).some((a) => a.type === 'art'));
    const ev = L.battle.step(b, { type: 'art' });
    assert.ok(ev.some((e) => e.t === 'art'));
    assert.eq(b.sides[0].stages.atk, 2);
    assert.ok(!L.battle.legal(b, 0).some((a) => a.type === 'art'));
  });
  it('paths unlock with rank, the catcher starts with an extra ball', () => {
    const m = L.save.freshMeta();
    assert.eq(L.paths.available(m).map((p) => p.id), ['kaempfer', 'hueter']);
    const run = L.run.create({ seed: 'p2', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, path: 'faenger' });
    assert.eq(run.items.fangkugel, 4);
  });
});
