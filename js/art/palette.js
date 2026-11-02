// Farb-Hilfen für die Grafik.
(function (L) {
  function parse(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function toHex(rgb) {
    return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  L.palette = {
    INK: '#2b2238',
    // amount > 0 verdunkelt, amount < 0 hellt auf (Anteil 0–1).
    shade(hex, amount) {
      const c = parse(hex);
      if (amount >= 0) return toHex(c.map((v) => v * (1 - amount)));
      return toHex(c.map((v) => v + (255 - v) * -amount));
    },
    mix(a, b, t) {
      const x = parse(a), y = parse(b);
      return toHex(x.map((v, i) => v + (y[i] - v) * t));
    },
    typeColor(typeId) { return typeId ? L.registry.get('type', typeId).color : '#a8a29e'; },
  };
})(globalThis.LUM);
