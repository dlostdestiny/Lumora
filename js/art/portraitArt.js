// Chibi-Porträts für Dialoge: großer Kopf, große Anime-Augen, Cel-Shading an Haar und Kleidung.
(function (L) {
  const INK = '#2b2238';
  let counter = 0;
  const f = (n) => Math.round(n * 10) / 10;
  const P = () => L.palette;
  const OUT = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  const HEAD = { x: 100, y: 102, r: 60 };

  function backHair(style, color) {
    const dark = P().shade(color, 0.2);
    switch (style) {
      case 'lang':
        return '<path d="M42 96 C34 150 40 196 56 214 L144 214 C160 196 166 150 158 96 Z" fill="' + dark + '" ' + OUT + '/>';
      case 'zopf':
        return '<path d="M44 100 C40 130 46 150 56 160 L144 160 C154 150 160 130 156 100 Z" fill="' + dark + '" ' + OUT + '/>' +
          '<path d="M150 112 C176 120 182 150 170 176 C164 190 172 204 166 212 C150 200 152 184 156 168 C160 150 152 134 146 128 Z" fill="' + color + '" ' + OUT + '/>' +
          '<circle cx="152" cy="122" r="7" fill="#e0566a" ' + OUT + '/>';
      case 'dutt':
        return '<circle cx="100" cy="36" r="24" fill="' + color + '" ' + OUT + '/><path d="M86 30 Q100 20 114 30" stroke="' + dark + '" stroke-width="3" fill="none"/>' +
          '<path d="M44 100 C42 128 48 146 58 152 L142 152 C152 146 158 128 156 100 Z" fill="' + dark + '" ' + OUT + '/>';
      case 'kapuze':
        return '<path d="M30 120 C26 50 70 26 100 26 C130 26 174 50 170 120 C172 160 160 190 150 214 L50 214 C40 190 28 160 30 120 Z" fill="' + color + '" ' + OUT + '/>';
      case 'stachelig':
      case 'kurz':
      default:
        return '<path d="M44 100 C42 124 48 140 56 146 L144 146 C152 140 158 124 156 100 Z" fill="' + dark + '" ' + OUT + '/>';
    }
  }

  function frontHair(style, color, id) {
    const dark = P().shade(color, 0.22);
    const light = P().shade(color, -0.35);
    let d;
    switch (style) {
      case 'stachelig':
        d = 'M38 104 L30 70 L52 74 L48 44 L72 58 L78 26 L96 50 L110 22 L120 50 L142 32 L140 62 L166 56 L156 82 L172 100 L150 96 C146 78 132 66 116 64 C112 80 96 86 84 76 C78 88 60 96 50 92 Z';
        break;
      case 'kapuze':
        d = 'M44 96 C44 60 72 44 100 44 C128 44 156 60 156 96 C140 80 124 76 112 82 C104 76 92 76 86 84 C72 78 58 84 44 96 Z';
        break;
      case 'lang':
        d = 'M40 110 C36 60 66 38 100 38 C134 38 164 60 160 110 C152 92 140 78 126 72 C120 86 104 90 94 80 C84 92 64 94 56 86 C50 92 44 100 40 110 Z';
        break;
      default:
        d = 'M40 106 C36 58 66 38 100 38 C134 38 164 58 160 106 C150 86 136 74 122 70 C118 84 102 88 92 78 C84 90 66 94 54 88 C48 94 44 100 40 106 Z';
    }
    const clip = id + 'h' + (counter++);
    return '<clipPath id="' + clip + '"><path d="' + d + '"/></clipPath>' +
      '<path d="' + d + '" fill="' + dark + '"/>' +
      '<g clip-path="url(#' + clip + ')"><path d="' + d + '" transform="translate(-6 -6)" fill="' + color + '"/>' +
      '<path d="M66 52 Q84 42 104 46" stroke="' + light + '" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/></g>' +
      '<path d="' + d + '" fill="none" ' + OUT + '/>';
  }

  function eyes(id, color, expr) {
    const y = HEAD.y + 14, ex = 25, rx = 13, ry = 17;
    let out = '';
    if (expr === 'froh') {
      for (const s of [-1, 1]) {
        const cx = HEAD.x + s * ex;
        out += '<path d="M' + (cx - rx) + ' ' + (y + 2) + ' Q' + cx + ' ' + (y - 14) + ' ' + (cx + rx) + ' ' + (y + 2) + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
      }
      return out;
    }
    const grad = id + 'e' + (counter++);
    out += '<defs><linearGradient id="' + grad + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P().shade(color, 0.45) + '"/><stop offset="0.6" stop-color="' + color + '"/><stop offset="1" stop-color="' + P().shade(color, -0.5) + '"/></linearGradient></defs>';
    const squint = expr === 'wuetend' || expr === 'ernst' ? 0.8 : 1;
    const pupil = expr === 'ueberrascht' ? 0.22 : 0.42;
    for (const s of [-1, 1]) {
      const cx = HEAD.x + s * ex;
      const ryy = ry * squint;
      out += '<ellipse cx="' + cx + '" cy="' + y + '" rx="' + rx + '" ry="' + f(ryy) + '" fill="#ffffff" stroke="' + INK + '" stroke-width="2.4"/>';
      out += '<ellipse cx="' + cx + '" cy="' + f(y + 1.5) + '" rx="' + f(rx * 0.84) + '" ry="' + f(ryy * 0.88) + '" fill="url(#' + grad + ')"/>';
      out += '<ellipse cx="' + cx + '" cy="' + f(y + 2) + '" rx="' + f(rx * pupil) + '" ry="' + f(ryy * pupil * 1.2) + '" fill="' + P().shade(color, 0.7) + '"/>';
      out += '<ellipse cx="' + f(cx - 4) + '" cy="' + f(y - ryy * 0.38) + '" rx="4.4" ry="3.6" fill="#ffffff"/>';
      out += '<circle cx="' + f(cx + 4.5) + '" cy="' + f(y + ryy * 0.42) + '" r="2" fill="#ffffff"/>';
      out += '<path d="M' + (cx - rx - 2) + ' ' + f(y - ryy * 0.5) + ' Q' + cx + ' ' + f(y - ryy * 1.4) + ' ' + (cx + rx + 2) + ' ' + f(y - ryy * 0.5) + ' L' + (cx + s * (rx + 5)) + ' ' + f(y - ryy * 0.8) + '" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
      if (expr === 'traurig') out += s === 1 ? '<path d="M' + (cx + 6) + ' ' + (y + 18) + ' q 3 8 0 12 q -4 -4 0 -12 Z" fill="#7cc8ff" stroke="' + INK + '" stroke-width="1.2"/>' : '';
    }
    return out;
  }

  function brows(expr, hairColor) {
    const y = HEAD.y - 14;
    const c = P().shade(hairColor, 0.3);
    const shapes = {
      neutral: [[-36, 0, -14, -2]], froh: [[-36, -4, -14, -6]], ernst: [[-36, -2, -14, 2]],
      traurig: [[-36, 2, -14, -6]], wuetend: [[-36, -6, -14, 4]], ueberrascht: [[-36, -10, -14, -12]],
    }[expr] || [[-36, 0, -14, -2]];
    let out = '';
    for (const [x1, y1, x2, y2] of shapes) {
      out += '<path d="M' + (HEAD.x + x1) + ' ' + (y + y1) + ' L' + (HEAD.x + x2) + ' ' + (y + y2) + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
      out += '<path d="M' + (HEAD.x - x1) + ' ' + (y + y1) + ' L' + (HEAD.x - x2) + ' ' + (y + y2) + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
    }
    return out;
  }

  function mouth(expr) {
    const x = HEAD.x, y = HEAD.y + 40;
    switch (expr) {
      case 'froh': return '<path d="M' + (x - 10) + ' ' + (y - 3) + ' Q' + x + ' ' + (y + 12) + ' ' + (x + 10) + ' ' + (y - 3) + ' Z" fill="#c2414b" ' + OUT + '/>';
      case 'ernst': return '<path d="M' + (x - 7) + ' ' + y + ' L' + (x + 7) + ' ' + y + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
      case 'traurig': return '<path d="M' + (x - 7) + ' ' + (y + 3) + ' Q' + x + ' ' + (y - 4) + ' ' + (x + 7) + ' ' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
      case 'wuetend': return '<path d="M' + (x - 9) + ' ' + (y + 4) + ' Q' + x + ' ' + (y - 6) + ' ' + (x + 9) + ' ' + (y + 4) + ' Z" fill="#c2414b" ' + OUT + '/>';
      case 'ueberrascht': return '<ellipse cx="' + x + '" cy="' + (y + 1) + '" rx="5" ry="7" fill="#c2414b" ' + OUT + '/>';
      default: return '<path d="M' + (x - 6) + ' ' + y + ' Q' + x + ' ' + (y + 5) + ' ' + (x + 6) + ' ' + y + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    }
  }

  function accessory(kind, p) {
    switch (kind) {
      case 'stirnband': return '<path d="M42 78 Q100 56 158 78 L156 88 Q100 68 44 88 Z" fill="' + P().shade(p.outfit, -0.2) + '" ' + OUT + '/><circle cx="100" cy="70" r="5" fill="#ffe066" ' + OUT + '/>';
      case 'blume': {
        let o = '';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          o += '<circle cx="' + f(148 + Math.cos(a) * 8) + '" cy="' + f(62 + Math.sin(a) * 8) + '" r="7" fill="#ff9ec4" ' + OUT + '/>';
        }
        return o + '<circle cx="148" cy="62" r="5" fill="#ffe066"/>';
      }
      case 'brille': return '<circle cx="75" cy="116" r="16" fill="none" stroke="' + INK + '" stroke-width="3"/><circle cx="125" cy="116" r="16" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M91 116 L109 116" stroke="' + INK + '" stroke-width="3"/>';
      case 'krone': return '<path d="M70 50 L66 22 L84 38 L100 14 L116 38 L134 22 L130 50 Z" fill="#1a1024" ' + OUT + '/><circle cx="100" cy="34" r="5" fill="#a21caf"/>';
      case 'schal': return '<path d="M58 168 Q100 186 142 168 L146 184 Q100 202 54 184 Z" fill="' + P().shade(p.outfit, -0.3) + '" ' + OUT + '/><path d="M120 184 l 6 30 l 14 -4 l -6 -28 Z" fill="' + P().shade(p.outfit, -0.3) + '" ' + OUT + '/>';
      default: return '';
    }
  }

  function portrait(characterId, expr, opts) {
    opts = opts || {};
    const c = L.registry.get('character', characterId);
    const p = c.portrait;
    if (!p) return '';
    expr = expr || 'neutral';
    const id = 'pt' + (counter++) + '_';
    let g = '';
    g += backHair(p.hair.style, p.hair.color);
    // Körper und Kleidung mit Cel-Schatten
    const bodyD = 'M50 220 C50 184 70 166 100 166 C130 166 150 184 150 220 Z';
    const clip = id + 'b';
    g += '<clipPath id="' + clip + '"><path d="' + bodyD + '"/></clipPath><path d="' + bodyD + '" fill="' + P().shade(p.outfit, 0.25) + '"/>' +
      '<g clip-path="url(#' + clip + ')"><path d="' + bodyD + '" transform="translate(-8 -4)" fill="' + p.outfit + '"/></g><path d="' + bodyD + '" fill="none" ' + OUT + '/>';
    g += '<path d="M84 166 L100 186 L116 166" fill="#ffffff" ' + OUT + '/>';
    // Hals und Kopf
    g += '<rect x="90" y="150" width="20" height="20" fill="' + P().shade(p.skin, 0.12) + '"/>';
    g += '<ellipse cx="42" cy="112" rx="8" ry="12" fill="' + p.skin + '" ' + OUT + '/><ellipse cx="158" cy="112" rx="8" ry="12" fill="' + p.skin + '" ' + OUT + '/>';
    const headD = 'M40 100 C40 60 66 42 100 42 C134 42 160 60 160 100 C160 136 134 160 100 160 C66 160 40 136 40 100 Z';
    const hclip = id + 'k';
    g += '<clipPath id="' + hclip + '"><path d="' + headD + '"/></clipPath><path d="' + headD + '" fill="' + P().shade(p.skin, 0.1) + '"/>' +
      '<g clip-path="url(#' + hclip + ')"><path d="' + headD + '" transform="translate(-6 -5)" fill="' + p.skin + '"/></g><path d="' + headD + '" fill="none" ' + OUT + '/>';
    g += '<ellipse cx="66" cy="136" rx="10" ry="6" fill="#ff7aa2" opacity="' + (expr === 'froh' || expr === 'ueberrascht' ? 0.55 : 0.35) + '"/><ellipse cx="134" cy="136" rx="10" ry="6" fill="#ff7aa2" opacity="' + (expr === 'froh' || expr === 'ueberrascht' ? 0.55 : 0.35) + '"/>';
    g += eyes(id, p.eyes, expr);
    g += mouth(expr);
    g += frontHair(p.hair.style, p.hair.color, id);
    g += brows(expr, p.hair.color);
    g += accessory(p.accessory, p);
    if (expr === 'wuetend') g += '<path d="M150 50 l 8 -4 m -4 -4 l 4 8 m 6 2 l 8 -4 m -4 -4 l 4 8" stroke="#e0566a" stroke-width="3" stroke-linecap="round"/>';
    if (expr === 'ueberrascht') g += '<path d="M150 44 l 4 -12 M160 50 l 10 -8 M164 62 l 12 -2" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    const size = opts.size || 220;
    const flip = opts.facing === 'left' ? ' transform="translate(200 0) scale(-1 1)"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="' + size + '" height="' + f(size * 1.1) + '" class="portrait-svg"><g' + flip + '>' + g + '</g></svg>';
  }

  L.art = L.art || {};
  L.art.portrait = portrait;
})(globalThis.LUM);
