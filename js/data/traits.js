// Merkmale: zufällige Besonderheiten einzelner Monster (Spezifikation 7a).
// Hook-Signatur: modify*(wert, ctx) mit ctx = { battle, side, mon, foe, move, ... }
(function (L) {
  L.def.trait({ id: 'riesig', name: 'Riesig', rarity: 'common', desc: 'KP +15 %, Tempo −10 %.', statMods: { hp: 1.15, spe: 0.9 } });
  L.def.trait({ id: 'winzig', name: 'Winzig', rarity: 'common', desc: 'Wird 10 % seltener getroffen.',
    hooks: { modifyEvasion: (v) => v * 0.9 } });
  L.def.trait({ id: 'flink', name: 'Flink', rarity: 'common', desc: 'Tempo +10 %.', statMods: { spe: 1.1 } });
  L.def.trait({ id: 'zaeh', name: 'Zäh', rarity: 'common', desc: 'Verteidigung +10 %.', statMods: { def: 1.1 } });
  L.def.trait({ id: 'ungestuem', name: 'Ungestüm', rarity: 'common', desc: 'Angriff +10 %.', statMods: { atk: 1.1 } });
  L.def.trait({ id: 'vernarbt', name: 'Vernarbt', rarity: 'rare', desc: 'Angriff +15 %, Bindung wächst halb so schnell.', statMods: { atk: 1.15 }, bondRate: 0.5 });
  L.def.trait({ id: 'sternaeugig', name: 'Sternäugig', rarity: 'rare', desc: 'Volltreffer-Stufe +1.',
    hooks: { modifyCritStage: (v, c) => (c.defending ? v : v + 1) } });
  L.def.trait({ id: 'sanft', name: 'Sanft', rarity: 'rare', desc: 'Bindung wächst doppelt so schnell.', bondRate: 2 });
  L.def.trait({ id: 'uralt', name: 'Uralt', rarity: 'veryRare', desc: 'Kennt eine uralte, seltene Attacke.', extraMove: true });
  L.def.trait({ id: 'strahlend', name: 'Strahlend', rarity: 'veryRare', desc: 'Alle Werte +5 %.', statMods: { hp: 1.05, atk: 1.05, def: 1.05, spe: 1.05 } });

  L.registry.addValidator('trait', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
