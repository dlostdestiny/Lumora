// Speichern im Browser (localStorage). Ohne Speicher läuft das Spiel mit einem Zwischenspeicher weiter.
(function (L) {
  const KEY_META = 'lumora_meta', KEY_RUN = 'lumora_run', KEY_BACKUP = 'lumora_backup';
  const VERSION = 1;
  let storage;
  let storageResolved = false;
  const memory = {};

  function resolveStorage() {
    if (storageResolved) return storage;
    storageResolved = true;
    try { storage = globalThis.localStorage || null; } catch (e) { storage = null; }
    if (!storage) save.available = false;
    return storage;
  }
  function get(k) {
    const s = resolveStorage();
    if (s) {
      try { return s.getItem(k); } catch (e) { save.available = false; }
    }
    return k in memory ? memory[k] : null;
  }
  function set(k, v) {
    memory[k] = v;
    const s = resolveStorage();
    if (s) {
      try { s.setItem(k, v); } catch (e) { save.available = false; }
    }
  }
  function remove(k) {
    delete memory[k];
    const s = resolveStorage();
    if (s) {
      try { s.removeItem(k); } catch (e) { save.available = false; }
    }
  }

  function freshMeta() {
    return {
      version: VERSION, runs: 0, crystals: 0, totalCrystals: 0,
      dex: {}, scenesSeen: [], bossesDefeated: [], flags: {}, fragments: [],
      stats: { victories: 0, bestAct: 0 }, notices: [], settings: L.settings.defaults(),
      echoUnlocked: 1, echoBest: -1,
      achievements: {}, titles: [], title: '', tipsSeen: {}, chronicle: [], unlocks: {}, frame: '', daily: {}, rankXp: 0, talents: {}, mastery: {}, eggs: [], hort: [],
    };
  }

  // Prüft Form und Version eines geladenen Meta-Objekts und füllt fehlende Werte auf. Wirft bei Unsinn.
  function normalize(meta) {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error('kein Objekt');
    let v = meta.version || 0;
    if (v < 0 || v > VERSION || Math.floor(v) !== v) throw new Error('unbekannte Version ' + v);
    while (v < VERSION) {
      meta = save.migrations[v](meta);
      v = meta.version;
    }
    const fresh = freshMeta();
    for (const k of Object.keys(fresh)) {
      if (meta[k] === undefined) continue;
      const want = Array.isArray(fresh[k]) ? 'array' : typeof fresh[k];
      const got = meta[k] === null ? 'null' : Array.isArray(meta[k]) ? 'array' : typeof meta[k];
      if (want !== got) throw new Error('falsches Feld ' + k);
    }
    const out = Object.assign(fresh, meta);
    out.settings = Object.assign(L.settings.defaults(), meta.settings || {});
    return out;
  }

  // Text-Code für Export/Import (Base64 aus UTF-8-JSON).
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function fromBase64(code) {
    const bin = atob(code);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  const save = {
    available: true,
    VERSION,
    setStorage(s) {
      storage = s;
      storageResolved = true;
      save.available = !!s;
      for (const k of Object.keys(memory)) delete memory[k];
    },
    freshMeta,
    migrations: {
      0: (m) => Object.assign(freshMeta(), m, { version: 1 }),
    },
    loadMeta() {
      const raw = get(KEY_META);
      if (!raw) return freshMeta();
      let meta;
      try {
        meta = JSON.parse(raw);
        if (!meta || typeof meta !== 'object') throw new Error('kein Objekt');
      } catch (e) {
        set(KEY_BACKUP, raw);
        const fresh = freshMeta();
        fresh.notices.push('save_corrupt');
        return fresh;
      }
      try {
        return normalize(meta);
      } catch (e) {
        set(KEY_BACKUP, raw);
        const fresh = freshMeta();
        fresh.notices.push('save_corrupt');
        return fresh;
      }
    },
    saveMeta(meta) { set(KEY_META, JSON.stringify(meta)); },
    saveRun(run) { set(KEY_RUN, JSON.stringify(run)); },
    loadRun() {
      const raw = get(KEY_RUN);
      if (!raw) return null;
      try {
        const run = JSON.parse(raw);
        return run && run.version === 1 && run.map ? run : null;
      } catch (e) {
        set(KEY_BACKUP + '_run', raw);
        return null;
      }
    },
    clearRun() { remove(KEY_RUN); },
    clearAll() { remove(KEY_META); remove(KEY_RUN); },
    exportCode(meta, run) {
      return 'LUMORA1:' + toBase64(JSON.stringify({ meta, run: run || null }));
    },
    // Gibt { meta, run } zurück oder wirft, wenn der Code kaputt ist.
    importCode(code) {
      try {
        const text = String(code).trim();
        if (text.indexOf('LUMORA1:') !== 0) throw new Error('Präfix fehlt');
        const data = JSON.parse(fromBase64(text.slice(8)));
        const run = data.run && data.run.version === 1 && data.run.map ? data.run : null;
        return { meta: normalize(data.meta), run };
      } catch (e) {
        throw new Error('Ungültiger Code: ' + e.message);
      }
    },
  };

  L.save = save;
})(globalThis.LUM);
