// Lauf-Chronik: die letzten Läufe mit Team, Ausgang und woran man gescheitert ist.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  function fmtDate(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function lostText(e) {
    const l = e.lostTo;
    if (!l) return '';
    const who = l.name || (R().has('species', l.species) ? R().get('species', l.species).name + (l.kind === 'wild' ? ' (wild)' : '') : '?');
    return 'Gescheitert an <b>' + ui.esc(who) + '</b>' + (l.layer !== undefined ? ' auf Ebene ' + (l.layer + 1) : '');
  }

  function card(e) {
    const win = e.result === 'victory';
    const echo = R().all('echo').find((x) => x.level === e.echo);
    const starter = R().has('species', e.starter) ? R().get('species', e.starter).name : e.starter;
    const team = e.team.map((m) => '<div class="ch-mon' + (m.shiny ? ' shiny' : '') + '" title="' + ui.esc(R().get('species', m.species).name) + ' Lv ' + m.level + '">' +
      ui.art.monster(m.species, { shiny: m.shiny }) + '<span>Lv ' + m.level + '</span></div>').join('');
    const relics = e.relics.map((id) => R().has('relic', id) ? '<span title="' + ui.esc(R().get('relic', id).name) + '">' + R().get('relic', id).icon + '</span>' : '').join('');
    const curses = (e.curses || []).map((id) => R().has('curse', id) ? '<span title="Fluch: ' + ui.esc(R().get('curse', id).name) + '">' + R().get('curse', id).icon + '</span>' : '').join('');
    return '<div class="ch-card glass ' + (win ? 'win' : 'loss') + '">' +
      '<div class="ch-head"><span class="ch-res">' + (win ? '🏆 Sieg' : '💀 Niederlage') + '</span><b>Lauf ' + e.number + '</b>' +
      (e.daily ? '<span class="chip daily-chip">📅 Tages-Herausforderung</span>' : '') +
      (e.mode && R().has('mode', e.mode) ? '<span class="chip">' + R().get('mode', e.mode).icon + ' ' + ui.esc(R().get('mode', e.mode).name) + '</span>' : '') +
      '<span class="chip">' + (echo ? echo.icon + ' ' + ui.esc(echo.name) : 'Echo ' + e.echo) + '</span><small class="muted">' + fmtDate(e.date) + '</small></div>' +
      '<div class="ch-team">' + team + '</div>' +
      '<div class="ch-info"><span>Starter: <b>' + ui.esc(starter) + '</b></span><span>⚔️ ' + e.battlesWon + ' Siege</span><span>⚪ ' + e.caught + ' gefangen</span>' +
      (e.quests ? '<span>📜 ' + e.quests + ' Aufträge</span>' : '') + '<span>💎 +' + e.crystals + '</span>' +
      (relics ? '<span class="ch-relics">' + relics + '</span>' : '') + (curses ? '<span class="ch-relics">' + curses + '</span>' : '') + '</div>' +
      (win ? '' : '<div class="ch-lost">' + lostText(e) + '</div>') + '</div>';
  }

  ui.screens.register('chronicle', {
    render(el) {
      const meta = ui.game.meta;
      const list = meta.chronicle || [];
      const wins = list.filter((e) => e.result === 'victory').length;
      // Häufigster Stolperstein
      const counts = {};
      for (const e of list) if (e.lostTo) { const k = e.lostTo.name || e.lostTo.species; counts[k] = (counts[k] || 0) + 1; }
      const nemesis = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const nemName = nemesis ? (R().has('species', nemesis) ? R().get('species', nemesis).name : nemesis) : null;
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.72)"></div>' +
        '<div class="screen ch-screen"><div class="ch-top glass"><h2>📜 Lauf-Chronik</h2><p class="muted">Deine letzten ' + L.progress.CHRONICLE_MAX + ' Läufe. Jeder Lauf lehrt dich etwas.</p>' +
        '<div class="row wrap ch-stats"><span>🔁 ' + meta.runs + ' Läufe</span><span>🏆 ' + meta.stats.victories + ' Siege</span>' +
        (list.length ? '<span>Quote (Chronik): ' + Math.round(wins / list.length * 100) + ' %</span>' : '') +
        (nemName ? '<span>😈 Erzfeind: <b>' + ui.esc(nemName) + '</b> (' + counts[nemesis] + '×)</span>' : '') + '</div></div>' +
        (list.length ? '<div class="ch-list">' + list.map(card).join('') + '</div>' : '<div class="panel" style="padding:20px">Noch keine Läufe. Zieh los, das Echo wartet!</div>') +
        '<button class="btn" data-back>Zurück</button></div>';
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
