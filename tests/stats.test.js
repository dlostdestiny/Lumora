describe('types', () => {
  const T = LUM.types;
  it('fire beats grass', () => assert.eq(T.effectiveness('glut', ['spross']), 2));
  it('dual types multiply', () => assert.eq(T.effectiveness('flut', ['glut', 'stein']), 4));
  it('resisted', () => assert.eq(T.effectiveness('glut', ['flut']), 0.5));
  it('stern hits all normal x2', () => {
    for (const t of ['glut', 'flut', 'spross', 'funke', 'stein', 'schatten']) assert.eq(T.effectiveness('stern', [t]), 2, t);
    assert.eq(T.effectiveness('stern', ['stern']), 0.5);
  });
  it('shadow beats stern', () => assert.eq(T.effectiveness('schatten', ['stern']), 2));
  it('normal types neutral vs stern', () => assert.eq(T.effectiveness('glut', ['stern']), 1));
  it('typeless is neutral', () => assert.eq(T.effectiveness(null, ['glut']), 1));
  it('matchups for glut', () => {
    const m = T.matchups('glut');
    assert.eq(m.strongVs, ['spross', 'schatten', 'frost', 'metall']);
    assert.eq(m.weakVs, ['glut', 'flut', 'stein']);
    assert.eq(m.vulnerableTo, ['flut', 'stein']);
    assert.eq(m.resists, ['glut', 'spross', 'schatten', 'frost', 'metall']);
  });
  it('matchups hide secret stern type by default', () => {
    assert.ok(T.matchups('schatten').strongVs.indexOf('stern') < 0);
    assert.ok(T.matchups('schatten', { secret: true }).strongVs.indexOf('stern') >= 0);
    assert.eq(T.visible(), ['glut', 'flut', 'spross', 'funke', 'stein', 'schatten', 'frost', 'wind', 'metall']);
  });
  it('new types frost, wind, metall fit into the chart', () => {
    assert.eq(T.effectiveness('frost', ['wind']), 2);
    assert.eq(T.effectiveness('metall', ['frost']), 2);
    assert.eq(T.effectiveness('wind', ['spross']), 2);
    assert.eq(T.effectiveness('glut', ['metall']), 2);
    assert.eq(T.effectiveness('stern', ['metall']), 2);
  });
});

describe('stats', () => {
  const L = LUM;
  if (!L.registry.has('nature', '_neutral')) L.def.nature({ id: '_neutral', name: 'Test', up: null, down: null, test: true });
  const sp = { base: { hp: 50, atk: 60, def: 40, spe: 70 } };
  it('stat formula', () => {
    assert.eq(L.stats.calc(sp, 10, '_neutral', null), { hp: 40, atk: 29, def: 21, spe: 33 });
  });
  it('nature applies', () => {
    const n = L.registry.all('nature').find((x) => x.up === 'atk' && x.down === 'def');
    const s = L.stats.calc(sp, 10, n.id, null);
    assert.eq(s.atk, 31);
    assert.eq(s.def, 18);
  });
  it('trait applies', () => {
    const s = L.stats.calc(sp, 10, '_neutral', 'riesig');
    assert.eq(s.hp, 46);
    assert.eq(s.spe, 29);
  });
  it('stage mult', () => {
    assert.eq(L.stats.stageMult(3), 2.5);
    assert.near(L.stats.stageMult(-3), 0.4);
    assert.eq(L.stats.stageMult(0), 1);
  });
  it('ten natures registered', () => {
    assert.eq(L.registry.all('nature').filter((n) => !n.test).length, 10);
  });
  it('traits have rarity', () => {
    const ts = L.registry.all('trait');
    assert.ok(ts.length >= 10);
    for (const t of ts) assert.ok(['common', 'rare', 'veryRare'].indexOf(t.rarity) >= 0, t.id);
  });
});
