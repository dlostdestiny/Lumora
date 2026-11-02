describe('battle items, bond, exp', () => {
  const L = LUM;
  const calm = (sp, lv) => TH.mon(sp, lv || 10, { moves: ['haerten'] });

  it('heiltrank heals half and consumes item', () => {
    const p = calm('kieselkrabb', 20);
    p.hp = 1;
    const b = TH.battle([p], [calm('kieselkrabb')], { player: { items: { heiltrank: 2 } } });
    L.battle.step(b, { type: 'item', item: 'heiltrank', target: 0 });
    assert.eq(p.hp, 1 + Math.floor(L.mon.maxHp(p) * 0.5));
    assert.eq(b.sides[0].items.heiltrank, 1);
  });
  it('beleber only targets fainted', () => {
    const p2 = calm('moosling');
    p2.hp = 0;
    const b = TH.battle([calm('kieselkrabb'), p2], [calm('kieselkrabb')], { player: { items: { beleber: 1 } } });
    const legal = L.battle.legal(b, 0).filter((a) => a.type === 'item' && a.item === 'beleber');
    assert.eq(legal.map((a) => a.target), [1]);
    assert.throws(() => L.battle.step(b, { type: 'item', item: 'beleber', target: 0 }), /nicht erlaubt/);
    L.battle.step(b, { type: 'item', item: 'beleber', target: 1 });
    assert.eq(p2.hp, Math.floor(L.mon.maxHp(p2) * 0.5));
  });
  it('bond move unavailable below 100', () => {
    const p = calm('glimmi');
    p.bond = 99;
    const b = TH.battle([p], [calm('kieselkrabb')]);
    assert.ok(!L.battle.legal(b, 0).some((a) => a.type === 'bond'));
  });
  it('bond move sets bond to 60 and only once per battle', () => {
    const p = TH.mon('glimmi', 15, { moves: ['glutbiss'] });
    p.bond = 100;
    const b = TH.battle([p], [calm('kieselkrabb', 40)]);
    const ev = L.battle.step(b, { type: 'bond' });
    assert.ok(ev.some((e) => e.t === 'bondMove'));
    assert.ok(p.bond >= 60 && p.bond < 70);
    p.bond = 100;
    assert.ok(!L.battle.legal(b, 0).some((a) => a.type === 'bond'));
  });
  it('bond grows each turn', () => {
    const p = calm('kieselkrabb');
    const b = TH.battle([p], [calm('kieselkrabb')]);
    L.battle.step(b, { type: 'move', index: 0 });
    assert.eq(p.bond, 3);
  });
  it('exp split participants 100 bench per config', () => {
    const p = TH.mon('glutaro', 30, { moves: ['flammenwirbel'] });
    const bench = TH.mon('moosling', 10);
    const e = TH.mon('summsel', 10);
    e.hp = 1;
    const b = TH.battle([p, bench], [e]);
    L.battle.step(b, { type: 'move', index: 0 });
    const r = L.battle.rewards(b);
    const full = Math.floor(L.registry.get('species', 'summsel').baseExp * 10 / LUM.config.expDivisor);
    assert.eq(r.exp[p.uid], full);
    assert.eq(r.exp[bench.uid], Math.floor(full * LUM.config.benchExpShare));
  });
  it('trainer exp x1.5', () => {
    const p = TH.mon('glutaro', 30, { moves: ['flammenwirbel'] });
    const e = TH.mon('summsel', 10);
    e.hp = 1;
    const b = TH.battle([p], [e], { enemy: { kind: 'trainer' } });
    L.battle.step(b, { type: 'move', index: 0 });
    const full = Math.floor(L.registry.get('species', 'summsel').baseExp * 10 / LUM.config.expDivisor);
    assert.eq(L.battle.rewards(b).exp[p.uid], Math.floor(full * 1.5));
  });
  it('fainted team members get no exp', () => {
    const p = TH.mon('glutaro', 30, { moves: ['flammenwirbel'] });
    const bench = TH.mon('moosling', 10);
    bench.hp = 0;
    const e = TH.mon('summsel', 10);
    e.hp = 1;
    const b = TH.battle([p, bench], [e]);
    L.battle.step(b, { type: 'move', index: 0 });
    assert.eq(L.battle.rewards(b).exp[bench.uid], undefined);
  });
});
