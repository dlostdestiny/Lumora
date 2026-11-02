describe('damage', () => {
  const L = LUM;
  const mk = (species, level, nature, extra) => L.mon.create(Object.assign({ species, level, rng: L.rng.create(1), nature, trait: null }, extra || {}));
  const calc = (attacker, defender, move, extra) =>
    L.damage.calc(Object.assign({ attacker, defender, move, battle: null, rng: L.rng.create(1), forceRoll: 1, forceCrit: false }, extra || {}));

  it('neutral damage matches formula', () => {
    const a = mk('glimmi', 30, 'robust'), d = mk('plitsch', 30, 'robust');
    assert.eq(L.mon.stats(a).atk, 96);
    assert.eq(L.mon.stats(d).def, 102);
    const r = calc(a, d, L.moves.resolve({ id: 'rempler' }));
    assert.eq(r.amount, 12);
    assert.eq(r.effectiveness, 1);
  });
  it('stab multiplies 1.25', () => {
    const a = mk('glimmi', 40, 'mutig'), d = mk('summsel', 40, 'mutig');
    const plain = calc(a, d, { type: null, power: 80 }).amount;
    const stab = calc(a, d, { type: 'glut', power: 80 });
    assert.ok(stab.stab);
    assert.near(stab.amount / plain, 1.25, 0.08);
  });
  it('super effective doubles', () => {
    const a = mk('glimmi', 40, 'mutig'), d = mk('summsel', 40, 'mutig');
    const plain = calc(a, d, { type: null, power: 80 }).amount;
    const se = calc(a, d, { type: 'stein', power: 80 });
    assert.eq(se.effectiveness, 2);
    assert.near(se.amount / plain, 2, 0.1);
  });
  it('crit multiplies 1.5', () => {
    const a = mk('glimmi', 40, 'mutig'), d = mk('summsel', 40, 'mutig');
    const plain = calc(a, d, { type: null, power: 80 }).amount;
    const crit = calc(a, d, { type: null, power: 80 }, { forceCrit: true });
    assert.ok(crit.crit);
    assert.near(crit.amount / plain, 1.5, 0.08);
  });
  it('burn reduces attack', () => {
    const a = mk('glimmi', 40, 'mutig'), d = mk('summsel', 40, 'mutig');
    const plain = calc(a, d, { type: null, power: 80 }).amount;
    a.status = 'brand';
    const burned = calc(a, d, { type: null, power: 80 }).amount;
    assert.near(burned / plain, 0.75, 0.08);
  });
  it('minimum damage 1', () => {
    const a = mk('summsel', 1, 'robust'), d = mk('kieselkrabb', 50, 'robust');
    const r = calc(a, d, { type: 'funke', power: 10 }, { forceRoll: 0.85 });
    assert.ok(r.amount >= 1);
  });
  it('crit chance by stage', () => {
    assert.eq(L.damage.critChance(0), 1 / 16);
    assert.eq(L.damage.critChance(1), 1 / 8);
    assert.eq(L.damage.critChance(2), 1 / 4);
    assert.eq(L.damage.critChance(5), 1 / 2);
  });
});
