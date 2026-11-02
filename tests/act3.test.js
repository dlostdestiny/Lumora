describe('act 3: Sturmgipfel', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const newRun = (seed, echo) => L.run.create({ seed, starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, echo: echo || 0, rank: 20 });
  const toAct = (run, n) => { while (run.actIndex < n) { run.pending = { node: 'BOSS', kind: 'boss', layer: 12 }; L.run.complete(run); } };

  it('three acts, the run is won after Sola', () => {
    assert.eq(L.run.acts().map((a) => a.id), ['act1', 'act2', 'act3']);
    const run = newRun('a3');
    toAct(run, 2);
    assert.eq(run.act, 'act3');
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    assert.ok(L.run.complete(run).victory);
  });
  it('the eclipse event only appears from Echo I on', () => {
    const count = (echo) => {
      let n = 0;
      for (let i = 0; i < 30; i++) {
        const run = newRun('ecl' + i, echo);
        toAct(run, 2);
        if (Object.values(run.map.nodes).some((x) => x.data.event === 'mondfinsternis')) n++;
      }
      return n;
    };
    assert.eq(count(0), 0);
    assert.ok(count(1) > 0);
  });
  it('nyxelle cannot be hit in the first two turns', () => {
    const b = TH.battle([TH.mon('glutaro', 30, { moves: ['glutbiss'] })], [TH.mon('nyxelle', 30)]);
    b.turn = 1;
    assert.eq(L.battle.hitChance(b, 0, L.moves.resolve({ id: 'glutbiss' })), 0);
    b.turn = 3;
    assert.ok(L.battle.hitChance(b, 0, L.moves.resolve({ id: 'glutbiss' })) > 0);
  });
  it('sola has a storm phase and a signature move', () => {
    const t = L.registry.get('trainer', 'sola');
    assert.eq(t.phases[0].weather, 'sturm');
    assert.ok(L.registry.get('move', 'himmelszorn').signature);
  });
  it('every act has a rival, three elites and a boss scene', () => {
    for (const a of L.run.acts()) {
      assert.ok(a.rival && a.elites.length === 3, a.id);
      assert.ok(L.registry.all('scene').some((s) => s.trigger === 'bossPre' && s.condition && s.condition.act === a.id), a.id);
    }
  });
});

describe('legends: stronger uniques', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const run = (rank, seed) => L.run.create({ seed: seed || 'leg', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, rank });

  it('uniques with legend need a minimum rank', () => {
    const r1 = run(1);
    r1.healedInAct = {};
    const a1 = L.registry.get('act', 'act1');
    assert.ok(!L.cond.check(a1.secrets[0].condition, { run: r1 }));
    assert.ok(L.cond.check(a1.secrets[0].condition, { run: run(3) }));
    assert.eq(L.registry.get('species', 'nyxelle').legend.rank, 12);
  });
  it('a legend fight has a level bonus and the legend affix', () => {
    const r = run(20);
    const setup = L.encounters.fromSpec(r, L.rng.create(1), { team: [{ species: 'wispelin', levelOffset: 0 }], kind: 'wild' }, 5);
    assert.ok(setup.legend);
    assert.eq(setup.affixes, ['legende']);
    assert.eq(setup.team[0].level, L.encounters.enemyLevel(r, 5) + L.config.legendLevelBonus);
  });
  it('the legend affix never appears on random elites', () => {
    for (let i = 0; i < 50; i++) assert.ok(L.affixes.random(L.rng.create('a' + i)) !== 'legende');
  });
  it('uniques are never handed out as rewards', () => {
    const r = run(20);
    for (let i = 0; i < 30; i++) {
      const rw = L.rewards.roll(r, 'hidden', L.rng.create('h' + i), 4)[0];
      assert.ok(L.registry.get('species', rw.species).rarity !== 'unique');
    }
  });
});

describe('frost status and new held items', () => {
  const L = LUM;
  it('frozen monsters cannot act, fire thaws them', () => {
    const b = TH.battle([TH.mon('glimmi', 20, { moves: ['glutbiss'] })], [TH.mon('moosling', 20, { moves: ['rempler'] })]);
    const foe = b.sides[1].team[0];
    foe.status = 'frost';
    foe.statusTurns = 2;
    const ev = L.battle.step(b, { type: 'move', index: 0 });
    assert.ok(ev.some((e) => e.t === 'statusEnd' && e.status === 'frost'));
    assert.eq(foe.status, null);
  });
  it('frost types are immune to freezing', () => {
    assert.ok(L.registry.get('status', 'frost').immune.indexOf('frost') >= 0);
  });
  it('the life orb hurts its holder', () => {
    const me = TH.mon('glimmi', 20, { moves: ['glutbiss'] });
    me.held = 'lebensorb';
    const b = TH.battle([me], [TH.mon('moosling', 30, { moves: ['brueller'] })]);
    const before = me.hp;
    L.battle.step(b, { type: 'move', index: 0 });
    assert.ok(me.hp < before);
  });
});

describe('side act: Versunkene Tiefe', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('the whirlpool leads into the side act after the next guardian, then back', () => {
    const run = L.run.create({ seed: 'tiefe', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    run.flags.nebenakt = true;
    run.pending = { node: 'BOSS', kind: 'boss', layer: 12 };
    L.run.complete(run);
    assert.eq(run.act, 'tiefe');
    assert.eq(run.map.layers, 9);
    run.pending = { node: 'BOSS', kind: 'boss', layer: 8 };
    const res = L.run.complete(run);
    assert.ok(res.actChanged);
    assert.eq(run.act, 'act2');
    assert.ok(run.relics.indexOf('perle_der_tiefe') >= 0);
    assert.ok(run.flags.nebenaktDone);
  });
  it('side acts are not main acts and its relic never appears randomly', () => {
    assert.ok(L.run.acts().every((a) => !a.side));
    const run = L.run.create({ seed: 'tiefe2', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    assert.ok(L.relics.available(run).every((r) => r.id !== 'perle_der_tiefe'));
  });
});
