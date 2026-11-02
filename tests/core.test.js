describe('rng', () => {
  const L = LUM;
  it('rng is deterministic', () => {
    const a = L.rng.create(42), b = L.rng.create(42);
    for (let i = 0; i < 5; i++) assert.eq(a.next(), b.next());
  });
  it('string seeds differ', () => {
    assert.ok(L.rng.create('a').next() !== L.rng.create('b').next());
  });
  it('int stays in range', () => {
    const r = L.rng.create(1), seen = {};
    for (let i = 0; i < 1000; i++) {
      const v = r.int(1, 6);
      assert.ok(v >= 1 && v <= 6, 'außerhalb: ' + v);
      seen[v] = true;
    }
    assert.eq(Object.keys(seen).length, 6);
  });
  it('weighted respects zero weight', () => {
    const r = L.rng.create(7);
    const items = [{ id: 'a', weight: 0 }, { id: 'b', weight: 3 }, { id: 'c', weight: 1 }];
    for (let i = 0; i < 500; i++) assert.ok(r.weighted(items).id !== 'a');
  });
  it('state roundtrip', () => {
    const r = L.rng.create(9);
    const s = r.getState();
    const first = [r.next(), r.next(), r.next()];
    r.setState(s);
    assert.eq([r.next(), r.next(), r.next()], first);
  });
  it('dailySeed formats date', () => {
    assert.eq(L.rng.dailySeed(new Date(2026, 10, 1)), '2026-11-01');
  });
});

describe('registry', () => {
  const L = LUM;
  it('registry rejects duplicate', () => {
    L.registry.add('_t', { id: 'dup' });
    assert.throws(() => L.registry.add('_t', { id: 'dup' }), /doppelt/);
  });
  it('registry get unknown throws', () => {
    assert.throws(() => L.registry.get('_t', 'nope'), /Unbekannt/);
  });
  it('registry all keeps insertion order', () => {
    L.registry.add('_t2', { id: 'x' });
    L.registry.add('_t2', { id: 'y' });
    assert.eq(L.registry.all('_t2').map((d) => d.id), ['x', 'y']);
  });
});

describe('clock', () => {
  const L = LUM;
  const at = (h, m) => new Date(2026, 10, 1, h, m || 0);
  it('isNight', () => {
    assert.eq(L.clock.isNight(at(21)), true);
    assert.eq(L.clock.isNight(at(12)), false);
    assert.eq(L.clock.isNight(at(5, 59)), true);
    assert.eq(L.clock.isNight(at(6, 0)), false);
  });
});

describe('hooks', () => {
  const L = LUM;
  it('hooks modify chains', () => {
    const hs = [{ source: 'a', fn: (v) => v * 2 }, { source: 'b', fn: (v) => v + 1 }];
    assert.eq(L.hooks.run(hs, 'modifyDamage', {}, 3), 7);
  });
  it('on hooks call all', () => {
    let n = 0;
    L.hooks.run([{ fn: () => n++ }, { fn: () => n++ }], 'onTurnEnd', {});
    assert.eq(n, 2);
  });
  it('bus emits', () => {
    let got = null;
    const off = L.bus.on('x', (p) => { got = p; });
    L.bus.emit('x', 5);
    off();
    L.bus.emit('x', 6);
    assert.eq(got, 5);
  });
});
