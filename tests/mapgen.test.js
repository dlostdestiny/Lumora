describe('mapgen', () => {
  const L = LUM;
  const act = { id: '_m', rival: 'x', map: { layers: 13, hiddenChance: 0.35, nodeWeights: { battle: 45, elite: 10, spring: 10, shop: 8, event: 22 } } };
  const variant = { id: '_v' };
  const maps = [];
  for (let s = 1; s <= 200; s++) maps.push(L.mapgen.generate(act, variant, L.rng.create(s)));
  const nodes = (m) => Object.values(m.nodes);

  it('every start reaches boss', () => {
    for (const m of maps) for (const s of m.start) assert.ok(L.mapgen.reachable(m, s).has(m.boss));
  });
  it('no dead ends', () => {
    for (const m of maps) for (const n of nodes(m)) if (n.kind !== 'boss') assert.ok(n.links.length > 0, n.id);
  });
  it('every node reachable from a start', () => {
    for (const m of maps) {
      const seen = new Set();
      for (const s of m.start) for (const id of L.mapgen.reachable(m, s)) seen.add(id);
      assert.eq(seen.size, nodes(m).length);
    }
  });
  it('layer 11 all spring, layer 0 all battle, one boss', () => {
    for (const m of maps) {
      for (const n of nodes(m)) {
        if (n.layer === 11) assert.eq(n.kind, 'spring');
        if (n.layer === 0) assert.eq(n.kind, 'battle');
      }
      assert.eq(nodes(m).filter((n) => n.kind === 'boss').length, 1);
    }
  });
  it('exactly one rival on layers 5–8', () => {
    for (const m of maps) {
      const r = nodes(m).filter((n) => n.kind === 'rival');
      assert.eq(r.length, 1);
      assert.ok(r[0].layer >= 5 && r[0].layer <= 8);
    }
  });
  it('no elite before layer 4', () => {
    for (const m of maps) for (const n of nodes(m)) if (n.kind === 'elite') assert.ok(n.layer >= 4);
  });
  it('at most one hidden, and sometimes none', () => {
    let none = 0;
    for (const m of maps) {
      const h = nodes(m).filter((n) => n.kind === 'hidden').length;
      assert.ok(h <= 1);
      if (!h) none++;
    }
    assert.ok(none > 50 && none < 190, 'none=' + none);
  });
  it('at least one shop and two events', () => {
    for (const m of maps) {
      assert.ok(nodes(m).filter((n) => n.kind === 'shop').length >= 1);
      assert.ok(nodes(m).filter((n) => n.kind === 'event').length >= 2);
    }
  });
  it('no spring or shop twice in a row', () => {
    for (const m of maps) for (const n of nodes(m)) {
      if (n.kind !== 'spring' && n.kind !== 'shop') continue;
      for (const id of n.links) if (m.nodes[id].layer < 11) assert.ok(m.nodes[id].kind !== n.kind, n.id + '→' + id);
    }
  });
  it('no crossing edges', () => {
    for (const m of maps) {
      const edges = [];
      for (const n of nodes(m)) for (const id of n.links) if (m.nodes[id].kind !== 'boss') edges.push([n.layer, n.col, m.nodes[id].col]);
      for (const a of edges) for (const b of edges) {
        if (a[0] !== b[0]) continue;
        assert.ok(!((a[1] < b[1] && a[2] > b[2]) || (a[1] > b[1] && a[2] < b[2])), 'Kreuzung ' + JSON.stringify([a, b]));
      }
    }
  });
  it('deterministic for seed', () => {
    assert.eq(L.mapgen.generate(act, variant, L.rng.create(7)), L.mapgen.generate(act, variant, L.rng.create(7)));
  });
});
