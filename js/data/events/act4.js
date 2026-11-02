// Ereignisse in Akt 4 (Jenseits des Schleiers). effect(api) verändert den Lauf; api siehe js/run/nodes.js.
(function (L) {
  const E = (def) => L.def.event(def);

  E({
    id: 'vergessene_erinnerung', title: 'Die vergessene Erinnerung', icon: '🫧',
    text: 'Zwischen den Glasscherben schwebt eine kleine, schimmernde Kugel. Darin siehst du ein Lachen, einen Namen und einen Sommertag. Es ist eine Erinnerung, die niemandem mehr gehört.',
    options: [
      { label: 'Sie vorsichtig auffangen', preview: 'Bindung +12, Team heilt 15 %.', effect: (api) => { api.bond(12); api.heal(0.15); api.text('Die Erinnerung schmiegt sich an dein Team. Alle fühlen sich auf einmal geborgen und ein bisschen mutiger.'); } },
      { label: 'Dem Wesen dahinter folgen', preview: 'Ein Kampf gegen etwas Seltenes.', effect: (api) => { api.text('Aus der Kugel steigt ein kleines Wesen auf und sieht dich traurig an!'); api.battle({ team: [{ species: 'vergessling', levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }); } },
      { label: 'Sie weiterziehen lassen', preview: '+15 Kristalle.', effect: (api) => { api.crystals(15); api.text('Die Kugel steigt in den Sternenwind und zerplatzt zu glitzerndem Staub. Zurück bleiben ein paar Kristalle.'); } },
    ],
  });
  E({
    id: 'zerbrochene_uhr', title: 'Die zerbrochene Uhr', icon: '🕰️',
    text: 'Eine riesige Standuhr liegt zerbrochen im Eis. Ihre Zeiger stehen still, doch irgendwo darin ticken noch kleine Zahnräder.',
    options: [
      { label: 'Die Uhr reparieren', preview: 'Ein Relikt. Dein erstes Monster steigt 2 Level.', effect: (api) => { const r = api.relic('random'); api.trainFirst(2); api.text('Die Uhr schlägt einmal, ganz leise. Aus dem Gehäuse fällt ' + r + ', und dein Monster fühlt sich plötzlich stärker.'); } },
      { label: 'Die Zahnräder sammeln', preview: '+60 Gold.', effect: (api) => { api.gold(60); api.text('Die Zahnräder sind aus echtem Gold. Du sammelst sie in deinem Beutel.'); } },
      { label: 'Den Zahnradwicht wecken', preview: 'Ein kleiner Kampf, danach ein neuer Freund?', effect: (api) => { api.text('Ein Zahnradwicht hüpft aus dem Gehäuse und will unbedingt mit dir kämpfen!'); api.battle({ team: [{ species: 'zahnradwicht', levelOffset: 2 }, { species: 'scherbenkrebs', levelOffset: 0 }], kind: 'wild', rewardSource: 'battle' }); } },
    ],
  });
  E({
    id: 'spiegelsee', title: 'Der Spiegelsee', icon: '🪞',
    text: 'Ein See aus spiegelglattem Eis. Im Spiegelbild siehst du dein Team, aber irgendwie sind alle ein kleines bisschen anders. Stärker. Oder sorgloser.',
    options: [
      { label: 'In den Spiegel greifen', preview: 'Dein erstes Monster steigt 3 Level, Team verliert 15 % KP.', effect: (api) => { api.trainFirst(3); api.damageTeam(0.15); api.text('Es ist eiskalt! Aber dein Monster kommt gestärkt zurück, als hätte es sein Spiegelbild umarmt.'); } },
      { label: 'Eine Weile hineinschauen', preview: 'Bindung +15.', effect: (api) => { api.bond(15); api.text('Ihr schaut euch lange an. Dein Team merkt, wie wichtig ihr einander seid.'); } },
      { label: 'Den Fuchs im Spiegel rufen', preview: 'Ein Schleierfuchs-Kampf.', effect: (api) => { api.text('Das Spiegelbild blinzelt. Dann springt ein Schleierfuchs aus dem Eis!'); api.battle({ team: [{ species: 'schleierfuchs', levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }); } },
    ],
  });
  E({
    id: 'ardans_lager', title: 'Ardans Lager', icon: '🔥',
    text: 'Zwischen Glasdünen brennt ein kleines Lagerfeuer. Ardan sitzt davor, ohne Kapuze, den grauen Schal locker um den Hals. Er sieht dich und lächelt schüchtern. „Setz dich. Ich habe Tee. Der ist sogar gut geworden.“',
    options: [
      { label: 'Tee trinken und reden', preview: 'Team heilt 40 %, Bindung +10.', effect: (api) => { api.heal(0.4); api.bond(10); api.text('Ihr redet über Kael, über die vielen Schleifen und darüber, wie schön ein einziger ruhiger Abend sein kann.'); } },
      { label: 'Nach Vael fragen', preview: '+25 Kristalle. Eine Geschichte.', effect: (api) => { api.crystals(25); api.flag('vael_spur'); api.text('„Vael hat ihren Gefährten geliebt. So sehr, dass sie die Zeit zerbrochen hat. Wenn du sie siehst, hör ihr zu, bevor du kämpfst.“'); } },
      { label: 'Um eine Übungsrunde bitten', preview: 'Ein Kampf, dann ein Relikt.', effect: (api) => { const r = api.rareRelic(); api.text('Ardan grinst. „Na gut. Aber ich gehe nicht sanft mit dir um.“ Als Dank für den Kampf bekommst du ' + r + '.'); api.battle({ team: [{ species: 'taktgeist', levelOffset: 1 }, { species: 'echomotte', levelOffset: 0 }], kind: 'trainer', trainerName: 'Ardan', rewardSource: 'elite' }); } },
    ],
  });
  E({
    id: 'sternenwal_gesang', title: 'Der Gesang des Sternenwals', icon: '🐋', rare: 0.5,
    text: 'Ein tiefer, warmer Klang rollt durch den Sternenwind. Ein riesiger Wal gleitet an den schwebenden Inseln vorbei, und mit jedem Ton ticken alle Uhren der Welt im selben Takt.',
    options: [
      { label: 'Zuhören', preview: 'Team heilt 35 %.', effect: (api) => { api.heal(0.35); api.text('Das Lied hüllt euch ein wie eine warme Decke. Alle Wunden schließen sich sacht.'); } },
      { label: 'Mitsingen', preview: 'Der Zeitwal kommt näher. Ein Kampf.', effect: (api) => { api.text('Der Wal hört dich, dreht sich langsam um und kommt näher. Er will wissen, wie stark dein Lied ist!'); api.battle({ team: [{ species: 'zeitwal', levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }); } },
      { label: 'Auf seinem Rücken ausruhen', preview: 'Team heilt 20 %, Bindung +10, +20 Kristalle.', effect: (api) => { api.heal(0.2); api.bond(10); api.crystals(20); api.text('Der Wal lässt dich aufsteigen. Ihr schwebt eine Weile durch die Sterne und kommt ganz neu an.'); } },
    ],
  });
})(globalThis.LUM);
