// Bannträger-Rang und Talentbaum im Schrein.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  // Rang-Abzeichen mit Fortschrittsbalken (für Spielerkarte und Zusammenfassung)
  ui.rankBadge = (meta) => {
    const i = L.rank.info(meta);
    const pts = L.rank.points(meta);
    return '<div class="rank-badge" title="Bannträger-Rang ' + i.rank + '"><span class="rk">⭐ ' + i.rank + '</span><div class="rk-bar"><i style="width:' + (i.need ? Math.round(i.xp / i.need * 100) : 100) + '%"></i></div>' +
      (pts > 0 ? '<span class="rk-pts">+' + pts + '</span>' : '') + '</div>';
  };

  ui.screens.register('talents', {
    render(el) {
      const meta = ui.game.meta;
      const info = L.rank.info(meta);
      const pts = L.rank.points(meta);
      const next = L.rank.RANK_STARTERS.find((s) => s.rank > info.rank);
      const paths = Object.keys(L.rank.PATHS).map((pid) => {
        const p = L.rank.PATHS[pid];
        const list = R().all('talent').filter((t) => t.path === pid);
        const spent = list.reduce((a, t) => a + ((meta.talents || {})[t.id] || 0), 0);
        return '<div class="tal-path glass" style="--pc:' + p.color + '"><div class="tal-head"><span class="tal-icon">' + p.icon + '</span><div><b>' + ui.esc(p.name) + '</b><small>' + ui.esc(p.desc) + '</small></div><span class="tal-spent">' + spent + '</span></div>' +
          list.map((t) => {
            const lv = (meta.talents || {})[t.id] || 0;
            const can = L.rank.canLearn(meta, t.id);
            return '<div class="tal-row' + (lv >= t.max ? ' maxed' : '') + '"><span class="ti">' + t.icon + '</span><div class="tt"><b>' + ui.esc(t.name) + '</b><small>' + ui.esc(t.per) + ' je Stufe</small>' +
              '<div class="pips">' + Array.from({ length: t.max }, (_, k) => '<i class="' + (k < lv ? 'on' : '') + '"></i>').join('') + '</div></div>' +
              '<button class="btn' + (can ? '' : ' secondary') + '" data-learn="' + t.id + '"' + (can ? '' : ' disabled') + '>' + (lv >= t.max ? '✓' : '+') + '</button></div>';
          }).join('') + '</div>';
      }).join('');
      const starters = L.rank.RANK_STARTERS.map((s) => {
        const sp = R().get('species', s.species);
        const open = info.rank >= s.rank;
        return '<div class="rs-card' + (open ? ' open' : '') + '"><div class="art">' + (open ? ui.art.monster(s.species, {}) : '<span class="lock">🔒</span>') + '</div><b>' + (open ? ui.esc(sp.name) : '???') + '</b><small>' + (open ? sp.types.map(ui.typeChip).join('') : 'Ab Rang ' + s.rank) + '</small></div>';
      }).join('');
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.72)"></div>' +
        '<div class="screen tal-screen"><div class="tal-top glass"><div class="rank-big">⭐<b>' + info.rank + '</b></div><div class="tal-info"><h2>Bannträger-Rang ' + info.rank + '</h2>' +
        '<div class="big-bar"><i style="width:' + (info.need ? Math.round(info.xp / info.need * 100) : 100) + '%"></i><span>' + (info.need ? info.xp + ' / ' + info.need + ' Erfahrung bis Rang ' + (info.rank + 1) : 'Höchster Rang!') + '</span></div>' +
        '<p class="muted">Nach jedem Lauf bekommst du Rang-Erfahrung: je weiter du kommst, desto mehr. Jeder Rang gibt einen Talentpunkt.' + (next ? ' Nächster neuer Starter ab Rang ' + next.rank + '.' : '') + '</p>' +
        '<div class="row" style="gap:14px;align-items:center"><span class="tal-points' + (pts ? ' has' : '') + '">✨ ' + pts + ' freie Punkte</span><button class="link" data-reset>Talente zurücksetzen</button></div></div>' +
        '<div class="rs-list">' + starters + '</div></div>' +
        '<div class="tal-paths">' + paths + '</div><p class="muted" style="margin:0">Talente gelten ab dem nächsten Lauf. In der Tages-Herausforderung zählen sie nicht.</p>' +
        '<button class="btn" data-back>Zurück</button></div>';
      el.querySelectorAll('[data-learn]').forEach((b) => {
        b.onclick = () => { L.rank.learn(meta, b.dataset.learn); ui.game.persist(); ui.screens.show('talents'); };
      });
      el.querySelector('[data-reset]').onclick = async () => {
        if (!L.rank.spent(meta)) return;
        if (!(await ui.choose('Talente zurücksetzen?', 'Du bekommst alle Punkte zurück und kannst sie neu verteilen.', [{ label: 'Ja, zurücksetzen', value: true }], 'Abbrechen'))) return;
        L.rank.reset(meta);
        ui.game.persist();
        ui.screens.show('talents');
      };
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
