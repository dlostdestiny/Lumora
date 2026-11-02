// Kartenbildschirm: leuchtende Wege, Medaillons, Spielfigur, Seitenleiste mit Team, Items und Relikten.
(function (L) {
  const ui = L.ui, R = () => L.registry;
  const ICON = { battle: '⚔️', elite: '💀', spring: '⛲', shop: '🛒', event: '❓', rival: '🗡️', hidden: '🔮', boss: '👑', arena: '🏟️' };
  const LABEL = { arena: 'Arena', battle: 'Wildes Monster', elite: 'Elite-Trainer', spring: 'Quelle', shop: 'Lottes Laden', event: 'Ereignis', rival: 'Rivale Kael', hidden: 'Versteckter Pfad', boss: 'Wächter' };
  const DESC = {
    battle: 'Ein wildes Monster. Du kannst es fangen.',
    elite: 'Ein starker Trainer. Gute Belohnung!',
    arena: 'Drei Kämpfe hintereinander, ohne Heilung dazwischen. Am Ende eine große Belohnung.',
    spring: 'Heilen, trainieren oder eine Attacke verbessern.',
    shop: 'Items, Relikte und Schriftrollen.',
    event: 'Etwas Unerwartetes wartet hier …',
    rival: 'Kael fordert dich heraus.',
    hidden: 'Ein geheimnisvoller Pfad. Wer weiß, was dort wartet?',
    boss: 'Die Wächterin dieses Gebiets.',
  };
  const COLOR = { arena: '#f97316', battle: '#e0566a', elite: '#9b5de5', spring: '#3fb8ff', shop: '#ffcf5a', event: '#c084fc', rival: '#ff8c42', hidden: '#ff5ad1', boss: '#ffd700' };
  const COL_W = 120, ROW_H = 92, PAD = 60;

  function nodePos(n, layers) {
    const x = PAD + (n.kind === 'boss' ? 2 : n.col) * COL_W + ((n.layer * 37) % 23) - 11;
    const y = PAD + (layers - 1 - n.layer) * ROW_H;
    return [x, y];
  }

  // Zahlen, die sich seit dem letzten Anzeigen geändert haben, hüpfen kurz.
  function bump(key, value) {
    const last = ui.game._last || (ui.game._last = {});
    const changed = last[key] !== undefined && last[key] !== value;
    last[key] = value;
    return changed ? ' bump' : '';
  }

  ui.sidebar = function (run) {
    const team = run.team.map((m, i) => {
      const max = L.mon.maxHp(m);
      const st = m.status ? R().get('status', m.status) : null;
      return '<div class="team-card' + (m.hp <= 0 ? ' fainted' : '') + (i === 0 ? ' lead' : '') + '" data-mon="' + i + '">' +
        '<div class="art">' + ui.monArt(m) + '<span class="lv">' + m.level + '</span></div><div class="info">' +
        '<div class="nm"><span>' + ui.esc(ui.spName(m)) + (m.shiny ? ' ✨' : '') + (m.echo ? ' 👻' : '') + (m.hatchling ? ' 🐣' : '') + '</span>' + (st ? '<span class="st" style="background:' + st.color + '" title="' + ui.esc(st.name) + '">' + st.icon + '</span>' : '') + '</div>' +
        '<div class="types">' + ui.typeChips(m) + '</div>' +
        ui.hpBar(m.hp, max) + '<div class="sub"><span>' + m.hp + ' / ' + max + '</span><span class="bond' + (m.bond >= 100 ? ' full' : '') + '" title="Bindung ' + Math.floor(m.bond) + '/100">♥ ' + Math.floor(m.bond) + '</span></div>' +
        '</div></div>';
    }).join('');
    const items = Object.keys(run.items).filter((k) => run.items[k] > 0).map((k) => {
      const it = R().get('item', k);
      return '<span class="badge tip" data-tip="' + ui.esc(it.name + ': ' + it.desc) + '"><b>' + it.icon + '</b>' + ui.esc(it.name) + '<em>' + run.items[k] + '</em></span>';
    }).join('') || '<span class="muted">Leer</span>';
    const relics = run.relics.map((id) => {
      const r = R().get('relic', id);
      const set = L.relicSets.of(id);
      return '<span class="relic tip' + (r.rarity === 'rare' ? ' rare' : '') + (set ? ' in-set' : '') + '" data-tip="' + ui.esc(r.name + ': ' + r.desc + (set ? ' · Set: ' + set.name : '')) + '">' + r.icon + '</span>';
    }).join('') || '<span class="muted">Noch keine</span>';
    const quests = (run.quests || []).map((q) => {
      const d = R().get('quest', q.id);
      const p = L.quests.progress(run, q);
      return '<div class="quest-mini' + (q.done ? ' done' : '') + ' tip" data-tip="' + ui.esc(d.desc + ' Belohnung: ' + d.rewardText) + '"><span>' + d.icon + ' ' + ui.esc(d.name) + '</span>' +
        (q.done ? '<b>✓</b>' : '<div class="qbar"><i style="width:' + (p / d.goal * 100).toFixed(0) + '%"></i></div><small>' + p + '/' + d.goal + '</small>') + '</div>';
    }).join('');
    const curses = (run.curses || []).map((id) => { const c = R().get('curse', id); return '<span class="badge curse tip" data-tip="' + ui.esc('Fluch – ' + c.name + ': ' + c.desc + ' Reinigen an Quellen oder bei Lotte.') + '"><b>' + c.icon + '</b>' + ui.esc(c.name) + '</span>'; }).join('');
    const sets = L.relicSets.status(run.relics).filter((x) => x.have > 0 && (!x.set.unlock || (run.unlocks || []).indexOf(x.set.unlock) >= 0)).map((x) =>
      '<span class="set-chip tip' + (x.complete ? ' complete' : '') + '" data-tip="' + ui.esc('Set ' + x.set.name + ' (' + x.set.pieces.map((p) => R().get('relic', p).name).join(', ') + '): ' + x.set.desc) + '">' + x.set.icon + ' ' + ui.esc(x.set.name) + ' ' + x.have + '/' + x.total + '</span>').join('');
    const res = L.resonance.active(run.team).map((r) => '<span class="badge res tip" data-tip="' + ui.esc(r.desc) + '"><b>🔗</b>' + ui.esc(r.name) + '</span>').join('');
    const bless = run.blessing ? R().get('blessing', run.blessing) : null;
    return '<div class="purse"><span class="coin' + bump('gold', run.gold) + '">🪙 <b>' + run.gold + '</b></span><span class="gem' + bump('crystals', run.crystals) + '">💎 <b>' + run.crystals + '</b></span>' +
      (bless ? '<span class="bless tip" data-tip="' + ui.esc('Segen – ' + bless.name + ': ' + bless.desc) + '">' + bless.icon + '</span>' : '') + '</div>' +
      '<h4>Team <small>' + run.team.length + '/' + run.teamSize + '</small></h4>' + team +
      '<button class="btn secondary" data-act="team">📋 Team verwalten</button>' +
      (res ? '<h4>Resonanz</h4><div class="inv">' + res + '</div>' : '') +
      (quests ? '<h4>Aufträge</h4>' + quests : '') + (curses ? '<h4>Flüche</h4><div class="inv">' + curses + '</div>' : '') +
      '<h4>Tasche</h4><div class="inv">' + items + '</div><h4>Relikte</h4><div class="relics">' + relics + '</div>' + (sets ? '<div class="sets">' + sets + '</div>' : '');
  };

  // Auswahl eines Nebenauftrags (1 aus 3)
  let offering = false;
  ui.questOffer = async (run) => {
    if (offering || !run.questOffer) return;
    offering = true;
    await ui.tutorial.show('questOffer');
    const opts = run.questOffer.map((id) => {
      const d = R().get('quest', id);
      return { label: d.icon + ' ' + ui.esc(d.name), sub: ui.esc(d.desc) + '<br>🎁 ' + ui.esc(d.rewardText), value: id };
    });
    const pick = await ui.choose('📜 Auftragsbrett', 'Mira hat Aufträge gesammelt. Du kannst <b>einen</b> annehmen. Er gilt bis zum Ende des Laufs.', opts, 'Keinen Auftrag');
    offering = false;
    if (pick) L.quests.accept(run, pick); else L.quests.decline(run);
    ui.game.persist();
    if (ui.screens.current() === 'map') ui.screens.show('map');
  };
  ui.questToast = (def) => {
    const t = document.createElement('div');
    t.className = 'ach-toast r-selten';
    t.style.setProperty('--rc', '#7ee08a');
    t.style.top = (18 + ui.root().querySelectorAll('.ach-toast').length * 82) + 'px';
    t.innerHTML = '<div class="ic">' + def.icon + '</div><div><small>📜 Auftrag erledigt</small><b>' + ui.esc(def.name) + '</b><span>🎁 ' + ui.esc(def.rewardText) + '</span></div>';
    ui.root().appendChild(t);
    setTimeout(() => t.classList.add('out'), 4200);
    setTimeout(() => t.remove(), 4800);
  };

  function curve(x1, y1, x2, y2) {
    const my = (y1 + y2) / 2;
    return 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + y2;
  }

  ui.screens.register('map', {
    render(el) {
      const run = ui.game.run;
      const act = L.encounters.act(run), variant = L.encounters.variant(run);
      const map = run.map;
      const open = L.run.choices(run);
      const reveal = run.relics.some((id) => R().get('relic', id).reveal);
      const W = PAD * 2 + 4 * COL_W, H = PAD * 2 + (map.layers - 1) * ROW_H + 40;
      const walked = new Set();
      const path = run.visited;
      for (let i = 1; i < path.length; i++) walked.add(path[i - 1] + '>' + path[i]);

      // Wege: unbekannte gestrichelt, gegangene golden leuchtend, offene schimmernd
      let edges = '', glow = '';
      for (const n of Object.values(map.nodes)) {
        const [x1, y1] = nodePos(n, map.layers);
        for (const t of n.links) {
          const [x2, y2] = nodePos(map.nodes[t], map.layers);
          const d = curve(x1, y1, x2, y2);
          const isWalked = walked.has(n.id + '>' + t);
          const isOpen = run.position === n.id && open.indexOf(t) >= 0;
          if (isWalked) glow += '<path class="edge walked-glow" d="' + d + '"/><path class="edge walked" d="' + d + '"/><path class="edge flow" d="' + d + '"/>';
          else edges += '<path class="edge' + (isOpen ? ' next' : '') + '" d="' + d + '"/>';
        }
      }
      // Erste Wahl: Wege vom Startpunkt zu den Knoten der untersten Ebene
      const startX = PAD + 2 * COL_W, startY = H - 22;
      if (!run.position) for (const id of open) { const [x, y] = nodePos(map.nodes[id], map.layers); edges += '<path class="edge next" d="' + curve(startX, startY, x, y) + '"/>'; }

      // Wegpunkte als Medaillons
      let nodes = '';
      for (const n of Object.values(map.nodes)) {
        const [x, y] = nodePos(n, map.layers);
        const st = open.indexOf(n.id) >= 0 ? 'open' : run.position === n.id ? 'current' : run.visited.indexOf(n.id) >= 0 ? 'visited' : 'locked';
        const r = n.kind === 'boss' ? 34 : 23;
        const col = COLOR[n.kind];
        nodes += '<g class="node ' + st + ' k-' + n.kind + '" data-node="' + n.id + '" style="--c:' + col + '">' +
          (n.kind === 'boss' ? '<circle class="aura" cx="' + x + '" cy="' + y + '" r="' + (r + 14) + '"/>' : '') +
          (st === 'open' ? '<circle class="ring" cx="' + x + '" cy="' + y + '" r="' + (r + 7) + '"/>' : '') +
          '<circle class="shadow" cx="' + x + '" cy="' + (y + 4) + '" r="' + r + '"/>' +
          '<circle class="base" cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:url(#med-' + n.kind + ')"/>' +
          '<circle class="rim" cx="' + x + '" cy="' + y + '" r="' + (r - 3) + '"/>' +
          '<text x="' + x + '" y="' + (y + 1) + '"' + (n.kind === 'boss' ? ' style="font-size:30px"' : '') + '>' + ICON[n.kind] + '</text>' +
          (n.data.double ? '<text class="dbl" x="' + (x - r + 2) + '" y="' + (y - r + 8) + '">×2</text>' : '') +
          (st === 'visited' ? '<text class="check" x="' + (x + r - 4) + '" y="' + (y - r + 6) + '">✓</text>' : '') + '</g>';
      }
      // Spielfigur auf der aktuellen Position (oder am Startpunkt)
      const avatar = ui.setting('avatar');
      const [nx, ny] = run.position ? nodePos(map.nodes[run.position], map.layers) : [startX, startY];
      const px = nx + 38, py = ny + 22;
      const token = '<g class="token"><circle class="token-glow" cx="' + px + '" cy="' + (py - 40) + '" r="24"/>' +
        '<clipPath id="tok-clip"><circle cx="' + px + '" cy="' + (py - 40) + '" r="19"/></clipPath>' +
        '<circle cx="' + px + '" cy="' + (py - 40) + '" r="20" fill="#2a2238"/>' +
        '<image href="img/portraits/' + avatar + '.png" x="' + (px - 26) + '" y="' + (py - 62) + '" width="52" height="52" clip-path="url(#tok-clip)" preserveAspectRatio="xMidYMin slice"/>' +
        '<circle cx="' + px + '" cy="' + (py - 40) + '" r="20" fill="none" stroke="#ffd977" stroke-width="3"/>' +
        '<path d="M' + (px - 6) + ' ' + (py - 21) + ' L' + px + ' ' + (py - 12) + ' L' + (px + 6) + ' ' + (py - 21) + ' Z" fill="#ffd977"/></g>';
      const defs = '<defs>' + Object.keys(COLOR).map((k) => '<radialGradient id="med-' + k + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".25" stop-color="' + COLOR[k] + '"/><stop offset="1" stop-color="' + L.palette.shade(COLOR[k], 0.55) + '"/></radialGradient>').join('') +
        '<linearGradient id="gold-path" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffcf5a"/><stop offset="1" stop-color="#fff3c4"/></linearGradient></defs>';
      // Wetterzonen als farbige Bänder mit Symbol am Rand
      const WCOL = { nebel: '200,210,230', stroemung: '90,170,255', glutregen: '255,130,60', sturm: '190,140,255' };
      let zones = '';
      for (const z of map.weather || []) {
        const w = R().get('weather', z.weather);
        const yTop = nodePos({ layer: z.to, col: 0 }, map.layers)[1] - ROW_H / 2, yBot = nodePos({ layer: z.from, col: 0 }, map.layers)[1] + ROW_H / 2;
        const c = WCOL[z.weather] || '255,255,255';
        zones += '<g class="wzone tip" data-tip="' + ui.esc(w.name + ': ' + w.desc + ' Kämpfe hier beginnen mit diesem Wetter.') + '"><rect x="4" y="' + yTop + '" width="' + (W - 8) + '" height="' + (yBot - yTop) + '" rx="22" style="fill:rgba(' + c + ',.12);stroke:rgba(' + c + ',.45)"/>' +
          '<rect class="wz-pill" x="12" y="' + (yTop + 8) + '" width="' + (44 + w.name.length * 9) + '" height="30" rx="15" style="stroke:rgb(' + c + ')"/>' +
          '<text class="wz-icon" x="30" y="' + (yTop + 24) + '">' + w.icon + '</text><text class="wz-name" x="48" y="' + (yTop + 24) + '" style="fill:rgb(' + c + ')">' + ui.esc(w.name) + '</text></g>';
      }
      const startMark = '<g class="start"><ellipse cx="' + startX + '" cy="' + (startY + 4) + '" rx="34" ry="9"/><text x="' + startX + '" y="' + (startY + 4) + '">Start</text></g>';

      const weather = variant.weather ? R().get('weather', variant.weather) : null;
      const night = L.clock.isNight(ui.game.now());
      const echo = run.echo ? R().get('echo', 'echo' + run.echo) : null;
      el.innerHTML = '<div class="map-wrap"><div class="map-area"><div class="bg">' + ui.art.background(variant.background, { palette: variant.palette }) + '</div>' +
        '<div class="shade map-shade"></div><div class="map-motes"></div><div class="map-mist"></div>' +
        '<div class="map-top panel glass"><div class="title-block"><span class="act-name">✦ ' + ui.esc(act.name) + (run.mode === 'turm' ? ' · Stockwerk ' + (L.tower.floors(run) + 1) : '') + ' ✦</span><span class="sub">' + ui.esc(variant.name) +
        (weather ? ' · ' + weather.icon + ' ' + weather.name : '') + (night ? ' · 🌙 Nacht' : ' · ☀️ Tag') + '</span></div>' +
        '<div class="row">' + (L.modes.of(run) ? '<span class="echo-tag tip" data-tip="' + ui.esc(L.modes.of(run).desc) + '">' + L.modes.of(run).icon + ' ' + ui.esc(L.modes.of(run).name) + '</span>' : '') + (echo ? '<span class="echo-tag tip" data-tip="' + ui.esc(echo.rule) + '">' + echo.icon + ' ' + ui.esc(echo.name) + '</span>' : '') +
        '<span class="muted">Lauf ' + run.number + '</span><button class="btn secondary" data-act="types" style="padding:4px 10px" title="Typen-Übersicht">📊 Typen</button><button class="btn secondary" data-act="menu" style="padding:4px 10px">☰</button></div></div>' +
        '<div class="map-scroll"><svg class="map-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + defs + zones + edges + glow + startMark + nodes + token + '</svg></div>' +
        '<div class="map-tip panel glass hidden"></div></div>' +
        '<div class="side glass">' + ui.sidebar(run) + '</div></div>';

      // Partikel über der Karte
      const rnd = L.rng.create(run.seed + ':' + run.visited.length);
      let mo = '';
      for (let i = 0; i < ui.fxCount(22); i++) mo += '<i style="left:' + (rnd.next() * 100).toFixed(1) + '%;top:' + (rnd.next() * 100).toFixed(1) + '%;animation-delay:-' + (rnd.next() * 12).toFixed(1) + 's;animation-duration:' + (8 + rnd.next() * 10).toFixed(1) + 's"></i>';
      el.querySelector('.map-motes').innerHTML = mo;

      // Info-Kästchen beim Darüberfahren
      const tip = el.querySelector('.map-tip');
      const area = el.querySelector('.map-area');
      el.querySelectorAll('.node').forEach((g) => {
        const n = map.nodes[g.dataset.node];
        g.addEventListener('mouseenter', () => {
          let title = LABEL[n.kind], desc = DESC[n.kind];
          if (n.data.double) { title = 'Elite-Doppelkampf'; desc = 'Zwei Trainer kämpfen zusammen: je zwei Monster gleichzeitig im Feld. Sehr schwer, doppelte Kristalle und mehr Gold!'; }
          if (n.kind === 'event' && reveal && n.data.event) { title = R().get('event', n.data.event).title; desc = '🧭 Der Kompass verrät es dir.'; }
          const lv = ['battle', 'elite', 'rival', 'hidden', 'arena'].indexOf(n.kind) >= 0 ? L.encounters.enemyLevel(run, n.layer) + (n.kind === 'elite' ? L.config.eliteLevelBonus : 0) : n.kind === 'boss' ? act.levelRange[1] + L.config.bossLevelBonus + L.echo.of(run).enemyLevel + (run.sideAct ? run.sideLevelBonus || 0 : 0) : null;
          const stTxt = g.classList.contains('open') ? '<span class="go">Klicken zum Betreten</span>' : g.classList.contains('visited') ? '<span class="muted">Schon besucht</span>' : g.classList.contains('current') ? '<span class="muted">Du bist hier</span>' : '<span class="muted">Noch nicht erreichbar</span>';
          const nw = n.data.weather ? R().get('weather', n.data.weather) : null;
          tip.innerHTML = '<b style="color:' + COLOR[n.kind] + '">' + ICON[n.kind] + ' ' + ui.esc(title) + '</b><div>' + ui.esc(desc) + '</div>' + (lv ? '<div class="muted">ca. Level ' + lv + '</div>' : '') + (nw ? '<div>' + nw.icon + ' ' + ui.esc(nw.name) + '</div>' : '') + stTxt;
          tip.classList.remove('hidden');
        });
        g.addEventListener('mousemove', (e) => {
          const r = area.getBoundingClientRect();
          tip.style.left = Math.min(r.width - 240, e.clientX - r.left + 16) + 'px';
          tip.style.top = (e.clientY - r.top + 14) + 'px';
        });
        g.addEventListener('mouseleave', () => tip.classList.add('hidden'));
      });
      // Parallaxe für Hintergrund und Partikel
      area.addEventListener('mousemove', (e) => {
        if (ui.setting('motion') === 'reduziert') return;
        const r = area.getBoundingClientRect();
        area.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        area.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });

      el.querySelectorAll('.node.open').forEach((g) => { g.onclick = () => { tip.classList.add('hidden'); ui.flow.enterNode(g.dataset.node); }; });
      el.querySelector('[data-act="team"]').onclick = async () => { await ui.teamManager(run); ui.screens.show('map'); };
      el.querySelector('[data-act="types"]').onclick = () => ui.typeChart();
      el.querySelectorAll('.team-card').forEach((r) => { r.onclick = async () => { await ui.monDetails(run, Number(r.dataset.mon)); ui.screens.show('map'); }; });
      el.querySelector('[data-act="menu"]').onclick = async () => {
        const v = await ui.choose('Menü', 'Dein Lauf wird automatisch gespeichert.<br><small class="muted">Seed: ' + ui.esc(run.seed) + '</small>', [{ label: '⚙️ Einstellungen', value: 'settings' }, { label: '🏯 Zurück zum Schrein (Lauf bleibt gespeichert)', value: 'hub' }, { label: '🏳️ Lauf aufgeben', value: 'give' }], 'Zurück');
        if (v === 'settings') { await ui.settingsModal(); return ui.screens.show('map'); }
        if (v === 'hub') ui.screens.show('hub');
        if (v === 'give' && (!ui.setting('confirm') || await ui.choose('Wirklich aufgeben?', 'Du bekommst die bisher gesammelten Kristalle.', [{ label: 'Ja, aufgeben', value: true }], 'Nein'))) {
          run.finished = 'defeat';
          ui.screens.show('summary', { result: 'defeat' });
        }
      };
      // Passende Tipps zu Wetter und Sets
      if ((map.weather || []).length) setTimeout(() => { if (ui.screens.current() === 'map') ui.tutorial.show('weather'); }, 1000);
      if (el.querySelector('.sets')) setTimeout(() => { if (ui.screens.current() === 'map') ui.tutorial.show('sets'); }, 1100);
      // Nebenauftrag zu Beginn des Akts wählen
      if (run.questOffer && !run.pending && !run.finished) setTimeout(() => { if (ui.screens.current() === 'map') ui.questOffer(run); }, 700);
      // Zur aktuellen Position scrollen
      const sc = el.querySelector('.map-scroll');
      sc.scrollTop = Math.max(0, py - sc.clientHeight * 0.6);
    },
  });
})(globalThis.LUM);
