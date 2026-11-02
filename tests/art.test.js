describe('art', () => {
  const L = LUM;
  it('every species renders svg string starting with <svg', () => {
    for (const s of L.registry.all('species')) {
      const svg = L.art.monster(s.id, {});
      assert.ok(svg.indexOf('<svg') === 0, s.id);
      assert.ok(svg.indexOf('NaN') < 0, s.id + ' enthält NaN');
      assert.ok(svg.indexOf('undefined') < 0, s.id + ' enthält undefined');
      const shiny = L.art.monster(s.id, { shiny: true, facing: 'left' });
      assert.ok(shiny.indexOf('sparkle') > 0, s.id + ' shiny ohne Funkeln');
    }
  });
  it('shiny uses shiny palette color', () => {
    const sp = L.registry.get('species', 'glimmi');
    const svg = L.art.monster('glimmi', { shiny: true });
    assert.ok(svg.indexOf(sp.art.shinyPalette.main) > 0);
    assert.ok(L.art.monster('glimmi', {}).indexOf(sp.art.shinyPalette.main) < 0);
  });
  it('gradient ids unique across two calls', () => {
    const ids = (s) => (s.match(/id="([^"]+)"/g) || []);
    const a = ids(L.art.monster('summsel', {})), b = ids(L.art.monster('summsel', {}));
    assert.ok(a.length > 0);
    for (const x of a) assert.ok(b.indexOf(x) < 0, 'doppelt: ' + x);
  });
  it('unknown body throws', () => {
    assert.throws(() => L.art.monsterFromSpec({ body: 'wurst', palette: { main: '#fff', belly: '#fff', accent: '#fff', eye: '#000' } }, {}), /Körperform/);
  });
  it('every character renders', () => {
    for (const c of L.registry.all('character')) {
      if (!c.portrait) continue;
      const svg = L.art.portrait(c.id, 'neutral', {});
      assert.ok(svg.indexOf('<svg') === 0 && svg.indexOf('NaN') < 0 && svg.indexOf('undefined') < 0, c.id);
    }
  });
  it('every expr renders differently', () => {
    const out = {};
    for (const e of ['neutral', 'froh', 'ernst', 'traurig', 'wuetend', 'ueberrascht']) {
      const svg = L.art.portrait('mira', e, {}).replace(/id="[^"]+"|url\(#[^)]+\)/g, '');
      assert.ok(svg.indexOf('NaN') < 0, e);
      out[svg] = e;
    }
    assert.eq(Object.keys(out).length, 6);
  });
  it('every background renders', () => {
    for (const id of ['wald', 'moor', 'schrein', 'arena_boss', 'vulkan', 'grotte', 'arena_brakk', 'gipfel', 'nebelkamm', 'arena_sola', 'glasebene', 'sternenstrom', 'arena_vael']) {
      const svg = L.art.background(id, {});
      assert.ok(svg.indexOf('<svg') === 0 && svg.indexOf('NaN') < 0 && svg.indexOf('undefined') < 0, id);
    }
    assert.throws(() => L.art.background('mond', {}), /Hintergrund/);
  });
  it('every species, character and background has an image prompt', () => {
    for (const s of L.registry.all('species')) {
      assert.ok(L.prompts.monsters[s.id], 'Prompt fehlt: ' + s.id);
      assert.ok(L.prompts.shiny[s.id], 'Schimmer-Prompt fehlt: ' + s.id);
    }
    for (const c of L.registry.all('character')) if (c.portrait) assert.ok(L.prompts.characters[c.id], 'Prompt fehlt: ' + c.id);
    for (const id of ['wald', 'moor', 'schrein', 'arena_boss', 'vulkan', 'grotte', 'arena_brakk', 'gipfel', 'nebelkamm', 'arena_sola', 'glasebene', 'sternenstrom', 'arena_vael']) assert.ok(L.prompts.backgrounds[id], id);
  });
  it('shade darkens', () => {
    assert.eq(L.palette.shade('#ffffff', 0.5), '#808080');
    assert.eq(L.palette.shade('#000000', -0.5), '#808080');
  });
});
