describe('save and progress', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12);
  const memStore = () => {
    const data = {};
    return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: (k) => { delete data[k]; }, data };
  };
  const newRun = (seed) => L.run.create({ seed, starter: 'plitsch', blessing: 'kugelregen', meta: null, now: day });

  it('meta roundtrip', () => {
    L.save.setStorage(memStore());
    const meta = L.save.loadMeta();
    assert.eq(meta.version, 1);
    meta.crystals = 42;
    meta.dex.summsel = { seen: true, caught: false, shinySeen: false, shinyCaught: false, traits: [] };
    L.save.saveMeta(meta);
    assert.eq(L.save.loadMeta().crystals, 42);
    assert.eq(L.save.loadMeta().dex.summsel.seen, true);
  });
  it('corrupt save is backed up', () => {
    const s = memStore();
    s.setItem('lumora_meta', '{kaputt');
    L.save.setStorage(s);
    const meta = L.save.loadMeta();
    assert.eq(meta.crystals, 0);
    assert.ok(meta.notices.indexOf('save_corrupt') >= 0);
    assert.eq(s.getItem('lumora_backup'), '{kaputt');
  });
  it('old version is migrated', () => {
    const s = memStore();
    s.setItem('lumora_meta', JSON.stringify({ version: 0, crystals: 7 }));
    L.save.setStorage(s);
    const meta = L.save.loadMeta();
    assert.eq(meta.version, 1);
    assert.eq(meta.crystals, 7);
    assert.eq(meta.dex, {});
  });
  it('missing storage falls back to memory', () => {
    L.save.setStorage({ getItem() { throw new Error('nein'); }, setItem() { throw new Error('nein'); }, removeItem() {} });
    const meta = L.save.loadMeta();
    meta.crystals = 3;
    L.save.saveMeta(meta);
    assert.eq(L.save.available, false);
    assert.eq(L.save.loadMeta().crystals, 3);
  });
  it('run roundtrip keeps rng state', () => {
    L.save.setStorage(memStore());
    const run = newRun('rt');
    L.save.saveRun(run);
    const loaded = L.save.loadRun();
    assert.eq(loaded, JSON.parse(JSON.stringify(run)));
    assert.eq(L.run.rng(loaded).next(), L.run.rng(run).next());
    L.save.clearRun();
    assert.eq(L.save.loadRun(), null);
  });
  it('resume mid-node returns to map with same pending', () => {
    L.save.setStorage(memStore());
    const run = newRun('mid');
    const p = L.run.enter(run, run.map.start[0], day);
    L.save.saveRun(run);
    // Kampf läuft, Spieler lädt neu
    const battle = L.run.makeBattle(run, day);
    L.battle.step(battle, { type: 'move', index: 0 });
    const loaded = L.save.loadRun();
    assert.eq(L.run.resume(loaded), { restartBattle: true });
    assert.eq(loaded.pending, JSON.parse(JSON.stringify(p)));
    assert.eq(loaded.team[0].hp, L.mon.maxHp(loaded.team[0]));
  });
  it('first catch flags', () => {
    const meta = L.save.freshMeta();
    const m = TH.mon('summsel', 5, { shiny: true });
    assert.eq(L.progress.caught(meta, m), { firstCatch: true, firstShiny: true });
    assert.eq(L.progress.caught(meta, m), { firstCatch: false, firstShiny: false });
    assert.eq(meta.dex.summsel.seen, true);
  });
  it('seen records traits', () => {
    const meta = L.save.freshMeta();
    L.progress.seen(meta, TH.mon('moosling', 5, { trait: 'riesig' }));
    assert.eq(meta.dex.moosling.traits, ['riesig']);
  });
  it('finishRun adds act crystals and counts runs', () => {
    const meta = L.save.freshMeta();
    const run = newRun('f');
    run.crystals = 4;
    run.finished = 'defeat';
    const res = L.progress.finishRun(meta, run);
    assert.eq(res.crystals, 4 + 5);
    assert.eq(meta.runs, 1);
    assert.eq(meta.crystals, 9);
  });
  it('dexCompletion ignores unseen uniques', () => {
    const meta = L.save.freshMeta();
    const total = L.progress.dexList(meta).filter((x) => x.counts).length;
    meta.dex.summsel = { seen: true, caught: true, shinySeen: false, shinyCaught: false, traits: [] };
    assert.near(L.progress.dexCompletion(meta), 1 / total);
  });
});
