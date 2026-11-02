describe('echo levels', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12);
  const mk = (echo, seed) => L.run.create({ seed: seed || 'echo', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day, echo });
  const jumpTo = (run, node) => {
    const parent = Object.values(run.map.nodes).find((n) => n.links.indexOf(node.id) >= 0);
    run.position = parent ? parent.id : null;
  };

  it('six echo levels 0..5, cumulative mods', () => {
    assert.eq(L.registry.all('echo').map((e) => e.level), [0, 1, 2, 3, 4, 5]);
    assert.eq(L.echo.mods(0).enemyLevel, 0);
    assert.eq(L.echo.mods(1).enemyLevel, 1);
    assert.eq(L.echo.mods(5).enemyLevel, 1);
    assert.eq(L.echo.mods(2).springHeal, 0.6);
    assert.eq(L.echo.mods(1).springHeal, 1);
    assert.eq(L.echo.mods(5).postBattleHeal, 0);
    assert.eq(L.echo.mods(5).crystalMult, 2.5);
  });
  it('run remembers echo level', () => assert.eq(mk(3).echo, 3));
  it('enemy levels rise with echo', () => {
    const r0 = mk(0), r1 = mk(1);
    assert.eq(L.encounters.enemyLevel(r1, 5), L.encounters.enemyLevel(r0, 5) + 1);
  });
  it('springs heal only 60% from echo 2', () => {
    const run = mk(2);
    const spring = Object.values(run.map.nodes).find((n) => n.kind === 'spring');
    jumpTo(run, spring);
    run.team[0].hp = 0;
    L.run.enter(run, spring.id, day);
    L.nodes.spring(run, 'heal', {});
    assert.eq(run.team[0].hp, Math.floor(L.mon.maxHp(run.team[0]) * 0.6));
  });
  it('echo 2 gives 4 battle rewards', () => {
    assert.eq(L.rewards.roll(mk(2), 'battle', L.rng.create(1)).length, 4);
    assert.eq(L.rewards.roll(mk(1), 'battle', L.rng.create(1)).length, 3);
  });
  it('echo 3 elites always have an affix, boss too', () => {
    const run = mk(3);
    assert.eq(L.encounters.elite(run, L.rng.create(2), 4).affixes.length, 1);
    assert.eq(L.encounters.boss(run, L.rng.create(2)).affixes.length, 1);
    assert.eq(L.encounters.boss(mk(2), L.rng.create(2)).affixes.length, 0);
  });
  it('echo 4 starts with fewer items and pricier shop', () => {
    const r = mk(4);
    assert.eq(r.items.fangkugel, 2);
    assert.eq(r.items.heiltrank, 1);
    const shop = L.nodes.shopStock(r, L.rng.create(3));
    const base = L.nodes.shopStock(mk(0), L.rng.create(3));
    assert.eq(shop[0].price, Math.round(base[0].price * 1.25));
  });
  it('echo 5 starts with a rare relic', () => {
    const r = mk(5);
    assert.ok(r.relics.some((id) => L.registry.get('relic', id).rarity === 'rare'));
  });
  it('victory unlocks the next level once', () => {
    const meta = L.save.freshMeta();
    const run = mk(1);
    run.finished = 'victory';
    const res = L.progress.finishRun(meta, run);
    assert.eq(meta.echoUnlocked, 2);
    assert.eq(meta.echoBest, 1);
    assert.eq(res.unlocked, 2);
    assert.eq(L.progress.finishRun(meta, run).unlocked, 2);
    const run0 = mk(0);
    run0.finished = 'victory';
    L.progress.finishRun(meta, run0);
    assert.eq(meta.echoUnlocked, 2);
  });
  it('crystals multiplied by echo level on finish', () => {
    const meta = L.save.freshMeta();
    const run = mk(5);
    run.crystals = 10;
    run.finished = 'defeat';
    const res = L.progress.finishRun(meta, run);
    assert.eq(res.crystals, Math.round((10 + 5) * 2.5));
  });
});
