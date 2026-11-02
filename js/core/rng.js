// Zufall mit Seed (Mulberry32). Jede Zufallsentscheidung im Spiel läuft hierüber.
(function (L) {
  function hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function create(seed) {
    let state = (typeof seed === 'string' ? hashString(seed) : (seed >>> 0)) || 0x9e3779b9;

    const r = {
      next() {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int(min, max) { return min + Math.floor(r.next() * (max - min + 1)); },
      chance(p) { return r.next() < p; },
      pick(arr) { return arr[Math.floor(r.next() * arr.length)]; },
      weighted(arr, key) {
        key = key || 'weight';
        const get = typeof key === 'function' ? key : (x) => x[key];
        let total = 0;
        for (const x of arr) total += Math.max(0, get(x) || 0);
        if (total <= 0) return undefined;
        let roll = r.next() * total;
        for (const x of arr) {
          const w = Math.max(0, get(x) || 0);
          if (w === 0) continue;
          if (roll < w) return x;
          roll -= w;
        }
        for (let i = arr.length - 1; i >= 0; i--) if ((get(arr[i]) || 0) > 0) return arr[i];
      },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(r.next() * (i + 1));
          const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      },
      getState() { return state; },
      setState(n) { state = n >>> 0; },
    };
    return r;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  L.rng = {
    create,
    hashString,
    dailySeed(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); },
  };
})(globalThis.LUM);
