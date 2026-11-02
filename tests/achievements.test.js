describe('achievements, titles, player name', () => {
  const L = LUM;
  const fresh = () => L.save.freshMeta();

  it('at least 28 achievements in four rarities', () => {
    const all = L.registry.all('achievement');
    assert.ok(all.length >= 28, 'nur ' + all.length);
    for (const r of ['gewoehnlich', 'selten', 'episch', 'legendaer']) assert.ok(all.some((a) => a.rarity === r), r);
  });
  it('rewards scale with rarity', () => {
    const R = L.achievements.RARITY;
    assert.ok(R.gewoehnlich.crystals < R.selten.crystals && R.selten.crystals < R.episch.crystals && R.episch.crystals < R.legendaer.crystals);
  });
  it('fresh meta has nothing unlocked', () => {
    const m = fresh();
    assert.eq(L.achievements.check(m), []);
    assert.eq(L.achievements.completion(m), 0);
  });
  it('tracking a stat unlocks and pays once', () => {
    const m = fresh();
    L.progress.track(m, 'battlesWon', 1);
    const got = L.achievements.check(m).map((a) => a.id);
    assert.ok(got.indexOf('erster_sieg') >= 0);
    assert.eq(m.crystals, L.achievements.RARITY.gewoehnlich.crystals * got.length);
    assert.eq(L.achievements.check(m), []);
  });
  it('boss defeat gives title', () => {
    const m = fresh();
    m.bossesDefeated.push('fenna');
    const got = L.achievements.check(m).map((a) => a.id);
    assert.ok(got.indexOf('waldretter') >= 0);
    assert.ok(m.titles.indexOf('Waldretter') >= 0);
  });
  it('progress value is capped and readable', () => {
    const m = fresh();
    L.progress.track(m, 'battlesWon', 37);
    const a = L.registry.get('achievement', 'kaempfer_2');
    assert.eq(L.achievements.value(m, a), 37);
    assert.eq(L.achievements.progress(m, a), 0.37);
  });
  it('every achievement value works on fresh meta', () => {
    const m = fresh();
    for (const a of L.registry.all('achievement')) assert.eq(typeof L.achievements.value(m, a), 'number', a.id);
  });
  it('player name setting is cleaned and limited', () => {
    const m = fresh();
    L.settings.set(m, 'playerName', '  <Luna>  ');
    assert.eq(L.settings.get(m, 'playerName'), 'Luna');
    L.settings.set(m, 'playerName', 'Ein viel zu langer Name hier');
    assert.eq(L.settings.get(m, 'playerName').length, 16);
  });
  it('display name falls back to avatar title', () => {
    const m = fresh();
    assert.eq(L.player.name(m), 'Bannträgerin');
    m.settings.avatar = 'spieler_b';
    assert.eq(L.player.name(m), 'Bannträger');
    m.settings.playerName = 'Kiro';
    assert.eq(L.player.name(m), 'Kiro');
  });
  it('story text inserts the name', () => {
    const m = fresh();
    m.settings.playerName = 'Luna';
    assert.eq(L.story.format('Hallo, {name}!', m), 'Hallo, Luna!');
  });
  it('old saves get achievement fields', () => {
    const data = {};
    L.save.setStorage({ getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; } });
    data.lumora_meta = JSON.stringify({ version: 1, crystals: 5, stats: { victories: 2, bestAct: 1 } });
    const m = L.save.loadMeta();
    assert.eq(m.achievements, {});
    assert.eq(m.titles, []);
    assert.eq(m.title, '');
    assert.eq(m.notices.indexOf('save_corrupt'), -1);
  });
});
