// Werteberechnung (Spezifikation 3.2).
(function (L) {
  const KEYS = ['hp', 'atk', 'def', 'spe'];
  L.stats = {
    KEYS,
    calc(species, level, natureId, traitId) {
      const nature = natureId ? L.registry.get('nature', natureId) : null;
      const trait = traitId ? L.registry.get('trait', traitId) : null;
      const out = {};
      for (const k of KEYS) {
        const b = species.base[k];
        let v = Math.floor(b * level / 25) + (k === 'hp' ? level + 10 : 5);
        if (nature && nature.up === k) v = Math.floor(v * 1.1);
        if (nature && nature.down === k) v = Math.floor(v * 0.9);
        if (trait && trait.statMods && trait.statMods[k]) v = Math.floor(v * trait.statMods[k]);
        out[k] = v;
      }
      return out;
    },
    stageMult(stage) { return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage); },
  };
})(globalThis.LUM);
