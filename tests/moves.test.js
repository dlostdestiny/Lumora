describe('moves', () => {
  const L = LUM;
  it('resolve applies upgrade name and power', () => {
    const base = L.moves.resolve({ id: 'glutbiss', upgrade: null });
    const a = L.moves.resolve({ id: 'glutbiss', upgrade: 'a' });
    assert.eq(base.name, 'Glutbiss');
    assert.eq(a.name, 'Glutbiss+');
    assert.ok(a.power > base.power);
    assert.eq(a.type, 'glut');
  });
  it('every move has two upgrades', () => {
    for (const m of L.registry.all('move')) {
      assert.ok(m.upgrades && m.upgrades.a && m.upgrades.b && m.upgrades.a.name && m.upgrades.b.name, m.id);
    }
  });
  it('registry validate has no move errors', () => {
    const errs = L.registry.validate().filter((e) => e.indexOf('move/') === 0 || e.indexOf('weather/') === 0);
    assert.eq(errs, []);
  });
  it('at least 4 moves per normal type incl. one status move', () => {
    for (const t of L.types.NORMAL) {
      const ms = L.registry.all('move').filter((m) => m.type === t);
      assert.ok(ms.length >= 4, t + ' hat ' + ms.length);
      assert.ok(ms.some((m) => m.power === 0), t + ' ohne Status-Attacke');
    }
  });
  it('at least 36 moves', () => assert.ok(L.registry.all('move').length >= 36));
  it('five weathers and five statuses', () => {
    assert.eq(L.registry.all('weather').map((w) => w.id).sort(), ['glutregen', 'nebel', 'schneesturm', 'stroemung', 'sturm']);
    assert.eq(L.registry.all('status').map((s) => s.id).sort(), ['brand', 'frost', 'gift', 'laehmung', 'schlaf']);
  });
});
