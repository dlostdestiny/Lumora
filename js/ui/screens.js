// Bildschirmwechsel und Spielzustand der Oberfläche.
(function (L) {
  const ui = L.ui;
  const screens = {};
  let current = null;

  ui.screens = {
    register(name, def) { screens[name] = def; },
    show(name, params) {
      if (current && screens[current].leave) screens[current].leave();
      current = name;
      const root = ui.root();
      root.querySelectorAll('.modal, .dialog').forEach((x) => x.remove());
      const el = document.createElement('div');
      el.className = 'screen fade-in screen-' + name;
      root.querySelectorAll('.screen').forEach((x) => x.remove());
      root.prepend(el);
      const out = screens[name].render(el, params || {});
      if (ui.music && ui.musicFor) { const tr = ui.musicFor(name); if (tr) ui.music(tr); }
      // Auswahl- und Info-Bildschirme bekommen Umgebungs-Leben (Schrein, Karte und Kampf haben ihr eigenes)
      if (['echo', 'starter', 'blessing', 'summary', 'dex'].indexOf(name) >= 0) setTimeout(() => ui.ambient(el), 0);
      if (ui.tutorial && L.tutorial.TRIGGERS.indexOf(name) >= 0) setTimeout(() => { if (current === name) ui.tutorial.show(name); }, 900);
      return out;
    },
    current: () => current,
  };

  ui.game = {
    meta: null,
    run: null,
    now: () => L.clock.now(),
    persist() {
      const run = ui.game.run;
      // Ein beendeter Lauf wird sofort verbucht, damit Neuladen während der Abschluss-Story nichts kostet.
      if (run && run.finished) L.progress.finishRun(ui.game.meta, run);
      const fresh = L.achievements.check(ui.game.meta);
      if (fresh.length && ui.achievementToast) fresh.forEach((a, i) => setTimeout(() => ui.achievementToast(a), i * 900));
      L.save.saveMeta(ui.game.meta);
      if (run && !run.finished) L.save.saveRun(run);
      else L.save.clearRun();
    },
  };
})(globalThis.LUM);
