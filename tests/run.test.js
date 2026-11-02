describe('run', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12), night = new Date(2026, 10, 1, 23);
  const newRun = (seed, extra) => L.run.create(Object.assign({ seed: seed || 'test', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, rank: 20 }, extra || {}));
  const nodesOf = (run, kind) => Object.values(run.map.nodes).filter((n) => n.kind === kind);
  // Springt direkt zu einem Knoten (Tests): Position auf einen Elternknoten setzen.
  const jumpTo = (run, node) => {
    const parent = Object.values(run.map.nodes).find((n) => n.links.indexOf(node.id) >= 0);
    run.position = parent ? parent.id : null;
  };

  it('create gives starter lv5 and starting items', () => {
    const run = newRun();
    assert.eq(run.team.length, 1);
    assert.eq(run.team[0].species, 'glimmi');
    assert.eq(run.team[0].level, 5);
    assert.eq(run.items.fangkugel, 3);
    assert.eq(run.items.heiltrank, 2);
    assert.eq(run.gold, 150);
    assert.eq(run.act, 'act1');
    assert.ok(['fluesterwald', 'moorlichtung'].indexOf(run.variant) >= 0);
  });
  it('fruehstart and seelenband blessings', () => {
    assert.eq(newRun('a', { blessing: 'fruehstart' }).team[0].level, 8);
    assert.eq(newRun('a', { blessing: 'seelenband' }).team[0].bond, 50);
  });
  it('choices start at layer 0 then follow links', () => {
    const run = newRun();
    assert.eq(L.run.choices(run), run.map.start);
    const first = run.map.start[0];
    L.run.enter(run, first, day);
    assert.throws(() => L.run.enter(run, first, day), /offen/);
  });
  it('enter is deterministic after save/restore of rngState', () => {
    const run = newRun('det');
    const copy = JSON.parse(JSON.stringify(run));
    const a = L.run.enter(run, run.map.start[0], day);
    const b = L.run.enter(copy, copy.map.start[0], day);
    assert.eq(a, b);
  });
  it('wild level scales with layer', () => {
    const run = newRun('lv');
    const rng = L.rng.create(1);
    const low = L.encounters.wild(run, rng, day, 0).level;
    const high = L.encounters.wild(run, rng, day, 11).level;
    assert.ok(low >= 2 && low <= 4, 'low ' + low);
    assert.ok(high >= 10 && high <= 12, 'high ' + high);
  });
  it('night-only encounter filtered by day', () => {
    const run = newRun('n');
    const rng = L.rng.create(2);
    for (let i = 0; i < 300; i++) assert.ok(L.encounters.wild(run, rng, day, 3).species !== 'lumini');
    let seen = false;
    for (let i = 0; i < 600 && !seen; i++) seen = L.encounters.wild(run, rng, night, 3).species === 'lumini';
    assert.ok(seen);
  });
  it('pochi can appear', () => {
    const run = newRun('p');
    const rng = L.rng.create(3);
    let found = false;
    for (let i = 0; i < 3000 && !found; i++) found = L.encounters.wild(run, rng, day, 3).species === 'pochi';
    assert.ok(found);
  });
  it('battle node creates battle setup and resolves win', () => {
    const run = newRun('b');
    const p = L.run.enter(run, run.map.start[0], day);
    assert.eq(p.kind, 'battle');
    assert.eq(p.battle.kind, 'wild');
    const battle = L.run.makeBattle(run, day);
    run.team[0].level = 30;
    battle.sides[1].team[0].hp = 1;
    L.battle.step(battle, { type: 'move', index: 0 });
    if (battle.state === 'choose') L.battle.step(battle, { type: 'move', index: 0 });
    assert.eq(battle.state, 'won');
    const sum = L.run.resolveBattle(run, battle, null);
    assert.ok(sum.gold >= 15 && sum.gold <= 25);
    assert.eq(run.pending.rewards.length, 3);
    L.run.complete(run);
    assert.eq(run.position, run.map.start[0]);
    assert.eq(run.pending, null);
  });
  it('lost battle finishes run', () => {
    const run = newRun('l');
    L.run.enter(run, run.map.start[0], day);
    const battle = L.run.makeBattle(run, day);
    run.team[0].hp = 1;
    battle.sides[1].team[0].level = 40;
    for (let i = 0; i < 10 && battle.state === 'choose'; i++) L.battle.step(battle, { type: 'move', index: 0 });
    assert.eq(battle.state, 'lost');
    L.run.resolveBattle(run, battle, null);
    assert.eq(run.finished, 'defeat');
  });
  it('spring heal sets healedInAct', () => {
    const run = newRun('s');
    const spring = nodesOf(run, 'spring')[0];
    jumpTo(run, spring);
    run.team[0].hp = 1;
    L.run.enter(run, spring.id, day);
    L.nodes.spring(run, 'heal', {});
    assert.eq(run.team[0].hp, L.mon.maxHp(run.team[0]));
    assert.eq(run.healedInAct.act1, true);
  });
  it('spring train adds 2 levels, upgrade sets upgrade', () => {
    const run = newRun('t');
    const spring = nodesOf(run, 'spring')[0];
    jumpTo(run, spring);
    L.run.enter(run, spring.id, day);
    L.nodes.spring(run, 'train', { mon: 0 });
    assert.eq(run.team[0].level, 7);
    const run2 = newRun('t');
    jumpTo(run2, spring);
    L.run.enter(run2, spring.id, day);
    L.nodes.spring(run2, 'upgrade', { mon: 0, move: 0, choice: 'b' });
    assert.eq(run2.team[0].moves[0].upgrade, 'b');
  });
  it('irrlicht option only without heal at last spring layer', () => {
    const run = newRun('w');
    const last = Object.values(run.map.nodes).find((n) => n.layer === run.map.layers - 2);
    jumpTo(run, last);
    const p = L.run.enter(run, last.id, day);
    assert.ok(p.spring.options.indexOf('irrlicht') >= 0);
    const run2 = newRun('w');
    run2.healedInAct.act1 = true;
    jumpTo(run2, last);
    assert.ok(L.run.enter(run2, last.id, day).spring.options.indexOf('irrlicht') < 0);
    const early = nodesOf(run, 'spring').find((n) => n.layer < run.map.layers - 2);
    if (early) {
      const run3 = newRun('w');
      jumpTo(run3, early);
      assert.ok(L.run.enter(run3, early.id, day).spring.options.indexOf('irrlicht') < 0);
    }
  });
  it('irrlicht choice starts wispelin battle', () => {
    const run = newRun('w');
    const last = Object.values(run.map.nodes).find((n) => n.layer === run.map.layers - 2);
    jumpTo(run, last);
    L.run.enter(run, last.id, day);
    L.nodes.spring(run, 'irrlicht', {});
    assert.eq(run.pending.kind, 'battle');
    assert.eq(run.pending.battle.team[0].species, 'wispelin');
  });
  it('rewards never duplicate owned relic', () => {
    const run = newRun('r');
    run.relics = L.registry.all('relic').map((r) => r.id).slice(1);
    const rng = L.rng.create(5);
    for (let i = 0; i < 50; i++) {
      for (const r of L.rewards.roll(run, 'elite', rng)) if (r.kind === 'relic') assert.ok(run.relics.indexOf(r.relic) < 0);
    }
  });
  it('weitblick gives 4 rewards', () => {
    const run = newRun('x', { blessing: 'weitblick' });
    assert.eq(L.rewards.roll(run, 'battle', L.rng.create(1)).length, 4);
  });
  it('apply monster reward adds to team', () => {
    const run = newRun('m');
    const res = L.rewards.apply(run, { kind: 'monster', species: 'summsel', level: 5 }, {});
    assert.eq(run.team.length, 2);
    assert.eq(res.pendingRelease, null);
  });
  it('apply scroll teaches move', () => {
    const run = newRun('m');
    L.rewards.apply(run, { kind: 'move', move: 'flutwelle' }, { mon: 0, replaceIndex: 0 });
    assert.ok(run.team[0].moves.some((m) => m.id === 'flutwelle'));
    assert.ok(run.team[0].moves.length <= 4);
  });
  it('buy fails without gold', () => {
    const run = newRun('shop');
    const shop = nodesOf(run, 'shop')[0];
    jumpTo(run, shop);
    const p = L.run.enter(run, shop.id, day);
    assert.ok(p.shop.length >= 6);
    run.gold = 0;
    assert.throws(() => L.nodes.buy(run, 0, {}), /Gold/);
    run.gold = 1000;
    L.nodes.buy(run, 0, {});
    assert.ok(run.gold < 1000);
    assert.throws(() => L.nodes.buy(run, 0, {}), /verkauft/);
  });
  it('hidden node yields brummfels or hidden reward', () => {
    let battles = 0, rewards = 0;
    for (let s = 0; s < 40; s++) {
      const run = newRun('h' + s);
      const n = Object.values(run.map.nodes).find((x) => x.layer === 4);
      n.kind = 'hidden';
      jumpTo(run, n);
      const p = L.run.enter(run, n.id, day);
      if (p.battle) { battles++; assert.eq(p.battle.team[0].species, 'brummfels'); } else { rewards++; assert.ok(p.rewards.length >= 1); }
    }
    assert.ok(battles > 0 && rewards > 0);
  });
  it('boss complete finishes run when it is the last act', () => {
    const run = newRun('boss');
    const bossNode = run.map.nodes[run.map.boss];
    jumpTo(run, bossNode);
    const p = L.run.enter(run, bossNode.id, day);
    assert.eq(p.battle.kind, 'boss');
    L.run.complete(run);
    const acts = L.registry.all('act');
    if (acts.length === 1) assert.eq(run.finished, 'victory');
    else assert.eq(run.actIndex, 1);
  });
});
