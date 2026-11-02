describe('act 2: Glutschmiede', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const newRun = (seed) => L.run.create({ seed, starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, rank: 20 });

  it('act 2 follows act 1 and has its own map', () => {
    assert.eq(L.run.acts().map((a) => a.id).slice(0, 2), ['act1', 'act2']);
    const run = newRun('a2');
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    const res = L.run.complete(run);
    assert.ok(res.actChanged && !res.victory);
    assert.eq(run.act, 'act2');
    assert.ok(['aschepfad', 'kristallgrotten'].indexOf(run.variant) >= 0);
    assert.eq(run.questOffer.length, 3);
  });
  it('the run is only won after the last act', () => {
    const run = newRun('a2b');
    run.actIndex = L.run.acts().length - 1;
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    assert.ok(L.run.complete(run).victory);
  });
  it('aschling offers two evolutions at level 18', () => {
    const m = TH.mon('aschling', 17);
    const offers = L.mon.gainExp(m, L.mon.expForLevel(18) - m.exp).filter((o) => o.kind === 'evolve');
    assert.eq(offers.map((o) => o.to).sort(), ['aschegeist', 'flammfee']);
  });
  it('sunnyfex secret appears at any spring with three fire monsters', () => {
    const run = newRun('sun');
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    L.run.complete(run);
    const node = { layer: 3 };
    assert.ok(L.nodes.springOptions(run, node).indexOf('sonnenfeuer') < 0);
    run.team.push(TH.mon('aschling', 15), TH.mon('magmolch', 15));
    assert.ok(L.nodes.springOptions(run, node).indexOf('sonnenfeuer') >= 0);
    run.pending = { kind: 'spring', layer: 3, spring: { options: L.nodes.springOptions(run, node) } };
    L.nodes.spring(run, 'sonnenfeuer', {});
    assert.eq(run.pending.battle.team[0].species, 'sunnyfex');
    assert.ok(L.nodes.springOptions(run, node).indexOf('sonnenfeuer') < 0);
  });
  it('mirrok copies the types of its foe', () => {
    const b = TH.battle([TH.mon('mirrok', 25)], [TH.mon('geysirling', 25)]);
    assert.eq(L.mon.types(b.sides[0].team[0]), ['flut']);
  });
  it('sunnyfex survives one knockout per run', () => {
    const fox = TH.mon('sunnyfex', 20);
    fox.hp = 1;
    const b = TH.battle([fox], [TH.mon('lavarisk', 40, { moves: ['felsbrocken'] })]);
    for (let i = 0; i < 4 && fox.reborn !== true; i++) L.battle.step(b, { type: 'move', index: 0 });
    assert.eq(fox.reborn, true);
  });
  it('brakk has a second phase with weather and a signature move', () => {
    const t = L.registry.get('trainer', 'brakk');
    assert.eq(t.phases[0].weather, 'glutregen');
    assert.ok(L.registry.get('move', 'schmiedeglut').signature);
  });
  it('signature moves never appear as scrolls', () => {
    const run = newRun('sig');
    for (let i = 0; i < 40; i++) {
      for (const r of L.rewards.roll(run, 'elite', L.rng.create('x' + i), 3)) assert.ok(!(r.kind === 'move' && L.registry.get('move', r.move).signature));
    }
  });
});
