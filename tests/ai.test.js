describe('ai', () => {
  const L = LUM;
  const mkB = (pTeam, eTeam, kind, extra) => {
    const b = L.battle.create(Object.assign({ player: { team: pTeam, items: {}, relics: [] }, enemy: Object.assign({ team: eTeam, kind }, extra || {}), rng: L.rng.create(4) }));
    L.battle.start(b);
    return b;
  };

  it('elite picks KO move', () => {
    const p = TH.mon('summsel', 10);
    p.hp = 1;
    const b = mkB([p], [TH.mon('kieselkrabb', 10, { moves: ['haerten', 'rempler'] })], 'elite');
    assert.eq(L.ai.choose(b, 1, b.rng), { type: 'move', index: 1 });
  });
  it('does not repeat status on statused target', () => {
    const p = TH.mon('summsel', 10);
    p.status = 'gift';
    const b = mkB([p], [TH.mon('nachtschu', 10, { moves: [{ id: 'gifthauch', upgrade: 'a' }, 'kratzer'] })], 'elite');
    assert.eq(L.ai.choose(b, 1, b.rng), { type: 'move', index: 1 });
  });
  it('prefers super effective move', () => {
    const b = mkB([TH.mon('plitsch', 15)], [TH.mon('summsel', 15, { moves: ['rempler', 'funkenstoss'] })], 'elite');
    assert.eq(L.ai.choose(b, 1, b.rng), { type: 'move', index: 1 });
  });
  it('trainer switches out of bad matchup', () => {
    const b = mkB([TH.mon('plitsch', 15)], [TH.mon('glimmi', 15, { moves: ['glutbiss'] }), TH.mon('summsel', 15, { moves: ['funkenstoss'] })], 'trainer');
    assert.eq(L.ai.choose(b, 1, b.rng), { type: 'switch', index: 1 });
  });
  it('wild never switches', () => {
    const b = mkB([TH.mon('plitsch', 15)], [TH.mon('glimmi', 15, { moves: ['glutbiss'] }), TH.mon('summsel', 15, { moves: ['funkenstoss'] })], 'wild');
    for (let i = 0; i < 20; i++) assert.eq(L.ai.choose(b, 1, b.rng).type, 'move');
  });
  it('boss heals once below 25%', () => {
    const e = TH.mon('dornkoenigin', 15);
    const b = mkB([TH.mon('summsel', 15)], [e], 'boss', { items: { superheiltrank: 1 } });
    e.hp = Math.floor(L.mon.maxHp(e) * 0.2);
    assert.eq(L.ai.choose(b, 1, b.rng), { type: 'item', item: 'superheiltrank', target: 0 });
    b.sides[1].items = {};
    assert.eq(L.ai.choose(b, 1, b.rng).type, 'move');
  });
  it('ai evaluation has no side effects on flags', () => {
    const b = mkB([TH.mon('summsel', 15)], [TH.mon('kieselkrabb', 15, { moves: ['rempler'] })], 'elite');
    b.sides[0].relics = ['schutzamulett'];
    L.ai.choose(b, 1, b.rng);
    assert.eq(b.flags, {});
  });
});
