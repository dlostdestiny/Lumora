// Echo-Stufen: freiwillige Schwierigkeit mit mehr Belohnung. Jede Stufe behält die Regeln der vorigen.
// mods überschreiben die Werte der vorigen Stufe (Belohnungs-Faktoren sind absolut, nicht addiert).
(function (L) {
  const E = (def) => L.def.echo(def);
  E({ level: 0, id: 'echo0', name: 'Normal', icon: '🌙', rule: 'Das ganz normale Abenteuer.', reward: '–', mods: {} });
  E({ level: 1, id: 'echo1', name: 'Echo I', icon: '🌒', rule: 'Alle Gegner sind 1 Level stärker.', reward: '💎 +25 % Kristalle', mods: { enemyLevel: 1, crystalMult: 1.25 } });
  E({ level: 2, id: 'echo2', name: 'Echo II', icon: '🌓', rule: 'Quellen heilen nur noch 60 %.', reward: '💎 +50 % Kristalle, 4 Belohnungen zur Auswahl', mods: { springHeal: 0.6, crystalMult: 1.5, extraRewards: 1 } });
  E({ level: 3, id: 'echo3', name: 'Echo III', icon: '🌔', rule: 'Eliten haben immer ein Affix, der Boss bekommt auch eins.', reward: '💎 +75 % Kristalle, ✨ Schimmer ×1,5', mods: { eliteAffixAlways: true, bossAffix: true, crystalMult: 1.75, shinyMult: 1.5 } });
  E({ level: 4, id: 'echo4', name: 'Echo IV', icon: '🌕', rule: '1 Fangkugel und 1 Heiltrank weniger am Start, Shop 25 % teurer.', reward: '💎 +100 % Kristalle, 🪙 +25 % Gold', mods: { startItemsMinus: 1, shopPriceMult: 1.25, crystalMult: 2, goldMult: 1.25 } });
  E({ level: 5, id: 'echo5', name: 'Albtraum', icon: '🌑', rule: 'Nach Kämpfen gibt es keine Heilung mehr.', reward: '💎 +150 % Kristalle, ✨ Schimmer ×2, seltenes Relikt am Start', mods: { postBattleHeal: 0, crystalMult: 2.5, shinyMult: 2, startRareRelic: true } });

  const BASE = {
    enemyLevel: 0, springHeal: 1, extraRewards: 0, eliteAffixAlways: false, bossAffix: false,
    startItemsMinus: 0, shopPriceMult: 1, postBattleHeal: null, crystalMult: 1, goldMult: 1, shinyMult: 1, startRareRelic: false,
  };

  L.echo = {
    max() { return L.registry.all('echo').reduce((m, e) => Math.max(m, e.level), 0); },
    // Gesammelte Regeln bis einschließlich dieser Stufe.
    mods(level) {
      const out = Object.assign({}, BASE);
      for (const e of L.registry.all('echo').slice().sort((a, b) => a.level - b.level)) {
        if (e.level <= (level || 0)) Object.assign(out, e.mods);
      }
      return out;
    },
    of(run) { return L.echo.mods(run ? run.echo || 0 : 0); },
  };

  L.registry.addValidator('echo', (def) => Object.keys(def.mods).filter((k) => !(k in BASE)).map((k) => 'unbekannte Regel ' + k));
})(globalThis.LUM);
