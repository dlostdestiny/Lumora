(function (L) {
  L.config = {
    teamSize: 4,
    maxLevel: 50,
    shinyChance: 0.01,
    pochiChance: 0.005,
    traitChance: 0.35,
    // Balance (per tests/sim.js abgestimmt)
    expDivisor: 2.5,
    postBattleHeal: 0.25,
    eliteAffixFromLayer: 6,
    rivalLevelBonus: 0,
    eliteLevelBonus: 1,
    benchExpShare: 0.75,
    bossLevelBonus: 0,
    weatherZoneChance: 0.5,
    // Einzigartige Monster (legend) erscheinen stärker als normale Gegner
    legendLevelBonus: 5,
    arenaChance: 0.6,
    hiddenAbilityChance: 0.06,
    ghostChance: 0.25,
    arenaRounds: 3,
    // Elite-Doppelkampf (2 gegen 2): Chance je Akt, dass ein Elite-Knoten zum Doppel wird; Bonus-Gold
    doubleEliteChance: 0.45,
    doubleEliteGold: 1.5,
    // Sicherung gegen Endlos-Kämpfe: ab dieser Runde Erschöpfung – beide Seiten verlieren je Runde
    // (Runde - exhaustionTurn + 1) × exhaustionStep ihrer max. KP
    exhaustionTurn: 100,
    exhaustionStep: 0.05,
    // Kampf-Tempo (Knopf im Kampf schaltet weiter)
    speeds: [1, 2, 4],
  };
  L.config.nextSpeed = (s) => {
    const list = L.config.speeds;
    const i = list.indexOf(s);
    return i < 0 ? list[0] : list[(i + 1) % list.length];
  };
})(globalThis.LUM);
