// Einstellungs-Fenster (aus L.settings.defs erzeugt) und Wirkung der Einstellungen auf die Oberfläche.
(function (L) {
  const ui = L.ui;

  ui.setting = (id) => L.settings.get(ui.game.meta, id);

  // Einstellungen, die über CSS-Klassen wirken, am Wurzel-Element setzen.
  ui.applySettings = () => {
    const root = ui.root();
    root.classList.toggle('motion-reduced', ui.setting('motion') === 'reduziert');
    root.classList.toggle('font-big', ui.setting('fontSize') === 'gross');
  };

  function settingsHtml() {
    return L.settings.groups.map((g) => {
      const icon = { Spiel: '🎮', Ton: '🔊', Darstellung: '🎨', Story: '📖' }[g] || '';
      const rows = L.settings.defs.filter((d) => d.group === g).map((d) => {
        const cur = ui.setting(d.id);
        if (d.type === 'text') return '<div class="set-row"><div><b>' + ui.esc(d.label) + '</b>' + (d.desc ? '<small class="muted">' + ui.esc(d.desc) + '</small>' : '') + '</div>' +
          '<input class="set-text" data-text="' + d.id + '" maxlength="' + (d.maxLength || 32) + '" placeholder="' + ui.esc(L.player.name({ settings: { avatar: ui.setting('avatar') } })) + '" value="' + ui.esc(cur) + '"></div>';
        return '<div class="set-row"><div><b>' + ui.esc(d.label) + '</b>' + (d.desc ? '<small class="muted">' + ui.esc(d.desc) + '</small>' : '') + '</div>' +
          '<div class="seg">' + d.options.map((o, i) => '<button class="seg-btn' + (o.value === cur ? ' on' : '') + '" data-set="' + d.id + '" data-i="' + i + '">' + ui.esc(o.label) + '</button>').join('') + '</div></div>';
      }).join('');
      return '<h4>' + icon + ' ' + g + '</h4>' + rows;
    }).join('') +
      '<h4>💾 Spielstand</h4><div class="row wrap"><button class="btn secondary" data-data="export">Exportieren</button><button class="btn secondary" data-data="import">Importieren</button><button class="btn danger" data-data="delete">Spielstand löschen</button></div>';
  }

  ui.settingsModal = () => new Promise((resolve) => {
    const m = ui.modal('<h3>⚙️ Einstellungen</h3><div class="settings-body"></div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-close>Fertig</button></div>');
    const body = m.el.querySelector('.settings-body');
    function draw() {
      body.innerHTML = settingsHtml();
      body.querySelectorAll('[data-text]').forEach((inp) => {
        inp.onchange = () => { L.settings.set(ui.game.meta, inp.dataset.text, inp.value); L.save.saveMeta(ui.game.meta); };
        inp.onkeydown = (e) => e.stopPropagation();
      });
      body.querySelectorAll('[data-set]').forEach((b) => {
        b.onclick = () => {
          const d = L.settings.defs.find((x) => x.id === b.dataset.set);
          L.settings.set(ui.game.meta, d.id, d.options[Number(b.dataset.i)].value);
          L.save.saveMeta(ui.game.meta);
          ui.applySettings();
          if (ui.audioSettingsChanged) ui.audioSettingsChanged();
          draw();
        };
      });
      body.querySelector('[data-data="export"]').onclick = exportSave;
      body.querySelector('[data-data="import"]').onclick = importSave;
      body.querySelector('[data-data="delete"]').onclick = deleteSave;
    }
    draw();
    m.el.querySelector('[data-close]').onclick = () => { m.close(); resolve(); };
  });

  async function exportSave() {
    const code = L.save.exportCode(ui.game.meta, ui.game.run || L.save.loadRun());
    const m = ui.modal('<h3>Spielstand exportieren</h3><p>Kopiere diesen Code und bewahre ihn gut auf. Mit „Importieren“ holst du deinen Spielstand zurück, auch auf einem anderen PC.</p>' +
      '<textarea class="code-box" readonly>' + ui.esc(code) + '</textarea><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn secondary" data-copy>Kopieren</button><button class="btn" data-ok>Fertig</button></div>');
    const ta = m.el.querySelector('textarea');
    m.el.querySelector('[data-copy]').onclick = (e) => {
      ta.select();
      const done = () => { e.target.textContent = 'Kopiert ✓'; };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, () => { document.execCommand('copy'); done(); });
      else { document.execCommand('copy'); done(); }
    };
    await new Promise((res) => { m.el.querySelector('[data-ok]').onclick = res; });
    m.close();
  }

  async function importSave() {
    const m = ui.modal('<h3>Spielstand importieren</h3><p>Füge hier deinen Code ein. <b>Achtung:</b> Der jetzige Spielstand wird ersetzt.</p>' +
      '<textarea class="code-box" placeholder="LUMORA1:…"></textarea><p class="err" style="color:var(--bad)"></p><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-cancel>Abbrechen</button><button class="btn" data-ok>Importieren</button></div>');
    await new Promise((res) => {
      m.el.querySelector('[data-cancel]').onclick = () => { m.close(); res(); };
      m.el.querySelector('[data-ok]').onclick = () => {
        try {
          const data = L.save.importCode(m.el.querySelector('textarea').value);
          ui.game.meta = data.meta;
          ui.game.run = data.run;
          L.save.saveMeta(data.meta);
          if (data.run) L.save.saveRun(data.run); else L.save.clearRun();
          m.close();
          res();
          ui.root().querySelectorAll('.modal').forEach((x) => x.remove());
          ui.applySettings();
          ui.screens.show('hub');
        } catch (e) {
          m.el.querySelector('.err').textContent = 'Das hat nicht geklappt: Der Code ist ungültig oder unvollständig.';
        }
      };
    });
  }

  async function deleteSave() {
    const a = await ui.choose('Spielstand löschen?', 'Alle Kristalle, das Lexikon, Freischaltungen und der laufende Lauf gehen verloren.', [{ label: 'Ja, alles löschen', value: true }], 'Nein');
    if (!a) return;
    const b = await ui.choose('Wirklich ganz sicher?', 'Das kann man nicht rückgängig machen.', [{ label: 'Ja, endgültig löschen', value: true }], 'Doch nicht');
    if (!b) return;
    L.save.clearAll();
    ui.game.meta = L.save.loadMeta();
    ui.game.run = null;
    ui.root().querySelectorAll('.modal').forEach((x) => x.remove());
    ui.applySettings();
    ui.screens.show('hub');
  }
})(globalThis.LUM);
