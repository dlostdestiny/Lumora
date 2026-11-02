// Brutnest und Hort im Schrein: Eier ansehen, pflegen, schlüpfen lassen; Schlüpflinge verwalten.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  // Gezeichnetes Ei in der Farbe seiner Art (warm = leuchtet, bereit = wackelt)
  ui.eggArt = (egg, size) => {
    const k = L.eggs.KINDS[egg.kind];
    const s = size || 90;
    const warm = Math.min(1, egg.warmth / egg.need);
    const id = 'eg' + Math.random().toString(36).slice(2, 8);
    const spots = [[38, 40, 7], [62, 58, 9], [44, 72, 6], [66, 34, 5], [30, 60, 5]].map(([x, y, r]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + (r * 0.8) + '" fill="' + k.spot + '" opacity=".75"/>').join('');
    return '<svg class="egg-svg' + (L.eggs.ready(egg) ? ' ready' : '') + (egg.kind === 'schimmer' ? ' shimmer' : '') + '" viewBox="0 0 100 110" width="' + s + '" height="' + (s * 1.1) + '">' +
      '<defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".35" stop-color="' + k.color + '"/><stop offset="1" stop-color="' + L.palette.shade(k.color, 0.45) + '"/></radialGradient></defs>' +
      '<ellipse cx="50" cy="102" rx="30" ry="6" fill="#000" opacity=".25"/>' +
      (warm > 0 ? '<ellipse cx="50" cy="58" rx="44" ry="50" fill="#ffb347" opacity="' + (0.15 + warm * 0.35).toFixed(2) + '" class="egg-glow"/>' : '') +
      '<path d="M50 8 C76 8 90 52 88 72 C86 92 70 102 50 102 C30 102 14 92 12 72 C10 52 24 8 50 8Z" fill="url(#' + id + ')" stroke="#2b2238" stroke-width="3"/>' + spots +
      '<path d="M30 30 Q36 18 46 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>' +
      (warm >= 0.66 ? '<path d="M42 50 l6 8 l-4 6 l7 9" stroke="#2b2238" stroke-width="2.5" fill="none" stroke-linecap="round"/>' : '') + '</svg>';
  };

  ui.eggToast = (egg) => {
    if (egg.toasted) return;
    egg.toasted = true;
    const k = L.eggs.KINDS[egg.kind];
    const t = document.createElement('div');
    t.className = 'ach-toast r-selten';
    t.style.setProperty('--rc', k.color);
    t.style.top = (18 + ui.root().querySelectorAll('.ach-toast').length * 82) + 'px';
    t.innerHTML = '<div class="ic">' + ui.eggArt(egg, 44) + '</div><div><small>🥚 Ei gefunden</small><b>' + ui.esc(k.name) + '</b><span>Es kommt nach dem Lauf in dein Brutnest.</span></div>';
    ui.root().appendChild(t);
    if (ui.sound) ui.sound('coin');
    setTimeout(() => ui.tutorial.show('egg'), 1200);
    setTimeout(() => t.classList.add('out'), 4000);
    setTimeout(() => t.remove(), 4600);
  };

  function hortCard(h, meta) {
    const sp = R().get('species', h.species);
    const nat = R().has('nature', h.nature) ? R().get('nature', h.nature).name : '';
    const tr = h.trait && R().has('trait', h.trait) ? R().get('trait', h.trait).name : '';
    const em = h.eggMove && R().has('move', h.eggMove) ? R().get('move', h.eggMove) : null;
    const ab = R().get('ability', h.hiddenAbility && sp.hiddenAbility ? sp.hiddenAbility : sp.ability);
    const fav = meta.companion && meta.companion.type === 'hort' && meta.companion.uid === h.uid;
    return '<div class="hort-card glass' + (fav ? ' fav' : '') + '"><div class="art">' + ui.art.monster(h.species, { shiny: h.shiny }) + '</div><div class="ht">' +
      '<b>' + ui.esc(sp.name) + (h.shiny ? ' ✨' : '') + '</b><div>' + sp.types.map(ui.typeChip).join('') + '</div>' +
      '<small>' + ui.esc([nat, tr].filter(Boolean).join(' · ')) + '</small>' +
      '<small>' + (h.hiddenAbility && sp.hiddenAbility ? '✨ ' : '') + ui.esc(ab.name) + '</small>' +
      (em ? '<small class="egg-move">🥚 Ei-Attacke: <b>' + ui.esc(em.name) + '</b></small>' : '') +
      '<small>♥ Bindung ' + (h.bond || 0) + '</small>' +
      '<div class="row" style="gap:6px;margin-top:4px"><button class="btn' + (fav ? '' : ' secondary') + '" data-fav="' + h.uid + '">' + (fav ? '⭐ Begleiter' : 'Als Begleiter') + '</button>' +
      '<button class="btn secondary" data-free="' + h.uid + '" title="Freilassen: +15 Kristalle">🕊️</button></div></div></div>';
  }

  ui.screens.register('brutnest', {
    render(el) {
      const meta = ui.game.meta;
      meta.eggs = meta.eggs || [];
      meta.hort = meta.hort || [];
      const slots = L.eggs.slots(meta);
      const nests = [];
      for (let i = 0; i < slots; i++) {
        const egg = meta.eggs[i];
        if (!egg) { nests.push('<div class="nest glass empty"><div class="nest-bowl">🪺</div><small class="muted">Leeres Nest. Finde Eier in deinen Läufen!</small></div>'); continue; }
        const k = L.eggs.KINDS[egg.kind];
        const care = Object.keys(L.eggs.CARE).map((c) => { const d = L.eggs.CARE[c]; return '<button class="seg-btn tip' + (egg.care === c ? ' on' : '') + '" data-care="' + egg.id + ':' + c + '" data-tip="' + ui.esc(d.desc) + '">' + d.icon + ' ' + ui.esc(d.name) + '</button>'; }).join('');
        nests.push('<div class="nest glass" style="--ec:' + k.color + '"><div class="nest-egg">' + ui.eggArt(egg, 96) + '</div><b>' + ui.esc(k.name) + (egg.parentName ? ' <small>(von ' + ui.esc(egg.parentName) + ')</small>' : '') + '</b>' +
          '<div class="warm-bar"><i style="width:' + Math.round(egg.warmth / egg.need * 100) + '%"></i><span>🔥 ' + egg.warmth + ' / ' + egg.need + '</span></div>' +
          '<div class="care-row">' + care + '</div>' +
          (L.eggs.ready(egg) ? '<button class="btn big hatch-btn" data-hatch="' + egg.id + '">🐣 Schlüpfen lassen!</button>' : '<small class="muted">Wird durch deine Läufe gewärmt. Je weiter du kommst, desto mehr.</small>') + '</div>');
      }
      const comp = meta.companion;
      const echo = meta.echoCompanion;
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.7)"></div>' +
        '<div class="screen nest-screen"><div class="nest-top glass"><div><h2>🥚 Brutnest</h2><p class="muted">Eier findest du in Läufen. Jeder Lauf wärmt sie. Wähle für jedes Ei eine Pflege: Sie bestimmt, was schlüpft.</p></div>' +
        '<div class="nest-info"><span>🪺 ' + meta.eggs.length + ' / ' + slots + ' Nester</span><span>🏡 ' + meta.hort.length + ' / ' + L.eggs.hortSize(meta) + ' im Hort</span></div></div>' +
        '<div class="nest-grid">' + nests.join('') + '</div>' +
        '<div class="nest-top glass"><div><h3 style="margin:0">🏡 Hort</h3><p class="muted" style="margin:2px 0 0">Geschlüpfte Monster leben hier. Einen davon kannst du als <b>Begleiter</b> in einen Lauf mitnehmen. Er startet auf Level 5 und kann seine Ei-Attacke.</p></div>' +
        (echo ? '<div class="echo-comp"><span>👻 Echo-Begleiter bereit: <b>' + ui.esc(R().get('species', echo.species).name) + '</b> (Lv ' + echo.level + ')</span><button class="btn' + (comp && comp.type === 'echo' ? '' : ' secondary') + '" data-echo>' + (comp && comp.type === 'echo' ? '⭐ Gewählt' : 'Als Begleiter') + '</button></div>' : '') +
        (comp ? '<button class="link" data-nofav>Keinen Begleiter mitnehmen</button>' : '') + '</div>' +
        '<div class="hort-grid">' + (meta.hort.length ? meta.hort.map((h) => hortCard(h, meta)).join('') : '<p class="muted">Noch niemand geschlüpft.</p>') + '</div>' +
        '<button class="btn" data-back>Zurück</button></div>';
      el.querySelectorAll('[data-care]').forEach((b) => {
        b.onclick = () => { const [id, c] = b.dataset.care.split(':'); const e = meta.eggs.find((x) => x.id === id); e.care = e.care === c ? null : c; ui.game.persist(); ui.screens.show('brutnest'); };
      });
      el.querySelectorAll('[data-hatch]').forEach((b) => {
        b.onclick = async () => {
          if (meta.hort.length >= L.eggs.hortSize(meta)) return ui.alert('Der Hort ist voll', 'Lass erst ein Monster frei oder baue im Kristall-Shop einen größeren Hort.');
          if (b.disabled) return;
          const egg = meta.eggs.find((x) => x.id === b.dataset.hatch);
          if (!egg) return;
          // Sofort sperren, damit ein Doppelklick während der Animation nicht zweimal schlüpfen lässt
          el.querySelectorAll('[data-hatch]').forEach((x) => { x.disabled = true; });
          const box = b.closest('.nest').querySelector('.nest-egg');
          box.classList.add('hatching');
          if (ui.sound) ui.sound('evolve');
          await ui.wait(1600);
          const baby = L.eggs.hatch(meta, egg.id, L.rng.create(Date.now() >>> 0));
          ui.game.persist();
          const sp = R().get('species', baby.species);
          await ui.alert('🐣 Es ist geschlüpft!', '<div class="row center" style="gap:16px"><div style="width:160px;height:160px">' + ui.art.monster(baby.species, { shiny: baby.shiny }) + '</div><div>' +
            '<h3 style="margin:0">' + ui.esc(sp.name) + (baby.shiny ? ' ✨ Schimmer!' : '') + '</h3>' + sp.types.map(ui.typeChip).join('') +
            (baby.eggMove ? '<p>🥚 Ei-Attacke: <b>' + ui.esc(R().get('move', baby.eggMove).name) + '</b></p>' : '') + (baby.hiddenAbility && sp.hiddenAbility ? '<p>✨ Versteckte Fähigkeit: <b>' + ui.esc(R().get('ability', sp.hiddenAbility).name) + '</b></p>' : '') +
            '<p class="muted">Es lebt jetzt im Hort.</p></div></div>', 'Hallo, Kleines!');
          ui.screens.show('brutnest');
        };
      });
      el.querySelectorAll('[data-fav]').forEach((b) => { b.onclick = () => { meta.companion = { type: 'hort', uid: b.dataset.fav }; ui.game.persist(); ui.screens.show('brutnest'); }; });
      const eb = el.querySelector('[data-echo]');
      if (eb) eb.onclick = () => { meta.companion = { type: 'echo' }; ui.game.persist(); ui.screens.show('brutnest'); };
      const nf = el.querySelector('[data-nofav]');
      if (nf) nf.onclick = () => { meta.companion = null; ui.game.persist(); ui.screens.show('brutnest'); };
      el.querySelectorAll('[data-free]').forEach((b) => {
        b.onclick = async () => {
          const h = meta.hort.find((x) => x.uid === b.dataset.free);
          if (ui.setting('confirm') && !(await ui.choose('Freilassen?', ui.esc(R().get('species', h.species).name) + ' kehrt in die Wildnis zurück. Du bekommst 15 Kristalle.', [{ label: 'Ja, freilassen', value: true }], 'Doch nicht'))) return;
          if (meta.companion && meta.companion.uid === h.uid) meta.companion = null;
          L.eggs.release(meta, h.uid);
          ui.game.persist();
          ui.screens.show('brutnest');
        };
      });
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
