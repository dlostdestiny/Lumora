describe('monster', () => {
  const L = LUM;
  const mk = (species, level, seed, extra) => L.mon.create(Object.assign({ species, level, rng: L.rng.create(seed || 1), nature: 'mutig', trait: null, shiny: false }, extra || {}));

  it('create uses last 4 learnset moves', () => {
    const sp = L.registry.get('species', 'glimmi');
    const m = mk('glimmi', 20);
    const learned = sp.learnset.filter((e) => e.level <= 20).map((e) => e.move);
    assert.eq(m.moves.map((x) => x.id), learned.slice(-4));
    assert.ok(m.moves.every((x) => x.upgrade === null));
  });
  it('create is deterministic with same seed', () => {
    const a = L.mon.create({ species: 'summsel', level: 7, rng: L.rng.create(5) });
    const b = L.mon.create({ species: 'summsel', level: 7, rng: L.rng.create(5) });
    assert.eq(a, b);
  });
  it('create starts at full hp and exp of level', () => {
    const m = mk('plitsch', 10);
    assert.eq(m.hp, L.mon.stats(m).hp);
    assert.eq(m.exp, L.mon.expForLevel(10));
  });
  it('expForLevel(10) === 800', () => assert.eq(L.mon.expForLevel(10), 800));
  it('gainExp levels up and raises hp by maxhp diff', () => {
    const m = mk('knospi', 5);
    m.hp -= 3;
    const before = L.mon.stats(m).hp;
    L.mon.gainExp(m, L.mon.expForLevel(6) - m.exp);
    assert.eq(m.level, 6);
    assert.eq(m.hp, L.mon.stats(m).hp - 3);
    assert.ok(L.mon.stats(m).hp > before);
  });
  it('gainExp queues learn offer when 4 moves', () => {
    const m = mk('glimmi', 11);
    assert.eq(m.moves.length, 4);
    const offers = L.mon.gainExp(m, L.mon.expForLevel(12) - m.exp);
    assert.ok(offers.some((o) => o.kind === 'learn' && o.move === 'funkenregen' && o.mon === m.uid));
    assert.eq(m.moves.length, 4);
  });
  it('gainExp learns directly with free slot', () => {
    const m = mk('glimmi', 7);
    const n = m.moves.length;
    const offers = L.mon.gainExp(m, L.mon.expForLevel(8) - m.exp);
    assert.ok(offers.some((o) => o.kind === 'learned' && o.move === 'aufheizen'));
    assert.eq(m.moves.length, n + 1);
  });
  it('gainExp offers evolution at level 14 for glimmi', () => {
    const m = mk('glimmi', 13);
    const offers = L.mon.gainExp(m, L.mon.expForLevel(14) - m.exp);
    assert.ok(offers.some((o) => o.kind === 'evolve' && o.to === 'glutaro'));
  });
  it('gainExp stops at max level', () => {
    const m = mk('summsel', 49);
    L.mon.gainExp(m, 10000000);
    assert.eq(m.level, 50);
  });
  it('evolve keeps hp ratio', () => {
    const m = mk('glimmi', 14);
    const max = L.mon.stats(m).hp;
    m.hp = Math.floor(max / 2);
    L.mon.evolve(m, 'glutaro');
    assert.eq(m.species, 'glutaro');
    assert.near(m.hp / L.mon.stats(m).hp, 0.5, 0.05);
  });
  it('learn replaces index', () => {
    const m = mk('glimmi', 11);
    L.mon.learn(m, 'funkenregen', 0);
    assert.eq(m.moves[0], { id: 'funkenregen', upgrade: null });
  });
  it('uralt adds ancient move', () => {
    const m = mk('summsel', 10, 3, { trait: 'uralt' });
    assert.ok(m.moves.some((x) => x.id === 'urblitz'));
    assert.ok(m.moves.length <= 4);
  });
  it('heal and faint helpers', () => {
    const m = mk('summsel', 10);
    m.hp = 0;
    assert.ok(L.mon.isFainted(m));
    L.mon.heal(m, 0.5);
    assert.eq(m.hp, Math.floor(L.mon.stats(m).hp * 0.5));
  });
  it('all species validate', () => {
    const errs = L.registry.validate().filter((e) => e.indexOf('species/') === 0 || e.indexOf('ability/') === 0);
    assert.eq(errs, []);
  });
  it('starter base totals within 300–330', () => {
    for (const id of ['glimmi', 'plitsch', 'knospi']) {
      const b = L.registry.get('species', id).base;
      const sum = b.hp + b.atk + b.def + b.spe;
      assert.ok(sum >= 300 && sum <= 330, id + ' ' + sum);
    }
  });
});
