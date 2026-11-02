// Schrein (Hub), Starter- und Segen-Auswahl.
(function (L) {
  const ui = L.ui, R = () => L.registry;
  const STARTERS = ['glimmi', 'plitsch', 'knospi'];
  const STAT_LABEL = { hp: 'KP', atk: 'ANG', def: 'VER', spe: 'TEM' };

  ui.screens.register('hub', {
    render(el) {
      const g = ui.game, meta = g.meta;
      const saved = L.save.loadRun();
      const dailyDone = L.daily.played(meta, L.daily.key(g.now()));
      const canBuy = L.registry.all('unlock').some((u) => !L.unlocks.blocker(meta, u.id));
      el.classList.add('hub');
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div>' +
        '<div class="hub-crystal"></div><div class="hub-stars"></div><div class="hub-far"></div><div class="shade"></div><div class="hub-fog"></div><div class="hub-petals"></div>' +
        '<div class="hub-player">' + ui.playerCard(meta) + '</div>' +
        '<div class="hub-logo"><h1>LUMORA</h1><p>Das Echo der Sternenquelle</p></div>' +
        '<div class="hub-mira">' + ui.art.portrait('mira', meta.runs ? 'froh' : 'neutral', {}) + '</div>' +
        '<div class="hub-stats panel"><span title="Kristalle">💎 ' + meta.crystals + '</span><span title="Läufe">🔁 ' + meta.runs + '</span><span title="Lexikon">📖 ' + Math.round(L.progress.dexCompletion(meta) * 100) + ' %</span>' + (meta.stats.towerBest ? '<span title="Echo-Turm: bestes Stockwerk">🗼 ' + meta.stats.towerBest + '</span>' : '') + '<span title="Sternenfragmente">🌠 ' + (meta.fragments || []).length + '/9' + (meta.flags.trueEnd ? ' ✨' : '') + '</span></div>' +
        '<div class="hub-menu">' +
        (saved ? '<button class="btn big" data-act="continue">▶ Weiterspielen</button>' : '') +
        '<button class="btn big' + (saved ? ' secondary' : '') + '" data-act="new">✨ Neuer Lauf</button>' +
        '<button class="btn daily-btn' + (dailyDone ? ' done' : '') + '" data-act="daily">📅 Tages-Herausforderung' + (dailyDone ? ' ✓' : '<span class="new-dot"></span>') + '</button>' +
        '<div class="hub-grid">' +
        '<button class="btn secondary" data-act="brutnest">🥚 Brutnest' + ((meta.eggs || []).some((e) => L.eggs.ready(e)) ? '<span class="new-dot"></span>' : '') + '</button>' +
        '<button class="btn secondary" data-act="talents">⭐ Rang & Talente' + (L.rank.points(meta) > 0 ? '<span class="new-dot"></span>' : '') + '</button>' +
        '<button class="btn secondary" data-act="crystalshop">💎 Kristall-Shop' + (canBuy ? '<span class="new-dot"></span>' : '') + '</button>' +
        '<button class="btn secondary" data-act="achievements">🏆 Erfolge</button>' +
        '<button class="btn secondary" data-act="dex">📖 Lexikon</button>' +
        '<button class="btn secondary" data-act="chronicle">📜 Chronik</button>' +
        '<button class="btn secondary" data-act="types">📊 Typen</button>' +
        '<button class="btn secondary" data-act="guide">📘 Anleitung</button>' +
        '<button class="btn secondary" data-act="settings">⚙️ Einstellungen</button>' +
        '</div>' +
        '</div>' +
        (meta.notices.indexOf('save_corrupt') >= 0 ? '<div class="notice panel">Der alte Spielstand war beschädigt und wurde gesichert. Es geht frisch los!</div>' : '') +
        (!L.save.available ? '<div class="notice panel">Speichern ist in diesem Browser nicht möglich. Dein Fortschritt geht beim Schließen verloren.</div>' : '') +
        shrineDeco(meta) +
        '<div class="hub-near"></div>';
      meta.notices = [];
      decorateHub(el);
      el.querySelector('[data-act="new"]').onclick = async () => {
        if (saved && !(await ui.choose('Neuer Lauf?', 'Dein gespeicherter Lauf geht verloren, sobald der neue Lauf beginnt.' + (saved.daily ? ' Die Tages-Herausforderung zählt dann als Niederlage.' : ''), [{ label: 'Ja, neu starten', value: true }], 'Abbrechen'))) return;
        // Der alte Lauf wird erst verworfen, wenn der neue wirklich startet (Zurück bleibt möglich).
        startNewRun();
      };
      const cont = el.querySelector('[data-act="continue"]');
      if (cont) cont.onclick = () => { g.run = saved; ui.flow.resume(); };
      el.querySelector('[data-act="dex"]').onclick = () => ui.screens.show('dex');
      el.querySelectorAll('[data-act="achievements"]').forEach((b) => { b.onclick = () => ui.screens.show('achievements'); });
      el.querySelector('[data-act="guide"]').onclick = () => ui.screens.show('guide');
      el.querySelector('[data-act="brutnest"]').onclick = () => ui.screens.show('brutnest');
      const nestDeco = el.querySelector('[data-nest]');
      if (nestDeco) nestDeco.onclick = () => ui.screens.show('brutnest');
      el.querySelector('[data-act="talents"]').onclick = () => ui.screens.show('talents');
      el.querySelector('[data-act="daily"]').onclick = () => ui.screens.show('daily');
      el.querySelector('[data-act="crystalshop"]').onclick = () => ui.screens.show('crystalshop');
      el.querySelector('[data-act="chronicle"]').onclick = () => ui.screens.show('chronicle');
      el.querySelector('[data-act="types"]').onclick = () => ui.typeChart();
      el.querySelector('[data-act="settings"]').onclick = async () => { await ui.settingsModal(); ui.screens.show('hub'); };
    },
  });

  // Begleiter wählen (Hort-Schlüpfling oder Echo-Begleiter), wenn es welche gibt
  async function chooseCompanion(meta, mode, starter) {
    const fits = (sp) => L.modes.allows({ mode, starter }, sp);
    const hort = (meta.hort || []).filter((h) => fits(h.species));
    const echo = meta.echoCompanion && fits(meta.echoCompanion.species) ? meta.echoCompanion : null;
    if (mode === 'solo' || (!hort.length && !echo)) return;
    await ui.tutorial.show('companion');
    const opts = [];
    if (echo) opts.push({ label: '👻 Echo: ' + ui.esc(R().get('species', echo.species).name) + ' (Lv ' + L.companions.echoLevel(meta, echo) + ')', sub: 'Dein stärkstes Monster aus dem letzten Lauf kehrt als Echo zurück, mit seinen alten Attacken. Es verblasst nach diesem Lauf.', art: ui.art.monster(echo.species, { shiny: echo.shiny }), value: { type: 'echo' } });
    for (const h of hort) {
      const em = h.eggMove && R().has('move', h.eggMove) ? R().get('move', h.eggMove).name : '';
      opts.push({ label: '🐣 ' + ui.esc(R().get('species', h.species).name) + (h.shiny ? ' ✨' : '') + ' (Lv 5)', sub: 'Aus deinem Hort' + (em ? ' · Ei-Attacke: ' + ui.esc(em) : '') + ' · ♥ ' + (h.bond || 0), art: ui.art.monster(h.species, { shiny: h.shiny }), value: { type: 'hort', uid: h.uid } });
    }
    const pick = await ui.choose('Wer begleitet dich?', 'Ein Begleiter startet zusätzlich zu deinem Starter im Team.', opts, 'Ohne Begleiter');
    meta.companion = pick || null;
  }

  // Ausbauten des Schreins (Kristall-Shop, Kategorie „Schrein“) als sichtbare Deko
  function shrineDeco(meta) {
    const has = (id) => L.unlocks.owned(meta, id);
    let h = '<div class="hub-deco">';
    if (has('laternen')) for (let i = 0; i < 7; i++) h += '<span class="deco-lantern" style="left:' + (8 + i * 13) + '%;top:' + (14 + (i % 3) * 7) + '%;animation-delay:-' + (i * 0.7).toFixed(1) + 's">🏮</span>';
    if (has('glocke')) h += '<span class="deco-bell" title="Echo-Glocke">🔔</span>';
    if (has('garten')) h += '<div class="deco-garden">' + ['🌷', '🌸', '🌼', '🌷', '🌸', '🌼', '🌷'].map((f, i) => '<span style="animation-delay:-' + i * 0.4 + 's">' + f + '</span>').join('') + '</div>';
    if (has('bibliothek')) h += '<span class="deco-books" title="Bibliothek">📚</span>';
    // Nester mit Eiern (Klick öffnet das Brutnest)
    const slots = L.eggs.slots(meta);
    h += '<div class="deco-nests" data-nest title="Brutnest">';
    for (let i = 0; i < slots; i++) { const e = (meta.eggs || [])[i]; h += '<div class="deco-nest">' + (e ? ui.eggArt(e, 34) : '') + '<span>🪺</span></div>'; }
    h += '</div>';
    if (has('ruhmeshalle')) {
      const TROPHY = { fenna: '🌿', brakk: '⚒️', sola: '🌩️', maris: '🌊', ardan: '🌑' };
      h += '<div class="deco-trophies" title="Ruhmeshalle">' + (meta.bossesDefeated || []).filter((b) => TROPHY[b]).map((b) => '<span title="' + ui.esc(R().get('trainer', b).name) + '">' + TROPHY[b] + '</span>').join('') + '</div>';
    }
    return h + '</div>';
  }

  // Lebendiger Schrein: Blütenblätter, Glühwürmchen, Lichtflecken, Sternschnuppen, Parallaxe.
  let starTimer = null;
  function decorateHub(el) {
    const rnd = L.rng.create(Date.now() >>> 0);
    const many = (n, fn) => { let h = ''; for (let i = 0; i < n; i++) h += fn(i); return h; };
    const n = (v, d) => v.toFixed(d === undefined ? 1 : d);
    el.querySelector('.hub-petals').innerHTML = many(ui.fxCount(22), () =>
      '<i style="left:' + n(rnd.next() * 100) + '%;--s:' + n(0.6 + rnd.next() * 0.8, 2) + ';--sway:' + n(30 + rnd.next() * 80, 0) + 'px;' +
      'animation-duration:' + n(9 + rnd.next() * 10) + 's,' + n(2.5 + rnd.next() * 3) + 's;animation-delay:-' + n(rnd.next() * 18) + 's,-' + n(rnd.next() * 3) + 's"></i>');
    el.querySelector('.hub-far').innerHTML = many(ui.fxCount(24), () =>
      '<i style="left:' + n(rnd.next() * 100) + '%;top:' + n(35 + rnd.next() * 55) + '%;animation-delay:-' + n(rnd.next() * 10) + 's;animation-duration:' + n(6 + rnd.next() * 8) + 's"></i>');
    el.querySelector('.hub-near').innerHTML = many(ui.fxCount(7), () => {
      const s = 30 + rnd.next() * 50;
      return '<i style="left:' + n(rnd.chance(0.5) ? rnd.next() * 25 : 75 + rnd.next() * 25) + '%;top:' + n(rnd.next() * 85) + '%;width:' + n(s, 0) + 'px;height:' + n(s, 0) + 'px;animation-delay:-' + n(rnd.next() * 14) + 's"></i>';
    });
    el.querySelectorAll('.hub-menu > *').forEach((b, i) => b.style.setProperty('--i', i));
    el.addEventListener('mousemove', (e) => {
      if (ui.setting('motion') === 'reduziert') return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', n(((e.clientX - r.left) / r.width) * 2 - 1, 3));
      el.style.setProperty('--py', n(((e.clientY - r.top) / r.height) * 2 - 1, 3));
    });
    // Ab und zu eine Sternschnuppe
    clearInterval(starTimer);
    const shoot = () => {
      const box = el.querySelector('.hub-stars');
      if (!box || !el.isConnected) { clearInterval(starTimer); return; }
      if (ui.setting('motion') === 'reduziert') return;
      const s = document.createElement('i');
      s.style.left = n(10 + rnd.next() * 70) + '%';
      s.style.top = n(2 + rnd.next() * 25) + '%';
      box.appendChild(s);
      setTimeout(() => s.remove(), 1600);
    };
    setTimeout(shoot, 1500);
    starTimer = setInterval(shoot, 6500);
  }

  // Gespeicherten Lauf verwerfen, direkt bevor ein neuer Lauf erstellt wird.
  // Ein angefangener Tageslauf zählt dabei als Niederlage.
  ui.discardSavedRun = function () {
    const meta = ui.game.meta;
    const saved = L.save.loadRun();
    if (saved && L.daily.abandon(meta, saved)) L.save.saveMeta(meta);
    L.save.clearRun();
  };

  // Segen-Auswahl bleibt gleich, auch wenn man zurück- und wieder vorgeht (kein Neu-Würfeln)
  let blessSeed = null;

  async function startNewRun() {
    const meta = ui.game.meta;
    if (meta.runs === 0 && !L.settings.get(meta, 'playerName') && !meta.askedName) {
      meta.askedName = true;
      const name = await ui.askName();
      if (name) L.settings.set(meta, 'playerName', name);
      L.save.saveMeta(meta);
    }
    await ui.dialog.trigger('runStart');
    ui.screens.show('echo');
  }

  ui.screens.register('echo', {
    render(el, params) {
      const meta = ui.game.meta;
      params = params || {};
      let sel = Math.min(meta.echoUnlocked, Math.max(0, params.echo !== undefined ? params.echo : meta.lastEcho || 0));
      const levels = R().all('echo').slice().sort((a, b) => a.level - b.level);
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade"></div>' +
        '<div class="screen pick-screen" style="overflow-y:auto"><h2>Wähle die Echo-Stufe</h2><p class="muted" style="margin:0">Je stärker das Echo, desto härter der Lauf und desto größer die Belohnung. Jede Stufe enthält alle Regeln der Stufen davor.</p>' +
        '<div class="cards">' + levels.map((e) => {
          const locked = e.level > meta.echoUnlocked;
          return '<div class="card small panel echo-card' + (locked ? ' locked' : '') + '" data-lvl="' + e.level + '"><div class="icon">' + (locked ? '🔒' : e.icon) + '</div><h3>' + ui.esc(e.name) + '</h3>' +
            '<p class="rule">' + ui.esc(e.rule) + '</p><p class="rew">' + ui.esc(e.reward) + '</p>' +
            (locked ? '<p>Gewinne zuerst auf ' + ui.esc(levels[e.level - 1].name) + '.</p>' : '') + (meta.echoBest >= e.level ? '<p>🏆 Geschafft!</p>' : '') + '</div>';
        }).join('') + '</div>' +
        '<div class="mode-row panel"><span>🧭 Bannträger-Weg:</span>' + L.registry.all('path').map((p) => { const open = L.paths.available(meta).indexOf(p) >= 0; return '<button class="seg-btn tip' + ((meta.lastPath || 'kaempfer') === p.id && open ? ' on' : '') + '" data-path="' + p.id + '"' + (open ? '' : ' disabled') + ' data-tip="' + ui.esc(p.desc + ' Kunst „' + p.artName + '“: ' + p.artDesc + (open ? '' : ' (ab Rang ' + p.rank + ')')) + '">' + p.icon + ' ' + ui.esc(p.name) + (open ? '' : ' 🔒') + '</button>'; }).join('') + '</div>' +
        '<div class="mode-row panel"><span>⚔️ Herausforderung:</span><button class="seg-btn' + (params.mode ? '' : ' on') + '" data-mode="">Keine</button>' + L.registry.all('mode').map((md) => '<button class="seg-btn tip' + (params.mode === md.id ? ' on' : '') + '" data-mode="' + md.id + '"' + (L.modes.open(meta, md) ? '' : ' disabled') + ' data-tip="' + ui.esc(md.desc + ' Kristalle ×' + md.crystalMult) + '">' + md.icon + ' ' + ui.esc(md.name) + ' <small>💎×' + md.crystalMult + '</small></button>').join('') + '</div>' +
        '<div class="seed-row panel" style="padding:8px 12px"><span>🌱 Eigener Seed:</span><input type="text" maxlength="24" placeholder="leer = zufällig"><small class="muted">Gleicher Seed = gleiche Karte</small></div>' +
        '<div class="row" style="justify-content:center;gap:12px"><button class="btn secondary" data-back>↩ Zurück</button><button class="btn big" data-go>Weiter ➜</button></div></div>';
      if (params.seed) el.querySelector('.seed-row input').value = params.seed;
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
      const mark = () => el.querySelectorAll('.echo-card').forEach((c) => c.classList.toggle('sel', Number(c.dataset.lvl) === sel));
      mark();
      el.querySelectorAll('.echo-card:not(.locked)').forEach((c) => { c.onclick = () => { sel = Number(c.dataset.lvl); mark(); }; });
      let mode = params.mode || '';
      let path = params.path && L.paths.of(params.path) ? params.path : L.paths.of(meta.lastPath) && L.paths.available(meta).indexOf(L.paths.of(meta.lastPath)) >= 0 ? meta.lastPath : 'kaempfer';
      el.querySelectorAll('[data-path]').forEach((b) => { b.onclick = () => { if (b.disabled) return; path = b.dataset.path; el.querySelectorAll('[data-path]').forEach((x) => x.classList.toggle('on', x === b)); }; });
      el.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => { mode = b.dataset.mode; el.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x === b)); }; });
      el.querySelector('[data-go]').onclick = () => {
        meta.lastEcho = sel;
        const seed = el.querySelector('input').value.trim();
        meta.lastPath = path;
        ui.screens.show('starter', Object.assign({}, params, { echo: sel, seed: seed || null, mode: mode || null, path }));
      };
    },
  });

  ui.screens.register('starter', {
    render(el, params) {
      const meta = ui.game.meta;
      const rankLocked = L.rank.RANK_STARTERS.filter((s) => L.rank.level(meta) < s.rank);
      const cards = L.unlocks.starters(meta).concat(L.rank.starters(meta)).map((id) => {
        const sp = R().get('species', id);
        const ab = R().get('ability', sp.ability);
        const stats = Object.keys(STAT_LABEL).map((k) => '<span>' + STAT_LABEL[k] + '</span><div class="statbar"><i style="width:' + Math.min(100, sp.base[k] / 1.2) + '%"></i></div>').join('');
        const extra = STARTERS.indexOf(id) < 0 && L.rank.starters(meta).indexOf(id) < 0;
        const byRank = L.rank.starters(meta).indexOf(id) >= 0;
        return '<div class="card panel' + (extra ? ' unlocked-starter' : '') + '" data-id="' + id + '"><div class="art">' + ui.art.monster(id, {}) + '</div><h3>' + sp.name + '</h3>' +
          (byRank ? '<span class="chip" style="background:#ffd23f;color:#3a2a00">⭐ Rang-Starter</span>' : '') +
          (extra ? '<span class="chip" style="background:#5fd4ff;color:#10223a">💎 Freigeschaltet' + (sp.evolves && sp.evolves.length ? '' : ' · entwickelt sich nicht') + '</span>' : '') +
          sp.types.map(ui.typeChip).join('') + '<p>' + ui.esc(sp.dex) + '</p><p><b>' + ab.name + ':</b> ' + ui.esc(ab.desc) + '</p><div class="stats-mini">' + stats + '</div></div>';
      }).join('');
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade"></div>' +
        '<div class="screen pick-screen" style="overflow-y:auto"><h2>Wähle deinen Gefährten</h2><div class="cards">' + cards +
        rankLocked.map((s) => '<div class="card panel locked-starter"><div class="art"><span class="lock">🔒</span></div><h3>???</h3><p>Ein neuer Gefährte wartet ab <b>Bannträger-Rang ' + s.rank + '</b>.</p></div>').join('') + '</div>' +
        '<button class="btn secondary" data-back>↩ Zurück</button></div>';
      el.querySelector('[data-back]').onclick = () => ui.screens.show('echo', params);
      if (params.starter) { const c = el.querySelector('.card[data-id="' + params.starter + '"]'); if (c) c.classList.add('sel'); }
      el.querySelectorAll('.card[data-id]').forEach((c) => { c.onclick = () => ui.screens.show('blessing', Object.assign({}, params, { starter: c.dataset.id })); });
    },
  });

  ui.screens.register('blessing', {
    render(el, params) {
      if (!params.seed && blessSeed === null) blessSeed = Date.now() >>> 0;
      const rng = L.rng.create(params.seed ? 'segen:' + params.seed : blessSeed);
      const picks = rng.shuffle(L.unlocks.blessings(L.unlocks.forRun(ui.game.meta))).slice(0, 3);
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade"></div>' +
        '<div class="screen pick-screen"><h2>Die Sternenquelle schenkt dir einen Segen</h2><div class="cards">' +
        picks.map((b) => '<div class="card small panel' + (b.unlock ? ' unlocked-starter' : '') + '" data-id="' + b.id + '"><div class="icon">' + b.icon + '</div><h3>' + b.name + '</h3><p>' + ui.esc(b.desc) + '</p></div>').join('') +
        '</div><button class="btn secondary" data-back>↩ Zurück</button></div>';
      el.querySelector('[data-back]').onclick = () => ui.screens.show('starter', params);
      let starting = false;
      el.querySelectorAll('.card').forEach((c) => {
        c.onclick = async () => {
          if (starting) return;
          starting = true;
          const g = ui.game;
          await chooseCompanion(g.meta, params.mode, params.starter);
          ui.discardSavedRun();
          blessSeed = null;
          g.run = L.run.create({ seed: params.seed || String(Date.now()), starter: params.starter, blessing: c.dataset.id, meta: g.meta, now: g.now(), echo: params.echo || 0, mode: params.mode || null, path: params.path || 'kaempfer' });
          L.progress.seen(g.meta, g.run.team[0]);
          L.progress.caught(g.meta, g.run.team[0]);
          g.persist();
          await ui.dialog.play(L.encounters.act(g.run).intro);
          ui.screens.show('map');
        };
      });
    },
  });
})(globalThis.LUM);
