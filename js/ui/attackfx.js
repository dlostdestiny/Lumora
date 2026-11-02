// Angriffs-Animationen je Typ: aufladen → fliegen → einschlagen. Mit Tiefe (Geschosse werden kleiner,
// wenn sie nach hinten zum Gegner fliegen), Kamera-Zoom, Treffer-Stopp und Zeitlupe.
// Stufe 0–3 aus der Einstellung „Effekt-Stufe“ (niedrig, mittel, hoch, ultra).
(function (L) {
  const ui = L.ui;
  const LEVELS = { niedrig: 0, mittel: 1, hoch: 2, ultra: 3 };
  const COLOR = { glut: '#ff7a3d', flut: '#3fa7ff', spross: '#5fcf5a', funke: '#ffd23f', stein: '#c9a27a', schatten: '#a070ff', stern: '#fff6b0', frost: '#bae6fd', wind: '#86efac', metall: '#cbd5e1', normal: '#ffffff' };

  ui.fxLevel = () => (ui.setting('motion') === 'reduziert' ? 0 : (LEVELS[ui.setting('fxLevel')] !== undefined ? LEVELS[ui.setting('fxLevel')] : 2));
  // Anzahl schwebender Partikel je Stufe (Schrein, Karte, Kampf, Menüs)
  ui.fxCount = (n) => Math.round(n * [0.3, 0.6, 1, 1.6][ui.fxLevel()]);

  const rnd = (a, b) => a + Math.random() * (b - a);
  function pos(el, root, fy) {
    const a = el.getBoundingClientRect(), r = root.getBoundingClientRect();
    return { x: a.left - r.left + a.width / 2, y: a.top - r.top + a.height * (fy || 0.55), w: a.width, h: a.height };
  }
  function make(root, cls, style, html) {
    const d = document.createElement('div');
    d.className = 'afx ' + cls;
    if (style) d.setAttribute('style', style);
    if (html) d.innerHTML = html;
    root.appendChild(d);
    return d;
  }
  // Animation mit Tempo-Faktor; entfernt das Element danach.
  function run(el, frames, ms, speed, opts) {
    // fill 'both': auch während einer Verzögerung schon am Startpunkt stehen (nicht in der Ecke oben links)
    const a = el.animate(frames, Object.assign({ duration: ms, easing: 'ease-out', fill: 'both' }, opts || {}));
    a.playbackRate = speed;
    // Sicherung: Läuft das Fenster im Hintergrund, hält der Browser Animationen an. Dann nicht ewig warten.
    const limit = ((opts && opts.delay) || 0) / speed + ms / speed + 250;
    const timeout = new Promise((res) => setTimeout(res, limit));
    return Promise.race([a.finished.catch(() => {}), timeout]).then(() => { if (!(opts && opts.keep)) el.remove(); });
  }
  const wait = (ms, speed) => new Promise((r) => setTimeout(r, ms / speed));

  // Bildschirm kurz einfärben
  function flash(root, color, ms, speed, opacity) {
    const f = make(root, 'afx-flash', 'background:' + color);
    return run(f, [{ opacity: opacity || 0.55 }, { opacity: 0 }], ms, speed);
  }
  // Kamera zum Ziel zoomen
  function camera(root, p, speed, strength) {
    const field = root.querySelector('.field');
    if (!field) return Promise.resolve();
    field.style.transformOrigin = p.x + 'px ' + p.y + 'px';
    const a = field.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + (1 + strength) + ')', offset: 0.25 }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-out' });
    a.playbackRate = speed;
    return Promise.race([a.finished.catch(() => {}), new Promise((res) => setTimeout(res, 650 / speed + 250))]);
  }
  function shake(root, speed, amount) {
    if (!ui.setting('shake')) return;
    const frames = [];
    for (let i = 0; i < 8; i++) frames.push({ transform: 'translate(' + rnd(-amount, amount).toFixed(1) + 'px,' + rnd(-amount, amount).toFixed(1) + 'px)' });
    frames.push({ transform: 'none' });
    const a = root.animate(frames, { duration: 420 });
    a.playbackRate = speed;
  }
  // Partikel-Explosion
  function burst(root, p, type, count, depth, speed, spread) {
    const box = make(root, 'afx-burst p-' + type, 'left:' + p.x + 'px;top:' + p.y + 'px');
    let h = '';
    for (let i = 0; i < count; i++) h += '<span></span>';
    box.innerHTML = h;
    const parts = [...box.children];
    parts.forEach((s) => {
      const a = rnd(0, Math.PI * 2), dist = rnd(40, spread || 160) * depth;
      const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist - rnd(10, 50) * depth;
      const sc = rnd(0.6, 1.5) * depth;
      const an = s.animate([{ transform: 'translate(0,0) scale(' + sc + ') rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) scale(' + (sc * 0.2).toFixed(2) + ') rotate(' + rnd(-360, 360).toFixed(0) + 'deg)', opacity: 0 }],
      { duration: rnd(600, 1000), easing: 'cubic-bezier(.15,.8,.3,1)', fill: 'forwards' });
      an.playbackRate = speed;
    });
    setTimeout(() => box.remove(), 1200 / speed);
  }
  // Druckwellen-Ringe und Lichtblitz am Einschlagsort
  function shock(root, p, color, depth, speed, rings) {
    const glow = make(root, 'afx-glow', 'left:' + p.x + 'px;top:' + p.y + 'px;--c:' + color);
    run(glow, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(' + (1.8 * depth) + ')', opacity: 0 }], 500, speed);
    for (let i = 0; i < rings; i++) {
      const ring = make(root, 'afx-ring', 'left:' + p.x + 'px;top:' + p.y + 'px;border-color:' + color);
      run(ring, [{ transform: 'translate(-50%,-50%) scale(.1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(' + ((2.2 + i * 0.8) * depth) + ')', opacity: 0 }], 600 + i * 150, speed, { delay: i * 90 });
    }
  }

  // ---------- Geschosse je Typ ----------
  async function projectile(root, from, to, type, speed, lvl) {
    const dur = 420;
    const depthFrom = from.depth, depthTo = to.depth;
    const arc = -60 - Math.abs(to.x - from.x) * 0.15;
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + arc };
    const path = (el, extra) => run(el, [
      { transform: 'translate(' + from.x + 'px,' + from.y + 'px) translate(-50%,-50%) scale(' + depthFrom + ')' + (extra ? extra[0] : '') },
      { transform: 'translate(' + mid.x + 'px,' + mid.y + 'px) translate(-50%,-50%) scale(' + ((depthFrom + depthTo) / 2 * 1.15) + ')' + (extra ? extra[1] : '') },
      { transform: 'translate(' + to.x + 'px,' + to.y + 'px) translate(-50%,-50%) scale(' + depthTo + ')' + (extra ? extra[2] : '') },
    ], dur, speed, { easing: 'ease-in' });

    if (type === 'funke') {
      // Blitz vom Himmel
      let pts = to.x + ',-20';
      let y = -20;
      while (y < to.y - 20) { y += rnd(30, 60); pts += ' ' + (to.x + rnd(-40, 40)).toFixed(0) + ',' + Math.min(y, to.y).toFixed(0); }
      pts += ' ' + to.x + ',' + to.y;
      const bolt = make(root, 'afx-bolt', '', '<svg width="100%" height="100%"><polyline points="' + pts + '" class="b1"/><polyline points="' + pts + '" class="b2"/></svg>');
      if (lvl >= 2) flash(root, '#fffbe0', 160, speed, 0.7);
      await run(bolt, [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.3, offset: 0.3 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], 380, speed);
      return;
    }
    if (type === 'stein') {
      // Felsbrocken stürzen von oben
      const n = lvl >= 3 ? 7 : lvl >= 2 ? 5 : 3;
      const drops = [];
      for (let i = 0; i < n; i++) {
        const r = make(root, 'afx-rock', 'width:' + rnd(42, 74).toFixed(0) + 'px;height:' + rnd(36, 62).toFixed(0) + 'px');
        const x = to.x + rnd(-to.w * 0.35, to.w * 0.35);
        drops.push(run(r, [{ transform: 'translate(' + x + 'px,-80px) rotate(0deg) scale(' + depthTo + ')' }, { transform: 'translate(' + x + 'px,' + (to.y + rnd(-20, 20)) + 'px) rotate(' + rnd(-200, 200).toFixed(0) + 'deg) scale(' + depthTo + ')' }],
          rnd(300, 420), speed, { delay: i * 60, easing: 'cubic-bezier(.5,0,1,1)' }));
      }
      await Promise.all(drops);
      return;
    }
    if (type === 'spross') {
      // Blätterwirbel
      const leaves = [];
      const n = lvl >= 3 ? 12 : lvl >= 2 ? 8 : 5;
      for (let i = 0; i < n; i++) {
        const l = make(root, 'afx-leaf');
        const o = (i / n) * 360;
        leaves.push(path(l, [' rotate(' + o + 'deg) translateX(18px)', ' rotate(' + (o + 360) + 'deg) translateX(30px)', ' rotate(' + (o + 720) + 'deg) translateX(8px)']));
        await wait(25, speed);
      }
      await Promise.all(leaves);
      return;
    }
    if (type === 'schatten') {
      const dark = make(root, 'afx-dark');
      run(dark, [{ opacity: 0 }, { opacity: lvl >= 2 ? 0.55 : 0.3, offset: 0.4 }, { opacity: 0 }], 900, speed);
    }
    if (type === 'normal' || type === 'stern' || type === 'wind') {
      // Tempostreifen
      const len = Math.hypot(to.x - from.x, to.y - from.y);
      const ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
      const s = make(root, 'afx-streak', 'left:' + from.x + 'px;top:' + from.y + 'px;width:' + len + 'px;transform:rotate(' + ang + 'deg)');
      await run(s, [{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.6 }, { clipPath: 'inset(0 0 0 100%)', opacity: 0 }], 360, speed);
      return;
    }
    // Feuerball, Wasserkugel, Schattenkugel, mit Spur
    const orb = make(root, 'afx-orb o-' + type);
    const trail = [];
    if (lvl >= 2) {
      for (let i = 1; i <= (lvl >= 3 ? 8 : 5); i++) {
        const t = make(root, 'afx-orb o-' + type + ' trail', 'opacity:' + (0.6 - i * 0.06).toFixed(2));
        trail.push(new Promise((res) => setTimeout(() => path(t).then(res), (i * 35) / speed)));
      }
    }
    await path(orb);
    await Promise.race([Promise.all(trail), wait(150, speed)]);
  }

  // ---------- Öffentliche Funktionen ----------
  ui.attackFx = {
    level: ui.fxLevel,
    // Angriff von einem Monster-Kasten auf einen anderen
    async attack(o) {
      const lvl = ui.fxLevel();
      if (lvl === 0) return;
      const root = o.root, speed = o.speed || 1;
      const type = o.type || 'normal';
      const color = COLOR[type] || '#fff';
      const slow = lvl >= 3 && (o.crit || o.power >= 80 || o.bond) ? 0.55 : lvl >= 2 && (o.crit || o.bond) ? 0.75 : 1;
      const sp = speed * slow;
      const from = Object.assign(pos(o.from, root), { depth: o.fromSide === 1 ? 0.8 : 1.15 });
      const to = Object.assign(pos(o.to, root), { depth: o.fromSide === 1 ? 1.15 : 0.8 });
      // Aufladen
      const charge = make(root, 'afx-charge', 'left:' + from.x + 'px;top:' + from.y + 'px;--c:' + color);
      run(charge, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(' + (1.3 * from.depth) + ')', opacity: 0.9, offset: 0.7 }, { transform: 'translate(-50%,-50%) scale(' + (1.6 * from.depth) + ')', opacity: 0 }], 300, sp);
      if (lvl >= 2) o.from.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.8) drop-shadow(0 0 20px ' + color + ')' }, { filter: 'brightness(1)' }], { duration: 300 / sp });
      await wait(220, sp);
      // Daneben: Geschoss fliegt am Ziel vorbei, kein Einschlag
      if (o.miss) {
        to.x += (o.fromSide === 0 ? 1 : -1) * 150;
        to.y -= 50;
        await projectile(root, from, to, type, sp, lvl);
        return;
      }
      await projectile(root, from, to, type, sp, lvl);
      // Einschlag
      if (lvl >= 2) await wait(70, speed); // Treffer-Stopp
      shock(root, to, color, to.depth, sp, lvl >= 3 ? 3 : lvl >= 2 ? 2 : 1);
      burst(root, to, type, [0, 14, 26, 46][lvl] * (o.bond ? 1.5 : 1), to.depth, sp, o.bond ? 260 : 170);
      if (lvl >= 2) {
        flash(root, color, 180, sp, type === 'schatten' ? 0.35 : 0.3);
        camera(root, to, sp, lvl >= 3 ? 0.09 : 0.05);
        shake(root, sp, lvl >= 3 ? 14 : 8);
      }
      if (lvl >= 3) {
        const cab = root.animate([{ filter: 'none' }, { filter: 'saturate(1.6) contrast(1.15) hue-rotate(-12deg)' }, { filter: 'none' }], { duration: 350 / sp });
        void cab;
        burst(root, to, 'normal', 14, to.depth, sp, 220);
      }
    },
    // Stärkung (eigene Werte), Schwächung (beim Gegner) oder Heilung
    async aura(o) {
      const lvl = ui.fxLevel();
      if (lvl === 0) return;
      const root = o.root, sp = o.speed || 1;
      const p = Object.assign(pos(o.el, root, 0.5), { depth: o.side === 1 ? 0.8 : 1.1 });
      const color = o.kind === 'heal' ? '#7ee08a' : o.kind === 'debuff' ? '#b070ff' : (COLOR[o.type] || '#ffd23f');
      const pillar = make(root, 'afx-pillar', 'left:' + p.x + 'px;top:' + (p.y + p.h * 0.4) + 'px;width:' + (p.w * 0.7 * p.depth) + 'px;height:' + (p.h * 1.3) + 'px;--c:' + color);
      run(pillar, [{ transform: 'translate(-50%,-100%) scaleY(0)', opacity: 0.9 }, { transform: 'translate(-50%,-100%) scaleY(1)', opacity: 0.8, offset: 0.4 }, { transform: 'translate(-50%,-100%) scaleY(1.1)', opacity: 0 }], 900, sp);
      const n = [0, 5, 9, 16][lvl];
      const sym = o.kind === 'heal' ? '✚' : o.kind === 'debuff' ? '▼' : '▲';
      for (let i = 0; i < n; i++) {
        const a = make(root, 'afx-arrow', 'left:' + (p.x + rnd(-p.w * 0.35, p.w * 0.35)).toFixed(0) + 'px;top:' + (p.y + rnd(-10, 40)).toFixed(0) + 'px;color:' + color, sym);
        const dy = o.kind === 'debuff' ? 70 : -90;
        run(a, [{ transform: 'translate(-50%,0) scale(' + p.depth + ')', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,' + dy + 'px) scale(' + p.depth + ')', opacity: 0 }], rnd(700, 1000), sp, { delay: i * 50 });
      }
      if (o.kind === 'debuff') {
        const spiral = make(root, 'afx-spiral', 'left:' + p.x + 'px;top:' + p.y + 'px');
        run(spiral, [{ transform: 'translate(-50%,-50%) rotate(0) scale(1.4)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) rotate(540deg) scale(.2)', opacity: 0 }], 800, sp);
      }
      if (lvl >= 2) shock(root, p, color, p.depth, sp, 1);
      await wait(650, sp);
    },
    // Wetter-Attacke: der Himmel leuchtet in der Wetterfarbe
    async sky(o) {
      const lvl = ui.fxLevel();
      if (lvl === 0) return;
      const c = { glutregen: '#ff7a3d', stroemung: '#3fa7ff', sturm: '#ffd23f', nebel: '#c9d6e3' }[o.weather] || '#fff';
      const s = make(o.root, 'afx-sky', '--c:' + c);
      await run(s, [{ opacity: 0 }, { opacity: lvl >= 2 ? 0.7 : 0.4, offset: 0.4 }, { opacity: 0 }], 900, o.speed || 1);
    },
  };
})(globalThis.LUM);
