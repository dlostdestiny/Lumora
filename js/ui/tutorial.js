// Tutorial-Oberfläche: Mira erklärt mit einer Sprechblase und hebt das passende Element hervor. Dazu die Anleitung im Schrein.
(function (L) {
  const ui = L.ui;
  let queue = Promise.resolve();

  // Zeigt alle ungesehenen Tipps eines Auslösers nacheinander. Gibt ein Promise zurück, das nach dem letzten Tipp erfüllt ist.
  function show(trigger, ctx) {
    const meta = ui.game.meta;
    if (!meta || !ui.setting('tutorial')) return Promise.resolve();
    const tips = L.tutorial.pending(meta, trigger, ctx);
    if (!tips.length) return Promise.resolve();
    tips.forEach((t) => L.tutorial.markSeen(meta, t.id));
    L.save.saveMeta(meta);
    queue = queue.then(async () => {
      while (ui.root().querySelector('.dialog')) await new Promise((r) => setTimeout(r, 300));
      for (let i = 0; i < tips.length; i++) {
        if (!ui.setting('tutorial')) break;
        await bubble(tips[i], i + 1, tips.length);
      }
    });
    return queue;
  }

  // Sichtbarer Teil des Ziel-Elements (auf das Fenster zugeschnitten) oder null.
  function findTarget(sel) {
    if (!sel) return null;
    const vw = window.innerWidth, vh = window.innerHeight;
    for (const s of sel.split(',')) {
      // Mehrere Treffer (z. B. alle offenen Felder) werden zusammen hervorgehoben
      const els = [...ui.root().querySelectorAll(s.trim())].map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
      if (!els.length) continue;
      const r = { left: Math.min(...els.map((b) => b.left)), top: Math.min(...els.map((b) => b.top)), right: Math.max(...els.map((b) => b.right)), bottom: Math.max(...els.map((b) => b.bottom)) };
      const left = Math.max(4, r.left), top = Math.max(4, r.top), right = Math.min(vw - 4, r.right), bottom = Math.min(vh - 4, r.bottom);
      if (right - left > 0 && bottom - top > 0) return { left, top, right, bottom, width: right - left, height: bottom - top };
    }
    return null;
  }

  // Platz für die Sprechblase: unter, über, rechts oder links vom Element; sonst unten in der Mitte.
  function place(rect, pad) {
    const vw = window.innerWidth, vh = window.innerHeight, W = 476, H = 210, gap = pad + 14;
    const left = Math.max(16, Math.min(vw - W, rect.left + rect.width / 2 - 230));
    const top = Math.max(16, Math.min(vh - H, rect.top + rect.height / 2 - 90));
    if (vh - rect.bottom - gap >= H) return 'left:' + left + 'px;top:' + (rect.bottom + gap) + 'px';
    if (rect.top - gap >= H) return 'left:' + left + 'px;bottom:' + (vh - rect.top + gap) + 'px';
    if (vw - rect.right - gap >= W) return 'left:' + (rect.right + gap) + 'px;top:' + top + 'px';
    if (rect.left - gap >= W) return 'right:' + (vw - rect.left + gap) + 'px;top:' + top + 'px';
    return 'left:50%;bottom:20px;transform:translateX(-50%)';
  }

  function bubble(tip, n, total) {
    return new Promise((resolve) => {
      const rect = findTarget(tip.target);
      const layer = document.createElement('div');
      layer.className = 'tut-layer';
      const pad = 8;
      // Abdunkeln aus vier Flächen um das Element herum, dazu ein leuchtender Rahmen
      let hole = '<div class="tut-dim" style="inset:0"></div>';
      if (rect) {
        const x1 = Math.max(0, rect.left - pad), y1 = Math.max(0, rect.top - pad), x2 = rect.right + pad, y2 = rect.bottom + pad;
        const box = (l, t, w, h) => '<div class="tut-dim" style="left:' + l + 'px;top:' + t + 'px;width:' + w + ';height:' + h + '"></div>';
        hole = box(0, 0, '100%', y1 + 'px') + '<div class="tut-dim" style="left:0;top:' + y2 + 'px;right:0;bottom:0"></div>' +
          box(0, y1, x1 + 'px', (y2 - y1) + 'px') + '<div class="tut-dim" style="left:' + x2 + 'px;top:' + y1 + 'px;right:0;height:' + (y2 - y1) + 'px"></div>' +
          '<div class="tut-hole" style="left:' + x1 + 'px;top:' + y1 + 'px;width:' + (x2 - x1) + 'px;height:' + (y2 - y1) + 'px"></div>';
      }
      const pos = rect ? place(rect, pad) : 'left:50%;top:50%;transform:translate(-50%,-50%)';
      layer.innerHTML = hole +
        '<div class="tut-bubble glass" style="' + pos + '"><div class="tut-mira">' + ui.art.portrait('mira', 'froh', {}) + '</div>' +
        '<div class="tut-body"><small>💡 Miras Tipp' + (total > 1 ? ' · ' + n + '/' + total : '') + '</small><b>' + ui.esc(tip.title) + '</b><p>' + ui.esc(tip.text) + '</p>' +
        '<div class="row tut-btns"><button class="link tut-off">Keine Tipps mehr</button><button class="btn tut-ok">' + (n < total ? 'Weiter' : 'Verstanden!') + '</button></div></div></div>';
      ui.root().appendChild(layer);
      let watch = null;
      const close = () => { clearInterval(watch); layer.remove(); document.removeEventListener('keydown', onKey, true); resolve(); };
      const onKey = (e) => {
        if (!layer.isConnected) return close();
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); close(); }
        e.stopPropagation();
      };
      document.addEventListener('keydown', onKey, true);
      layer.querySelector('.tut-ok').onclick = close;
      layer.querySelector('.tut-off').onclick = () => {
        L.settings.set(ui.game.meta, 'tutorial', false);
        L.save.saveMeta(ui.game.meta);
        close();
      };
      // Wird die Ebene durch einen Bildschirmwechsel entfernt, geht es trotzdem weiter.
      watch = setInterval(() => { if (!layer.isConnected) close(); }, 500);
    });
  }

  ui.tutorial = { show };

  // Anleitung: alle Tipps nach Themen, auch die schon gesehenen.
  ui.screens.register('guide', {
    render(el) {
      const meta = ui.game.meta;
      const list = L.tutorial.list();
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.72)"></div>' +
        '<div class="screen guide-screen"><div class="guide-head glass"><div class="tut-mira big">' + ui.art.portrait('mira', 'froh', {}) + '</div>' +
        '<div><h2>📘 Anleitung</h2><p class="muted">Alles, was Mira dir unterwegs erklärt, kannst du hier nachlesen.</p>' +
        '<div class="row"><button class="btn secondary" data-reset>🔄 Tipps neu zeigen</button><span class="muted">Miras Tipps: <b>' + (ui.setting('tutorial') ? 'An' : 'Aus') + '</b></span></div></div></div>' +
        L.tutorial.TOPICS.map((topic) => '<h3 class="guide-h">' + ui.esc(topic) + '</h3><div class="guide-grid">' +
          list.filter((t) => t.topic === topic).map((t) => '<div class="guide-card glass' + (L.tutorial.seen(meta, t.id) ? '' : ' new') + '"><b>' + ui.esc(t.title) + '</b><p>' + ui.esc(t.text) + '</p></div>').join('') + '</div>').join('') +
        '<h3 class="guide-h">⌨️ Tastatur</h3><div class="guide-grid">' + ui.KEY_HELP.map((k) => '<div class="guide-card glass"><b>' + ui.esc(k[0]) + '</b><p>' + ui.esc(k[1]) + '</p></div>').join('') + '</div>' +
        '<button class="btn" data-back>Zurück</button></div>';
      el.querySelector('[data-reset]').onclick = () => {
        L.tutorial.reset(meta);
        L.settings.set(meta, 'tutorial', true);
        L.save.saveMeta(meta);
        ui.screens.show('hub');
      };
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
