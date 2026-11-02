// Bilder aus Dateien (img/…) mit automatischem Rückfall auf die Code-Grafik, wenn keine Datei da ist.
// Dateinamen: img/monsters/<id>.png, img/monsters/<id>_shiny.png, img/portraits/<id>.png,
// img/portraits/<id>_<ausdruck>.png, img/bg/<id>.jpg (oder .png)
(function (L) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // Ausdrucks-Porträts, die es wirklich als Datei gibt (img/portraits/<id>_<ausdruck>.png).
  // Neue Ausdrucks-Bilder hier eintragen, z. B. mira: ['froh', 'ernst']. Ohne Eintrag wird direkt <id>.png genommen.
  const EXPRESSIONS = {};
  // URLs, die schon einmal nicht geladen werden konnten – werden danach übersprungen (spart 404-Anfragen)
  const failed = new Set();

  function tag(kind, id, opts, cands, cls) {
    // Bekannt fehlende Dateien überspringen (die letzte Möglichkeit bleibt, dann greift der Code-Rückfall)
    const usable = cands.filter((c) => !failed.has(c.src));
    if (!usable.length) return '<span class="art-svg art-' + kind + '">' + svgFor(kind, id, opts) + '</span>';
    cands = usable;
    if (L.ui.game && L.ui.game.meta && L.settings.get(L.ui.game.meta, 'artMode') === 'gezeichnet') {
      return '<span class="art-svg art-' + kind + '">' + svgFor(kind, id, opts) + '</span>';
    }
    const data = esc(JSON.stringify({ kind, id, opts, cands }));
    const first = cands[0];
    return '<img class="art-img art-' + kind + ' ' + (first.cls || '') + ' ' + (cls || '') + '" src="' + first.src + '" alt="" draggable="false" data-art="' + data + '" data-step="0" onerror="LUM.ui.artFallback(this)">';
  }

  function svgFor(kind, id, opts) {
    if (kind === 'monster') return L.art.monster(id, opts);
    if (kind === 'portrait') return L.art.portrait(id, opts.expr, opts);
    return L.art.background(id, opts);
  }

  L.ui = L.ui || {};
  L.ui.artFallback = function (img) {
    const d = JSON.parse(img.getAttribute('data-art'));
    const step = Number(img.getAttribute('data-step')) + 1;
    if (d.cands[step - 1]) failed.add(d.cands[step - 1].src);
    if (step < d.cands.length) {
      img.setAttribute('data-step', step);
      img.className = 'art-img art-' + d.kind + ' ' + (d.cands[step].cls || '') + (d.opts.facing === 'left' ? ' face-left' : '');
      img.src = d.cands[step].src;
      return;
    }
    const span = document.createElement('span');
    span.className = 'art-svg art-' + d.kind;
    span.innerHTML = svgFor(d.kind, d.id, d.opts);
    img.replaceWith(span);
  };

  // Kampf-Monster mit Umgebungslicht: Farbschimmer und Schatten werden mit dem Monster-Bild als Maske darübergelegt.
  L.ui.blendLoaded = function (img) {
    const url = 'url("' + img.src + '")';
    img.parentNode.querySelectorAll('.tint, .shade').forEach((el) => { el.style.webkitMaskImage = url; el.style.maskImage = url; });
  };
  L.ui.blendFallback = function (img) {
    const fb = img.getAttribute('data-fb');
    if (fb) {
      img.removeAttribute('data-fb');
      img.classList.add('shiny-filter');
      img.src = fb;
      return;
    }
    const flip = img.closest('.flip');
    const o = JSON.parse(img.getAttribute('data-o'));
    flip.className = 'flip';
    flip.innerHTML = '<span class="art-svg art-monster">' + L.art.monster(o.id, { shiny: o.shiny, facing: o.facing }) + '</span>';
  };

  L.ui.art = {
    EXPRESSIONS,
    // Für den Kampfbildschirm: Bild mit Umgebungslicht (oder gezeichnete Version als Rückfall).
    battleMonster(mon, opts) {
      opts = opts || {};
      const drawn = L.ui.game && L.ui.game.meta && L.settings.get(L.ui.game.meta, 'artMode') === 'gezeichnet';
      if (drawn) return '<span class="art-svg art-monster">' + L.art.monster(mon.species, { shiny: mon.shiny, facing: opts.facing }) + '</span>';
      const base = 'img/monsters/' + mon.species;
      const o = esc(JSON.stringify({ id: mon.species, shiny: mon.shiny, facing: opts.facing }));
      return '<div class="flip' + (opts.facing === 'left' ? ' face-left' : '') + '"><div class="blend">' +
        '<img class="art-img" alt="" draggable="false" src="' + (mon.shiny ? base + '_shiny.png' : base + '.png') + '"' + (mon.shiny ? ' data-fb="' + base + '.png"' : '') +
        ' data-o="' + o + '" onload="LUM.ui.blendLoaded(this)" onerror="LUM.ui.blendFallback(this)">' +
        '<div class="tint"></div><div class="shade"></div></div></div>';
    },
    monster(id, opts) {
      opts = opts || {};
      const base = 'img/monsters/' + id;
      const cands = opts.shiny
        ? [{ src: base + '_shiny.png' }, { src: base + '.png', cls: 'shiny-filter' }]
        : [{ src: base + '.png' }];
      return tag('monster', id, opts, cands, opts.facing === 'left' ? 'face-left' : '');
    },
    portrait(id, expr, opts) {
      opts = Object.assign({ expr: expr || 'neutral' }, opts || {});
      const base = 'img/portraits/' + id;
      const hasExpr = (EXPRESSIONS[id] || []).indexOf(opts.expr) >= 0;
      return tag('portrait', id, opts, (hasExpr ? [{ src: base + '_' + opts.expr + '.png' }] : []).concat([{ src: base + '.png' }]), opts.facing === 'left' ? 'face-left' : '');
    },
    background(id, opts) {
      return tag('background', id, opts || {}, [{ src: 'img/bg/' + id + '.jpg' }, { src: 'img/bg/' + id + '.png' }]);
    },
  };
})(globalThis.LUM);
