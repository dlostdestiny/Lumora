// Sound und Musik, komplett im Browser erzeugt (Web Audio, keine Dateien).
// ui.sound(name) spielt einen Effekt, ui.music(track) wechselt die Musik. Lautstärke über die Einstellungen.
(function (L) {
  const ui = L.ui;
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let current = null, musicTimer = null, step = 0;

  function vol(id) { return ui.setting('mute') ? 0 : (Number(ui.setting(id)) || 0) / 100; }

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    applyVolume();
    return ctx;
  }
  function applyVolume() {
    if (!ctx) return;
    musicBus.gain.value = vol('musicVolume') * 0.35;
    sfxBus.gain.value = vol('sfxVolume') * 0.6;
  }

  // Ein Ton mit Hüllkurve
  function tone(bus, freq, start, dur, opts) {
    opts = opts || {};
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, start);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), start + dur);
    const peak = opts.gain || 0.3;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + (opts.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(bus);
    o.start(start); o.stop(start + dur + 0.05);
  }
  // Rauschen (für Treffer, Wind, Feuer)
  function noise(bus, start, dur, opts) {
    opts = opts || {};
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = opts.filter || 'lowpass'; f.frequency.value = opts.freq || 1200;
    const g = ctx.createGain(); g.gain.value = opts.gain || 0.3;
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(start);
  }
  const note = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // ---------- Effekte ----------
  const TYPE_FREQ = { glut: 180, flut: 320, spross: 260, funke: 900, stein: 110, schatten: 140, frost: 1200, wind: 600, metall: 700, stern: 1500 };
  const SFX = {
    click: (t) => tone(sfxBus, 880, t, 0.06, { type: 'triangle', gain: 0.15 }),
    hit: (t, o) => { noise(sfxBus, t, 0.18, { freq: (o && TYPE_FREQ[o.type]) || 900, gain: 0.45 }); tone(sfxBus, 160, t, 0.15, { type: 'square', slide: 60, gain: 0.12 }); },
    crit: (t) => { noise(sfxBus, t, 0.3, { freq: 2500, filter: 'highpass', gain: 0.35 }); tone(sfxBus, 1200, t, 0.25, { type: 'sawtooth', slide: 300, gain: 0.15 }); },
    superEff: (t) => [0, 4, 7].forEach((s, i) => tone(sfxBus, note(76 + s), t + i * 0.05, 0.12, { type: 'square', gain: 0.1 })),
    weak: (t) => tone(sfxBus, 300, t, 0.25, { type: 'triangle', slide: 150, gain: 0.15 }),
    miss: (t) => tone(sfxBus, 500, t, 0.2, { type: 'sine', slide: 900, gain: 0.12 }),
    faint: (t) => tone(sfxBus, 400, t, 0.7, { type: 'triangle', slide: 60, gain: 0.25 }),
    heal: (t) => [0, 4, 7, 12].forEach((s, i) => tone(sfxBus, note(72 + s), t + i * 0.07, 0.3, { gain: 0.12 })),
    status: (t) => tone(sfxBus, 220, t, 0.3, { type: 'square', slide: 330, gain: 0.08 }),
    shake: (t) => { tone(sfxBus, 200, t, 0.08, { type: 'square', gain: 0.12 }); noise(sfxBus, t, 0.08, { freq: 600, gain: 0.15 }); },
    catch: (t) => [0, 4, 7, 12, 16].forEach((s, i) => tone(sfxBus, note(72 + s), t + i * 0.09, 0.35, { type: 'triangle', gain: 0.15 })),
    escape: (t) => tone(sfxBus, 600, t, 0.3, { type: 'sawtooth', slide: 200, gain: 0.1 }),
    levelup: (t) => [0, 2, 4, 7, 12].forEach((s, i) => tone(sfxBus, note(67 + s), t + i * 0.08, 0.25, { type: 'square', gain: 0.09 })),
    evolve: (t) => { for (let i = 0; i < 12; i++) tone(sfxBus, note(60 + i * 2), t + i * 0.12, 0.3, { type: 'triangle', gain: 0.1 }); },
    achievement: (t) => [0, 7, 12, 16, 19].forEach((s, i) => tone(sfxBus, note(72 + s), t + i * 0.08, 0.5, { type: 'sine', gain: 0.14 })),
    coin: (t) => { tone(sfxBus, note(83), t, 0.08, { type: 'square', gain: 0.08 }); tone(sfxBus, note(88), t + 0.08, 0.2, { type: 'square', gain: 0.08 }); },
    bond: (t) => [0, 3, 7, 10, 14].forEach((s, i) => tone(sfxBus, note(64 + s), t + i * 0.06, 0.6, { type: 'sawtooth', gain: 0.07 })),
    victory: (t) => [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(sfxBus, note(67 + s), t + i * 0.13, 0.35, { type: 'square', gain: 0.1 })),
    defeat: (t) => [12, 7, 3, 0].forEach((s, i) => tone(sfxBus, note(60 + s), t + i * 0.25, 0.5, { type: 'triangle', gain: 0.14 })),
  };
  ui.sound = (name, opts) => {
    try {
      if (!init() || !vol('sfxVolume') || !SFX[name]) return;
      SFX[name](ctx.currentTime + 0.01, opts);
    } catch (e) { /* Ton ist nie wichtig genug für einen Fehler */ }
  };

  // ---------- Musik: kleine Melodie-Schleifen je Ort ----------
  // scale = Tonleiter (Halbtöne), root = Grundton (MIDI), bpm, mood steuert Klangfarbe und Bass.
  const TRACKS = {
    hub: { root: 62, scale: [0, 2, 4, 7, 9], bpm: 72, lead: 'sine', bass: 'triangle', chords: [0, 5, 3, 4], pad: true },
    wald: { root: 64, scale: [0, 2, 4, 7, 9], bpm: 92, lead: 'triangle', bass: 'triangle', chords: [0, 3, 4, 3] },
    vulkan: { root: 57, scale: [0, 3, 5, 7, 10], bpm: 100, lead: 'sawtooth', bass: 'square', chords: [0, 5, 6, 4] },
    gipfel: { root: 66, scale: [0, 2, 5, 7, 9], bpm: 96, lead: 'triangle', bass: 'sine', chords: [0, 4, 5, 3] },
    battle: { root: 60, scale: [0, 3, 5, 7, 10], bpm: 138, lead: 'square', bass: 'sawtooth', chords: [0, 0, 5, 6], drums: true },
    boss: { root: 55, scale: [0, 1, 3, 6, 7, 10], bpm: 150, lead: 'sawtooth', bass: 'square', chords: [0, 1, 0, 6], drums: true },
    finale: { root: 58, scale: [0, 2, 3, 7, 8], bpm: 160, lead: 'sawtooth', bass: 'square', chords: [0, 3, 5, 4], drums: true },
  };
  const CHORD_STEPS = [0, 5, 7, 3, 8, 9, 10];

  function tick() {
    const tr = TRACKS[current];
    if (!tr || !ctx) return;
    const beat = 60 / tr.bpm / 2; // Achtel
    const t = ctx.currentTime + 0.05;
    const bar = Math.floor(step / 8) % tr.chords.length;
    const chordRoot = tr.root + CHORD_STEPS[tr.chords[bar] % CHORD_STEPS.length] - 12;
    // Bass auf 1 und 5
    if (step % 4 === 0) tone(musicBus, note(chordRoot - 12), t, beat * 3.5, { type: tr.bass, gain: 0.22 });
    // Melodie: zufällige Töne der Tonleiter, aber an den Takt gebunden (wiederholt sich alle 4 Takte)
    const seed = (step % 32) * 7 + bar * 13;
    if ((seed % 5) !== 0 || step % 2 === 0) {
      const deg = tr.scale[(seed * 3 + Math.floor(step / 2)) % tr.scale.length];
      const oct = (seed % 3 === 0) ? 12 : 0;
      tone(musicBus, note(tr.root + deg + oct), t, beat * 1.6, { type: tr.lead, gain: tr.lead === 'sine' ? 0.18 : 0.08 });
    }
    // Flächen-Akkord am Taktanfang
    if (tr.pad && step % 8 === 0) [0, 4, 7].forEach((s) => tone(musicBus, note(chordRoot + 12 + s), t, beat * 8, { type: 'sine', gain: 0.05, attack: 0.4 }));
    // Schlagzeug
    if (tr.drums) {
      if (step % 4 === 0) tone(musicBus, 120, t, 0.15, { type: 'sine', slide: 40, gain: 0.5 });
      if (step % 4 === 2) noise(musicBus, t, 0.12, { freq: 3000, filter: 'highpass', gain: 0.2 });
      if (step % 2 === 1) noise(musicBus, t, 0.03, { freq: 8000, filter: 'highpass', gain: 0.06 });
    }
    step++;
    musicTimer = setTimeout(tick, beat * 1000);
  }

  ui.music = (track) => {
    if (track === current) return;
    current = track;
    clearTimeout(musicTimer);
    step = 0;
    try {
      if (!init() || !track || !vol('musicVolume')) return;
      if (ctx.state === 'suspended') return; // startet nach dem ersten Klick
      tick();
    } catch (e) { /* ohne Musik weiterspielen */ }
  };
  ui.audioSettingsChanged = () => {
    applyVolume();
    const t = current; current = null; ui.music(t);
  };

  // Browser erlauben Ton erst nach einer Nutzer-Aktion: beim ersten Klick starten.
  document.addEventListener('pointerdown', () => {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume().then(() => { const t = current; current = null; ui.music(t); });
  }, { capture: true });
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn, .card, .opt, .seg-btn')) ui.sound('click'); }, { capture: true });

  // Welche Musik zu welchem Bildschirm passt
  const ACT_TRACK = { act1: 'wald', act2: 'vulkan', act3: 'gipfel' };
  ui.musicFor = (screen) => {
    const run = ui.game.run;
    if (screen === 'map' && run) return ACT_TRACK[run.act] || (run.act === 'tiefe' ? 'hub' : 'wald');
    if (['hub', 'echo', 'starter', 'blessing', 'achievements', 'guide', 'chronicle', 'crystalshop', 'daily', 'talents', 'dex', 'summary'].indexOf(screen) >= 0) return 'hub';
    return null;
  };
})(globalThis.LUM);
