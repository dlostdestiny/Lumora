// Versteckte Fähigkeiten: Wilde Monster haben selten (config.hiddenAbilityChance) ihre zweite, versteckte Fähigkeit.
// Eine Entwicklung behält die versteckte Fähigkeit (die entwickelte Art hat ihre eigene).
(function (L) {
  L.def.ability({ id: 'frostpelz', name: 'Frostpelz', desc: 'Wer es mit Kontakt trifft, friert zu 20 % ein.',
    hooks: { onHit: (c) => { if (c.move && c.move.contact && c.attacker.hp > 0 && c.rng.chance(0.2)) c.api.inflict(c.attackerSide, 'frost'); } } });
  L.def.ability({ id: 'eisenwille', name: 'Eisenwille', desc: 'Angriff kann nicht gesenkt werden. Bei vollen KP Verteidigung ×1,2.',
    hooks: { modifyStat: (v, c) => (c.stat === 'def' && c.mon.hp >= L.mon.maxHp(c.mon) ? v * 1.2 : v) } });

  const HIDDEN = {
    glimmi: 'gluehlicht', glutaro: 'gluehlicht', plitsch: 'schleimhaut', platschotter: 'schleimhaut', knospi: 'sporenwolke', bluehreh: 'sporenwolke',
    summsel: 'wirbelwind', kieselkrabb: 'felsenfest', moosling: 'schleimhaut', tropfling: 'nebelhauch', nachtschu: 'rabenblick', zwirbel: 'summflug',
    pilzpuff: 'sporenwolke', lumini: 'sturmfeder', brummfels: 'kristallkern', pustelinchen: 'summflug',
    aschling: 'aschenkleid', flammfee: 'sturmfeder', aschegeist: 'nachtauge', magmolch: 'aschenkleid', lavarisk: 'aschenkleid',
    steinspatz: 'sturmfeder', felsfalke: 'sturmfeder', zischkaefer: 'magmahaut', russmaus: 'nachtauge', geysirling: 'schleimhaut',
    basaltbock: 'felsenfest', kristallwurm: 'edelglanz', rostratte: 'eisenwille', stahlratte: 'eisenwille',
    blitzfink: 'rabenblick', donneradler: 'rabenblick', kraehling: 'nachtauge', rabenfuerst: 'nachtauge', windwiesel: 'summflug', sturmmarder: 'summflug',
    wolkenwoll: 'geysirkraft', gipfelbock: 'kristallkern', alpenknospe: 'schleimhaut', edelweissa: 'schleimhaut', nebelmotte: 'russschleier',
    himmelsdrache: 'rabenblick', flockling: 'frostpelz', frostbaer: 'frostpelz',
    zapfi: 'summflug', blitzigel: 'summflug', kiesi: 'eisenwille', felspanzer: 'eisenwille', nachtmiez: 'nachtauge', schattenpanther: 'nachtauge', schattenpantherin: 'nachtauge',
  };
  for (const id of Object.keys(HIDDEN)) if (L.registry.has('species', id)) L.registry.get('species', id).hiddenAbility = HIDDEN[id];

  L.registry.addValidator('species', (def, reg) => (def.hiddenAbility && !reg.has('ability', def.hiddenAbility) ? ['unbekannte versteckte Fähigkeit ' + def.hiddenAbility] : []));
})(globalThis.LUM);
