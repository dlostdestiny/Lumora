// Ereignisse, die in jedem Akt vorkommen können (Tauschhändler, Wetterumschwung).
(function (L) {
  const E = (def) => L.def.event(def);

  E({
    id: 'tauschhaendler', title: 'Der Tauschhändler', icon: '🔁',
    text: 'Ein Mann mit einem Wagen voller Käfige und Kisten winkt dir zu. „Ich kaufe nichts und verkaufe nichts. Ich tausche nur!“',
    options: [
      { label: 'Monster gegen seltenes Relikt', condition: { teamAtLeast: 2 }, preview: 'Dein schwächstes Monster (nicht der Anführer) geht, ein seltenes Relikt kommt.',
        effect: (api) => { const n = api.removeWeakest(); const rel = api.rareRelic(); api.text(n + ' winkt dir zum Abschied. Du bekommst: ' + rel + '.'); } },
      { label: 'Relikt gegen seltenes Monster', condition: { relicsAtLeast: 1 }, preview: 'Ein zufälliges Relikt geht, ein seltenes Monster kommt.',
        effect: (api) => { const rel = api.removeRelic(); const n = api.rareMonster(api.level + 1); api.text('Du gibst ' + rel + ' her. Aus einem Käfig springt ' + n + '!'); } },
      { label: 'Nichts tauschen', effect: (api) => api.text('„Schade! Vielleicht beim nächsten Mal.“') },
    ],
  });
  E({
    id: 'wetterumschwung', title: 'Wetterumschwung', icon: '🌦️',
    text: 'Der Himmel verfärbt sich. Auf einem Felsen steht ein alter Wetterstein mit vier Symbolen. Wenn du ihn drehst, ändert sich das Wetter für den Rest des Weges.',
    options: [
      { label: '🔥 Glutregen rufen', preview: 'Glut stärker, Flut schwächer.', effect: (api) => { api.upcomingWeather('glutregen'); api.text('Die Luft wird heiß. Glühende Tropfen fallen vom Himmel.'); } },
      { label: '🌧️ Strömung rufen', preview: 'Flut stärker, Glut schwächer.', effect: (api) => { api.upcomingWeather('stroemung'); api.text('Ein warmer Regen setzt ein und hört nicht mehr auf.'); } },
      { label: '🌩️ Sturm rufen', preview: 'Funke stärker und trifft immer.', effect: (api) => { api.upcomingWeather('sturm'); api.text('Donner grollt über dir.'); } },
      { label: '☀️ Klaren Himmel rufen', preview: 'Kein Wetter mehr.', effect: (api) => { api.upcomingWeather(null); api.text('Die Wolken reißen auf. Sonne!'); } },
    ],
  });
})(globalThis.LUM);
