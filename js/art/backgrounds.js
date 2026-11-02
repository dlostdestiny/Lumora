// Hintergründe für Karte, Kampf und Schrein. Farben kommen aus der Gebiets-Variante (palette) oder Standardwerten.
(function (L) {
  let counter = 0;
  const f = (n) => Math.round(n * 10) / 10;
  const P = () => L.palette;

  // Pseudozufall nur für die Optik (fest, damit der Hintergrund nicht flackert).
  function noise(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function trees(rnd, y, count, h, color, w) {
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = (i + rnd() * 0.6) * (1280 / count);
      const th = h * (0.7 + rnd() * 0.5);
      const tw = w * (0.8 + rnd() * 0.4);
      out += '<path d="M' + f(x) + ' ' + f(y - th) + ' L' + f(x + tw / 2) + ' ' + f(y - th * 0.45) + ' L' + f(x + tw * 0.32) + ' ' + f(y - th * 0.45) + ' L' + f(x + tw * 0.62) + ' ' + f(y) + ' L' + f(x - tw * 0.62) + ' ' + f(y) + ' L' + f(x - tw * 0.32) + ' ' + f(y - th * 0.45) + ' L' + f(x - tw / 2) + ' ' + f(y - th * 0.45) + ' Z" fill="' + color + '"/>';
    }
    return out;
  }

  const BG = {
    wald(pal, id) {
      const rnd = noise(7);
      const sky = id + 's';
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, 0.3) + '"/><stop offset="1" stop-color="' + P().shade(pal.far, -0.2) + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        [0, 1, 2, 3].map((i) => '<path d="M' + (180 + i * 260) + ' 0 L' + (260 + i * 260) + ' 0 L' + (120 + i * 240) + ' 720 L' + (40 + i * 240) + ' 720 Z" fill="' + pal.light + '" opacity="0.07"/>').join('') +
        trees(rnd, 470, 14, 330, P().shade(pal.far, -0.1), 140) +
        '<rect y="450" width="1280" height="270" fill="' + pal.far + '"/>' +
        trees(rnd, 560, 9, 380, pal.near, 190) +
        '<path d="M0 560 Q320 520 640 560 T1280 560 L1280 720 L0 720 Z" fill="' + P().shade(pal.near, 0.15) + '"/>' +
        [...Array(26)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(200 + rnd() * 400) + '" r="' + f(1.5 + rnd() * 2.5) + '" fill="' + pal.light + '" opacity="' + f(0.3 + rnd() * 0.5) + '" class="firefly"/>').join('');
    },
    moor(pal, id) {
      const rnd = noise(3);
      const sky = id + 's';
      let reeds = '';
      for (let i = 0; i < 60; i++) {
        const x = rnd() * 1280, h = 40 + rnd() * 90, y = 600 + rnd() * 100;
        reeds += '<path d="M' + f(x) + ' ' + f(y) + ' q ' + f(rnd() * 10 - 5) + ' ' + f(-h / 2) + ' ' + f(rnd() * 16 - 8) + ' ' + f(-h) + '" stroke="' + P().shade(pal.near, 0.3) + '" stroke-width="3" fill="none"/>';
      }
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.sky + '"/><stop offset="1" stop-color="' + pal.far + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        trees(rnd, 480, 10, 240, P().shade(pal.far, 0.25), 120) +
        '<rect y="470" width="1280" height="250" fill="' + pal.near + '"/>' +
        '<ellipse cx="420" cy="600" rx="300" ry="40" fill="' + P().shade(pal.sky, -0.2) + '" opacity="0.6"/>' +
        '<ellipse cx="1000" cy="640" rx="240" ry="30" fill="' + P().shade(pal.sky, -0.2) + '" opacity="0.5"/>' +
        reeds +
        [380, 520, 650].map((y, i) => '<rect y="' + y + '" width="1280" height="70" fill="' + pal.light + '" opacity="' + (0.12 - i * 0.02) + '" class="fog"/>').join('');
    },
    schrein(pal, id) {
      const rnd = noise(11);
      const sky = id + 's';
      const glow = id + 'g';
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140f24"/><stop offset="1" stop-color="#3a2a5a"/></linearGradient>' +
        '<radialGradient id="' + glow + '"><stop offset="0" stop-color="#bfe3ff" stop-opacity="0.9"/><stop offset="1" stop-color="#bfe3ff" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        [...Array(80)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 380) + '" r="' + f(0.8 + rnd() * 1.8) + '" fill="#ffffff" opacity="' + f(0.3 + rnd() * 0.7) + '" class="twinkle"/>').join('') +
        '<circle cx="640" cy="300" r="190" fill="url(#' + glow + ')"/>' +
        '<path d="M380 520 L900 520 L860 470 L420 470 Z" fill="#4b3c6e"/>' +
        '<rect x="460" y="250" width="34" height="220" fill="#5a4a80"/><rect x="786" y="250" width="34" height="220" fill="#5a4a80"/>' +
        '<path d="M420 250 Q640 170 860 250 L860 228 Q640 150 420 228 Z" fill="#c2414b"/>' +
        '<path d="M612 360 Q640 300 668 360 Q676 400 640 420 Q604 400 612 360 Z" fill="#bfe3ff" stroke="#ffffff" stroke-width="2" class="glow"/>' +
        '<path d="M0 560 L1280 560 L1280 720 L0 720 Z" fill="#2a2140"/>' +
        '<path d="M300 720 L560 520 L720 520 L980 720 Z" fill="#3a2f58"/>';
    },
    arena_boss(pal, id) {
      const rnd = noise(5);
      const sky = id + 's';
      let thorns = '';
      for (let i = 0; i < 18; i++) {
        const x = rnd() * 1280, y = 720, h = 160 + rnd() * 260, dir = rnd() > 0.5 ? 1 : -1;
        thorns += '<path d="M' + f(x) + ' ' + y + ' Q' + f(x + dir * 60) + ' ' + f(y - h / 2) + ' ' + f(x + dir * 20) + ' ' + f(y - h) + ' L' + f(x + dir * 30) + ' ' + f(y - h + 20) + ' Q' + f(x + dir * 76) + ' ' + f(y - h / 2) + ' ' + f(x + 18) + ' ' + y + ' Z" fill="#160d1f"/>';
      }
      return '<defs><radialGradient id="' + sky + '" cx="0.5" cy="0.35"><stop offset="0" stop-color="#5b2a6e"/><stop offset="1" stop-color="#0d0814"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        trees(rnd, 520, 12, 300, '#1f1430', 150) +
        '<rect y="510" width="1280" height="210" fill="#24182f"/>' +
        thorns +
        [...Array(30)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 600) + '" r="' + f(1 + rnd() * 3) + '" fill="#c084fc" opacity="' + f(0.2 + rnd() * 0.5) + '" class="firefly"/>').join('');
    },
    vulkan(pal, id) {
      const rnd = noise(13);
      const sky = id + 's', lava = id + 'l';
      let peaks = '', rocks = '';
      for (let i = 0; i < 7; i++) {
        const x = i * 210 + rnd() * 60, h = 180 + rnd() * 160;
        peaks += '<path d="M' + f(x - 160) + ' 470 L' + f(x) + ' ' + f(470 - h) + ' L' + f(x + 160) + ' 470 Z" fill="' + P().shade(pal.far, -0.1 + rnd() * 0.15) + '"/>';
      }
      for (let i = 0; i < 16; i++) {
        const x = rnd() * 1280, y = 560 + rnd() * 140, r = 18 + rnd() * 40;
        rocks += '<path d="M' + f(x - r) + ' ' + f(y) + ' L' + f(x - r * 0.4) + ' ' + f(y - r * 0.9) + ' L' + f(x + r * 0.6) + ' ' + f(y - r * 0.7) + ' L' + f(x + r) + ' ' + f(y) + ' Z" fill="' + P().shade(pal.near, -0.2) + '"/>';
      }
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, -0.3) + '"/><stop offset="1" stop-color="' + P().shade(pal.light, -0.35) + '"/></linearGradient>' +
        '<linearGradient id="' + lava + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5a1f"/><stop offset="0.5" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<path d="M520 470 L640 170 L700 190 L780 470 Z" fill="' + P().shade(pal.far, -0.25) + '"/><path d="M630 175 Q660 120 640 60 Q700 110 690 190 Z" fill="#3a2a2a" opacity="0.7"/>' +
        '<path d="M640 180 Q650 300 600 470 L680 470 Q660 320 676 190 Z" fill="url(#' + lava + ')" opacity="0.85" class="glow"/>' +
        peaks + '<rect y="460" width="1280" height="260" fill="' + pal.near + '"/>' +
        '<path d="M0 620 Q220 590 420 630 T900 610 T1280 640 L1280 660 Q1000 640 820 662 T380 655 T0 645 Z" fill="url(#' + lava + ')" opacity="0.9" class="glow"/>' +
        rocks + [...Array(30)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(150 + rnd() * 450) + '" r="' + f(1 + rnd() * 2.5) + '" fill="#ffb36b" opacity="' + f(0.3 + rnd() * 0.6) + '" class="firefly"/>').join('');
    },
    grotte(pal, id) {
      const rnd = noise(17);
      const sky = id + 's', glow = id + 'g';
      let crystals = '', drips = '';
      for (let i = 0; i < 22; i++) {
        const x = rnd() * 1280, base = 470 + rnd() * 240, h = 40 + rnd() * 140, w = 14 + rnd() * 26, c = rnd() > 0.5 ? pal.light : '#f0abfc';
        crystals += '<path d="M' + f(x - w) + ' ' + f(base) + ' L' + f(x) + ' ' + f(base - h) + ' L' + f(x + w) + ' ' + f(base) + ' Z" fill="' + c + '" opacity="' + f(0.35 + rnd() * 0.4) + '" class="glow"/>';
      }
      for (let i = 0; i < 14; i++) {
        const x = rnd() * 1280, h = 60 + rnd() * 160;
        drips += '<path d="M' + f(x - 30) + ' 0 L' + f(x) + ' ' + f(h) + ' L' + f(x + 30) + ' 0 Z" fill="' + P().shade(pal.far, -0.3) + '"/>';
      }
      return '<defs><radialGradient id="' + sky + '" cx="0.5" cy="0.45"><stop offset="0" stop-color="' + pal.far + '"/><stop offset="1" stop-color="' + P().shade(pal.sky, -0.4) + '"/></radialGradient>' +
        '<radialGradient id="' + glow + '"><stop offset="0" stop-color="' + pal.light + '" stop-opacity="0.5"/><stop offset="1" stop-color="' + pal.light + '" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/><circle cx="640" cy="330" r="320" fill="url(#' + glow + ')"/>' + drips +
        '<path d="M0 500 Q320 460 640 500 T1280 490 L1280 720 L0 720 Z" fill="' + pal.near + '"/>' +
        '<ellipse cx="640" cy="640" rx="380" ry="50" fill="' + pal.light + '" opacity="0.15"/>' + crystals;
    },
    arena_brakk(pal, id) {
      const rnd = noise(19);
      const sky = id + 's';
      return '<defs><radialGradient id="' + sky + '" cx="0.5" cy="0.4"><stop offset="0" stop-color="#7a2a10"/><stop offset="0.6" stop-color="#2a0f0a"/><stop offset="1" stop-color="#0d0606"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<rect x="80" y="80" width="90" height="460" fill="#2a1a16"/><rect x="1110" y="80" width="90" height="460" fill="#2a1a16"/>' +
        '<path d="M470 470 L810 470 L760 380 L520 380 Z" fill="#3a2420"/><circle cx="640" cy="300" r="90" fill="#1a0f1f" stroke="#ff5a1f" stroke-width="6" class="glow"/>' +
        '<circle cx="640" cy="300" r="56" fill="#3b1a4a" opacity="0.9"/>' +
        '<rect y="520" width="1280" height="200" fill="#1f1412"/><path d="M0 560 L1280 560" stroke="#ff7a3d" stroke-width="3" opacity="0.5"/>' +
        [...Array(40)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 620) + '" r="' + f(1 + rnd() * 3) + '" fill="' + (rnd() > 0.5 ? '#ff8a3d' : '#c084fc') + '" opacity="' + f(0.25 + rnd() * 0.6) + '" class="firefly"/>').join('');
    },
    gipfel(pal, id) {
      const rnd = noise(23);
      const sky = id + 's';
      let peaks = '', snow = '';
      for (let i = 0; i < 6; i++) {
        const x = i * 250 + rnd() * 80, h = 220 + rnd() * 200;
        peaks += '<path d="M' + f(x - 190) + ' 520 L' + f(x) + ' ' + f(520 - h) + ' L' + f(x + 190) + ' 520 Z" fill="' + P().shade(pal.far, -0.15 + rnd() * 0.2) + '"/>' +
          '<path d="M' + f(x - 45) + ' ' + f(520 - h + 60) + ' L' + f(x) + ' ' + f(520 - h) + ' L' + f(x + 45) + ' ' + f(520 - h + 60) + ' L' + f(x + 15) + ' ' + f(520 - h + 48) + ' L' + f(x - 12) + ' ' + f(520 - h + 64) + ' Z" fill="#f1f5f9" opacity="0.85"/>';
      }
      for (let i = 0; i < 50; i++) snow += '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 720) + '" r="' + f(1 + rnd() * 2) + '" fill="#ffffff" opacity="' + f(0.3 + rnd() * 0.5) + '" class="firefly"/>';
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, -0.3) + '"/><stop offset="1" stop-color="' + pal.far + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<path d="M300 140 L340 60 L330 120 L380 100 L320 200" stroke="' + pal.light + '" stroke-width="5" fill="none" opacity="0.7" class="glow"/>' +
        '<path d="M950 110 L990 40 L975 100 L1020 85 L960 180" stroke="' + pal.light + '" stroke-width="4" fill="none" opacity="0.55" class="glow"/>' +
        peaks + '<path d="M0 560 Q320 520 640 555 T1280 545 L1280 720 L0 720 Z" fill="' + pal.near + '"/>' +
        '<path d="M0 600 Q400 575 800 605 T1280 600 L1280 720 L0 720 Z" fill="' + P().shade(pal.near, 0.2) + '"/>' + snow;
    },
    nebelkamm(pal, id) {
      const rnd = noise(29);
      const sky = id + 's';
      let ridges = '';
      for (let k = 0; k < 3; k++) {
        let d = 'M0 ' + (360 + k * 90);
        for (let x = 0; x <= 1280; x += 160) d += ' L' + x + ' ' + f(340 + k * 90 - rnd() * 90);
        ridges += '<path d="' + d + ' L1280 720 L0 720 Z" fill="' + P().shade(pal.far, -0.1 - k * 0.12) + '"/>' +
          '<rect y="' + (380 + k * 90) + '" width="1280" height="80" fill="' + pal.light + '" opacity="0.1" class="fog"/>';
      }
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.sky + '"/><stop offset="1" stop-color="' + pal.light + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/><circle cx="980" cy="160" r="60" fill="#f8fafc" opacity="0.5"/>' + ridges +
        '<rect y="560" width="1280" height="160" fill="' + pal.near + '"/>' +
        [500, 620].map((y) => '<rect y="' + y + '" width="1280" height="90" fill="' + pal.light + '" opacity="0.12" class="fog"/>').join('');
    },
    arena_sola(pal, id) {
      const rnd = noise(31);
      const sky = id + 's';
      let bolts = '';
      for (let i = 0; i < 6; i++) {
        const x = 100 + rnd() * 1080;
        bolts += '<path d="M' + f(x) + ' 0 L' + f(x - 20) + ' 120 L' + f(x + 10) + ' 110 L' + f(x - 30) + ' 260" stroke="#c4b5fd" stroke-width="4" fill="none" opacity="' + f(0.3 + rnd() * 0.5) + '" class="glow"/>';
      }
      return '<defs><radialGradient id="' + sky + '" cx="0.5" cy="0.3"><stop offset="0" stop-color="#4c1d95"/><stop offset="0.5" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0b0a1a"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<ellipse cx="640" cy="220" rx="380" ry="120" fill="none" stroke="#a78bfa" stroke-width="3" opacity="0.4"/><ellipse cx="640" cy="220" rx="220" ry="70" fill="none" stroke="#c4b5fd" stroke-width="2" opacity="0.4"/>' +
        '<circle cx="640" cy="220" r="34" fill="#0b0a1a" stroke="#facc15" stroke-width="3"/>' + bolts +
        '<path d="M200 720 L420 520 L860 520 L1080 720 Z" fill="#2e2a4a"/><rect y="600" width="1280" height="120" fill="#1a1830" opacity="0.6"/>' +
        [...Array(30)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 500) + '" r="' + f(0.8 + rnd() * 2) + '" fill="#ffffff" opacity="' + f(0.3 + rnd() * 0.6) + '" class="twinkle"/>').join('');
    },
    glasebene(pal, id) {
      const rnd = noise(43);
      const sky = id + 's';
      let crystals = '', sparks = '';
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 150 + rnd() * 60, h = 120 + rnd() * 240, w = 40 + rnd() * 50;
        crystals += '<path d="M' + f(x - w) + ' 560 L' + f(x - w * 0.3) + ' ' + f(560 - h) + ' L' + f(x + w * 0.4) + ' ' + f(560 - h * 0.85) + ' L' + f(x + w) + ' 560 Z" fill="' + P().shade(pal.far, 0.1 + rnd() * 0.25) + '" opacity="0.8"/>' +
          '<path d="M' + f(x - w * 0.3) + ' ' + f(560 - h) + ' L' + f(x + w * 0.1) + ' 560 L' + f(x - w) + ' 560 Z" fill="#ffffff" opacity="0.18"/>';
      }
      for (let i = 0; i < 40; i++) sparks += '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 700) + '" r="' + f(1 + rnd() * 2.5) + '" fill="#f0f9ff" opacity="' + f(0.3 + rnd() * 0.6) + '" class="twinkle"/>';
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, -0.25) + '"/><stop offset="1" stop-color="' + pal.light + '" stop-opacity="0.6"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="' + pal.sky + '"/><rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<circle cx="640" cy="170" r="70" fill="#f0f9ff" opacity="0.35" class="glow"/>' + crystals +
        '<rect y="560" width="1280" height="160" fill="' + pal.near + '"/>' +
        '<path d="M0 620 Q320 600 640 625 T1280 610 L1280 720 L0 720 Z" fill="' + P().shade(pal.near, 0.2) + '" opacity="0.8"/>' +
        '<path d="M120 700 L260 600 M520 710 L700 610 M900 700 L1100 600" stroke="#ffffff" stroke-width="2" opacity="0.25"/>' + sparks;
    },
    sternenstrom(pal, id) {
      const rnd = noise(47);
      const sky = id + 's';
      let islands = '', stars = '';
      for (let i = 0; i < 5; i++) {
        const x = 120 + i * 250 + rnd() * 80, y = 280 + rnd() * 220, w = 70 + rnd() * 70;
        islands += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * 0.22) + '" fill="' + P().shade(pal.far, 0.1) + '"/>' +
          '<path d="M' + f(x - w) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + w * 0.9) + ' ' + f(x + w) + ' ' + f(y) + ' Z" fill="' + P().shade(pal.far, -0.2) + '"/>' +
          '<ellipse cx="' + f(x) + '" cy="' + f(y - 4) + '" rx="' + f(w * 0.8) + '" ry="' + f(w * 0.12) + '" fill="' + pal.near + '"/>';
      }
      for (let i = 0; i < 70; i++) stars += '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 600) + '" r="' + f(0.8 + rnd() * 2) + '" fill="#ffffff" opacity="' + f(0.3 + rnd() * 0.6) + '" class="twinkle"/>';
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, -0.35) + '"/><stop offset="1" stop-color="' + pal.far + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' + stars +
        '<path d="M0 200 Q300 80 640 190 T1280 130 L1280 260 Q900 330 600 270 T0 330 Z" fill="#4ade80" opacity="0.18" class="fog"/>' +
        '<path d="M0 260 Q300 150 640 250 T1280 200 L1280 300 Q900 380 600 330 T0 390 Z" fill="#a78bfa" opacity="0.18" class="fog"/>' +
        islands +
        '<path d="M0 560 Q320 520 640 560 T1280 540 L1280 720 L0 720 Z" fill="' + pal.near + '" opacity="0.9"/>' +
        '<rect y="520" width="1280" height="120" fill="' + pal.light + '" opacity="0.1" class="fog"/>';
    },
    arena_vael(pal, id) {
      const rnd = noise(53);
      const sky = id + 's';
      let teeth = '', ice = '';
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, cx = 640 + Math.cos(a) * 250, cy = 250 + Math.sin(a) * 250 * 0.5;
        teeth += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="9" fill="#2e1065" stroke="#a78bfa" stroke-width="2" opacity="0.8"/>';
      }
      for (let i = 0; i < 14; i++) {
        const x = rnd() * 1280, h = 60 + rnd() * 160, w = 18 + rnd() * 22;
        ice += '<path d="M' + f(x - w) + ' 720 L' + f(x) + ' ' + f(720 - h) + ' L' + f(x + w) + ' 720 Z" fill="#a5f3fc" opacity="' + f(0.2 + rnd() * 0.3) + '"/>';
      }
      return '<defs><radialGradient id="' + sky + '" cx="0.5" cy="0.35"><stop offset="0" stop-color="#6d28d9"/><stop offset="0.5" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0a0a1f"/></radialGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        '<circle cx="640" cy="250" r="190" fill="none" stroke="#c4b5fd" stroke-width="3" opacity="0.4"/><circle cx="640" cy="250" r="150" fill="#1e1b4b" opacity="0.6" stroke="#fbbf24" stroke-width="2"/>' +
        '<path d="M640 250 L640 130 M640 250 L720 290" stroke="#fde68a" stroke-width="5" stroke-linecap="round" opacity="0.8" class="glow"/>' + teeth +
        '<path d="M560 540 L560 420 Q640 360 720 420 L720 540 Z" fill="#312e81" stroke="#a78bfa" stroke-width="3"/>' +
        '<path d="M200 720 L420 540 L860 540 L1080 720 Z" fill="#2e2a4a"/><rect y="620" width="1280" height="100" fill="#14122b" opacity="0.7"/>' + ice +
        [...Array(36)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 520) + '" r="' + f(0.8 + rnd() * 2) + '" fill="#ffffff" opacity="' + f(0.3 + rnd() * 0.6) + '" class="twinkle"/>').join('');
    },
    tiefsee(pal, id) {
      const rnd = noise(37);
      const sky = id + 's';
      let bubbles = '', coral = '';
      for (let i = 0; i < 40; i++) bubbles += '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 720) + '" r="' + f(2 + rnd() * 6) + '" fill="none" stroke="#a5f3fc" stroke-width="1.5" opacity="' + f(0.2 + rnd() * 0.5) + '" class="firefly"/>';
      for (let i = 0; i < 18; i++) {
        const x = rnd() * 1280, h = 50 + rnd() * 120, c = rnd() > 0.5 ? '#fb7185' : '#f59e0b';
        coral += '<path d="M' + f(x) + ' 720 q ' + f(-20 + rnd() * 40) + ' ' + f(-h / 2) + ' ' + f(-10 + rnd() * 20) + ' ' + f(-h) + ' M' + f(x) + ' ' + f(720 - h * 0.5) + ' q 20 -20 30 -40" stroke="' + c + '" stroke-width="' + f(6 + rnd() * 6) + '" fill="none" stroke-linecap="round" opacity="0.85"/>';
      }
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal.light + '" stop-opacity="0.5"/><stop offset="0.15" stop-color="' + pal.far + '"/><stop offset="1" stop-color="' + P().shade(pal.sky, -0.3) + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="' + pal.sky + '"/><rect width="1280" height="720" fill="url(#' + sky + ')"/>' +
        [0, 1, 2, 3, 4].map((i) => '<path d="M' + (150 + i * 260) + ' 0 L' + (230 + i * 260) + ' 0 L' + (120 + i * 240) + ' 720 L' + (60 + i * 240) + ' 720 Z" fill="' + pal.light + '" opacity="0.06"/>').join('') +
        '<path d="M300 520 L340 380 L380 520 Z M380 520 L430 330 L480 520 Z M860 530 L900 360 L950 530 Z" fill="' + P().shade(pal.far, -0.3) + '" opacity="0.8"/>' +
        '<path d="M0 600 Q320 560 640 600 T1280 590 L1280 720 L0 720 Z" fill="' + pal.near + '"/>' + coral + bubbles;
    },
    turm(pal, id) {
      const rnd = noise(41);
      const sky = id + 's';
      let cols = '';
      for (let i = 0; i < 6; i++) { const x = 60 + i * 230; cols += '<rect x="' + x + '" y="60" width="54" height="560" fill="' + P().shade(pal.far, -0.15) + '"/><rect x="' + (x - 10) + '" y="40" width="74" height="26" fill="' + pal.near + '"/><path d="M' + (x + 27) + ' 120 l10 18 l-10 18 l-10 -18 Z" fill="' + pal.light + '" opacity="0.6" class="glow"/>'; }
      return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.sky, -0.2) + '"/><stop offset="1" stop-color="' + pal.far + '"/></linearGradient></defs>' +
        '<rect width="1280" height="720" fill="url(#' + sky + ')"/>' + [...Array(60)].map(() => '<circle cx="' + f(rnd() * 1280) + '" cy="' + f(rnd() * 400) + '" r="' + f(0.8 + rnd() * 1.6) + '" fill="#fff" opacity="' + f(0.3 + rnd() * 0.6) + '" class="twinkle"/>').join('') +
        '<ellipse cx="640" cy="260" rx="220" ry="220" fill="' + pal.light + '" opacity="0.08"/>' + cols +
        '<rect y="600" width="1280" height="120" fill="' + pal.near + '"/><path d="M0 600 L1280 600" stroke="' + pal.light + '" stroke-width="3" opacity="0.5"/>' +
        '<path d="M380 720 L560 600 L720 600 L900 720 Z" fill="' + P().shade(pal.near, 0.15) + '"/>';
    },
  };

  const DEFAULT_PAL = { sky: '#1d3b2f', far: '#2f5a43', near: '#3f7a4a', light: '#f7e9a0' };

  L.art = L.art || {};
  L.art.background = function (bgId, opts) {
    opts = opts || {};
    const fn = BG[bgId];
    if (!fn) throw new Error('Unbekannter Hintergrund: ' + bgId);
    const id = 'bg' + (counter++) + '_';
    const w = opts.width || 1280, h = opts.height || 720;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice" class="bg-svg">' + fn(Object.assign({}, DEFAULT_PAL, opts.palette || {}), id) + '</svg>';
  };
})(globalThis.LUM);
