// Ereignisse in Akt 1. effect(api) verändert den Lauf; api siehe js/run/nodes.js.
(function (L) {
  const E = (def) => L.def.event(def);

  E({
    id: 'verirrtes_junges', title: 'Ein verirrtes Junges', icon: '🍄',
    text: 'Zwischen den Wurzeln zittert ein kleiner Moosling. Er hat seine Familie verloren und schaut dich mit großen Augen an.',
    options: [
      { label: 'Mitnehmen', preview: 'Moosling schließt sich an.', effect: (api) => { api.addMon('moosling', api.level - 1); api.text('Der Moosling hüpft fröhlich hinter dir her.'); } },
      { label: 'Zu seiner Familie bringen', preview: 'Team heilt 30 %, Bindung +5.', effect: (api) => { api.heal(0.3); api.bond(5); api.text('Die Moosling-Familie bedankt sich mit einer Wolke heilender Sporen.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Du lässt den Moosling zurück. Er schaut dir lange nach.') },
    ],
  });
  E({
    id: 'moosaltar', title: 'Der Moosaltar', icon: '🗿',
    text: 'Ein uralter Altar, ganz von Moos bedeckt. In der Mitte liegt eine Schale. Eine Inschrift: „Gib, und dir wird gegeben.“',
    options: [
      { label: 'Lebenskraft opfern', preview: 'Team verliert 20 % KP, du erhältst ein Relikt.', effect: (api) => { api.damageTeam(0.2); const r = api.relic('random'); api.text('Das Moos leuchtet auf. In der Schale liegt nun: ' + r + '.'); } },
      { label: 'Beten', preview: 'Vielleicht passiert etwas.', effect: (api) => { if (api.rng.chance(0.5)) { api.heal(0.25); api.text('Eine warme Brise umhüllt dein Team.'); } else api.text('Nichts passiert. Nur der Wind rauscht.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Du gehst respektvoll vorbei.') },
    ],
  });
  E({
    id: 'wandernde_haendlerin', title: 'Die wandernde Händlerin', icon: '🎒', character: 'haendlerin',
    text: 'Lotte, eine fröhliche Händlerin, sitzt auf ihrem riesigen Rucksack. „Ich hab da was Besonderes für dich!“',
    options: [
      { label: '3 Fangkugeln (40 Gold)', condition: { goldAtLeast: 40 }, effect: (api) => { api.gold(-40); api.item('fangkugel', 3); api.text('„Viel Glück beim Fangen!“'); } },
      { label: 'Ein seltsames Ei (80 Gold)', condition: { goldAtLeast: 80 }, preview: 'Ein seltenes Monster.', effect: (api) => { api.gold(-80); const sp = api.rng.pick(['pilzpuff', 'lumini']); api.addMon(sp, api.level); api.text('Das Ei schlüpft sofort! Ein ' + L.registry.get('species', sp).name + ' blinzelt dich an.'); } },
      { label: 'Ablehnen', effect: (api) => api.text('„Schade! Vielleicht beim nächsten Mal.“') },
    ],
  });
  E({
    id: 'schattenaltar', title: 'Der Schattenaltar', icon: '🕯️',
    text: 'Schwarze Kerzen brennen ohne Wind. Auf dem Altar liegt ein funkelndes Relikt, umwickelt von dunklen Ranken. Eine Stimme flüstert: „Nimm es … wenn du den Preis trägst.“',
    options: [
      { label: 'Das Relikt nehmen', preview: 'Seltenes Relikt, aber ein Fluch lastet auf dir.', effect: (api) => { const rel = api.rareRelic(); const c = api.curse('random'); api.text('Du greifst zu. ' + rel + ' gehört jetzt dir … ' + (c ? 'aber der Fluch „' + c + '“ legt sich auf dich.' : 'und nichts passiert.')); } },
      { label: 'Kerzen ausblasen (30 Gold)', condition: { goldAtLeast: 30, cursed: true }, preview: 'Ein Fluch wird gereinigt.', effect: (api) => { api.gold(-30); const c = api.purge(); api.text(c ? 'Die Flammen erlöschen. Der Fluch „' + c + '“ ist fort.' : 'Die Flammen erlöschen.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Du wendest dich ab. Das Flüstern verstummt.') },
    ],
  });
  E({
    id: 'sprechender_pilz', title: 'Der sprechende Pilz', icon: '🍄',
    text: 'Ein riesiger Pilz öffnet ein Auge. „Beantworte mein Rätsel: Was wird mehr, wenn man es teilt?“',
    options: [
      { label: '„Freude.“', effect: (api) => { const r = api.relic('random'); api.text('„Richtig!“ Der Pilz schenkt dir: ' + r + '.'); } },
      { label: '„Ein Pilz.“', effect: (api) => { api.damageTeam(0.1); api.text('„Falsch! Und frech!“ Der Pilz pustet dir Sporen ins Gesicht.'); } },
      { label: '„Ein Loch.“', effect: (api) => { api.gold(15); api.text('„Hihi. Nicht richtig, aber lustig.“ Er wirft dir ein paar Münzen zu.'); } },
    ],
  });
  E({
    id: 'beerenstrauch', title: 'Ein Beerenstrauch', icon: '🫐',
    text: 'Ein Strauch voller glänzender Beeren. Einige sind blau, andere seltsam violett.',
    options: [
      { label: 'Essen', preview: 'Heilt 40 %, aber manche Beeren sind giftig.', effect: (api) => { api.heal(0.4); if (api.rng.chance(0.3)) { api.poisonFirst(); api.text('Die Beeren schmecken gut … aber dein erstes Monster fühlt sich komisch an.'); } else api.text('Lecker! Dein Team fühlt sich gestärkt.'); } },
      { label: 'Sammeln', preview: '+1 Heiltrank.', effect: (api) => { api.item('heiltrank', 1); api.text('Du presst einen Heiltrank aus den Beeren.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Lieber nicht.') },
    ],
  });
  E({
    id: 'alter_trainer', title: 'Der alte Trainer', icon: '🧓',
    text: 'Ein alter Mann sitzt auf einem Baumstumpf. „Ich war einst ein Bannträger. Ich kann dir etwas beibringen … oder dich prüfen.“',
    options: [
      { label: 'Etwas lernen', preview: 'Eine starke Attacke.', effect: (api) => { const mv = api.rng.pick(['flammenwirbel', 'flutwelle', 'blattwirbel', 'blitzschlag', 'felsbrocken', 'finsterstoss']); api.teachMove(mv); api.text('„' + L.registry.get('move', mv).name + '. Nutze sie weise.“'); } },
      { label: 'Prüfung annehmen', preview: 'Ein Kampf mit guter Belohnung.', effect: (api) => { api.battle({ trainerName: 'Der alte Trainer', team: [{ species: 'brummfels', levelOffset: 1 }], kind: 'trainer', rewardSource: 'elite' }); api.text('„Zeig mir, was in dir steckt!“'); } },
      { label: 'Weitergehen', effect: (api) => api.text('„Auch gut. Der Weg ist lang.“') },
    ],
  });
  E({
    id: 'gluehwuermchentanz', title: 'Glühwürmchentanz', icon: '✨', condition: { realTime: 'night' },
    text: 'Auf einer Lichtung tanzen hunderte Lichter. Mitten im Schwarm leuchtet eines besonders hell.',
    options: [
      { label: 'Näher herangehen', preview: 'Ein Lumini!', effect: (api) => { api.battle({ team: [{ species: 'lumini', levelOffset: 1 }], kind: 'wild', rewardSource: 'battle', shinyFactor: 3 }); api.text('Das helle Licht schießt auf dich zu!'); } },
      { label: 'Zuschauen', preview: 'Bindung +10.', effect: (api) => { api.bond(10); api.text('Ihr schaut gemeinsam zu. Dein Team rückt näher zusammen.'); } },
    ],
  });
  E({
    id: 'kaputte_bruecke', title: 'Die kaputte Brücke', icon: '🌉',
    text: 'Eine morsche Hängebrücke über einer Schlucht. Auf der anderen Seite glitzert etwas.',
    options: [
      { label: 'Hinüberklettern', preview: 'Riskant.', effect: (api) => { if (api.rng.chance(0.5)) { api.gold(40); api.text('Geschafft! Drüben liegt ein Beutel mit 40 Gold.'); } else { api.damageTeam(0.15); api.text('Ein Brett bricht! Dein Team rettet sich mit Mühe.'); } } },
      { label: 'Monster helfen lassen', condition: { any: [{ teamTypeCount: { type: 'stein', min: 1 } }, { teamTypeCount: { type: 'spross', min: 1 } }] }, preview: 'Ein Stein- oder Spross-Monster baut eine Brücke.', effect: (api) => { api.gold(40); api.bond(5); api.text('Dein Monster baut mit Ranken und Steinen eine sichere Brücke. +40 Gold!'); } },
      { label: 'Umkehren', effect: (api) => { api.heal(0.1); api.text('Du ruhst dich kurz aus und gehst weiter.'); } },
    ],
  });
  E({
    id: 'nebelspiegel', title: 'Der Nebelspiegel', icon: '🪞', variants: ['moorlichtung'],
    text: 'Im Moor steht ein Spiegel aus Wasser. Dein Spiegelbild bewegt sich … ein bisschen anders als du.',
    options: [
      { label: 'Hineinsehen', preview: 'Ein Monster lernt etwas über sich.', effect: (api) => { api.trainFirst(1); api.text('Dein erstes Monster starrt lange hinein. Es wirkt danach stärker.'); } },
      { label: 'Einen Stein werfen', effect: (api) => { if (api.rng.chance(0.4)) { api.item('superkugel', 1); api.text('Das Wasser spuckt eine Superkugel aus!'); } else api.text('Plopp. Nichts passiert.'); } },
    ],
  });

  L.registry.addValidator('event', (def) => {
    const errs = [];
    if (!def.options || !def.options.length) errs.push('keine Optionen');
    for (const o of def.options || []) if (typeof o.effect !== 'function') errs.push('Option ohne effect: ' + o.label);
    return errs;
  });
})(globalThis.LUM);
