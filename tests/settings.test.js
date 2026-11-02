describe('settings', () => {
  const L = LUM;
  const store = () => {
    const data = {};
    return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: (k) => { delete data[k]; }, data };
  };

  it('fresh meta has all defaults', () => {
    const meta = L.save.freshMeta();
    for (const d of L.settings.defs) assert.eq(meta.settings[d.id], d.default, d.id);
  });
  it('old saves get missing settings filled in', () => {
    const s = store();
    s.setItem('lumora_meta', JSON.stringify({ version: 1, settings: { avatar: 'spieler_b' } }));
    L.save.setStorage(s);
    const meta = L.save.loadMeta();
    assert.eq(meta.settings.avatar, 'spieler_b');
    assert.eq(meta.settings.speed, 1);
    assert.eq(meta.settings.damageNumbers, true);
  });
  it('set validates values', () => {
    const meta = L.save.freshMeta();
    L.settings.set(meta, 'textSpeed', 'sofort');
    assert.eq(L.settings.get(meta, 'textSpeed'), 'sofort');
    assert.throws(() => L.settings.set(meta, 'textSpeed', 'rakete'), /Wert/);
    assert.throws(() => L.settings.set(meta, 'gibtsnicht', 1), /Einstellung/);
    L.settings.set(meta, 'shake', false);
    assert.eq(L.settings.get(meta, 'shake'), false);
  });
  it('every setting has group, label and valid default', () => {
    for (const d of L.settings.defs) {
      assert.ok(d.group && d.label, d.id);
      if (d.type === 'choice') assert.ok(d.options.some((o) => o.value === d.default), d.id);
      if (d.type === 'toggle') assert.eq(typeof d.default, 'boolean', d.id);
    }
  });
  it('effect level setting with four steps, default hoch', () => {
    const d = L.settings.defs.find((x) => x.id === 'fxLevel');
    assert.ok(d, 'fxLevel fehlt');
    assert.eq(d.options.map((o) => o.value), ['niedrig', 'mittel', 'hoch', 'ultra']);
    assert.eq(L.settings.get(L.save.freshMeta(), 'fxLevel'), 'hoch');
  });
  it('export and import roundtrip', () => {
    L.save.setStorage(store());
    const meta = L.save.freshMeta();
    meta.crystals = 77;
    const code = L.save.exportCode(meta, null);
    const back = L.save.importCode(code);
    assert.eq(back.meta.crystals, 77);
    assert.eq(back.run, null);
    assert.throws(() => L.save.importCode('quatsch'), /Code/);
  });
});
