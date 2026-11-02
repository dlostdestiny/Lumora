// Erfolge: Meldung beim Freischalten, Spielerkarte im Schrein, Erfolge-Seite mit Titel-Auswahl.
(function (L) {
  const ui = L.ui;

  ui.achievementToast = (a) => {
    const r = L.achievements.RARITY[a.rarity];
    const t = document.createElement('div');
    t.className = 'ach-toast r-' + a.rarity;
    if (ui.sound) ui.sound('achievement');
    t.style.setProperty('--rc', r.color);
    t.innerHTML = '<div class="ic">' + a.icon + '</div><div><small>🏆 Erfolg freigeschaltet · ' + r.name + '</small><b>' + ui.esc(a.name) + '</b>' +
      '<span>💎 +' + r.crystals + (a.title ? ' · Titel: „' + ui.esc(a.title) + '“' : '') + '</span></div>';
    t.style.top = (18 + ui.root().querySelectorAll('.ach-toast').length * 82) + 'px';
    ui.root().appendChild(t);
    setTimeout(() => t.classList.add('out'), 4200);
    setTimeout(() => t.remove(), 4800);
  };

  // Namensfrage vor dem ersten Lauf. Gibt den Namen zurück oder '' (überspringen).
  ui.askName = () => new Promise((resolve) => {
    const m = ui.modal('<h3>✨ Wie heißt du?</h3><p>So werden dich Mira und die anderen nennen. Du kannst ihn später in den Einstellungen ändern.</p>' +
      '<input class="set-text name-input" maxlength="16" placeholder="Dein Name">' +
      '<div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn secondary" data-skip>Überspringen</button><button class="btn" data-ok>Los geht’s!</button></div>');
    const inp = m.el.querySelector('input');
    const done = (v) => { m.close(); resolve(v); };
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') done(inp.value.trim()); };
    m.el.querySelector('[data-ok]').onclick = () => done(inp.value.trim());
    m.el.querySelector('[data-skip]').onclick = () => done('');
    setTimeout(() => inp.focus(), 50);
  });

  ui.fragmentToast = (id, count) => {
    const t = document.createElement('div');
    t.className = 'ach-toast r-legendaer';
    t.style.setProperty('--rc', '#fde68a');
    t.style.top = (18 + ui.root().querySelectorAll('.ach-toast').length * 82) + 'px';
    if (ui.sound) ui.sound('achievement');
    setTimeout(() => ui.tutorial.show('fragment'), 1500);
    t.innerHTML = '<div class="ic">🌠</div><div><small>Sternenfragment gefunden · ' + count + ' / 9</small><b>' + ui.esc(L.fragments.label(id)) + '</b><span>' + (count >= 9 ? 'Alle neun! Der Sternenriss wartet auf dem Gipfel …' : 'Es bleibt für immer bei dir.') + '</span></div>';
    ui.root().appendChild(t);
    setTimeout(() => t.classList.add('out'), 5200);
    setTimeout(() => t.remove(), 5800);
  };

  // Spielerkarte: Porträt, Name, Titel, Erfolgs-Balken
  ui.playerCard = (meta, extraCls) => {
    const all = L.registry.all('achievement');
    const got = all.filter((a) => L.achievements.unlocked(meta, a.id)).length;
    const pct = Math.round((got / all.length) * 100);
    return '<div class="player-card glass ' + (extraCls || '') + (meta.frame ? ' frame-' + meta.frame : '') + '" data-act="achievements" title="Erfolge ansehen">' +
      '<div class="pc-art">' + ui.art.portrait(L.settings.get(meta, 'avatar'), 'froh', {}) + '</div>' +
      '<div class="pc-info"><b>' + ui.esc(L.player.name(meta)) + '</b>' + (meta.title ? '<span class="pc-title">' + ui.esc(meta.title) + '</span>' : '<span class="pc-title muted">Noch kein Titel</span>') +
      '<div class="pc-bar"><i style="width:' + pct + '%"></i></div><small>🏆 ' + got + ' / ' + all.length + ' Erfolge</small></div>' + (ui.rankBadge ? ui.rankBadge(meta) : '') + '</div>';
  };

  ui.screens.register('achievements', {
    render(el) {
      const meta = ui.game.meta;
      const all = L.achievements.list();
      const got = all.filter((a) => L.achievements.unlocked(meta, a.id)).length;
      const pct = Math.round((got / all.length) * 100);
      const byR = (r) => all.filter((a) => a.rarity === r);
      const counts = Object.keys(L.achievements.RARITY).map((r) => {
        const list = byR(r), rr = L.achievements.RARITY[r];
        return '<span class="rc-chip" style="--rc:' + rr.color + '">' + rr.name + ' ' + list.filter((a) => L.achievements.unlocked(meta, a.id)).length + '/' + list.length + '</span>';
      }).join('');
      const card = (a) => {
        const done = L.achievements.unlocked(meta, a.id);
        const secret = a.hidden && !done;
        const rr = L.achievements.RARITY[a.rarity];
        const v = Math.min(a.goal, L.achievements.value(meta, a));
        return '<div class="ach-card r-' + a.rarity + (done ? ' done' : '') + '" style="--rc:' + rr.color + '">' +
          '<div class="ic">' + (secret ? '❔' : a.icon) + '</div><div class="txt"><b>' + (secret ? '???' : ui.esc(a.name)) + '</b>' +
          '<small>' + (secret ? 'Ein Geheimnis … finde es selbst heraus!' : ui.esc(a.desc)) + '</small>' +
          (done ? '<span class="ok">✓ Geschafft</span>' : '<div class="ach-bar"><i style="width:' + (v / a.goal * 100).toFixed(0) + '%"></i></div><span class="num">' + (secret ? '?' : v) + ' / ' + (secret ? '?' : a.goal) + '</span>') +
          '<span class="rew">💎 ' + rr.crystals + (a.title ? ' · 🎖️ ' + (secret ? '???' : ui.esc(a.title)) : '') + '</span></div></div>';
      };
      const sections = Object.keys(L.achievements.RARITY).slice().reverse().map((r) =>
        '<h3 class="ach-h" style="color:' + L.achievements.RARITY[r].color + '">' + L.achievements.RARITY[r].name + '</h3><div class="ach-grid">' + byR(r).map(card).join('') + '</div>').join('');
      const titles = ['', ...meta.titles];
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.72)"></div>' +
        '<div class="screen ach-screen"><div class="ach-head glass">' + ui.playerCard(meta, 'big') +
        '<div class="ach-total"><h2>🏆 Erfolge</h2><div class="big-bar"><i style="width:' + pct + '%"></i><span>' + got + ' / ' + all.length + ' · ' + pct + ' %</span></div><div class="row wrap">' + counts + '</div>' +
        '<div class="title-pick"><span>🎖️ Dein Titel:</span>' + titles.map((t) => '<button class="seg-btn' + ((meta.title || '') === t ? ' on' : '') + '" data-title="' + ui.esc(t) + '">' + (t ? ui.esc(t) : 'Keiner') + '</button>').join('') +
        (meta.titles.length ? '' : '<small class="muted">Seltene Erfolge schalten Titel frei.</small>') + '</div></div></div>' +
        '<div class="ach-list">' + sections + '</div><button class="btn" data-back>Zurück</button></div>';
      el.querySelectorAll('[data-title]').forEach((b) => {
        b.onclick = () => { meta.title = b.dataset.title; ui.game.persist(); ui.screens.show('achievements'); };
      });
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
