// Visual-Novel-Dialoge mit Chibi-Porträts und tippendem Text. Klick = Text sofort / weiter.
(function (L) {
  const ui = L.ui;

  ui.dialog = {
    play(sceneId) {
      if (!sceneId || !L.registry.has('scene', sceneId)) return Promise.resolve();
      const scene = L.registry.get('scene', sceneId);
      const meta = ui.game.meta;
      if (meta && ui.setting('skipSeenScenes') && meta.scenesSeen.indexOf(sceneId) >= 0) return Promise.resolve();
      if (meta) L.progress.sceneSeen(meta, sceneId);
      return new Promise((resolve) => {
        const el = document.createElement('div');
        el.className = 'dialog';
        el.innerHTML = '<div class="dim"></div><div class="who left"></div><div class="who right"></div>' +
          '<div class="box panel"><div class="nm hidden"></div><div class="txt"></div><div class="next">▼</div></div>' +
          '<button class="btn secondary skip">Überspringen ⏭</button>';
        ui.root().appendChild(el);
        ui.root().classList.add('in-dialog');
        const txt = el.querySelector('.txt'), nm = el.querySelector('.nm');
        const sides = {};
        let i = -1, typing = null, full = '';

        function avatarFor(who) { return who === 'du' ? (meta && meta.settings.avatar) || 'spieler_a' : who; }
        function show() {
          i++;
          if (i >= scene.lines.length) return done();
          const line = scene.lines[i];
          const who = avatarFor(line.who);
          const ch = L.registry.get('character', who);
          if (ch.portrait) {
            if (!sides[who]) sides[who] = Object.keys(sides).length % 2 === 0 ? 'left' : 'right';
            const slot = el.querySelector('.who.' + sides[who]);
            slot.innerHTML = ui.art.portrait(who, line.expr || 'neutral', { facing: sides[who] === 'right' ? 'left' : 'right' });
            el.querySelectorAll('.who').forEach((w) => { w.style.opacity = w === slot ? '1' : '.55'; });
            nm.textContent = ch.name;
            nm.classList.remove('hidden');
            txt.className = 'txt';
          } else {
            nm.classList.add('hidden');
            txt.className = 'txt narr';
            el.querySelectorAll('.who').forEach((w) => { w.style.opacity = '.4'; });
          }
          full = L.story.format(line.text, ui.game.meta);
          let n = 0;
          txt.textContent = '';
          clearInterval(typing);
          typing = setInterval(() => {
            const ts = ui.setting('textSpeed');
            n += ts === 'sofort' ? full.length : ts === 'schnell' ? 6 : 2;
            txt.textContent = full.slice(0, n);
            if (n >= full.length) { clearInterval(typing); typing = null; }
          }, 22);
        }
        function done() {
          clearInterval(typing);
          el.remove();
          ui.root().classList.remove('in-dialog');
          document.removeEventListener('keydown', onKey);
          if (ui.game.meta) L.save.saveMeta(ui.game.meta);
          resolve();
        }
        function advance() {
          if (typing) { clearInterval(typing); typing = null; txt.textContent = full; return; }
          show();
        }
        function onKey(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); } }
        el.addEventListener('click', (e) => { if (!e.target.classList.contains('skip')) advance(); });
        el.querySelector('.skip').addEventListener('click', done);
        document.addEventListener('keydown', onKey);
        show();
      });
    },
    // Spielt die passende Szene für einen Auslöser (falls vorhanden).
    trigger(trigger) {
      const id = L.story.next(ui.game.run || { number: (ui.game.meta.runs || 0) + 1 }, ui.game.meta, trigger);
      return ui.dialog.play(id);
    },
  };
})(globalThis.LUM);
