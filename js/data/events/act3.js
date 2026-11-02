// Ereignisse in Akt 3 (Der Sturmgipfel). effect(api) verändert den Lauf; api siehe js/run/nodes.js.
// condition = nur verteilt, wenn erfüllt; rare = Chance, dass es überhaupt auf die Karte kommt.
(function (L) {
  const E = (def) => L.def.event(def);

  E({
    id: 'mondfinsternis', title: 'Die Mondfinsternis', icon: '🌑', condition: { echoAtLeast: 1, rankAtLeast: 12 }, rare: 0.35,
    text: 'Plötzlich schiebt sich ein Schatten vor den Mond. Alles wird still. Auf einem Felsen sitzt eine Katze aus Nacht und Sternen und sieht dich an.',
    options: [
      { label: 'Näher gehen', preview: 'Ein Kampf gegen etwas Einzigartiges.', effect: (api) => { api.flag('nyxelle_gesehen'); api.text('Die Katze faucht. Ihr Fell knistert wie ein Gewitter!'); api.battle({ team: [{ species: 'nyxelle', levelOffset: 2 }], kind: 'wild', rewardSource: 'elite' }); } },
      { label: 'Still beobachten', preview: 'Bindung +15.', effect: (api) => { api.bond(15); api.text('Ihr seht gemeinsam zu, wie der Mond wieder hervorkommt. Die Katze ist verschwunden.'); } },
    ],
  });
  E({
    id: 'seilbruecke', title: 'Die Seilbrücke', icon: '🌉',
    text: 'Eine alte Seilbrücke über einer tiefen Schlucht. Der Wind lässt sie schwanken. Unten rauscht ein Fluss.',
    options: [
      { label: 'Schnell rüberrennen', preview: 'Vielleicht verliert man etwas …', effect: (api) => { if (api.rng.chance(0.5)) { api.gold(-30); api.text('Geschafft! Aber dir ist ein Beutel Gold in die Tiefe gefallen.'); } else api.text('Geschafft, ohne Verluste!'); } },
      { label: 'Vorsichtig klettern', preview: 'Team verliert 10 % KP, Bindung +10.', effect: (api) => { api.damageTeam(0.1); api.bond(10); api.text('Ihr helft euch gegenseitig Stück für Stück hinüber.'); } },
      { label: 'Im Fluss fischen', preview: 'Ein Monster aus dem Wasser?', effect: (api) => { api.text('Etwas Großes beißt an!'); api.battle({ team: [{ species: 'wolkenwoll', levelOffset: 2 }], kind: 'wild', rewardSource: 'battle' }); } },
    ],
  });
  E({
    id: 'sturmschrein', title: 'Der Sturmschrein', icon: '⛩️',
    text: 'Ein kleiner Schrein, in den der Blitz eingeschlagen hat. Die Glocke klingt von selbst. Ein Schild: „Wer läutet, wird geprüft.“',
    options: [
      { label: 'Die Glocke läuten', preview: 'Kampf, dann ein seltenes Relikt.', effect: (api) => { const r = api.rareRelic(); api.text('Ein Sturmgeist erscheint und bewacht ' + r + '. Du hast es dir verdient … wenn du gewinnst.'); api.battle({ team: [{ species: 'blitzfink', levelOffset: 1 }, { species: 'donneradler', levelOffset: 0 }], kind: 'trainer', trainerName: 'Sturmgeist', rewardSource: 'elite' }); } },
      { label: 'Beten', preview: 'Team heilt 30 %.', effect: (api) => { api.heal(0.3); api.text('Ein warmer Wind streicht über dein Team.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Du verbeugst dich und gehst weiter.') },
    ],
  });
  E({
    id: 'einsiedler', title: 'Der Einsiedler', icon: '🧓',
    text: 'In einer Hütte aus Stein wohnt ein alter Mann. „Ich war auch mal Bannträger“, sagt er. „Ich kann dir etwas beibringen. Aber nicht umsonst.“',
    options: [
      { label: 'Lernen (60 Gold)', condition: { goldAtLeast: 60 }, preview: 'Lerne Donnerkeil.', effect: (api) => { api.gold(-60); api.teachMove('donnerkeil'); api.text('„Gut aufpassen! Der Blitz kommt aus dem Bauch, nicht aus dem Kopf.“'); } },
      { label: 'Trainieren (Tag bei ihm bleiben)', preview: 'Dein erstes Monster steigt 3 Level, Team verliert 20 % KP.', effect: (api) => { api.trainFirst(3); api.damageTeam(0.2); api.text('Ein harter Tag. Aber dein Monster ist sichtlich stärker.'); } },
      { label: 'Nach Ardan fragen', preview: 'Eine Geschichte.', effect: (api) => { api.crystals(10); api.flag('ardan_spur'); api.text('„Ardan? Ein guter Junge. Er wollte die Zeit zurückdrehen, um jemanden zu retten. Seitdem dreht sich die Zeit um ihn.“'); } },
    ],
  });
  E({
    id: 'sternwarte', title: 'Die alte Sternwarte', icon: '🔭',
    text: 'Eine verfallene Sternwarte. Das Fernrohr zeigt noch immer in den Himmel. Auf dem Tisch liegt eine Karte mit eingezeichneten Sternbildern.',
    options: [
      { label: 'Durchs Fernrohr sehen', preview: '+20 Kristalle.', effect: (api) => { api.crystals(20); api.text('Du siehst einen Stern, der heller leuchtet als alle anderen. Er scheint dich zu rufen.'); } },
      { label: 'Die Karte mitnehmen', preview: 'Ein Relikt.', effect: (api) => { const r = api.relic('random'); api.text('Hinter der Karte steckt: ' + r + '.'); } },
      { label: 'Ausruhen', preview: 'Team heilt 25 %.', effect: (api) => { api.heal(0.25); api.text('Unter dem Sternenhimmel schläft dein Team tief und fest.'); } },
    ],
  });
})(globalThis.LUM);
