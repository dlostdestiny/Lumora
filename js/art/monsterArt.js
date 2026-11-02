// Zeichnet Monster als SVG im Anime-/Chibi-Stil: dicke Umrisse, große glänzende Augen,
// Cel-Shading mit harter Schattenkante. Alles wird aus der ArtSpec der Art zusammengesetzt.
(function (L) {
  const P = () => L.palette;
  const INK = '#2b2238';
  let counter = 0;

  const OUT = 'stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
  const f = (n) => Math.round(n * 10) / 10;

  // Körperformen: liefern Körper-SVG, Kopf-Position und Bauch.
  const BODIES = {
    round: () => ({
      shape: { type: 'ellipse', cx: 100, cy: 122, rx: 54, ry: 48 },
      head: { x: 100, y: 112, r: 50 }, headIsBody: true,
      belly: { cx: 100, cy: 142, rx: 30, ry: 22 },
      feet: [[76, 166, 15, 8], [124, 166, 15, 8]],
      tailAt: [148, 140],
    }),
    blob: () => ({
      shape: { type: 'path', d: 'M100 64 C148 64 160 118 158 148 C156 170 130 174 100 174 C70 174 44 170 42 148 C40 118 52 64 100 64Z' },
      head: { x: 100, y: 116, r: 52 }, headIsBody: true,
      belly: { cx: 100, cy: 150, rx: 34, ry: 16 },
      feet: [],
      tailAt: [152, 150],
    }),
    quad: () => ({
      shape: { type: 'ellipse', cx: 92, cy: 136, rx: 52, ry: 30 },
      head: { x: 118, y: 90, r: 38 },
      belly: { cx: 92, cy: 148, rx: 32, ry: 12 },
      legs: [[58, 160], [78, 164], [108, 164], [128, 160]],
      tailAt: [44, 126],
    }),
    tall: () => ({
      shape: { type: 'ellipse', cx: 100, cy: 140, rx: 40, ry: 42 },
      head: { x: 100, y: 78, r: 42 },
      belly: { cx: 100, cy: 148, rx: 24, ry: 26 },
      feet: [[82, 180, 15, 7], [118, 180, 15, 7]],
      arms: [[62, 138], [138, 138]],
      tailAt: [136, 162],
    }),
    bird: () => ({
      shape: { type: 'ellipse', cx: 100, cy: 118, rx: 48, ry: 46 },
      head: { x: 100, y: 108, r: 48 }, headIsBody: true,
      belly: { cx: 100, cy: 136, rx: 28, ry: 24 },
      feet: [[86, 164, 8, 5], [114, 164, 8, 5]],
      tailAt: [146, 134],
      beak: true,
    }),
    serpent: () => ({
      shape: { type: 'path', d: 'M100 104 C132 104 142 138 138 158 C134 178 66 178 62 158 C58 138 68 104 100 104 Z' },
      head: { x: 100, y: 82, r: 40 },
      belly: { cx: 100, cy: 152, rx: 22, ry: 16 },
      feet: [],
      tailAt: [134, 164],
    }),
  };

  function shapeEl(s, attrs) {
    if (s.type === 'ellipse') return '<ellipse cx="' + s.cx + '" cy="' + s.cy + '" rx="' + s.rx + '" ry="' + s.ry + '" ' + attrs + '/>';
    return '<path d="' + s.d + '" ' + attrs + '/>';
  }
  function shifted(s, dx, dy) {
    if (s.type === 'ellipse') return Object.assign({}, s, { cx: s.cx + dx, cy: s.cy + dy });
    return Object.assign({}, s, { transform: 'translate(' + dx + ' ' + dy + ')' });
  }
  // Fläche mit Cel-Shading: Schattenfarbe als Grund, darüber die nach links oben verschobene Grundfarbe.
  // So bleibt rechts unten eine Schatten-Sichel mit harter Kante. Dazu Glanz und Umriss.
  function celShape(id, s, color, opts) {
    opts = opts || {};
    const sx = opts.sx || 9, sy = opts.sy || 10;
    const clip = id + 'c' + (counter++);
    const lit = shifted(s, -sx, -sy);
    const litEl = shapeEl(lit, 'fill="' + color + '"' + (lit.transform ? ' transform="' + lit.transform + '"' : ''));
    const hi = s.type === 'ellipse'
      ? '<ellipse cx="' + f(s.cx - s.rx * 0.38) + '" cy="' + f(s.cy - s.ry * 0.5) + '" rx="' + f(s.rx * 0.26) + '" ry="' + f(s.ry * 0.14) + '" fill="#ffffff" opacity="0.5" transform="rotate(-28 ' + f(s.cx - s.rx * 0.38) + ' ' + f(s.cy - s.ry * 0.5) + ')"/>'
      : '';
    // Weicher Verlauf (Tiefe) und Glanzkante oben links (Randlicht)
    const soft = id + 'r' + (counter++);
    const rim = shifted(s, 4, 5);
    const rimEl = shapeEl(rim, 'fill="none" stroke="#ffffff" stroke-width="5" opacity="0.28"' + (rim.transform ? ' transform="' + rim.transform + '"' : ''));
    return '<defs><radialGradient id="' + soft + '" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="' + P().shade(color, 0.6) + '" stop-opacity="0.35"/></radialGradient></defs>' +
      '<clipPath id="' + clip + '">' + shapeEl(s, '') + '</clipPath>' +
      shapeEl(s, 'fill="' + P().shade(color, 0.24) + '"') +
      '<g clip-path="url(#' + clip + ')">' + litEl + (opts.pattern || '') + shapeEl(s, 'fill="url(#' + soft + ')"') + rimEl + '</g>' +
      hi + shapeEl(s, 'fill="none" ' + OUT);
  }

  function ear(kind, x, y, side, pal, head) {
    const s = side; // -1 links, 1 rechts
    const r = head.r;
    switch (kind) {
      case 'cat': {
        const bx = x, by = y;
        const d = 'M' + f(bx - s * r * 0.28) + ' ' + f(by + r * 0.18) + ' L' + f(bx + s * r * 0.08) + ' ' + f(by - r * 0.62) + ' L' + f(bx + s * r * 0.42) + ' ' + f(by + r * 0.05) + ' Z';
        const inner = 'M' + f(bx - s * r * 0.12) + ' ' + f(by + r * 0.08) + ' L' + f(bx + s * r * 0.08) + ' ' + f(by - r * 0.36) + ' L' + f(bx + s * r * 0.26) + ' ' + f(by + r * 0.02) + ' Z';
        return '<path d="' + d + '" fill="' + pal.main + '" ' + OUT + '/><path d="' + inner + '" fill="' + P().mix(pal.accent, '#ffb3c7', 0.5) + '"/>';
      }
      case 'long': {
        const cx = x + s * r * 0.2, cy = y - r * 0.38;
        return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * 0.2) + '" ry="' + f(r * 0.62) + '" transform="rotate(' + (s * 18) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + pal.main + '" ' + OUT + '/>' +
          '<ellipse cx="' + f(cx) + '" cy="' + f(cy + r * 0.05) + '" rx="' + f(r * 0.09) + '" ry="' + f(r * 0.42) + '" transform="rotate(' + (s * 18) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + pal.belly + '"/>';
      }
      case 'leaf': {
        const tipX = x + s * r * 0.55, tipY = y - r * 0.55;
        const d = 'M' + f(x) + ' ' + f(y + r * 0.1) + ' Q' + f(x + s * r * 0.05) + ' ' + f(tipY) + ' ' + f(tipX) + ' ' + f(tipY) + ' Q' + f(x + s * r * 0.6) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y + r * 0.1) + ' Z';
        return '<path d="' + d + '" fill="' + P().mix(pal.main, '#5fcf5a', 0.5) + '" ' + OUT + '/><path d="M' + f(x + s * 2) + ' ' + f(y + r * 0.04) + ' L' + f(tipX - s * 4) + ' ' + f(tipY + 4) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" opacity="0.6"/>';
      }
      case 'horn': {
        const d = 'M' + f(x - s * r * 0.12) + ' ' + f(y + r * 0.1) + ' Q' + f(x + s * r * 0.05) + ' ' + f(y - r * 0.5) + ' ' + f(x + s * r * 0.3) + ' ' + f(y - r * 0.55) + ' Q' + f(x + s * r * 0.12) + ' ' + f(y - r * 0.2) + ' ' + f(x + s * r * 0.16) + ' ' + f(y + r * 0.08) + ' Z';
        return '<path d="' + d + '" fill="' + pal.accent + '" ' + OUT + '/>';
      }
      case 'fin': {
        const d = 'M' + f(x - s * r * 0.15) + ' ' + f(y + r * 0.15) + ' Q' + f(x + s * r * 0.2) + ' ' + f(y - r * 0.55) + ' ' + f(x + s * r * 0.55) + ' ' + f(y - r * 0.2) + ' Q' + f(x + s * r * 0.3) + ' ' + f(y) + ' ' + f(x + s * r * 0.3) + ' ' + f(y + r * 0.2) + ' Z';
        return '<path d="' + d + '" fill="' + pal.accent + '" ' + OUT + '/>';
      }
      default: return '';
    }
  }

  function tail(kind, at, pal) {
    const [x, y] = at;
    const dir = x < 100 ? -1 : 1;
    switch (kind) {
      case 'flame': {
        const d = 'M' + x + ' ' + y + ' C' + (x + dir * 30) + ' ' + (y - 6) + ' ' + (x + dir * 20) + ' ' + (y - 40) + ' ' + (x + dir * 38) + ' ' + (y - 58) +
          ' C' + (x + dir * 46) + ' ' + (y - 34) + ' ' + (x + dir * 56) + ' ' + (y - 24) + ' ' + (x + dir * 46) + ' ' + (y - 6) + ' C' + (x + dir * 40) + ' ' + (y + 8) + ' ' + (x + dir * 18) + ' ' + (y + 12) + ' ' + x + ' ' + (y + 8) + ' Z';
        const inner = 'M' + (x + dir * 22) + ' ' + (y - 2) + ' C' + (x + dir * 28) + ' ' + (y - 16) + ' ' + (x + dir * 30) + ' ' + (y - 30) + ' ' + (x + dir * 38) + ' ' + (y - 38) +
          ' C' + (x + dir * 42) + ' ' + (y - 22) + ' ' + (x + dir * 44) + ' ' + (y - 10) + ' ' + (x + dir * 36) + ' ' + (y - 2) + ' Z';
        return '<path d="' + d + '" fill="#ff7a3d" ' + OUT + ' class="flicker"/><path d="' + inner + '" fill="' + (pal.accent === '#ffd23f' ? '#fff3a0' : '#ffd23f') + '"/>';
      }
      case 'leaf': {
        const d = 'M' + x + ' ' + y + ' Q' + (x + dir * 40) + ' ' + (y - 4) + ' ' + (x + dir * 50) + ' ' + (y - 40) + ' Q' + (x + dir * 18) + ' ' + (y - 34) + ' ' + x + ' ' + y + ' Z';
        return '<path d="' + d + '" fill="' + P().mix(pal.main, '#3f9b46', 0.4) + '" ' + OUT + '/><path d="M' + x + ' ' + y + ' Q' + (x + dir * 30) + ' ' + (y - 12) + ' ' + (x + dir * 46) + ' ' + (y - 36) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" opacity="0.5"/>';
      }
      case 'fluffy': {
        const d = 'M' + x + ' ' + (y + 6) + ' C' + (x + dir * 40) + ' ' + (y + 10) + ' ' + (x + dir * 58) + ' ' + (y - 30) + ' ' + (x + dir * 38) + ' ' + (y - 58) +
          ' C' + (x + dir * 22) + ' ' + (y - 74) + ' ' + (x + dir * 2) + ' ' + (y - 56) + ' ' + (x + dir * 14) + ' ' + (y - 42) + ' C' + (x + dir * 28) + ' ' + (y - 30) + ' ' + (x + dir * 22) + ' ' + (y - 8) + ' ' + x + ' ' + (y - 8) + ' Z';
        return '<path d="' + d + '" fill="' + pal.main + '" ' + OUT + '/><path d="M' + (x + dir * 30) + ' ' + (y - 50) + ' Q' + (x + dir * 40) + ' ' + (y - 30) + ' ' + (x + dir * 26) + ' ' + (y - 14) + '" fill="none" stroke="' + pal.belly + '" stroke-width="5" stroke-linecap="round"/>';
      }
      case 'bolt': {
        const d = 'M' + x + ' ' + y + ' L' + (x + dir * 22) + ' ' + (y - 6) + ' L' + (x + dir * 16) + ' ' + (y - 22) + ' L' + (x + dir * 40) + ' ' + (y - 30) + ' L' + (x + dir * 30) + ' ' + (y - 14) + ' L' + (x + dir * 38) + ' ' + (y - 12) + ' L' + (x + dir * 12) + ' ' + (y + 8) + ' Z';
        return '<path d="' + d + '" fill="#ffd23f" ' + OUT + '/>';
      }
      case 'fin': {
        const d = 'M' + (x - dir * 6) + ' ' + (y - 4) + ' Q' + (x + dir * 28) + ' ' + (y - 2) + ' ' + (x + dir * 50) + ' ' + (y - 30) + ' Q' + (x + dir * 44) + ' ' + (y + 4) + ' ' + (x + dir * 56) + ' ' + (y + 26) + ' Q' + (x + dir * 26) + ' ' + (y + 20) + ' ' + (x - dir * 6) + ' ' + (y + 12) + ' Z';
        return '<path d="' + d + '" fill="' + pal.accent + '" ' + OUT + '/>';
      }
      default: return '';
    }
  }

  // Große Anime-Augen mit Iris-Verlauf, Pupille, zwei Glanzpunkten und Lidstrich.
  function eyes(id, head, pal, look) {
    const r = head.r;
    const ex = r * 0.4, ey = head.y + r * 0.04;
    const rx = r * 0.2, ry = r * 0.27;
    const grad = id + 'g' + (counter++);
    let out = '<defs><linearGradient id="' + grad + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(pal.eye, 0.45) + '"/><stop offset="0.55" stop-color="' + pal.eye + '"/><stop offset="1" stop-color="' + P().shade(pal.eye, -0.45) + '"/></linearGradient></defs>';
    for (const s of [-1, 1]) {
      const cx = head.x + s * ex + (look || 0);
      out += '<ellipse cx="' + f(cx) + '" cy="' + f(ey) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="#ffffff" stroke="' + INK + '" stroke-width="2.6"/>';
      out += '<ellipse cx="' + f(cx) + '" cy="' + f(ey + ry * 0.08) + '" rx="' + f(rx * 0.82) + '" ry="' + f(ry * 0.86) + '" fill="url(#' + grad + ')"/>';
      out += '<ellipse cx="' + f(cx) + '" cy="' + f(ey + ry * 0.12) + '" rx="' + f(rx * 0.38) + '" ry="' + f(ry * 0.44) + '" fill="' + P().shade(pal.eye, 0.7) + '"/>';
      out += '<ellipse cx="' + f(cx - rx * 0.32) + '" cy="' + f(ey - ry * 0.34) + '" rx="' + f(rx * 0.34) + '" ry="' + f(ry * 0.26) + '" fill="#ffffff"/>';
      out += '<circle cx="' + f(cx + rx * 0.34) + '" cy="' + f(ey + ry * 0.42) + '" r="' + f(rx * 0.16) + '" fill="#ffffff"/>';
      // Iris-Ring und kleiner Stern-Funke im Auge
      out += '<ellipse cx="' + f(cx) + '" cy="' + f(ey + ry * 0.08) + '" rx="' + f(rx * 0.82) + '" ry="' + f(ry * 0.86) + '" fill="none" stroke="' + P().shade(pal.eye, 0.5) + '" stroke-width="1.6"/>';
      const sx = cx + rx * 0.3, sy = ey - ry * 0.05, k = rx * 0.22;
      out += '<path d="M' + f(sx) + ' ' + f(sy - k) + ' L' + f(sx + k * 0.3) + ' ' + f(sy - k * 0.3) + ' L' + f(sx + k) + ' ' + f(sy) + ' L' + f(sx + k * 0.3) + ' ' + f(sy + k * 0.3) + ' L' + f(sx) + ' ' + f(sy + k) + ' L' + f(sx - k * 0.3) + ' ' + f(sy + k * 0.3) + ' L' + f(sx - k) + ' ' + f(sy) + ' L' + f(sx - k * 0.3) + ' ' + f(sy - k * 0.3) + ' Z" fill="#ffffff" opacity="0.9"/>';
      // Unterlid
      out += '<path d="M' + f(cx - rx * 0.5) + ' ' + f(ey + ry * 1.08) + ' Q' + f(cx) + ' ' + f(ey + ry * 1.2) + ' ' + f(cx + rx * 0.5) + ' ' + f(ey + ry * 1.08) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>';
      // Lidstrich mit kleinem Schwung nach außen
      out += '<path d="M' + f(cx - rx * 1.05) + ' ' + f(ey - ry * 0.55) + ' Q' + f(cx) + ' ' + f(ey - ry * 1.35) + ' ' + f(cx + rx * 1.05) + ' ' + f(ey - ry * 0.55) + ' L' + f(cx + s * rx * 1.3) + ' ' + f(ey - ry * 0.8) + '" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return out;
  }

  function mouth(head, beak, pal) {
    const x = head.x, y = head.y + head.r * 0.42;
    if (beak) return '<path d="M' + f(x - 7) + ' ' + f(y - 3) + ' L' + f(x + 7) + ' ' + f(y - 3) + ' L' + f(x) + ' ' + f(y + 6) + ' Z" fill="' + pal.accent + '" ' + OUT + '/>';
    return '<path d="M' + f(x - 7) + ' ' + f(y) + ' Q' + f(x - 3.5) + ' ' + f(y + 5) + ' ' + f(x) + ' ' + f(y) + ' Q' + f(x + 3.5) + ' ' + f(y + 5) + ' ' + f(x + 7) + ' ' + f(y) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
  }

  function cheeks(head) {
    const y = head.y + head.r * 0.32;
    return [-1, 1].map((s) => '<ellipse cx="' + f(head.x + s * head.r * 0.62) + '" cy="' + f(y) + '" rx="' + f(head.r * 0.14) + '" ry="' + f(head.r * 0.08) + '" fill="#ff7aa2" opacity="0.45"/>').join('');
  }

  function pattern(kind, body, pal) {
    const s = body.shape;
    const cx = s.cx || 100, cy = s.cy || 130;
    if (kind === 'spots') {
      return [[-0.45, -0.35, 0.13], [0.5, -0.1, 0.1], [0.25, -0.55, 0.08], [-0.6, 0.15, 0.09]]
        .map(([dx, dy, r]) => '<circle cx="' + f(cx + dx * (s.rx || 50)) + '" cy="' + f(cy + dy * (s.ry || 40)) + '" r="' + f(r * 60) + '" fill="' + P().mix(pal.accent, pal.main, 0.35) + '" opacity="0.85"/>').join('');
    }
    if (kind === 'stripes') {
      return [-0.3, 0, 0.3].map((dx) => '<path d="M' + f(cx + dx * 90 - 6) + ' ' + f(cy - 60) + ' q 12 30 0 60" stroke="' + P().shade(pal.main, 0.35) + '" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>').join('');
    }
    return '';
  }

  // Extras, die hinter dem Körper liegen
  function extrasBack(list, body, pal, head) {
    let out = '';
    if (list.indexOf('wings') >= 0) {
      for (const s of [-1, 1]) {
        const x = 100 + s * 46, y = 100;
        out += '<path d="M' + x + ' ' + (y + 20) + ' Q' + (x + s * 50) + ' ' + (y - 30) + ' ' + (x + s * 40) + ' ' + (y + 34) + ' Q' + (x + s * 20) + ' ' + (y + 40) + ' ' + x + ' ' + (y + 30) + ' Z" fill="' + P().mix(pal.belly, '#ffffff', 0.4) + '" opacity="0.92" ' + OUT + '/>';
      }
    }
    if (list.indexOf('glow') >= 0) { const gid = 'glow' + (counter++); out += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="' + pal.accent + '" stop-opacity="0.55"/><stop offset="1" stop-color="' + pal.accent + '" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="112" r="84" fill="url(#' + gid + ')" class="glow"/>'; }
    if (list.indexOf('mist') >= 0) out += '<ellipse cx="100" cy="168" rx="80" ry="16" fill="#c9d6e3" opacity="0.45"/>';
    if (list.indexOf('veil') >= 0) out += '<path d="M' + (head.x - head.r - 10) + ' ' + (head.y - 10) + ' Q100 ' + (head.y - head.r - 30) + ' ' + (head.x + head.r + 10) + ' ' + (head.y - 10) + ' L' + (head.x + head.r + 26) + ' 190 L' + (head.x - head.r - 26) + ' 190 Z" fill="#1a1024" opacity="0.55"/>';
    if (list.indexOf('mane') >= 0) {
      let d = '';
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.95 + i * 0.13);
        const r1 = head.r * 0.9, r2 = head.r * 1.35;
        d += 'M' + f(head.x + Math.cos(a) * r1) + ' ' + f(head.y + Math.sin(a) * r1) + ' L' + f(head.x + Math.cos(a + 0.08) * r2) + ' ' + f(head.y + Math.sin(a + 0.08) * r2) + ' L' + f(head.x + Math.cos(a + 0.16) * r1) + ' ' + f(head.y + Math.sin(a + 0.16) * r1) + ' ';
      }
      out += '<path d="' + d + '" fill="' + pal.accent + '" ' + OUT + '/>';
    }
    return out;
  }

  // Extras vor dem Körper
  function extrasFront(list, body, pal, head) {
    let out = '';
    const r = head.r;
    if (list.indexOf('antennae') >= 0) {
      for (const s of [-1, 1]) {
        const x = head.x + s * r * 0.3, y = head.y - r * 0.85;
        out += '<path d="M' + f(x) + ' ' + f(y + 8) + ' Q' + f(x + s * 4) + ' ' + f(y - 18) + ' ' + f(x + s * 16) + ' ' + f(y - 24) + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + f(x + s * 16) + '" cy="' + f(y - 24) + '" r="5" fill="' + pal.accent + '" ' + OUT + '/>';
      }
    }
    if (list.indexOf('brows') >= 0) {
      for (const s of [-1, 1]) {
        const x = head.x + s * r * 0.4, y = head.y - r * 0.32;
        out += '<path d="M' + f(x - s * 10) + ' ' + f(y - 6) + ' L' + f(x + s * 10) + ' ' + f(y) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
      }
    }
    if (list.indexOf('scarf') >= 0) {
      const y = head.y + r * 0.85;
      out += '<path d="M' + f(head.x - r * 0.7) + ' ' + f(y) + ' Q' + head.x + ' ' + f(y + 14) + ' ' + f(head.x + r * 0.7) + ' ' + f(y) + ' L' + f(head.x + r * 0.72) + ' ' + f(y + 12) + ' Q' + head.x + ' ' + f(y + 26) + ' ' + f(head.x - r * 0.72) + ' ' + f(y + 12) + ' Z" fill="' + pal.accent + '" ' + OUT + '/>' +
        '<path d="M' + f(head.x + r * 0.4) + ' ' + f(y + 14) + ' l 8 26 l 12 -4 l -6 -24 Z" fill="' + pal.accent + '" ' + OUT + '/>';
    }
    if (list.indexOf('antlers') >= 0) {
      for (const s of [-1, 1]) {
        const x = head.x + s * r * 0.35, y = head.y - r * 0.8;
        out += '<path d="M' + f(x) + ' ' + f(y + 8) + ' L' + f(x + s * 6) + ' ' + f(y - 26) + ' M' + f(x + s * 4) + ' ' + f(y - 12) + ' L' + f(x + s * 18) + ' ' + f(y - 22) + ' M' + f(x + s * 6) + ' ' + f(y - 26) + ' L' + f(x + s * 16) + ' ' + f(y - 38) + '" fill="none" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>';
      }
      if (list.indexOf('flowers') >= 0) {
        for (const [dx, dy] of [[-22, -34], [24, -38], [-14, -48]]) out += flower(head.x + dx, head.y - r * 0.8 + dy + 20, pal.accent);
      }
    } else if (list.indexOf('flowers') >= 0) {
      out += flower(head.x + r * 0.5, head.y - r * 0.7, pal.accent);
    }
    if (list.indexOf('claws') >= 0) {
      for (const s of [-1, 1]) {
        const x = 100 + s * 62, y = 128;
        out += '<path d="M' + x + ' ' + (y + 10) + ' Q' + (x + s * 18) + ' ' + (y - 10) + ' ' + (x + s * 6) + ' ' + (y - 26) + ' L' + (x + s * 2) + ' ' + (y - 10) + ' L' + (x - s * 8) + ' ' + (y - 22) + ' Q' + (x - s * 10) + ' ' + (y) + ' ' + x + ' ' + (y + 10) + ' Z" fill="' + pal.accent + '" ' + OUT + '/>';
      }
    }
    if (list.indexOf('shell') >= 0) {
      out += '<path d="M60 92 Q100 52 140 92 Q120 84 100 86 Q80 84 60 92 Z" fill="' + P().shade(pal.main, 0.15) + '" ' + OUT + '/>';
    }
    if (list.indexOf('mushroomcap') >= 0) {
      const y = head.y - r * 0.55;
      out += '<path d="M' + f(head.x - r * 1.05) + ' ' + f(y + 12) + ' Q' + f(head.x - r * 0.9) + ' ' + f(y - r * 0.75) + ' ' + head.x + ' ' + f(y - r * 0.78) + ' Q' + f(head.x + r * 0.9) + ' ' + f(y - r * 0.75) + ' ' + f(head.x + r * 1.05) + ' ' + f(y + 12) + ' Q' + head.x + ' ' + f(y + 2) + ' ' + f(head.x - r * 1.05) + ' ' + f(y + 12) + ' Z" fill="' + pal.accent + '" ' + OUT + '/>';
      for (const [dx, dy, rr] of [[-0.5, -0.3, 7], [0.1, -0.55, 6], [0.55, -0.2, 6]]) out += '<circle cx="' + f(head.x + dx * r) + '" cy="' + f(y + dy * r) + '" r="' + rr + '" fill="#fff6ee"/>';
    }
    if (list.indexOf('drop') >= 0) out += '<path d="M100 56 Q90 72 100 78 Q110 72 100 56 Z" fill="' + pal.main + '" ' + OUT + '/>';
    if (list.indexOf('shine') >= 0) out += '<path d="M66 100 Q70 84 84 78" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>';
    if (list.indexOf('moss') >= 0) out += '<path d="M' + f(head.x - r * 0.8) + ' ' + f(head.y - r * 0.6) + ' q 12 -14 24 -4 q 10 -12 22 -2 q 12 -10 24 2 q 10 -6 16 6" fill="' + pal.accent + '" ' + OUT + '/>';
    if (list.indexOf('crown') >= 0) {
      const y = head.y - r * 0.9;
      out += '<path d="M' + f(head.x - 24) + ' ' + f(y + 10) + ' L' + f(head.x - 26) + ' ' + f(y - 14) + ' L' + f(head.x - 12) + ' ' + f(y) + ' L' + head.x + ' ' + f(y - 20) + ' L' + f(head.x + 12) + ' ' + f(y) + ' L' + f(head.x + 26) + ' ' + f(y - 14) + ' L' + f(head.x + 24) + ' ' + f(y + 10) + ' Z" fill="#1a1024" ' + OUT + '/><circle cx="' + head.x + '" cy="' + f(y - 4) + '" r="4" fill="' + pal.eye + '"/>';
    }
    if (list.indexOf('thorns') >= 0) {
      for (const [x, y, s] of [[58, 130, -1], [142, 130, 1], [66, 160, -1], [134, 160, 1]]) out += '<path d="M' + x + ' ' + y + ' l ' + (s * 14) + ' -6 l ' + (-s * 10) + ' 12 Z" fill="#1a1024" ' + OUT + '/>';
    }
    if (list.indexOf('lantern') >= 0) {
      out += '<path d="M' + f(head.x) + ' ' + f(head.y - r) + ' q 0 -16 18 -22" stroke="' + INK + '" stroke-width="3" fill="none"/><circle cx="' + f(head.x + 22) + '" cy="' + f(head.y - r - 24) + '" r="9" fill="#d8b4fe" ' + OUT + ' class="glow"/>';
    }
    if (list.indexOf('clover') >= 0) {
      const x = 118, y = 132;
      out += [[0, -6], [6, 0], [0, 6], [-6, 0]].map(([dx, dy]) => '<circle cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="5.5" fill="' + pal.accent + '"/>').join('');
    }
    return out;
  }

  function flower(x, y, color) {
    let out = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      out += '<circle cx="' + f(x + Math.cos(a) * 5) + '" cy="' + f(y + Math.sin(a) * 5) + '" r="4.2" fill="' + color + '" stroke="' + INK + '" stroke-width="1.4"/>';
    }
    return out + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3" fill="#ffe066"/>';
  }

  // Neue Detail-Extras: Schnurrhaare, Reißzähne, Stirn-Edelstein, Haarbüschel, Brustfell, Gesichtsmarkierungen.
  function extrasDetail(list, body, pal, head) {
    let out = '';
    const r = head.r;
    if (list.indexOf('chestfluff') >= 0 && body.belly) {
      const b = body.belly;
      const top = b.cy - b.ry;
      let d = 'M' + f(b.cx - b.rx * 0.8) + ' ' + f(top + 4);
      for (let i = 0; i < 5; i++) {
        const x1 = b.cx - b.rx * 0.8 + (i + 0.5) * (b.rx * 1.6 / 5), x2 = b.cx - b.rx * 0.8 + (i + 1) * (b.rx * 1.6 / 5);
        d += ' L' + f(x1) + ' ' + f(top + 16) + ' L' + f(x2) + ' ' + f(top + 4);
      }
      out += '<path d="' + d + ' Q' + b.cx + ' ' + f(top - 10) + ' ' + f(b.cx - b.rx * 0.8) + ' ' + f(top + 4) + ' Z" fill="' + P().shade(pal.belly, -0.3) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    }
    if (list.indexOf('markings') >= 0) {
      for (const s of [-1, 1]) {
        const x = head.x + s * r * 0.82, y = head.y + r * 0.1;
        out += '<path d="M' + f(x) + ' ' + f(y - 7) + ' L' + f(x - s * 14) + ' ' + f(y - 2) + ' L' + f(x) + ' ' + f(y + 3) + ' Z M' + f(x) + ' ' + f(y + 6) + ' L' + f(x - s * 11) + ' ' + f(y + 10) + ' L' + f(x) + ' ' + f(y + 14) + ' Z" fill="' + pal.accent + '" opacity="0.9"/>';
      }
    }
    if (list.indexOf('whiskers') >= 0) {
      for (const s of [-1, 1]) {
        const x = head.x + s * r * 0.48, y = head.y + r * 0.4;
        for (const dy of [-5, 1, 7]) out += '<path d="M' + f(x) + ' ' + f(y + dy * 0.4) + ' Q' + f(x + s * 16) + ' ' + f(y + dy - 2) + ' ' + f(x + s * 30) + ' ' + f(y + dy * 1.4) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.75"/>';
      }
    }
    if (list.indexOf('fangs') >= 0) {
      const y = head.y + r * 0.42 + 2;
      for (const s of [-1, 1]) out += '<path d="M' + f(head.x + s * 4) + ' ' + f(y) + ' L' + f(head.x + s * 7) + ' ' + f(y + 7) + ' L' + f(head.x + s * 10) + ' ' + f(y) + ' Z" fill="#ffffff" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>';
    }
    if (list.indexOf('gem') >= 0) {
      const x = head.x, y = head.y - r * 0.5;
      out += '<path d="M' + x + ' ' + f(y - 9) + ' L' + f(x + 7) + ' ' + y + ' L' + x + ' ' + f(y + 9) + ' L' + f(x - 7) + ' ' + y + ' Z" fill="' + P().shade(pal.accent, -0.15) + '" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M' + x + ' ' + f(y - 9) + ' L' + f(x + 7) + ' ' + y + ' L' + x + ' ' + y + ' Z" fill="#ffffff" opacity="0.55"/>';
    }
    if (list.indexOf('tuft') >= 0) {
      const x = head.x, y = head.y - r * 0.95;
      out += '<path d="M' + f(x - 10) + ' ' + f(y + 8) + ' Q' + f(x - 14) + ' ' + f(y - 12) + ' ' + f(x - 2) + ' ' + f(y - 14) + ' Q' + f(x - 6) + ' ' + f(y - 2) + ' ' + f(x + 2) + ' ' + f(y) + ' Q' + f(x + 8) + ' ' + f(y - 16) + ' ' + f(x + 18) + ' ' + f(y - 8) + ' Q' + f(x + 10) + ' ' + f(y - 2) + ' ' + f(x + 10) + ' ' + f(y + 8) + ' Z" fill="' + pal.main + '" ' + OUT + '/>';
    }
    return out;
  }

  // Typ-Partikel rund um das Monster (Glut, Blasen, Blätter, Funken, Kiesel, Schattenwisch, Sterne).
  function aura(types) {
    const t = (types || [])[0];
    const pts = [[30, 120], [168, 104], [44, 70], [160, 150], [24, 160]];
    let out = '';
    pts.forEach(([x, y], i) => {
      const s = 0.7 + (i % 3) * 0.2;
      switch (t) {
        case 'glut': out += '<path d="M' + x + ' ' + f(y - 9 * s) + ' Q' + f(x + 6 * s) + ' ' + y + ' ' + x + ' ' + f(y + 5 * s) + ' Q' + f(x - 6 * s) + ' ' + y + ' ' + x + ' ' + f(y - 9 * s) + ' Z" fill="#ffb347" stroke="#ff7a3d" stroke-width="1.2"/>'; break;
        case 'flut': out += '<circle cx="' + x + '" cy="' + y + '" r="' + f(5 * s) + '" fill="#d9f0ff" fill-opacity="0.35" stroke="#7cc8ff" stroke-width="1.6"/><circle cx="' + f(x - 1.5 * s) + '" cy="' + f(y - 1.5 * s) + '" r="' + f(1.4 * s) + '" fill="#ffffff"/>'; break;
        case 'spross': out += '<path d="M' + f(x - 6 * s) + ' ' + y + ' Q' + x + ' ' + f(y - 9 * s) + ' ' + f(x + 6 * s) + ' ' + y + ' Q' + x + ' ' + f(y + 7 * s) + ' ' + f(x - 6 * s) + ' ' + y + ' Z" fill="#7bd66a" stroke="#2f7a3a" stroke-width="1.2" transform="rotate(' + (i * 47) + ' ' + x + ' ' + y + ')"/>'; break;
        case 'funke': out += '<path d="M' + f(x - 2) + ' ' + f(y - 8 * s) + ' L' + f(x + 4 * s) + ' ' + f(y - 1) + ' L' + x + ' ' + y + ' L' + f(x + 3) + ' ' + f(y + 8 * s) + ' L' + f(x - 4 * s) + ' ' + f(y + 1) + ' L' + x + ' ' + y + ' Z" fill="#fff07a" stroke="#e0a800" stroke-width="1"/>'; break;
        case 'stein': out += '<path d="M' + f(x - 5 * s) + ' ' + f(y + 3 * s) + ' L' + f(x - 3 * s) + ' ' + f(y - 4 * s) + ' L' + f(x + 4 * s) + ' ' + f(y - 5 * s) + ' L' + f(x + 6 * s) + ' ' + f(y + 2 * s) + ' Z" fill="#c9a27a" stroke="#6b4f33" stroke-width="1.2"/>'; break;
        case 'schatten': out += '<path d="M' + f(x - 7 * s) + ' ' + f(y + 4) + ' Q' + x + ' ' + f(y - 10 * s) + ' ' + f(x + 7 * s) + ' ' + f(y + 2) + ' Q' + x + ' ' + f(y - 2) + ' ' + f(x - 7 * s) + ' ' + f(y + 4) + ' Z" fill="#a78bfa" opacity="0.75"/>'; break;
        case 'stern': out += '<circle cx="' + x + '" cy="' + y + '" r="' + f(2.5 * s) + '" fill="#fff6b0"/>'; break;
        case 'frost': out += '<path d="M' + f(x - 5 * s) + ' ' + y + ' L' + f(x + 5 * s) + ' ' + y + ' M' + x + ' ' + f(y - 5 * s) + ' L' + x + ' ' + f(y + 5 * s) + ' M' + f(x - 3.5 * s) + ' ' + f(y - 3.5 * s) + ' L' + f(x + 3.5 * s) + ' ' + f(y + 3.5 * s) + ' M' + f(x + 3.5 * s) + ' ' + f(y - 3.5 * s) + ' L' + f(x - 3.5 * s) + ' ' + f(y + 3.5 * s) + '" stroke="#e0f2fe" stroke-width="1.6" stroke-linecap="round"/>'; break;
        case 'wind': out += '<path d="M' + f(x - 8 * s) + ' ' + y + ' Q' + x + ' ' + f(y - 6 * s) + ' ' + f(x + 6 * s) + ' ' + y + ' Q' + f(x + 9 * s) + ' ' + f(y + 4 * s) + ' ' + f(x + 3 * s) + ' ' + f(y + 4 * s) + '" stroke="#bbf7d0" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; break;
        case 'metall': out += '<circle cx="' + x + '" cy="' + y + '" r="' + f(4 * s) + '" fill="none" stroke="#cbd5e1" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + f(1.4 * s) + '" fill="#94a3b8"/>'; break;
      }
    });
    return out ? '<g class="aura" opacity="0.85">' + out + '</g>' : '';
  }

  function sparkles() {
    return [[38, 54, 1], [164, 70, 0.8], [150, 168, 0.65]].map(([x, y, s]) =>
      '<path class="sparkle" d="M' + x + ' ' + (y - 12 * s) + ' L' + f(x + 3 * s) + ' ' + f(y - 3 * s) + ' L' + f(x + 12 * s) + ' ' + y + ' L' + f(x + 3 * s) + ' ' + f(y + 3 * s) + ' L' + x + ' ' + f(y + 12 * s) + ' L' + f(x - 3 * s) + ' ' + f(y + 3 * s) + ' L' + f(x - 12 * s) + ' ' + y + ' L' + f(x - 3 * s) + ' ' + f(y - 3 * s) + ' Z" fill="#fff6b0" stroke="#e0a800" stroke-width="1.2"/>').join('');
  }

  function monsterFromSpec(art, opts) {
    opts = opts || {};
    const make = BODIES[art.body];
    if (!make) throw new Error('Unbekannte Körperform: ' + art.body);
    const pal = opts.shiny ? art.shinyPalette : art.palette;
    const id = 'mon' + (counter++) + '_';
    const body = make();
    const head = body.head;
    const extras = art.extras || [];
    let g = '';

    g += '<ellipse cx="100" cy="184" rx="52" ry="9" fill="#000000" opacity="0.18"/>';
    g += extrasBack(extras, body, pal, head);
    g += tail(art.tail, body.tailAt, pal);
    if (body.headIsBody) for (const s of [-1, 1]) g += ear(art.ears, head.x + s * head.r * 0.55, head.y - head.r * 0.72, s, pal, head);
    for (const leg of body.legs || []) g += '<rect x="' + (leg[0] - 9) + '" y="' + (leg[1] - 22) + '" width="18" height="30" rx="8" fill="' + P().shade(pal.main, 0.12) + '" ' + OUT + '/>';
    for (const arm of body.arms || []) g += '<ellipse cx="' + arm[0] + '" cy="' + arm[1] + '" rx="11" ry="17" fill="' + pal.main + '" ' + OUT + '/>';
    g += celShape(id, body.shape, pal.main, { pattern: pattern(art.pattern, body, pal) });
    if (body.belly) g += '<ellipse cx="' + body.belly.cx + '" cy="' + body.belly.cy + '" rx="' + body.belly.rx + '" ry="' + body.belly.ry + '" fill="' + pal.belly + '" opacity="0.95"/>';
    for (const ft of body.feet || []) g += '<ellipse cx="' + ft[0] + '" cy="' + ft[1] + '" rx="' + ft[2] + '" ry="' + ft[3] + '" fill="' + P().shade(pal.main, 0.12) + '" ' + OUT + '/>';
    if (!body.headIsBody) {
      // Kontaktschatten unter dem Kopf
      g += '<ellipse cx="' + head.x + '" cy="' + f(head.y + head.r * 0.92) + '" rx="' + f(head.r * 0.7) + '" ry="' + f(head.r * 0.22) + '" fill="' + P().shade(pal.main, 0.45) + '" opacity="0.45"/>';
      for (const s of [-1, 1]) g += ear(art.ears, head.x + s * head.r * 0.55, head.y - head.r * 0.72, s, pal, head);
      g += celShape(id, { type: 'ellipse', cx: head.x, cy: head.y, rx: head.r, ry: head.r * 0.94 }, pal.main, { sx: 7, sy: 8 });
    }
    g += extrasDetail(extras, body, pal, head);
    g += eyes(id, head, pal, 0);
    g += mouth(head, body.beak, pal);
    if (['round', 'blob', 'quad'].indexOf(art.body) >= 0 || extras.indexOf('cheeks') >= 0) g += cheeks(head);
    g += extrasFront(extras, body, pal, head);
    if (opts.aura !== false) g += aura(opts.types);
    if (opts.shiny) g += sparkles();

    const size = opts.size || 160;
    const flip = opts.facing === 'left' ? ' transform="translate(200 0) scale(-1 1)"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" class="mon-svg">' +
      '<g' + flip + '><g class="mon-idle">' + g + '</g></g></svg>';
  }

  L.art = L.art || {};
  L.art.monsterFromSpec = monsterFromSpec;
  L.art.monster = function (speciesId, opts) {
    const sp = L.registry.get('species', speciesId);
    return monsterFromSpec(sp.art, Object.assign({ types: sp.types }, opts));
  };
  L.art.silhouette = function (speciesId, opts) {
    return L.art.monster(speciesId, opts).replace(/fill="(?!none)[^"]+"/g, 'fill="#3b3350"').replace(/stroke="#[0-9a-fA-F]+"/g, 'stroke="#3b3350"').replace(/url\(#[^)]+\)/g, '#3b3350');
  };
})(globalThis.LUM);
