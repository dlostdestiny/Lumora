// UI-Hilfen: Escaping, Wartezeiten, Modale Fenster, Auswahl-Dialoge, kleine Bausteine (KP-Balken, Typ-Chips).
(function (L) {
  const R = () => L.registry;
  const ui = L.ui = L.ui || {};

  ui.esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  ui.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  ui.root = () => document.getElementById('app');
  ui.spName = (mon) => R().get('species', mon.species).name;

  ui.typeChip = (type) => {
    if (!type) return '<span class="chip" style="background:#d6d3d1">Normal</span>';
    const t = R().get('type', type);
    return '<span class="chip" style="background:' + t.color + '">' + t.icon + ' ' + t.name + '</span>';
  };
  ui.typeChips = (mon) => R().get('species', mon.species).types.map(ui.typeChip).join('');
  ui.hpColor = (ratio) => (ratio > 0.5 ? 'var(--hp)' : ratio > 0.2 ? 'var(--hp-mid)' : 'var(--hp-low)');
  ui.hpBar = (hp, max) => {
    const r = Math.max(0, hp / max);
    return '<div class="bar"><i style="width:' + (r * 100).toFixed(1) + '%;background:' + ui.hpColor(r) + '"></i></div>';
  };
  ui.bondBar = (bond) => '<div class="bar bond" title="Bindung ' + Math.floor(bond) + '/100"><i style="width:' + bond + '%"></i></div>';
  ui.expBar = (mon) => {
    const a = L.mon.expForLevel(mon.level), b = L.mon.expForLevel(mon.level + 1);
    const r = mon.level >= L.config.maxLevel ? 1 : (mon.exp - a) / (b - a);
    return '<div class="bar exp"><i style="width:' + (r * 100).toFixed(1) + '%"></i></div>';
  };
  ui.monArt = (mon, opts) => L.ui.art.monster(mon.species, Object.assign({ shiny: mon.shiny }, opts || {}));

  ui.moveLine = (ref) => {
    const m = L.moves.resolve(ref);
    return ui.typeChip(m.type) + ' <b>' + ui.esc(m.name) + '</b> <small class="muted">' + (m.power ? 'Stärke ' + m.power : 'Status') + (m.accuracy ? ' · Gen. ' + m.accuracy : '') + '</small>';
  };

  // Modales Fenster. html = Inhalt; Rückgabe { el, close }.
  ui.modal = (html, opts) => {
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'modal';
    el.innerHTML = '<div class="panel fade-in">' + html + '</div>';
    ui.root().appendChild(el);
    const close = () => el.remove();
    if (opts.closeOnBg) el.addEventListener('click', (e) => { if (e.target === el) close(); });
    return { el, close };
  };

  // Auswahl: options = [{ label, sub?, art?, value, disabled? }], cancel = Text für Abbrechen (oder null).
  ui.choose = (title, text, options, cancel) => new Promise((resolve) => {
    const html = '<h3>' + ui.esc(title) + '</h3>' + (text ? '<p>' + text + '</p>' : '') +
      '<div class="opt-list">' + options.map((o, i) =>
        '<button class="opt" data-i="' + i + '"' + (o.disabled ? ' disabled' : '') + '>' + (o.art ? '<div class="art">' + o.art + '</div>' : '') +
        '<div><div>' + o.label + '</div>' + (o.sub ? '<small>' + o.sub + '</small>' : '') + '</div></button>').join('') + '</div>' +
      (cancel ? '<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn secondary" data-cancel>' + ui.esc(cancel) + '</button></div>' : '');
    const m = ui.modal(html);
    m.el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { m.close(); resolve(options[Number(b.dataset.i)].value); }));
    const c = m.el.querySelector('[data-cancel]');
    if (c) c.addEventListener('click', () => { m.close(); resolve(null); });
  });

  ui.alert = (title, html, button) => new Promise((resolve) => {
    const m = ui.modal('<h3>' + ui.esc(title) + '</h3><div>' + html + '</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-ok>' + ui.esc(button || 'Weiter') + '</button></div>');
    m.el.querySelector('[data-ok]').addEventListener('click', () => { m.close(); resolve(); });
  });

  ui.monOption = (mon, i, extra) => Object.assign({
    label: '<b>' + ui.esc(ui.spName(mon)) + '</b> Lv ' + mon.level + ' ' + ui.typeChips(mon),
    sub: 'KP ' + mon.hp + '/' + L.mon.maxHp(mon) + (mon.status ? ' · ' + R().get('status', mon.status).name : ''),
    art: ui.monArt(mon),
    value: i,
  }, extra || {});

  // Attacke lernen: wählt, welche Attacke vergessen wird. Gibt true zurück, wenn gelernt.
  ui.learnMove = async (mon, moveId) => {
    const name = ui.spName(mon);
    const mv = R().get('move', moveId);
    if (mon.moves.some((m) => m.id === moveId)) return false;
    if (mon.moves.length < 4) {
      L.mon.learn(mon, moveId, null);
      await ui.alert('Neue Attacke!', name + ' hat <b>' + ui.esc(mv.name) + '</b> gelernt!');
      return true;
    }
    const opts = mon.moves.map((ref, i) => ({ label: ui.moveLine(ref), sub: ui.esc(L.moves.resolve(ref).desc || ''), value: i }));
    const idx = await ui.choose(name + ' möchte ' + mv.name + ' lernen', 'Neu: ' + ui.moveLine({ id: moveId }) + '<br><small class="muted">' + ui.esc(mv.desc || '') + '</small><br>Welche Attacke soll ' + ui.esc(name) + ' dafür vergessen?', opts, mv.name + ' nicht lernen');
    if (idx === null) return false;
    L.mon.learn(mon, moveId, idx);
    return true;
  };

  // Entwicklung anbieten (bei verzweigter Entwicklung später mehrere Ziele).
  ui.evolve = async (mon, toId) => {
    if (ui.sound) ui.sound('evolve');
    await ui.tutorial.show('evolve');
    const from = ui.spName(mon), to = R().get('species', toId);
    const m = ui.modal('<h3>Was? ' + ui.esc(from) + ' entwickelt sich!</h3><div class="row center" style="gap:30px">' +
      '<div style="width:180px;height:180px">' + ui.monArt(mon) + '</div><div style="font-size:40px">➜</div>' +
      '<div style="width:180px;height:180px" class="appear">' + L.ui.art.monster(toId, { shiny: mon.shiny }) + '</div></div>' +
      '<p class="muted" style="text-align:center">' + ui.esc(to.dex) + '</p>' +
      '<div class="row" style="justify-content:center"><button class="btn big" data-yes>Entwickeln!</button><button class="btn secondary" data-no>Noch nicht</button></div>');
    const yes = await new Promise((res) => {
      m.el.querySelector('[data-yes]').onclick = () => res(true);
      m.el.querySelector('[data-no]').onclick = () => res(false);
    });
    m.close();
    if (yes) {
      const offers = L.mon.evolve(mon, toId);
      L.progress.track(ui.game.meta, 'evolutions');
      await ui.alert('Glückwunsch!', ui.esc(from) + ' hat sich zu <b>' + ui.esc(to.name) + '</b> entwickelt!');
      for (const o of offers) {
        if (o.kind === 'learned') await ui.alert('Neue Attacke!', ui.esc(to.name) + ' hat <b>' + ui.esc(R().get('move', o.move).name) + '</b> gelernt!');
        if (o.kind === 'learn') await ui.learnMove(mon, o.move);
      }
    } else {
      await ui.alert('Noch nicht', ui.esc(from) + ' bleibt erst einmal, wie es ist. Beim nächsten Level-Aufstieg kannst du es dir anders überlegen.');
    }
  };

  // Angebote nach Kampf/Training/Ereignis nacheinander abarbeiten.
  ui.resolveOffers = async (run, offers) => {
    const done = {};
    for (const o of offers || []) {
      if (o.kind === 'evolve') {
        if (done[o.mon]) continue;
        const forms = offers.filter((x) => x.kind === 'evolve' && x.mon === o.mon).map((x) => x.to);
        done[o.mon] = true;
        const mon = run.team.find((m) => m.uid === o.mon);
        if (!mon || forms.indexOf(mon.species) >= 0) continue;
        if (forms.length > 1) {
          await ui.tutorial.show('evolve');
          const pick = await ui.choose('Was? ' + ui.spName(mon) + ' entwickelt sich!', 'Es kann zwei Wege gehen. Welche Form soll es annehmen?',
            forms.map((to) => { const sp = R().get('species', to); return { label: ui.esc(sp.name), sub: sp.types.map(ui.typeChip).join('') + ' ' + ui.esc(sp.dex), art: ui.art.monster(to, { shiny: mon.shiny }), value: to }; }), 'Noch nicht');
          if (pick) await ui.evolve(mon, pick);
        } else await ui.evolve(mon, forms[0]);
        continue;
      }
      if (o.kind === 'teach') {
        const idx = await ui.choose('Wer soll ' + R().get('move', o.move).name + ' lernen?', ui.moveLine({ id: o.move }),
          run.team.map((m, i) => ui.monOption(m, i, { disabled: m.moves.some((x) => x.id === o.move) })), 'Niemand');
        if (idx !== null) await ui.learnMove(run.team[idx], o.move);
        continue;
      }
      const mon = run.team.find((m) => m.uid === o.mon);
      if (!mon) continue;
      if (o.kind === 'learn') await ui.learnMove(mon, o.move);
    }
  };

  // Leben für jeden Bildschirm: Kamerafahrt, Parallaxe, schwebende Lichtpartikel, Vignette
  // und lebendige Karten (hereinfliegen, schweben, 3D-Kippen zur Maus, Glanz).
  ui.ambient = (el) => {
    el.classList.add('amb');
    const bg = el.querySelector('.bg');
    if (bg && !el.querySelector('.amb-motes')) {
      let h = '';
      for (let i = 0; i < ui.fxCount(18); i++) {
        h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:-' + (Math.random() * 12).toFixed(1) + 's;animation-duration:' + (8 + Math.random() * 10).toFixed(1) + 's"></i>';
      }
      bg.insertAdjacentHTML('afterend', '<div class="amb-motes">' + h + '</div><div class="amb-vignette"></div>');
    }
    el.addEventListener('mousemove', (e) => {
      if (ui.setting('motion') === 'reduziert') return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    el.querySelectorAll('.card').forEach((c, i) => {
      c.style.setProperty('--i', i);
      c.addEventListener('mousemove', (e) => {
        if (ui.setting('motion') === 'reduziert') return;
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--rx', (-y * 10).toFixed(1) + 'deg');
        c.style.setProperty('--ry', (x * 12).toFixed(1) + 'deg');
        c.style.setProperty('--sx', ((x + 0.5) * 100).toFixed(0) + '%');
      });
      c.addEventListener('mouseleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  };

  // Allgemeine Typen-Übersicht (nicht vom Team abhängig): Liste pro Typ und Tabelle.
  ui.typeChart = () => new Promise((resolve) => {
    const types = L.types.visible();
    const chips = (ids) => (ids.length ? ids.map(ui.typeChip).join(' ') : '<span class="muted">–</span>');
    const list = types.map((t) => {
      const m = L.types.matchups(t);
      return '<div class="type-card">' + ui.typeChip(t) +
        '<div class="type-rows"><span>⚔️ Stark gegen</span><div>' + chips(m.strongVs) + '</div>' +
        '<span>🪶 Schwach gegen</span><div>' + chips(m.weakVs) + '</div>' +
        '<span>💥 Bekommt viel Schaden von</span><div>' + chips(m.vulnerableTo) + '</div>' +
        '<span>🛡️ Hält gut aus</span><div>' + chips(m.resists) + '</div></div></div>';
    }).join('');
    const head = '<tr><th class="corner">Angriff ↓ / Ziel →</th>' + types.map((t) => '<th>' + ui.typeChip(t) + '</th>').join('') + '</tr>';
    const rows = types.map((a) => '<tr><th>' + ui.typeChip(a) + '</th>' + types.map((d) => {
      const e = L.types.effectiveness(a, [d]);
      return e > 1 ? '<td class="eff-good">×2</td>' : e < 1 ? '<td class="eff-bad">×½</td>' : '<td class="eff-none">·</td>';
    }).join('') + '</tr>').join('');
    const m = ui.modal('<h3>📊 Typen-Übersicht</h3>' +
      '<div class="row" style="margin-bottom:10px"><button class="btn" data-tab="list">Pro Typ</button><button class="btn secondary" data-tab="table">Tabelle</button></div>' +
      '<div data-view="list" class="type-list">' + list + '</div>' +
      '<div data-view="table" class="hidden"><table class="type-table">' + head + rows + '</table>' +
      '<p class="muted">Lies so: Zeile = angreifende Attacke, Spalte = Typ des Ziels. Hat ein Monster zwei Typen, werden die Werte multipliziert, zum Beispiel ×2 und ×2 = ×4. Außerdem machen Attacken 25 % mehr Schaden, wenn sie denselben Typ haben wie das angreifende Monster.</p></div>' +
      '<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-close>Schließen</button></div>');
    m.el.querySelectorAll('[data-tab]').forEach((b) => {
      b.onclick = () => {
        m.el.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('secondary', x !== b));
        m.el.querySelectorAll('[data-view]').forEach((v) => v.classList.toggle('hidden', v.dataset.view !== b.dataset.tab));
      };
    });
    m.el.querySelector('[data-close]').onclick = () => { m.close(); resolve(); };
  });

  // Team voll: welches Monster geht?
  ui.resolveRelease = async (run) => {
    const mon = run.pending && run.pending.release;
    if (!mon) return;
    await ui.tutorial.show('teamFull');
    const opts = run.team.map((m, i) => ui.monOption(m, i, { label: 'Freilassen: ' + ui.monOption(m, i).label }));
    const idx = await ui.choose('Dein Team ist voll!', 'Neu dabei: <b>' + ui.esc(ui.spName(mon)) + '</b> Lv ' + mon.level + ' ' + ui.typeChips(mon) + '<br>Wen möchtest du dafür freilassen?', opts, ui.spName(mon) + ' ziehen lassen');
    L.run.release(run, idx);
    L.ui.game.persist();
  };
})(globalThis.LUM);
