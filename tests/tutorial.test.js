describe('tutorial tips', () => {
  const L = LUM;
  const fresh = () => L.save.freshMeta();

  it('has tips for the main situations', () => {
    for (const t of ['hub', 'map', 'battle', 'battleWild', 'spring', 'shop', 'summary']) assert.ok(L.tutorial.pending(fresh(), t).length > 0, t);
  });
  it('every tip has a known topic', () => {
    for (const t of L.tutorial.list()) assert.ok(L.tutorial.TOPICS.indexOf(t.topic) >= 0, t.id);
  });
  it('pending tips come in order and disappear once seen', () => {
    const m = fresh();
    const hub = L.tutorial.pending(m, 'hub');
    assert.eq(hub.map((t) => t.id), ['willkommen', 'spielerkarte']);
    L.tutorial.markSeen(m, 'willkommen');
    assert.eq(L.tutorial.pending(m, 'hub').map((t) => t.id), ['spielerkarte']);
    L.tutorial.reset(m);
    assert.eq(L.tutorial.pending(m, 'hub').length, 2);
  });
  it('seen tips survive save normalize', () => {
    const m = fresh();
    L.tutorial.markSeen(m, 'karte');
    const back = L.save.importCode(L.save.exportCode(m)).meta;
    assert.ok(L.tutorial.seen(back, 'karte'));
  });
  it('tutorial setting defaults to on', () => {
    assert.eq(L.settings.get(fresh(), 'tutorial'), true);
  });
  it('all tips pass validation', () => {
    assert.eq(L.registry.validate().filter((e) => /tip/.test(e)), []);
  });
});
