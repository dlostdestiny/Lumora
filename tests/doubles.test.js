describe('doubles: 2 gegen 2', () => {
  const L = LUM;
  const mv = (index, foe, slot) => ({ type: 'move', index, foe, slot });
  const team = (...ids) => ids.map((id) => TH.mon(id, 10, { moves: ['rempler'] }));
  const dbl = (p, e, opts) => TH.battle(p, e, Object.assign({ doubles: true }, opts || {}));

  it('both sides start with two active mons', () => {
    const b = dbl(team('summsel', 'moosling', 'kieselkrabb'), team('glutaro', 'zwirbel', 'nachtschu'));
    assert.eq(b.sides[0].slots.map((s) => s.active), [0, 1]);
    assert.eq(L.battle.actives(b, 1).length, 2);
    assert.eq(L.battle.liveSlots(b, 0), [0, 1]);
  });
  it('single battles keep exactly one slot', () => {
    const b = TH.battle(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    assert.eq(b.sides[0].slots.length, 1);
    assert.ok(!b.doubles);
  });
  it('needs one action per active mon', () => {
    const b = dbl(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    assert.throws(() => L.battle.step(b, mv(0, 0)));
  });
  it('four mons act in one turn and events carry slots', () => {
    const b = dbl(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    const ev = L.battle.step(b, [mv(0, 0), mv(0, 1)]);
    const moves = TH.ofType(ev, 'move');
    assert.eq(moves.length, 4);
    for (const m of moves) assert.ok(m.slot === 0 || m.slot === 1);
    assert.eq(moves.filter((m) => m.side === 0).map((m) => m.slot).sort(), [0, 1]);
  });
  it('the chosen target takes the damage', () => {
    const b = dbl(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    const e0 = b.sides[1].team[0], e1 = b.sides[1].team[1];
    const before0 = e0.hp, before1 = e1.hp;
    const ev = L.battle.step(b, [mv(0, 1), mv(0, 1)]);
    const hits = TH.ofType(ev, 'damage').filter((d) => d.side === 1);
    assert.ok(hits.length >= 1);
    assert.ok(hits.every((d) => d.slot === 1));
    assert.eq(e0.hp, before0);
    assert.ok(e1.hp < before1);
  });
  it('attack on a fainted slot is redirected to the other foe', () => {
    const p = [TH.mon('glutaro', 30, { moves: ['glutbiss'] }), TH.mon('moosling', 30, { moves: ['rempler'] })];
    const e = team('summsel', 'zwirbel');
    e[0].hp = 1;
    const b = dbl(p, e);
    const ev = L.battle.step(b, [mv(0, 0), mv(0, 0)]);
    assert.ok(TH.ofType(ev, 'faint').some((f) => f.side === 1 && f.slot === 0));
    assert.ok(TH.ofType(ev, 'damage').some((d) => d.side === 1 && d.slot === 1));
  });
  it('fainted enemy is replaced from the bench, empty slot stays down', () => {
    const p = [TH.mon('glutaro', 40, { moves: ['glutbiss'] }), TH.mon('moosling', 40, { moves: ['rempler'] })];
    const e = team('summsel', 'zwirbel', 'nachtschu');
    e[0].hp = 1; e[1].hp = 1;
    const b = dbl(p, e);
    L.battle.step(b, [mv(0, 0), mv(0, 1)]);
    assert.eq(b.state, 'choose');
    assert.eq(L.battle.liveSlots(b, 1).length, 1);
    assert.eq(L.battle.actives(b, 1)[0].species, 'nachtschu');
  });
  it('player faint → forceSwitch for that slot, partner in the field is not offered', () => {
    const p = [TH.mon('kieselkrabb', 50, { moves: ['rempler'] }), TH.mon('moosling', 10, { moves: ['rempler'] }), TH.mon('summsel', 10, { moves: ['rempler'] })];
    p[1].hp = 1;
    const e = [TH.mon('glutaro', 12, { moves: ['rempler'] }), TH.mon('zwirbel', 12, { moves: ['rempler'] })];
    const b = dbl(p, e, { enemyPolicy: () => ({ type: 'move', index: 0, foe: 1 }) });
    L.battle.step(b, [mv(0, 0), mv(0, 0)]);
    assert.ok(p[0].hp > 0);
    assert.eq(b.state, 'forceSwitch');
    assert.eq(b.pendingSlots, [1]);
    assert.eq(L.battle.legal(b, 0).map((a) => a.index), [2]);
    assert.throws(() => L.battle.forceSwitch(b, 0));
    L.battle.forceSwitch(b, 2);
    assert.eq(b.state, 'choose');
    assert.eq(b.sides[0].slots[1].active, 2);
  });
  it('cannot switch to the partner in the field or twice to the same mon', () => {
    const b = dbl(team('summsel', 'moosling', 'kieselkrabb'), team('glutaro', 'zwirbel'));
    assert.ok(!L.battle.legal(b, 0, 0).some((a) => a.type === 'switch' && a.index === 1));
    assert.throws(() => L.battle.step(b, [{ type: 'switch', index: 2 }, { type: 'switch', index: 2 }]));
    const ev = L.battle.step(b, [{ type: 'switch', index: 2, slot: 0 }, mv(0, 0, 1)]);
    assert.ok(ev.some((e) => e.t === 'switch' && e.side === 0 && e.slot === 0));
    assert.eq(L.battle.actives(b, 0).map((m) => m.species), ['kieselkrabb', 'moosling']);
  });
  it('stages belong to each slot', () => {
    const b = dbl(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    L.battle.focus(b, 0, 1);
    b.sides[0].stages.atk = 2;
    L.battle.focus(b, 0, 0);
    assert.eq(b.sides[0].stages.atk, 0);
    L.battle.focus(b, 0, 1);
    assert.eq(b.sides[0].stages.atk, 2);
  });
  it('a single mon left fights alone against two', () => {
    const b = dbl([TH.mon('glutaro', 30, { moves: ['glutbiss'] })], team('summsel', 'zwirbel'));
    assert.eq(b.sides[0].slots.length, 1);
    const ev = L.battle.step(b, [mv(0, 1)]);
    assert.eq(TH.ofType(ev, 'move').filter((m) => m.side === 1).length, 2);
  });
  it('AI picks a move with a target slot', () => {
    const b = dbl(team('summsel', 'moosling'), team('glutaro', 'zwirbel'));
    const a = L.ai.choose(b, 1, b.rng, 'elite', 1);
    assert.eq(a.type, 'move');
    assert.ok(a.foe === 0 || a.foe === 1);
  });
  it('a whole double battle plays to the end with the AI on both sides', () => {
    const b = dbl(team('summsel', 'moosling', 'kieselkrabb'), team('glutaro', 'zwirbel', 'nachtschu'), { enemy: { kind: 'elite' } });
    b.enemyPolicy = null;
    let n = 0;
    while (['won', 'lost'].indexOf(b.state) < 0 && n++ < 300) {
      if (b.state === 'forceSwitch') { L.battle.forceSwitch(b, L.battle.legal(b, 0)[0].index); continue; }
      L.battle.step(b, L.battle.liveSlots(b, 0).map((k) => Object.assign({ slot: k }, L.ai.choose(b, 0, b.rng, 'elite', k))));
    }
    assert.ok(b.state === 'won' || b.state === 'lost');
  });
  it('elite node can become a double battle with two trainers', () => {
    const now = new Date(2026, 10, 1, 14);
    let found = null;
    for (let i = 0; i < 60 && !found; i++) {
      const run = L.run.create({ seed: 'dbl' + i, starter: 'glimmi', blessing: null, meta: null, now });
      const node = Object.values(run.map.nodes).find((n) => n.data.double);
      if (node) found = { run, node };
    }
    assert.ok(found, 'kein Doppel-Elite-Knoten gefunden');
    assert.eq(found.node.kind, 'elite');
    const { run, node } = found;
    run.position = null;
    run.map.start = [node.id];
    const p = L.run.enter(run, node.id, now);
    assert.ok(p.battle.double);
    assert.ok(p.battle.trainerName.indexOf(' & ') > 0);
    assert.ok(p.battle.team.length >= 4);
    const battle = L.run.makeBattle(run, now);
    assert.ok(battle.doubles);
    L.battle.start(battle);
    assert.eq(L.battle.actives(battle, 1).length, 2);
  });
  it('legal() with pending actions: an item already chosen by slot 0 is not offered to slot 1 again', () => {
    const p = team('summsel', 'moosling', 'kieselkrabb');
    p[0].hp = 5; p[1].hp = 5;
    const b = dbl(p, team('glutaro', 'zwirbel'), { player: { items: { heiltrank: 1 } } });
    const first = L.battle.legal(b, 0, 0).find((a) => a.type === 'item');
    assert.ok(first);
    const pending = [Object.assign({ slot: 0 }, first)];
    assert.ok(!L.battle.legal(b, 0, 1, pending).some((a) => a.type === 'item' && a.item === 'heiltrank'));
    assert.ok(L.battle.legal(b, 0, 1).some((a) => a.type === 'item'));
  });
  it('legal() with pending actions: bond, art and a claimed switch are not offered twice', () => {
    const p = team('summsel', 'moosling', 'kieselkrabb');
    const b = dbl(p, team('glutaro', 'zwirbel'));
    const pending = [{ slot: 0, type: 'switch', index: 2 }, { slot: 0, type: 'bond' }, { slot: 0, type: 'art' }];
    const l = L.battle.legal(b, 0, 1, pending);
    assert.ok(!l.some((a) => a.type === 'switch' && a.index === 2));
    assert.ok(!l.some((a) => a.type === 'bond' || a.type === 'art'));
  });
});
