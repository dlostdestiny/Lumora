// Zentrale Ablage aller Inhalte (Monster, Attacken, Akte …). Inhalte melden sich hier an.
(function (L) {
  const store = {};
  const validators = {};

  const registry = {
    add(kind, def) {
      if (!def || !def.id) throw new Error('Registry: Eintrag ohne id in ' + kind);
      const m = store[kind] || (store[kind] = new Map());
      if (m.has(def.id)) throw new Error('Registry: doppelte id ' + kind + '/' + def.id);
      m.set(def.id, def);
      return def;
    },
    get(kind, id) {
      const m = store[kind];
      if (!m || !m.has(id)) throw new Error('Unbekannt: ' + kind + '/' + id);
      return m.get(id);
    },
    has(kind, id) { return !!(store[kind] && store[kind].has(id)); },
    all(kind) { return store[kind] ? Array.from(store[kind].values()) : []; },
    addValidator(kind, fn) { (validators[kind] || (validators[kind] = [])).push(fn); },
    validate() {
      const errors = [];
      for (const kind of Object.keys(validators)) {
        for (const def of registry.all(kind)) {
          for (const fn of validators[kind]) {
            try {
              for (const e of fn(def, registry) || []) errors.push(kind + '/' + def.id + ': ' + e);
            } catch (e) {
              errors.push(kind + '/' + def.id + ': Validator-Fehler ' + e.message);
            }
          }
        }
      }
      return errors;
    },
  };

  L.registry = registry;
  L.def = {};
  ['type', 'nature', 'trait', 'status', 'weather', 'ability', 'move', 'species', 'item', 'relic',
    'blessing', 'affix', 'resonance', 'character', 'trainer', 'scene', 'event', 'act', 'echo', 'achievement', 'tip', 'relicSet', 'curse', 'unlock', 'quest', 'dailyRule', 'talent', 'mode', 'path'].forEach((kind) => {
    L.def[kind] = (def) => registry.add(kind, def);
  });
})(globalThis.LUM);
