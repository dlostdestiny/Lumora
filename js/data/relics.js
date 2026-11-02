// Relikte: passive Boni für den ganzen Lauf. Hooks gelten für das aktive Monster des Spielers
// bzw. (modifyExp, modifyGold, …) für das ganze Team.
(function (L) {
  const R = (def) => L.def.relic(def);

  R({ id: 'doppelband', name: 'Doppelband', icon: '🎀', rarity: 'rare', desc: 'Bindung wächst doppelt so schnell.', hooks: { modifyBondGain: (v) => v * 2 } });
  R({ id: 'wanderkompass', name: 'Kompass des Wanderers', icon: '🧭', rarity: 'common', desc: 'Zeigt auf der Karte, was in Ereignissen wartet.', reveal: true, hooks: {} });
  R({ id: 'gluecksklee', name: 'Glücksklee', icon: '🍀', rarity: 'common', desc: 'Gold +25 %.', hooks: { modifyGold: (v) => v * 1.25 } });
  R({ id: 'fangnetz', name: 'Fangnetz', icon: '🥅', rarity: 'common', desc: 'Fangchance +20 %.', hooks: { modifyCatchRate: (v) => v * 1.2 } });
  R({ id: 'heilmoos', name: 'Heilmoos', icon: '🌱', rarity: 'common', desc: 'Nach jedem Kampf heilt das Team 5 %.', hooks: { modifyHealAfterBattle: (v) => v + 0.05 } });
  R({ id: 'wetterfahne', name: 'Wetterfahne', icon: '🌀', rarity: 'common', desc: 'Selbst gerufenes Wetter hält 8 Runden.', hooks: { modifyWeatherTurns: () => 8 } });
  R({ id: 'schaerfstein', name: 'Schärfstein', icon: '🔪', rarity: 'rare', desc: 'Volltreffer-Stufe +1.', hooks: { modifyCritStage: (v, c) => (c.defending ? v : v + 1) } });
  R({
    id: 'schutzamulett', name: 'Schutzamulett', icon: '🧿', rarity: 'common', desc: 'Der erste Treffer in jedem Kampf macht nur halben Schaden.',
    hooks: {
      modifyIncomingDamage: (v, c) => {
        const k = 'amulett_' + c.side;
        if (c.battle.flags[k]) return v;
        c.battle.flags[k] = true;
        return v * 0.5;
      },
    },
  });
  R({ id: 'ersthelfer', name: 'Ersthelfer-Tasche', icon: '🩹', rarity: 'common', desc: 'Einwechseln heilt 10 % KP.',
    hooks: { onSwitchIn: (c) => { if (c.mon.hp > 0 && c.mon.hp < L.mon.maxHp(c.mon)) c.api.heal(c.side, 0.1); } } });
  R({ id: 'lehrbuch', name: 'Lehrbuch', icon: '📘', rarity: 'common', desc: 'EP +25 %.', hooks: { modifyExp: (v) => v * 1.25 } });
  R({ id: 'federleicht', name: 'Federleicht', icon: '🪽', rarity: 'common', desc: 'Tempo +10 %.', hooks: { modifyStat: (v, c) => (c.stat === 'spe' ? v * 1.1 : v) } });
  R({ id: 'typprisma', name: 'Typprisma', icon: '🔷', rarity: 'rare', desc: 'Sehr effektive Treffer machen 10 % mehr Schaden.',
    hooks: { modifyDamage: (v, c) => (c.effectiveness >= 2 ? v * 1.1 : v) } });
  R({ id: 'sternenstaub', name: 'Sternenstaub', icon: '✨', rarity: 'rare', desc: 'Schimmer-Monster erscheinen doppelt so oft.', shinyFactor: 2, hooks: {} });
  R({ id: 'waldfloete', name: 'Waldflöte', icon: '🪈', rarity: 'rare', desc: 'Wilde Monster tragen häufiger Merkmale.', traitFactor: 2, hooks: {} });

  // Teile von Relikt-Sets (js/data/relicsets.js). unlock = erst nach Kauf im Kristall-Shop im Spiel.
  R({ id: 'rindenschild', name: 'Rindenschild', icon: '🪵', rarity: 'common', desc: 'Verteidigung +10 %.', hooks: { modifyStat: (v, c) => (c.stat === 'def' ? v * 1.1 : v) } });
  R({ id: 'jagdhorn', name: 'Jagdhorn', icon: '📯', rarity: 'common', unlock: 'set_jaeger', desc: 'Gegen wilde Monster +15 % Schaden.', hooks: { modifyDamage: (v, c) => (c.battle && c.battle.kind === 'wild' ? v * 1.15 : v) } });
  R({ id: 'sternkarte', name: 'Sternkarte', icon: '🗺️', rarity: 'common', unlock: 'set_sterne', desc: '+1 Kristall nach jedem Kampf.', hooks: { modifyCrystals: (v) => v + 1 } });
  R({ id: 'koederbeutel', name: 'Köderbeutel', icon: '🧺', rarity: 'common', unlock: 'set_faenger', desc: 'Fangchance +15 %.', hooks: { modifyCatchRate: (v) => v * 1.15 } });
  R({ id: 'mondsichel', name: 'Mondsichel', icon: '🌙', rarity: 'rare', unlock: 'set_mond', desc: 'Schatten- und Stern-Attacken +15 %.', hooks: { modifyDamage: (v, c) => (c.move && (c.move.type === 'schatten' || c.move.type === 'stern') ? v * 1.15 : v) } });
  R({ id: 'nachtauge', name: 'Nachtauge', icon: '👁️', rarity: 'common', unlock: 'set_mond', desc: 'Genauigkeit +10 %.', hooks: { modifyAccuracy: (v) => v * 1.1 } });

  // Relikte, die es in diesem Lauf geben kann (ohne schon besessene und ohne nicht freigeschaltete).
  L.relics = {
    available(run, exclude) {
      const unlocks = run.unlocks || [];
      return L.registry.all('relic').filter((r) => run.relics.indexOf(r.id) < 0 && (!exclude || exclude.indexOf(r.id) < 0) && (!r.unlock || unlocks.indexOf(r.unlock) >= 0));
    },
  };

  L.registry.addValidator('relic', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
