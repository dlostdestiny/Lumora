// Tages-Herausforderung: heutiger Lauf mit festen Regeln. Nur der erste Versuch zählt.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  // Deine besten Tage (lokal)
  function bestList(meta) {
    const days = Object.keys(meta.daily || {}).map((k) => Object.assign({ key: k }, meta.daily[k])).sort((a, b) => b.score - a.score).slice(0, 5);
    if (!days.length) return '';
    return '<div class="daily-best"><b>🏅 Deine besten Tage</b>' + days.map((d, i) => '<div class="db-row"><span>' + ['🥇', '🥈', '🥉', '4.', '5.'][i] + '</span><span>' + d.key.split('-').reverse().join('.') + '</span><span>' + (d.result === 'victory' ? '🏆' : '💀') + '</span><b>' + d.score + '</b></div>').join('') + '</div>';
  }

  ui.screens.register('daily', {
    render(el) {
      const g = ui.game, meta = g.meta;
      const today = g.now();
      const key = L.daily.key(today);
      const s = L.daily.setup(key);
      const sp = R().get('species', s.starter), bl = R().get('blessing', s.blessing), rule = R().get('dailyRule', s.rule);
      const echo = R().all('echo').find((e) => e.level === s.echo);
      const rec = meta.daily && meta.daily[key];
      const streak = L.daily.streak(meta, today);
      const curses = rule.curses.map((id) => { const c = R().get('curse', id); return '<span class="badge curse"><b>' + c.icon + '</b>' + ui.esc(c.name) + ': ' + ui.esc(c.desc) + '</span>'; }).join('');
      // Letzte 7 Tage
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime()); d.setDate(d.getDate() - i);
        const r = meta.daily && meta.daily[L.daily.key(d)];
        days.push('<div class="dy' + (r ? (r.result === 'victory' ? ' win' : ' done') : '') + (i === 0 ? ' today' : '') + '"><small>' + ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()] + '</small><b>' + (r ? (r.result === 'victory' ? '🏆' : '✓') : '·') + '</b>' + (r ? '<small>' + r.score + '</small>' : '') + '</div>');
      }
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.7)"></div>' +
        '<div class="screen daily-screen"><div class="daily-card glass"><div class="daily-head"><span class="daily-date">📅 ' + today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + '</span>' +
        '<h2>Tages-Herausforderung</h2><p class="muted">Heute spielen alle denselben Lauf: gleiche Karte, gleicher Starter, gleiche Regeln. Nur dein <b>erster</b> Versuch zählt!</p></div>' +
        '<div class="daily-body"><div class="daily-starter"><div class="art">' + ui.art.monster(s.starter, {}) + '</div><b>' + ui.esc(sp.name) + '</b>' + sp.types.map(ui.typeChip).join('') + '</div>' +
        '<div class="daily-rules"><div class="dr"><span>' + bl.icon + '</span><div><b>Segen: ' + ui.esc(bl.name) + '</b><small>' + ui.esc(bl.desc) + '</small></div></div>' +
        '<div class="dr rule"><span>' + rule.icon + '</span><div><b>Tagesregel: ' + ui.esc(rule.name) + '</b><small>' + ui.esc(rule.desc) + '</small></div></div>' +
        '<div class="dr"><span>' + echo.icon + '</span><div><b>' + ui.esc(echo.name) + '</b><small>' + ui.esc(echo.rule) + '</small></div></div>' +
        '<div class="inv">' + curses + '</div><small class="muted">Kristall-Shop-Vorteile gelten heute nicht. Belohnung: 💎 +15, bei Sieg 💎 +60.</small></div></div>' +
        '<div class="daily-week">' + days.join('') + '</div>' +
        bestList(meta) +
        '<div class="daily-foot">' + (rec ? '<div class="daily-res">Heute geschafft: <b>' + (rec.result === 'victory' ? '🏆 Sieg' : '💀 Niederlage') + '</b> · Punkte <b>' + rec.score + '</b></div>' : '') +
        '<span>🔥 Serie: <b>' + streak + '</b> ' + (streak === 1 ? 'Tag' : 'Tage') + '</span><span>⭐ Bestwert: <b>' + (meta.stats.dailyBest || 0) + '</b></span></div>' +
        '<div class="row" style="justify-content:center;gap:12px"><button class="btn secondary" data-back>Zurück</button><button class="btn big" data-go>' + (rec ? '🔁 Nochmal (zählt nicht)' : '▶ Herausforderung starten') + '</button></div></div></div>';
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
      el.querySelector('[data-go]').onclick = async () => {
        const saved = L.save.loadRun();
        if (saved && !(await ui.choose('Neuer Lauf?', 'Dein gespeicherter Lauf geht dabei verloren.' + (saved.daily ? ' Der angefangene Tageslauf zählt als Niederlage.' : ''), [{ label: 'Ja, starten', value: true }], 'Abbrechen'))) return;
        ui.discardSavedRun();
        g.run = L.daily.createRun(key, meta, g.now());
        L.progress.seen(meta, g.run.team[0]);
        L.progress.caught(meta, g.run.team[0]);
        g.persist();
        await ui.dialog.play(L.encounters.act(g.run).intro);
        ui.screens.show('map');
      };
    },
  });
})(globalThis.LUM);
