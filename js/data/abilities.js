// Fähigkeiten: eine passive Fähigkeit pro Art.
// hooks gelten, solange das Monster aktiv kämpft. teamHooks gelten, solange es im Team ist (z. B. Belohnungen).
(function (L) {
  const maxHp = (m) => L.mon.maxHp(m);
  const typeHeart = (type) => ({
    modifyDamage: (v, c) => (c.move && c.move.type === type && c.mon.hp < maxHp(c.mon) / 3 ? v * 1.5 : v),
  });

  const list = [
    { id: 'glutherz', name: 'Glutherz', desc: 'Bei weniger als 1/3 KP sind Glut-Attacken 50 % stärker.', hooks: typeHeart('glut') },
    { id: 'flutherz', name: 'Flutherz', desc: 'Bei weniger als 1/3 KP sind Flut-Attacken 50 % stärker. Sehr effektive Treffer gegen es machen 40 % weniger Schaden.',
      hooks: Object.assign({}, typeHeart('flut'), { modifyIncomingDamage: (v, c) => (c.effectiveness >= 2 ? v * 0.6 : v) }) },
    { id: 'funkenherz', name: 'Funkenherz', desc: 'Bei weniger als 1/3 KP sind Funke-Attacken 50 % stärker. Eigene Attacken lähmen 15 % häufiger.',
      hooks: Object.assign({}, typeHeart('funke'), { modifyStatusChance: (v, c) => (c.status === 'laehmung' ? v + 0.15 : v) }) },
    { id: 'steinherz', name: 'Steinherz', desc: 'Bei weniger als 1/3 KP sind Stein-Attacken 50 % stärker. Erleidet keine Volltreffer.',
      hooks: Object.assign({}, typeHeart('stein'), { modifyCritStage: (v, c) => (c.defending ? -99 : v) }) },
    { id: 'schattenherz', name: 'Schattenherz', desc: 'Bei weniger als 1/3 KP sind Schatten-Attacken 50 % stärker. Volltreffer-Stufe +1.',
      hooks: Object.assign({}, typeHeart('schatten'), { modifyCritStage: (v, c) => (c.defending ? v : v + 1) }) },
    { id: 'sprossherz', name: 'Sprossherz', desc: 'Bei weniger als 1/3 KP sind Spross-Attacken 50 % stärker.', hooks: typeHeart('spross') },
    {
      id: 'summflug', name: 'Summflug', desc: 'Tempo +1 Stufe beim Einwechseln.',
      hooks: { onSwitchIn: (c) => c.api.stage(c.side, 'spe', 1) },
    },
    {
      id: 'panzerschale', name: 'Panzerschale', desc: 'Kann keine Volltreffer erleiden.',
      hooks: { modifyCritStage: (v, c) => (c.defending ? -99 : v) },
    },
    {
      id: 'sporenwolke', name: 'Sporenwolke', desc: 'Wer es mit Kontakt trifft, schläft zu 30 % ein.',
      hooks: {
        onHit: (c) => {
          if (c.move && c.move.contact && c.attacker.hp > 0 && c.rng.chance(0.3)) c.api.inflict(c.attackerSide, 'schlaf');
        },
      },
    },
    {
      id: 'schleimhaut', name: 'Schleimhaut', desc: 'Heilt jede Runde 1/16 seiner KP.',
      hooks: { onTurnEnd: (c) => { if (c.mon.hp < maxHp(c.mon)) c.api.heal(c.side, 1 / 16); } },
    },
    {
      id: 'nachtauge', name: 'Nachtauge', desc: 'Genauigkeit kann nicht gesenkt werden. Nachts Angriff ×1,2.', blockAccDrop: true,
      hooks: { modifyStat: (v, c) => (c.stat === 'atk' && L.clock.isNight(c.battle.now || L.clock.now()) ? v * 1.2 : v) },
    },
    {
      id: 'wirbelwind', name: 'Wirbelwind', desc: 'Die erste Attacke nach dem Einwechseln hat Priorität +1.',
      hooks: { modifyPriority: (v, c) => (c.battle.sides[c.side].volatile.movesUsed ? v : v + 1) },
    },
    {
      id: 'nebelhauch', name: 'Nebelhauch', desc: 'Ruft beim Einwechseln Nebel, wenn kein Wetter herrscht.',
      hooks: { onSwitchIn: (c) => { if (!c.battle.weather) c.api.setWeather('nebel', c.side); } },
    },
    {
      id: 'gluehlicht', name: 'Glühlicht', desc: 'Eigene Attacken verbrennen 20 % häufiger.',
      hooks: { modifyStatusChance: (v, c) => (c.status === 'brand' ? v + 0.2 : v) },
    },
    {
      id: 'felsenfest', name: 'Felsenfest', desc: 'Übersteht einen Treffer bei vollen KP mit 1 KP.',
      hooks: { modifySurvive: (v, c) => v || c.hpBefore === c.maxHp },
    },
    {
      id: 'irrlicht', name: 'Irrlicht', desc: 'Status-Attacken des Gegners werden zurückgeworfen.',
      hooks: { onStatusInflict: (c) => (c.move && c.move.power === 0 ? { reflect: true } : null) },
    },
    {
      id: 'glueckspfote', name: 'Glückspfote', desc: 'Verdoppelt Gold und Kristalle nach dem Kampf, solange es im Team ist.',
      hooks: {},
      teamHooks: { modifyGold: (v) => v * 2, modifyCrystals: (v) => v * 2 },
    },
    {
      id: 'dornenkrone', name: 'Dornenkrone', desc: 'Wer es mit Kontakt trifft, verliert 1/12 seiner KP.',
      hooks: {
        onHit: (c) => {
          if (c.move && c.move.contact && c.attacker.hp > 0) c.api.damage(c.attackerSide, maxHp(c.attacker) / 12, 'ability');
        },
      },
    },
    // --- Akt 2 ---
    { id: 'aschenkleid', name: 'Aschenkleid', desc: 'Glut-Attacken machen ihm 50 % weniger Schaden.',
      hooks: { modifyIncomingDamage: (v, c) => (c.move && c.move.type === 'glut' ? v * 0.5 : v) } },
    { id: 'magmahaut', name: 'Magmahaut', desc: 'Wer es mit Kontakt trifft, wird zu 30 % verbrannt.',
      hooks: { onHit: (c) => { if (c.move && c.move.contact && c.attacker.hp > 0 && c.rng.chance(0.3)) c.api.inflict(c.attackerSide, 'brand'); } } },
    { id: 'kristallkern', name: 'Kristallkern', desc: 'Verteidigung +1 Stufe beim Einwechseln.',
      hooks: { onSwitchIn: (c) => c.api.stage(c.side, 'def', 1) } },
    { id: 'russschleier', name: 'Rußschleier', desc: 'Senkt beim Einwechseln die Genauigkeit des Gegners um 1 Stufe.',
      hooks: { onSwitchIn: (c) => { if (c.foe && c.foe.hp > 0) c.api.stage(1 - c.side, 'acc', -1); } } },
    { id: 'hitzeschub', name: 'Hitzeschub', desc: 'Bei Glutregen Tempo ×1,5.',
      hooks: { modifyStat: (v, c) => (c.stat === 'spe' && c.battle.weather && c.battle.weather.id === 'glutregen' ? v * 1.5 : v) } },
    { id: 'geysirkraft', name: 'Geysirkraft', desc: 'Bei Strömung heilt es jede Runde 1/10 seiner KP.',
      hooks: { onTurnEnd: (c) => { if (c.battle.weather && c.battle.weather.id === 'stroemung' && c.mon.hp < maxHp(c.mon)) c.api.heal(c.side, 0.1); } } },
    { id: 'schmiedeherz', name: 'Schmiedeherz', desc: 'Glut- und Stein-Attacken sind 10 % stärker.',
      hooks: { modifyDamage: (v, c) => (c.move && (c.move.type === 'glut' || c.move.type === 'stein') ? v * 1.1 : v) } },
    { id: 'spiegelkern', name: 'Spiegelkern', desc: 'Übernimmt beim Einwechseln die Typen des Gegners.',
      hooks: { onSwitchIn: (c) => { if (c.foe) { c.mon._types = L.registry.get('species', c.foe.species).types.slice(); c.api.text(L.registry.get('species', c.mon.species).name + ' spiegelt den Gegner!'); } } } },
    { id: 'wiedergeburt', name: 'Wiedergeburt', desc: 'Einmal pro Lauf übersteht es einen K.-o.-Treffer und heilt sich danach um die Hälfte.',
      hooks: {
        modifySurvive: (v, c) => { if (v || c.mon.reborn) return v; c.mon.reborn = 'jetzt'; return true; },
        onHit: (c) => { if (c.mon.reborn === 'jetzt') { c.mon.reborn = true; c.api.heal(c.side, 0.5); c.api.text('Ein Sonnenfeuer lodert auf! ' + L.registry.get('species', c.mon.species).name + ' steht wieder auf!'); } },
      } },
    // --- Akt 3 ---
    { id: 'sturmfeder', name: 'Sturmfeder', desc: 'Bei Sturm Tempo ×1,5.',
      hooks: { modifyStat: (v, c) => (c.stat === 'spe' && c.battle.weather && c.battle.weather.id === 'sturm' ? v * 1.5 : v) } },
    { id: 'gewitterwolle', name: 'Gewitterwolle', desc: 'Wer es mit Kontakt trifft, wird zu 30 % gelähmt.',
      hooks: { onHit: (c) => { if (c.move && c.move.contact && c.attacker.hp > 0 && c.rng.chance(0.3)) c.api.inflict(c.attackerSide, 'laehmung'); } } },
    { id: 'rabenblick', name: 'Rabenblick', desc: 'Volltreffer-Stufe +1.',
      hooks: { modifyCritStage: (v, c) => (c.defending ? v : v + 1) } },
    { id: 'gipfelmut', name: 'Gipfelmut', desc: 'Bei weniger als der Hälfte der KP Angriff ×1,3.',
      hooks: { modifyStat: (v, c) => (c.stat === 'atk' && c.mon.hp < maxHp(c.mon) / 2 ? v * 1.3 : v) } },
    { id: 'edelglanz', name: 'Edelglanz', desc: 'Heilt beim Einwechseln Statusprobleme.',
      hooks: { onSwitchIn: (c) => { if (c.mon.status) { c.mon.status = null; c.api.text(L.registry.get('species', c.mon.species).name + ' strahlt hell. Der Status ist weg!'); } } } },
    { id: 'sturmkrone', name: 'Sturmkrone', desc: 'Funke- und Schatten-Attacken sind 10 % stärker.',
      hooks: { modifyDamage: (v, c) => (c.move && (c.move.type === 'funke' || c.move.type === 'schatten') ? v * 1.1 : v) } },
    { id: 'finsterschleier', name: 'Finsterschleier', desc: 'In den ersten 2 Runden eines Kampfes kann es nicht getroffen werden.',
      hooks: { modifyEvasion: (v, c) => (c.battle.turn <= 2 ? 0 : v) } },
  ];
  for (const a of list) L.def.ability(a);

  L.registry.addValidator('ability', (def) => L.hooks.check(def.hooks).concat(L.hooks.check(def.teamHooks)));
})(globalThis.LUM);
