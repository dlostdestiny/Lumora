// Kampfbildschirm: zeigt den Kampf, nimmt Aktionen an und spielt die Ereignisse der Engine mit Effekten ab.
(function (L) {
  const ui = L.ui, R = () => L.registry;
  const STAGE_WORD = { 1: 'steigt', 2: 'steigt stark', 3: 'steigt enorm', '-1': 'sinkt', '-2': 'sinkt stark', '-3': 'sinkt enorm' };
  const CANT = { frost: 'ist eingefroren!', schlaf: 'schläft tief und fest …', laehmung: 'ist gelähmt und kann sich nicht bewegen!', verwirrt: 'ist verwirrt und trifft sich selbst!' };

  function nameOf(battle, side, mon) {
    const n = ui.spName(mon);
    if (side === 0) return n;
    return n + (battle.kind === 'wild' ? ' (wild)' : ' (Gegner)');
  }

  ui.battle = {
    // Startet einen Kampf und löst ihn auf, wenn er zu Ende ist. Gibt die Zusammenfassung von L.run.resolveBattle zurück.
    start(run) {
      return new Promise((resolve) => {
        const g = ui.game;
        const battle = L.run.makeBattle(run, g.now());
        const setup = run.pending.battle;
        const variant = L.encounters.variant(run);
        const el = ui.root().querySelector('.screen') || ui.root();
        el.innerHTML = '';
        const scr = document.createElement('div');
        scr.className = 'battle' + (battle.doubles ? ' double' : '');
        // Plätze je Seite: im Doppelkampf zwei Monster nebeneinander
        const SL = battle.doubles ? [0, 1] : [0];
        const bgId = setup.arena || variant.background;
        if (ui.music) ui.music(setup.kind === 'boss' ? (run.flags.finale ? 'finale' : 'boss') : 'battle');
        scr.innerHTML = '<div class="bg">' + ui.art.background(bgId, { palette: variant.palette }) + '</div><div class="rays"></div><div class="motes far"></div><div class="weather"></div>' +
          '<div class="field"><div class="platform enemy"></div><div class="platform player"></div>' + SL.map((k) => '<div class="mon enemy s' + k + '"></div><div class="mon player s' + k + '"></div>').join('') +
          SL.map((k) => '<div class="info enemy s' + k + ' panel"></div><div class="info player s' + k + ' panel"></div>').join('') + '</div><div class="atmo"></div><div class="motes near"></div>' +
          '<div class="bottom"><div class="msg panel"></div><div class="menu"></div></div>' +
          '<button class="btn secondary sound-btn" title="Ton an/aus (Taste M)"></button>' +
          '<button class="btn secondary speed-btn" title="Kampf-Tempo"></button>' +
          '<button class="btn secondary types-btn" title="Typen-Übersicht (T)">📊 Typen</button>' +
          '<button class="btn secondary log-btn" title="Kampf-Protokoll (P)">📜</button>';
        el.appendChild(scr);
        // Umgebungslicht je Ort: färbt Monster leicht ein und legt Dunst an den Boden
        const LIGHT = { wald: '255,226,150', moor: '120,175,255', arena_boss: '255,80,205', schrein: '150,195,255', vulkan: '255,150,80', grotte: '170,160,255', arena_brakk: '255,110,60', gipfel: '200,215,255', nebelkamm: '190,200,240', arena_sola: '170,140,255', tiefsee: '120,220,255', turm: '190,170,255', glasebene: '190,225,255', sternenstrom: '170,220,230', arena_vael: '190,160,255' };
        const light = LIGHT[bgId] || '255,255,255';
        scr.style.setProperty('--tint', 'rgb(' + light + ')');
        scr.style.setProperty('--haze', 'rgba(' + light + ',.22)');
        scr.style.setProperty('--glow', 'rgba(' + light + ',.85)');
        // Tiefe: Lichtpartikel in zwei Ebenen (hinten klein und scharf, vorne groß und unscharf)
        const prng = L.rng.create(bgId + ':' + battle.turn);
        const motes = (cls, n, size, blur) => {
          let html = '';
          for (let i = 0; i < n; i++) {
            const s = size[0] + prng.next() * (size[1] - size[0]);
            const near = cls === 'near';
            const x = near ? (prng.chance(0.5) ? prng.next() * 22 : 78 + prng.next() * 22) : prng.next() * 100;
            html += '<i style="left:' + x.toFixed(1) + '%;top:' + (prng.next() * 90).toFixed(1) + '%;width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;filter:blur(' + blur + 'px);animation-delay:-' + (prng.next() * 12).toFixed(1) + 's;animation-duration:' + (9 + prng.next() * 9).toFixed(1) + 's"></i>';
          }
          scr.querySelector('.motes.' + cls).innerHTML = html;
        };
        motes('far', ui.fxCount(26), [2, 5], 0.3);
        motes('near', ui.fxCount(9), [26, 60], 9);
        // Maus-Parallaxe: Ebenen verschieben sich unterschiedlich stark
        const onMove = (e) => {
          if (ui.setting('motion') === 'reduziert') return;
          const r = scr.getBoundingClientRect();
          scr.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
          scr.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        };
        scr.addEventListener('mousemove', onMove);
        const $ = (s) => scr.querySelector(s);
        const msg = $('.msg'), menu = $('.menu');
        let skip = false;
        scr.addEventListener('click', (e) => { if (!e.target.closest('.menu') && !e.target.closest('.speed-btn') && !e.target.closest('.sound-btn') && !e.target.closest('.types-btn') && !e.target.closest('.log-btn')) skip = true; });
        scr.querySelector('.types-btn').onclick = () => ui.typeChart();
        const showLog = () => {
          const m = ui.modal('<h3>📜 Kampf-Protokoll</h3><div class="battle-log">' + (log.length ? log.slice(-150).map((t, i) => '<div><small>' + (i + 1) + '</small> ' + ui.esc(t) + '</div>').join('') : '<p class="muted">Noch nichts passiert.</p>') + '</div><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-close>Schließen</button></div>', { closeOnBg: true });
          m.el.querySelector('[data-close]').onclick = m.close;
          const box = m.el.querySelector('.battle-log'); box.scrollTop = box.scrollHeight;
        };
        scr.querySelector('.log-btn').onclick = showLog;

        // ---------- Tempo (1×, 2×, 4×) ----------
        const speed = () => g.meta.settings.speed || 1;
        const W = (ms) => ui.wait(ms / speed());
        const T = (fn, ms) => setTimeout(fn, ms / speed());
        // CSS-Animationen eines Elements im aktuellen Tempo abspielen
        const rate = (el) => { if (el && el.getAnimations) for (const a of el.getAnimations({ subtree: true })) a.playbackRate = speed(); };
        const speedBtn = $('.speed-btn');
        function drawSpeed() {
          speedBtn.textContent = '⏩ ' + speed() + '×';
          scr.style.setProperty('--bar-t', (0.45 / speed()) + 's');
        }
        speedBtn.onclick = () => { g.meta.settings.speed = L.config.nextSpeed(speed()); L.save.saveMeta(g.meta); drawSpeed(); };
        drawSpeed();
        const soundBtn = $('.sound-btn');
        function drawSound() { soundBtn.textContent = ui.setting('mute') ? '🔇' : '🔊'; soundBtn.classList.toggle('muted', !!ui.setting('mute')); }
        const toggleSound = () => { L.settings.set(g.meta, 'mute', !ui.setting('mute')); L.save.saveMeta(g.meta); if (ui.audioSettingsChanged) ui.audioSettingsChanged(); drawSound(); };
        soundBtn.onclick = toggleSound;
        drawSound();

        for (const m of battle.sides[1].team) L.progress.seen(g.meta, m);

        // ---------- Darstellung ----------
        const who = (side) => (side === 0 ? 'player' : 'enemy');
        const hasSlot = (side, slot) => !!battle.sides[side].slots[slot || 0];
        // Monster auf einem Platz (im Einzelkampf immer Platz 0)
        const monAt = (side, slot) => L.battle.slotMon(battle, side, slot || 0);
        function drawMon(side, anim, slot) {
          slot = slot || 0;
          const box = monBox(side, slot);
          if (!hasSlot(side, slot)) { box.className = 'mon ' + who(side) + ' s' + slot + ' empty'; box.innerHTML = ''; drawInfo(side, slot); return; }
          const mon = monAt(side, slot);
          const body = (R().get('species', mon.species).art || {}).body || 'round';
          box.className = 'mon ' + who(side) + ' s' + slot + ' body-' + body + (anim ? ' ' + anim : '') + (battle.doubles && mon.hp <= 0 ? ' faint' : '');
          box.innerHTML = ui.art.battleMonster(mon, { facing: side === 0 ? 'right' : 'left' }) + '<div class="sfx"></div>';
          rate(box);
          drawInfo(side, slot);
        }
        function drawSide(side, anim) { for (const k of SL) drawMon(side, anim, k); }
        function drawInfos() { for (const side of [0, 1]) for (const k of SL) drawInfo(side, k); }
        // KP-Balken mit „Nachzieher“: der helle Rest schrumpft verzögert hinterher
        const hpPrev = {};
        function hpBarFx(side, mon, max) {
          const ratio = Math.max(0, mon.hp / max);
          const key = side + ':' + mon.uid;
          const prev = hpPrev[key] === undefined ? ratio : hpPrev[key];
          hpPrev[key] = ratio;
          return '<div class="bar hp" data-to="' + ratio + '"><i class="ghost" style="width:' + (prev * 100).toFixed(1) + '%"></i><i class="fill" style="width:' + (prev * 100).toFixed(1) + '%;background:' + ui.hpColor(ratio) + '"></i></div>';
        }
        const STATUS_FX = { schlaf: '💤', gift: '☠️', brand: '🔥', laehmung: '⚡' };
        function drawInfo(side, slot) {
          slot = slot || 0;
          const s = battle.sides[side];
          const infoEl = $('.info.' + who(side) + '.s' + slot);
          if (!hasSlot(side, slot)) { infoEl.classList.add('hidden'); return; }
          const mon = monAt(side, slot);
          infoEl.classList.toggle('down', battle.doubles && mon.hp <= 0);
          const max = L.mon.maxHp(mon);
          const st = mon.status ? R().get('status', mon.status) : null;
          const pips = side === 1 && battle.kind !== 'wild' && slot === 0 ? '<div class="pips">' + s.team.map((m) => '<i class="' + (m.hp <= 0 ? 'down' : '') + '"></i>').join('') + '</div>' : '';
          // Status-Symbole schweben über dem Monster
          const sfx = $('.mon.' + who(side) + '.s' + slot + ' .sfx');
          if (sfx) {
            const icon = mon.hp > 0 && mon.status ? STATUS_FX[mon.status] : '';
            if (sfx.dataset.icon !== icon) {
              sfx.dataset.icon = icon;
              sfx.innerHTML = icon ? [0, 1, 2].map((i) => '<span style="animation-delay:' + (i * 0.8) + 's;left:' + (35 + i * 15) + '%">' + icon + '</span>').join('') : '';
              rate(sfx);
            }
          }
          infoEl.style.setProperty('--acc', L.palette.typeColor(R().get('species', mon.species).types[0]));
          infoEl.innerHTML =
            '<div class="nm"><span>' + ui.esc(ui.spName(mon)) + (mon.shiny ? ' ✨' : '') + (st ? '<span class="status" style="background:' + st.color + '">' + st.icon + ' ' + st.name + '</span>' : '') + '</span><span>Lv ' + mon.level + '</span></div>' +
            '<div>' + ui.typeChips(mon) + (mon.trait && side === 1 ? ' <small class="muted">' + R().get('trait', mon.trait).name + '</small>' : '') + '</div>' +
            '<div class="hpline"><span>KP</span>' + hpBarFx(side, mon, max) + '</div>' +
            (side === 0 ? '<div class="hpnum">' + mon.hp + ' / ' + max + '</div><div class="hpline"><span style="color:var(--bond)">♥</span>' + ui.bondBar(mon.bond) + '</div>' : '') + pips +
            (side === 1 && slot === 0 && battle.sides[1].affixes.length ? '<div>' + battle.sides[1].affixes.map((a) => '<span class="chip" style="background:#ff9fa9" title="' + ui.esc(R().get('affix', a).desc) + '">' + R().get('affix', a).icon + ' ' + R().get('affix', a).name + '</span>').join('') + '</div>' : '');
          // Balken nach dem Einfügen auf den neuen Wert laufen lassen
          const bar = infoEl.querySelector('.bar.hp');
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const to = (Number(bar.dataset.to) * 100).toFixed(1) + '%';
            bar.querySelector('.fill').style.width = to;
            bar.querySelector('.ghost').style.width = to;
          }));
        }
        // Treffer-Partikel passend zum Typ der Attacke
        let lastType = null;
        function impact(side, type, slot) {
          if (ui.setting('motion') === 'reduziert') return;
          const b = monBox(side, slot).getBoundingClientRect(), r = scr.getBoundingClientRect();
          const d = document.createElement('div');
          d.className = 'impact p-' + (type || 'normal');
          d.style.left = (b.left - r.left + b.width / 2) + 'px';
          d.style.top = (b.top - r.top + b.height * 0.55) + 'px';
          let h = '';
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 90;
            h += '<span style="--dx:' + Math.round(Math.cos(a) * dist) + 'px;--dy:' + Math.round(Math.sin(a) * dist - 30) + 'px;--rot:' + Math.round(Math.random() * 360) + 'deg;animation-delay:' + (Math.random() * 0.08).toFixed(2) + 's"></span>';
          }
          d.innerHTML = h + '<b class="ring"></b>';
          scr.appendChild(d);
          rate(d);
          T(() => d.remove(), 1000);
        }
        function drawWeather() {
          const w = $('.weather');
          w.className = 'weather' + (battle.weather && ui.setting('weatherFx') ? ' weather-' + battle.weather.id : '');
          w.innerHTML = battle.weather ? '<div class="weather-tag panel">' + R().get('weather', battle.weather.id).icon + ' ' + R().get('weather', battle.weather.id).name + ' (' + battle.weather.turnsLeft + ')</div>' : '';
        }
        const log = [];
        async function say(text, ms) {
          log.push(text);
          msg.textContent = text;
          skip = false;
          if (ui.setting('clickToContinue')) {
            msg.classList.add('click-wait');
            while (!skip) await ui.wait(30);
            msg.classList.remove('click-wait');
            return;
          }
          const until = Date.now() + (ms || 900) / speed();
          while (Date.now() < until && !skip) await ui.wait(30);
        }
        function monBox(side, slot) { return $('.mon.' + who(side) + '.s' + (slot || 0)); }
        function fx(cls, side, ms, slot) {
          if (cls === 'shake' && !ui.setting('shake')) return;
          const b = monBox(side, slot);
          b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls);
          rate(b);
          T(() => b.classList.remove(cls), ms || 400);
        }
        function floatNum(side, text, kind, slot) {
          if (!ui.setting('damageNumbers')) return;
          const b = monBox(side, slot).getBoundingClientRect(), r = scr.getBoundingClientRect();
          const d = document.createElement('div');
          d.className = 'float-num ' + (kind || '');
          d.textContent = text;
          d.style.left = (b.left - r.left + b.width / 2 - 20) + 'px';
          d.style.top = (b.top - r.top + b.height * 0.25) + 'px';
          scr.appendChild(d);
          rate(d);
          T(() => d.remove(), 1000);
        }
        function banner(text) {
          const d = document.createElement('div');
          d.className = 'banner';
          d.textContent = text;
          scr.appendChild(d);
          rate(d);
          T(() => d.remove(), 900);
        }
        async function cutIn(side, title, slot) {
          if (!ui.setting('cutins')) { banner(title); return W(700); }
          const mon = monAt(side, slot);
          const d = document.createElement('div');
          d.className = 'cutin';
          d.innerHTML = '<div class="band"><div class="lines"></div></div><div class="who">' + ui.monArt(mon, { size: 400 }) + '</div><div class="ttl">' + ui.esc(title) + '</div>';
          scr.appendChild(d);
          rate(d);
          await W(1300);
          d.remove();
        }
        function speedlines() {
          const d = document.createElement('div');
          d.className = 'speed';
          scr.appendChild(d);
          rate(d);
          T(() => d.remove(), 650);
        }
        async function animateBar(side, slot) { drawInfo(side, slot); await W(skip ? 50 : 420); }

        // Angriffs-Animation passend zur Attacke (siehe js/ui/attackfx.js)
        let fxShown = false;
        async function moveFx(e, events) {
          if (ui.fxLevel() === 0) return;
          const i = events.indexOf(e);
          let missed = false, crit = false;
          for (let j = i + 1; j < events.length; j++) {
            const x = events[j];
            if (x.t === 'move' || x.t === 'turnStart') break;
            if (x.t === 'miss' && x.side === e.side) { missed = true; break; }
            if (x.t === 'damage' && x.crit) crit = true;
          }
          const def = e.bond ? { power: 150, effects: [] } : (R().has('move', e.move) ? R().get('move', e.move) : { power: 40, effects: [] });
          const me = monBox(e.side, e.slot), foe = monBox(1 - e.side, e.foeSlot);
          const base = { root: scr, speed: speed() };
          if (def.power > 0) {
            fxShown = !missed;
            return ui.attackFx.attack(Object.assign(base, { from: me, to: foe, fromSide: e.side, type: e.type || 'normal', power: def.power, bond: e.bond, crit, miss: missed }));
          }
          if (missed) return;
          const effs = def.effects || [];
          const weather = effs.find((x) => x.kind === 'weather');
          if (weather) return ui.attackFx.sky(Object.assign(base, { weather: weather.weather }));
          if (effs.some((x) => x.kind === 'heal')) return ui.attackFx.aura(Object.assign(base, { el: me, side: e.side, kind: 'heal', type: e.type }));
          if (effs.some((x) => x.target === 'self' || x.kind === 'critUp')) return ui.attackFx.aura(Object.assign(base, { el: me, side: e.side, kind: 'buff', type: e.type }));
          return ui.attackFx.aura(Object.assign(base, { el: foe, side: 1 - e.side, kind: 'debuff', type: e.type }));
        }

        // ---------- Ereignisse abspielen ----------
        async function play(events) {
          for (const e of events) {
            const sl = e.slot || 0;
            const mon = e.side === undefined ? null : (e.uid && battle.sides[e.side].team.find((m) => m.uid === e.uid)) || monAt(e.side, sl);
            switch (e.t) {
              case 'move':
                lastType = e.type || null;
                fx(e.side === 0 ? 'lunge-r' : 'lunge-l', e.side, 360, sl);
                if (!e.bond) await say(nameOf(battle, e.side, mon) + ' setzt ' + e.name + ' ein!', 650);
                await moveFx(e, events);
                break;
              case 'bondMove':
                ui.sound('bond');
                if (e.side === 0) L.progress.track(g.meta, 'bondMoves');
                await cutIn(e.side, e.name + '!', sl);
                await say('Bindungs-Attacke: ' + e.name + '!', 700);
                break;
              case 'miss': ui.sound('miss'); await say('Daneben!', 650); break;
              case 'damage': {
                const target = e.side;
                fx('shake', target, 380, sl);
                fx('hitflash', target, 320, sl);
                ui.sound(e.crit ? 'crit' : 'hit', { type: lastType });
                // Kleiner Einschlag nur, wenn keine große Angriffs-Animation lief (z. B. Mehrfachtreffer, Stufe Niedrig)
                if (!e.reason && !e.self) { if (fxShown) fxShown = false; else impact(target, lastType, sl); }
                if (e.crit) {
                  if (target === 1) L.progress.track(g.meta, 'crits');
                  speedlines();
                  banner('VOLLTREFFER!');
                  if (ui.setting('shake')) { scr.classList.remove('cam-punch'); void scr.offsetWidth; scr.classList.add('cam-punch'); rate(scr); }
                }
                floatNum(target, '-' + e.amount, e.crit ? 'crit' : '', sl);
                await animateBar(target, sl);
                if (e.self) await say(nameOf(battle, target, mon) + ' hat sich selbst verletzt!', 700);
                else if (e.reason === 'recoil') await say(nameOf(battle, target, mon) + ' wird vom Rückstoß getroffen!', 700);
                else if (e.reason === 'ability' || e.reason === 'affix') await say(nameOf(battle, target, mon) + ' nimmt Schaden!', 650);
                else if (e.reason === 'exhaustion') await say(nameOf(battle, target, mon) + ' ist erschöpft!', 600);
                if (e.effectiveness >= 2) { ui.sound('superEff'); await say('Das ist sehr effektiv!', 750); }
                else if (e.effectiveness > 0 && e.effectiveness < 1) { ui.sound('weak'); await say('Das ist nicht sehr effektiv …', 750); }
                break;
              }
              case 'heal':
                ui.sound('heal');
                floatNum(e.side, '+' + e.amount, 'heal', sl);
                await animateBar(e.side, sl);
                await say(nameOf(battle, e.side, mon) + ' wird geheilt.', 600);
                break;
              case 'status': {
                const st = R().get('status', e.status);
                drawInfo(e.side, sl);
                ui.sound('status');
                const words = { frost: 'ist eingefroren!', brand: 'hat Verbrennungen!', gift: 'wurde vergiftet!', laehmung: 'ist gelähmt!', schlaf: 'ist eingeschlafen!' };
                await say(nameOf(battle, e.side, mon) + ' ' + (words[e.status] || st.name), 800);
                break;
              }
              case 'statusTick':
                fx('shake', e.side, 300, sl);
                floatNum(e.side, '-' + e.amount, '', sl);
                await animateBar(e.side, sl);
                await say(nameOf(battle, e.side, mon) + (e.status === 'brand' ? ' leidet unter Verbrennungen!' : ' leidet unter Gift!'), 700);
                break;
              case 'statusEnd':
                drawInfo(e.side, sl);
                if (e.status === 'schlaf') await say(nameOf(battle, e.side, mon) + ' ist aufgewacht!', 700);
                else if (e.status) await say(nameOf(battle, e.side, mon) + ' ist wieder gesund.', 700);
                break;
              case 'cantMove': await say(nameOf(battle, e.side, mon) + ' ' + CANT[e.reason], 800); break;
              case 'stage':
                await say(nameOf(battle, e.side, mon) + 's ' + L.battle.STAT_NAMES[e.stat] + ' ' + STAGE_WORD[String(e.delta)] + '!', 750);
                break;
              case 'weather':
                drawWeather();
                await say(R().get('weather', e.id).icon + ' ' + R().get('weather', e.id).name + ' zieht auf!', 800);
                break;
              case 'weatherEnd':
                drawWeather();
                await say(R().get('weather', e.id).name + ' legt sich.', 700);
                break;
              case 'faint':
                ui.sound('faint');
                monBox(e.side, sl).classList.add('faint');
                rate(monBox(e.side, sl));
                await say(nameOf(battle, e.side, mon) + ' wurde besiegt!', 900);
                if (e.side === 0) ui.tutorial.show('faint');
                if (e.side === 1 || battle.doubles) drawInfo(e.side, sl);
                break;
              case 'switch':
                drawMon(e.side, 'appear', sl);
                drawWeather();
                if (e.side === 0) await say('Los, ' + ui.spName(mon) + '!', 700);
                break;
              case 'bond': drawInfo(0, sl); break;
              case 'ability': {
                const ab = R().get('ability', e.ability);
                await say(e.text || (nameOf(battle, e.side, mon) + 's ' + ab.name + '!'), 800);
                break;
              }
              case 'text': await say(e.text, 900); break;
              case 'art': {
                const p = L.paths.of(e.path);
                ui.sound('bond');
                await cutIn(0, p.icon + ' ' + e.name + '!');
                break;
              }
              case 'item': {
                const it = R().get('item', e.item);
                await say('Du benutzt ' + it.name + '.', 700);
                break;
              }
              case 'phase':
                if (e.scene) await ui.dialog.play(e.scene);
                drawSide(1);
                drawWeather();
                break;
              case 'captureTry': await captureAnim(e); break;
              case 'end': break;
            }
          }
          drawInfos(); drawWeather();
        }

        async function captureAnim(e) {
          const box = monBox(1);
          const b = box.getBoundingClientRect(), r = scr.getBoundingClientRect();
          const ball = document.createElement('div');
          ball.className = 'ball';
          ball.style.left = (b.left - r.left + b.width / 2 - 23) + 'px';
          ball.style.top = (b.top - r.top + b.height * 0.6) + 'px';
          await say('Du wirfst eine ' + R().get('item', e.ball).name + '!', 500);
          scr.appendChild(ball);
          box.style.transform = 'scale(.1)';
          box.style.opacity = '0';
          await W(500);
          for (let i = 0; i < e.shakes; i++) {
            ball.classList.remove('wobble'); void ball.offsetWidth; ball.classList.add('wobble');
            ui.sound('shake');
            rate(ball);
            await W(700);
          }
          if (e.success) {
            banner('GEFANGEN!');
            ui.sound('catch');
            await say('Juhu! ' + ui.spName(L.battle.active(battle, 1)) + ' wurde gefangen!', 1400);
          } else {
            ui.sound('escape');
            ball.remove();
            box.style.transform = '';
            box.style.opacity = '';
            fx('appear', 1, 450);
            await say(['Oh nein! Es hat sich befreit!', 'Fast! Es ist wieder frei!', 'So knapp!'][Math.max(0, e.shakes - 1)] || 'Es ist ausgebrochen!', 900);
          }
        }

        // ---------- Menüs ----------
        function moveMenu(slot) {
          const me = monAt(0, slot), foe = L.battle.active(battle, 1);
          // Im Doppelkampf zählt für die Hinweise jedes Gegner-Monster im Feld
          const foes = battle.doubles ? L.battle.actives(battle, 1) : [foe];
          const effVs = (m) => Math.max(...foes.map((f) => L.types.effectiveness(m.type, L.mon.types(f))));
          const legal = battle.doubles ? L.battle.legal(battle, 0, slot, chosen) : L.battle.legal(battle, 0);
          const bondReady = legal.some((a) => a.type === 'bond') && !chosen.some((c) => c.type === 'bond');
          const canSwitch = legal.some((a) => a.type === 'switch');
          const hasItems = legal.some((a) => a.type === 'item' || a.type === 'capture');
          const artPath = L.paths.of(battle.sides[0].path);
          const canArt = legal.some((a) => a.type === 'art') && !chosen.some((c) => c.type === 'art');
          menu.innerHTML = me.moves.map((ref, i) => {
            const m = L.moves.resolve(ref);
            const col = L.palette.typeColor(m.type);
            const eff = m.power > 0 ? effVs(m) : 1;
            const effTxt = !ui.setting('effHints') ? '' : m.power > 0 && eff >= 2 ? '⬆ sehr effektiv' : m.power > 0 && eff < 1 ? '⬇ schwach' : '';
            return '<button class="move-btn" data-move="' + i + '" style="--c:' + col + ';background:linear-gradient(160deg,' + L.palette.shade(col, -0.45) + ',' + col + ' 55%,' + L.palette.shade(col, 0.15) + ')" title="' + ui.esc(m.desc || '') + '">' +
              '<span class="ticon">' + (m.type ? R().get('type', m.type).icon : '✦') + '</span><span class="eff">' + effTxt + '</span>' + (i + 1) + '. ' + ui.esc(m.name) + (ref.upgrade ? ' ★' : '') + '<small>' + (m.type ? R().get('type', m.type).name : 'Normal') + ' · ' + (m.power ? 'Stärke ' + m.power : 'Status') + (m.accuracy ? ' · ' + m.accuracy + ' %' : '') + '</small></button>';
          }).join('') + (me.moves.length < 4 ? '<div></div>'.repeat(4 - me.moves.length) : '') +
            '<div class="menu-row"><button class="btn' + (bondReady ? ' bond-ready' : ' secondary') + '" data-a="bond"' + (bondReady ? '' : ' disabled') + ' title="Bindung 100 nötig, einmal pro Kampf">♥ Bindung</button>' +
            '<button class="btn secondary" data-a="team"' + (canSwitch ? '' : ' disabled') + '>🔄 Wechseln</button>' +
            '<button class="btn secondary" data-a="bag"' + (hasItems ? '' : ' disabled') + '>🎒 Tasche</button>' +
            (artPath ? '<button class="btn' + (canArt ? ' art-ready' : ' secondary') + '" data-a="art"' + (canArt ? '' : ' disabled') + ' title="' + ui.esc(artPath.artName + ': ' + artPath.artDesc + ' (einmal pro Kampf, Taste K)') + '">' + artPath.icon + ' ' + ui.esc(artPath.artName) + '</button>' : '') +
            (battle.doubles && chosen.length ? '<button class="btn secondary" data-a="back">↩ Zurück</button>' : '') + '</div>';
          if (battle.doubles && chosen.length) menu.querySelector('[data-a="back"]').onclick = () => { chosen.pop(); next(); };
          menu.querySelectorAll('[data-move]').forEach((b) => { b.onclick = () => act({ type: 'move', index: Number(b.dataset.move) }); });
          menu.querySelector('[data-a="bond"]').onclick = () => act({ type: 'bond' });
          const artBtn = menu.querySelector('[data-a="art"]');
          if (artBtn) artBtn.onclick = () => act({ type: 'art' });
          menu.querySelector('[data-a="team"]').onclick = async () => {
            // Im Doppelkampf: nicht den Partner im Feld und niemanden, der in dieser Runde schon eingewechselt wird
            const ok = (i) => legal.some((a) => a.type === 'switch' && a.index === i) && !chosen.some((c) => c.type === 'switch' && c.index === i);
            const idx = await ui.choose('Wen schickst du in den Kampf?', '', battle.sides[0].team.map((m, i) => ui.monOption(m, i, { disabled: !ok(i) })), 'Zurück');
            if (idx !== null) act({ type: 'switch', index: idx });
          };
          menu.querySelector('[data-a="bag"]').onclick = async () => {
            // Im Doppelkampf zählt, was der andere Platz in dieser Runde schon eingeplant hat
            const left = (id) => (battle.sides[0].items[id] || 0) - chosen.filter((c) => (c.type === 'item' ? c.item : c.ball) === id).length;
            const opts = [];
            for (const a of legal) {
              if (a.type === 'capture') {
                const it = R().get('item', a.ball);
                const p = L.capture.chance({ target: foe, ball: a.ball, battle, now: g.now() });
                opts.push({ label: it.icon + ' ' + it.name + ' ×' + left(a.ball), sub: ui.setting('catchChance') ? 'Fangchance etwa ' + Math.round(p * 100) + ' %' : '', value: a });
              }
            }
            const seen = {};
            for (const a of legal) {
              if (a.type !== 'item' || seen[a.item]) continue;
              seen[a.item] = true;
              const it = R().get('item', a.item);
              opts.push({ label: it.icon + ' ' + it.name + ' ×' + left(a.item), sub: it.desc, value: { type: 'pickItem', item: a.item } });
            }
            const v = await ui.choose('Tasche', '', opts, 'Zurück');
            if (!v) return;
            if (v.type === 'capture') return act(v);
            const targets = L.battle.itemTargets(battle, 0, v.item);
            const t = await ui.choose('Für wen?', '', battle.sides[0].team.map((m, i) => ui.monOption(m, i, { disabled: targets.indexOf(i) < 0 })), 'Zurück');
            if (t !== null) act({ type: 'item', item: v.item, target: t });
          };
        }
        // Miras Tipps passend zur Lage (jeder nur einmal)
        function tutorialTips() {
          const me = L.battle.actives(battle, 0)[0] || L.battle.active(battle, 0);
          ui.tutorial.show('battle');
          if (battle.doubles) ui.tutorial.show('double');
          ui.tutorial.show(battle.kind === 'wild' ? 'battleWild' : 'battleTrainer');
          if (setup.kind === 'boss' || (run.pending && run.pending.kind === 'boss')) ui.tutorial.show('boss');
          if (setup.legend) ui.tutorial.show('legend');
          if (L.battle.legal(battle, 0).some((a) => a.type === 'bond')) ui.tutorial.show('bondReady');
          if (me.hp > 0 && me.hp / L.mon.maxHp(me) < 0.35) ui.tutorial.show('lowHp');
        }
        function keyHandler(e) {
          if (ui.root().querySelector('.modal, .dialog, .tut-layer')) return;
          const k = (e.key || '').toLowerCase();
          if (k === 'enter' || k === ' ') { skip = true; e.preventDefault(); return; }
          if (k === 'p') return showLog();
          if (k === 'm') return toggleSound();
          if (k === 't') return ui.typeChart();
          const btn = { b: 'bag', w: 'team', h: 'bond', k: 'art' }[k];
          if (btn) { const el = menu.querySelector('[data-a="' + btn + '"]'); if (el && !el.disabled) el.click(); return; }
          const n = Number(e.key);
          if (n >= 1 && n <= 4) { const b = menu.querySelector('[data-move="' + (n - 1) + '"]'); if (b && !b.disabled) b.click(); }
        }
        document.addEventListener('keydown', keyHandler);

        let busy = false;
        // Doppelkampf: gesammelte Aktionen der eigenen Plätze für diese Runde
        let chosen = [];
        const slotsToAct = () => L.battle.liveSlots(battle, 0);
        const curSlot = () => slotsToAct()[chosen.length];
        // Braucht die Aktion ein Ziel? Nur bei Angriffen und wenn zwei Gegner im Feld stehen.
        function needsTarget(action, slot) {
          if (L.battle.liveSlots(battle, 1).length < 2) return false;
          if (action.type === 'bond') return true;
          if (action.type !== 'move') return false;
          const m = L.moves.resolve(monAt(0, slot).moves[action.index]);
          return !(m.power === 0 && (m.effects || []).every((e) => e.target === 'self' || ['heal', 'weather', 'critUp', 'cleanse'].indexOf(e.kind) >= 0));
        }
        function pickTarget(slot) {
          const opts = L.battle.liveSlots(battle, 1).map((k) => {
            const m = monAt(1, k);
            return { label: '<b>' + ui.esc(ui.spName(m)) + '</b> Lv ' + m.level + ' ' + ui.typeChips(m), sub: 'KP ' + Math.round(m.hp / L.mon.maxHp(m) * 100) + ' %' + (k === 0 ? ' · links' : ' · rechts'), art: ui.monArt(m), value: k };
          });
          return ui.choose('Wen soll ' + ui.spName(monAt(0, slot)) + ' angreifen?', '', opts, 'Zurück');
        }
        async function actDouble(action) {
          if (busy) return;
          const slot = curSlot();
          const legal = L.battle.legal(battle, 0, slot, chosen);
          if (!legal.some((a) => a.type === action.type && a.index === action.index && a.item === action.item && a.target === action.target && a.ball === action.ball)) return;
          if (needsTarget(action, slot)) {
            busy = true;
            const t = await pickTarget(slot);
            busy = false;
            if (t === null) return;
            action.foe = t;
          }
          chosen.push(Object.assign({ slot }, action));
          if (chosen.length < slotsToAct().length) return next();
          const list = chosen;
          chosen = [];
          busy = true;
          menu.innerHTML = '';
          scr.querySelectorAll('.mon.acting').forEach((b) => b.classList.remove('acting'));
          let events = null;
          try {
            events = L.battle.step(battle, list);
          } catch (err) {
            // Ungültige Kombination (sollte nicht vorkommen): Auswahl neu beginnen statt hängen zu bleiben
            console.warn(err);
            busy = false;
            return next();
          }
          try {
            await play(events);
          } finally {
            busy = false;
          }
          await next();
        }
        async function act(action) {
          if (battle.doubles) return actDouble(action);
          if (busy) return;
          busy = true;
          menu.innerHTML = '';
          try {
            const ok = L.battle.legal(battle, 0).some((a) => JSON.stringify(a) === JSON.stringify(action));
            if (ok) await play(L.battle.step(battle, action));
          } finally {
            busy = false;
          }
          await next();
        }

        async function next() {
          if (battle.state === 'choose' && battle.doubles) {
            const slot = curSlot();
            scr.querySelectorAll('.mon.acting').forEach((b) => b.classList.remove('acting'));
            monBox(0, slot).classList.add('acting');
            msg.textContent = 'Was soll ' + ui.spName(monAt(0, slot)) + ' tun?' + (slotsToAct().length > 1 ? ' (' + (chosen.length + 1) + '/' + slotsToAct().length + ')' : '');
            moveMenu(slot);
            tutorialTips();
            return;
          }
          if (battle.state === 'choose') {
            msg.textContent = 'Was soll ' + ui.spName(L.battle.active(battle, 0)) + ' tun?';
            moveMenu();
            tutorialTips();
            return;
          }
          if (battle.state === 'forceSwitch') {
            const can = L.battle.legal(battle, 0).map((a) => a.index);
            const idx = await ui.choose('Wer kämpft weiter?', '', battle.sides[0].team.map((m, i) => ui.monOption(m, i, { disabled: can.indexOf(i) < 0 })), null);
            await play(L.battle.forceSwitch(battle, idx));
            return next();
          }
          return finish();
        }

        async function finish() {
          document.removeEventListener('keydown', keyHandler);
          const result = battle.result;
          ui.sound(result === 'lost' ? 'defeat' : 'victory');
          const t = setup.trainer ? R().get('trainer', setup.trainer) : null;
          const t2 = setup.partner ? R().get('trainer', setup.partner) : null;
          for (const x of [t, t2]) {
            if (x && result === 'won') await say(x.name + ': „' + x.lines.win + '“', 1600);
            if (x && result === 'lost') await say(x.name + ': „' + x.lines.lose + '“', 1600);
          }
          const before = run.team.map((m) => ({ uid: m.uid, level: m.level, name: ui.spName(m) }));
          const summary = L.run.resolveBattle(run, battle, g.meta);
          g.persist();
          if (result !== 'lost') {
            if (before.some((b) => { const m = run.team.find((x) => x.uid === b.uid); return m && m.level > b.level; })) setTimeout(() => ui.sound('levelup'), 400);
            const lines = [];
            for (const b of before) {
              const m = run.team.find((x) => x.uid === b.uid);
              if (!m) continue;
              const exp = summary.exp[b.uid] || 0;
              lines.push('<div class="row" style="margin:4px 0"><div style="width:48px;height:48px">' + ui.monArt(m) + '</div><div style="flex:1"><b>' + ui.esc(b.name) + '</b> +' + exp + ' EP' +
                (m.level > b.level ? ' <span style="color:var(--good);font-weight:900">Level ' + m.level + '!</span>' : '') + ui.expBar(m) + '</div></div>');
            }
            await ui.alert(result === 'captured' ? 'Gefangen!' : 'Sieg!', lines.join('') +
              '<p><span class="gold">+' + summary.gold + ' Gold</span> · 💎 +' + summary.crystals + (summary.firstCatch ? ' · <b>Neu im Lexikon!</b>' : '') + '</p>');
          }
          resolve(summary);
        }

        // ---------- Start ----------
        drawSide(0, 'enter-l');
        drawSide(1, 'enter-r');
        drawWeather();
        (async () => {
          const foe = L.battle.active(battle, 1);
          if (setup.double) {
            const t1 = R().get('trainer', setup.trainer), t2 = R().get('trainer', setup.partner);
            banner('DOPPELKAMPF!');
            await say(t1.name + ': „' + t1.lines.start + '“', 1600);
            await say(t2.name + ': „' + t2.lines.start + '“', 1600);
            await say(setup.trainerName + ' fordern dich zum Doppelkampf heraus! ' + L.battle.actives(battle, 1).map((m) => ui.spName(m)).join(' und ') + ' kommen gleichzeitig!', 1300);
          } else if (setup.trainer) {
            const t = R().get('trainer', setup.trainer);
            await say(t.name + ': „' + t.lines.start + '“', 1600);
            await say(t.name + ' schickt ' + ui.spName(foe) + ' in den Kampf!', 900);
          } else if (setup.trainerName) {
            await say(setup.trainerName + ' fordert dich heraus!', 1000);
          } else {
            if (foe.shiny) { banner('✨ SCHIMMER! ✨'); await say('Was? ' + ui.spName(foe) + ' schimmert ganz besonders!', 1500); }
            else await say('Ein wildes Monster erscheint: ' + ui.spName(foe) + '!', 900);
          }
          if (setup.ghost) { banner('ECHO-KAMPF'); await say('👻 Ein Echo deines früheren Ichs stellt sich dir! Sein Team kennst du nur zu gut …', 1600); }
          if (setup.arenaRound !== undefined) { banner('ARENA · RUNDE ' + (setup.arenaRound + 1) + ' / ' + L.config.arenaRounds); await say('🏟️ Arena, Runde ' + (setup.arenaRound + 1) + ' von ' + L.config.arenaRounds + '! Keine Heilung zwischen den Runden.', 1400); }
          await play(L.battle.start(battle));
          await next();
        })();
      });
    },
  };
})(globalThis.LUM);
