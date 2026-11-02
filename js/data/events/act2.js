// Ereignisse in Akt 2 (Die Glutschmiede). effect(api) verändert den Lauf; api siehe js/run/nodes.js.
(function (L) {
  const E = (def) => L.def.event(def);

  E({
    id: 'heisse_quelle', title: 'Die heiße Quelle', icon: '♨️',
    text: 'Zwischen schwarzen Felsen dampft eine heiße Quelle. Das Wasser blubbert gefährlich, riecht aber nach Kräutern.',
    options: [
      { label: 'Ein Bad nehmen', preview: 'Team heilt 35 %. Manchmal ist es zu heiß …', effect: (api) => { api.heal(0.35); if (api.rng.chance(0.3)) { api.burnFirst(); api.text('Herrlich … AU! Dein erstes Monster hat sich verbrannt.'); } else api.text('Herrlich. Dein Team döst im warmen Dampf.'); } },
      { label: 'Eier kochen', preview: '+1 Beerenbeutel, Bindung +5.', effect: (api) => { api.item('beerenbeutel', 1); api.bond(5); api.text('Ihr kocht Eier im Dampf und esst gemeinsam. Gemütlich!'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Zu heiß. Du gehst lieber weiter.') },
    ],
  });
  E({
    id: 'verschuettete_mine', title: 'Die verschüttete Mine', icon: '⛏️',
    text: 'Ein alter Stollen, halb eingestürzt. Hinter den Steinen glitzert etwas. Aus der Tiefe hört man ein Knurren.',
    options: [
      { label: 'Freigraben', preview: 'Team verliert 15 % KP. Vielleicht ein Relikt?', effect: (api) => { api.damageTeam(0.15); if (api.rng.chance(0.6)) { const r = api.relic('random'); api.text('Nach viel Schweiß findest du: ' + r + '!'); } else { api.gold(45); api.text('Nur ein paar alte Münzen. Immerhin 45 Gold.'); } } },
      { label: 'Dem Knurren folgen', preview: 'Ein Kampf gegen ein seltenes Monster.', effect: (api) => { api.text('Aus der Dunkelheit springt ein Basaltbock!'); api.battle({ team: [{ species: 'basaltbock', levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }); } },
      { label: 'Weitergehen', effect: (api) => api.text('Einsturzgefahr. Lieber nicht.') },
    ],
  });
  E({
    id: 'alte_schmiede', title: 'Die verlassene Schmiede', icon: '⚒️',
    text: 'Eine kleine Schmiede am Wegrand. Der Amboss ist noch warm. Auf einem Zettel steht: „Für Bannträger. Bedient euch. – B.“',
    options: [
      { label: 'Am Amboss trainieren', preview: 'Dein erstes Monster steigt 2 Level.', effect: (api) => { api.trainFirst(2); api.text('Der Klang des Hammers macht dein Monster stärker!'); } },
      { label: 'Werkzeug mitnehmen', preview: 'Lerne Schmiedehammer.', effect: (api) => { api.teachMove('schmiedehammer'); api.text('Ein Monster schaut sich die Hammerschläge genau ab.'); } },
      { label: 'Einen Gruß dalassen', preview: 'Bindung +10.', effect: (api) => { api.bond(10); api.flag('gruss_brakk'); api.text('Du schreibst „Danke!“ auf den Zettel. Irgendwie fühlt sich das gut an.'); } },
    ],
  });
  E({
    id: 'aschenregen', title: 'Aschenregen', icon: '🌋',
    text: 'Der Berg grollt. Graue Asche fällt wie Schnee. In der Asche funkelt es: kleine schwarze Splitter, warm und flüsternd.',
    options: [
      { label: 'Splitter sammeln', preview: 'Seltenes Relikt, aber ein Fluch.', effect: (api) => { const rel = api.rareRelic(); const c = api.curse('random'); api.text('Du findest ' + rel + (c ? '. Doch die Splitter flüstern weiter: Fluch „' + c + '“.' : '.')); } },
      { label: 'Durchlaufen', preview: 'Team verliert 10 % KP, Bindung +10.', effect: (api) => { api.damageTeam(0.1); api.bond(10); api.text('Ihr kämpft euch gemeinsam durch den Aschenregen.'); } },
      { label: 'Unterstellen', effect: (api) => api.text('Du wartest unter einem Felsvorsprung, bis es vorbei ist.') },
    ],
  });
  E({
    id: 'kristallecho', title: 'Das Kristallecho', icon: '💠',
    text: 'In der Grotte steht ein Kristall, so groß wie ein Haus. Darin bewegen sich Bilder: du selbst, an anderen Tagen, in anderen Läufen.',
    options: [
      { label: 'Hineinsehen', preview: '+15 Kristalle und eine Erinnerung.', effect: (api) => { api.crystals(15); api.text('Du siehst dich fallen und wieder aufstehen. Immer wieder. Hinter dir steht eine Gestalt mit einem schwarzen Stein.'); } },
      { label: 'Ein Stück abbrechen', preview: 'Superkugel, aber das Echo schreit.', effect: (api) => { api.item('superkugel', 1); api.damageTeam(0.1); api.text('Der Kristall kreischt. Dein Team hält sich die Ohren zu.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Manche Dinge will man nicht sehen.') },
    ],
  });
})(globalThis.LUM);
