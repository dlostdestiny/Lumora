// Kristall-Shop im Schrein: dauerhafte Freischaltungen für Kristalle.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  function preview(u) {
    if (u.kind === 'starter') return '<div class="cs-art">' + ui.art.monster(u.species, {}) + '</div>';
    if (u.kind === 'frame') return '<div class="cs-frame frame-' + u.frame + '"><span>' + u.icon + '</span></div>';
    return '<div class="cs-icon">' + u.icon + '</div>';
  }

  ui.screens.register('crystalshop', {
    render(el) {
      const meta = ui.game.meta;
      const total = R().all('unlock').length, owned = R().all('unlock').filter((u) => L.unlocks.owned(meta, u.id)).length;
      const sections = L.unlocks.CATEGORIES.map((cat) => {
        const list = R().all('unlock').filter((u) => u.category === cat);
        return '<h3 class="cs-h">' + ui.esc(cat) + '</h3><div class="cs-grid">' + list.map((u) => {
          const has = L.unlocks.owned(meta, u.id);
          const why = has ? null : L.unlocks.blocker(meta, u.id);
          const locked = why && why.indexOf('Erst') === 0;
          let btn;
          if (has && u.kind === 'frame') btn = '<button class="btn' + (meta.frame === u.frame ? '' : ' secondary') + '" data-frame="' + u.frame + '">' + (meta.frame === u.frame ? '✓ Angelegt' : 'Anlegen') + '</button>';
          else if (has) btn = '<span class="cs-owned">✓ Freigeschaltet</span>';
          else btn = '<button class="btn" data-buy="' + u.id + '"' + (why ? ' disabled' : '') + '>💎 ' + u.cost + '</button>' + (why && why !== 'Nicht genug Kristalle' ? '<small class="muted">' + ui.esc(why) + '</small>' : '');
          return '<div class="cs-card glass' + (has ? ' owned' : '') + (locked ? ' locked' : '') + '">' + preview(u) + '<div class="cs-txt"><b>' + ui.esc(u.name) + '</b><p>' + ui.esc(u.desc) + '</p><div class="cs-buy">' + btn + '</div></div></div>';
        }).join('') + '</div>';
      }).join('');
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.72)"></div>' +
        '<div class="screen cs-screen"><div class="cs-top glass"><div class="cs-crystal">💎</div><div><h2>Kristall-Shop</h2>' +
        '<p class="muted">Kristalle bekommst du aus Läufen, Erfolgen und Aufträgen. Was du hier kaufst, bleibt für immer.</p>' +
        '<div class="row" style="gap:16px"><span class="cs-have">💎 <b>' + meta.crystals + '</b></span><span class="muted">' + owned + ' / ' + total + ' freigeschaltet</span>' +
        (meta.frame ? '<button class="link" data-frame="">Rahmen ablegen</button>' : '') + '</div></div></div>' + sections +
        '<button class="btn" data-back>Zurück</button></div>';
      el.querySelectorAll('[data-buy]').forEach((b) => {
        b.onclick = async () => {
          const u = R().get('unlock', b.dataset.buy);
          if (ui.setting('confirm') && !(await ui.choose(u.icon + ' ' + u.name, ui.esc(u.desc) + '<br><br>Für <b>💎 ' + u.cost + '</b> kaufen?', [{ label: 'Kaufen', value: true }], 'Abbrechen'))) return;
          L.unlocks.buy(meta, u.id);
          if (u.kind === 'frame') meta.frame = u.frame;
          ui.game.persist();
          ui.screens.show('crystalshop');
          ui.shopToast(u);
        };
      });
      el.querySelectorAll('[data-frame]').forEach((b) => { b.onclick = () => { meta.frame = b.dataset.frame; ui.game.persist(); ui.screens.show('crystalshop'); }; });
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });

  ui.shopToast = (u) => {
    const t = document.createElement('div');
    t.className = 'ach-toast r-episch';
    t.style.setProperty('--rc', '#5fd4ff');
    t.style.top = (18 + ui.root().querySelectorAll('.ach-toast').length * 82) + 'px';
    t.innerHTML = '<div class="ic">' + u.icon + '</div><div><small>💎 Freigeschaltet</small><b>' + ui.esc(u.name) + '</b><span>Gilt ab deinem nächsten Lauf.</span></div>';
    ui.root().appendChild(t);
    setTimeout(() => t.classList.add('out'), 3600);
    setTimeout(() => t.remove(), 4200);
  };
})(globalThis.LUM);
