// Akt 4: Jenseits des Schleiers. Gläserne Ebene und Sternenstrom, Wächterin Vael, die Erste Bannträgerin.
// Kein Haupt-Akt (side: true): Er folgt nur im Modus „Jenseits des Schleiers“ (nach dem wahren Ende) auf Akt 3.
(function (L) {
  const EVENTS = ['vergessene_erinnerung', 'zerbrochene_uhr', 'spiegelsee', 'ardans_lager', 'sternenwal_gesang', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'wandernde_haendlerin'];
  L.def.act({
    id: 'act4', order: 4, side: true, name: 'Jenseits des Schleiers',
    levelRange: [33, 43],
    map: { layers: 13, hiddenChance: 0.3, nodeWeights: { battle: 44, elite: 13, spring: 9, shop: 8, event: 22 } },
    rival: 'kael_act4',
    elites: ['uhrmacherin_tikka', 'eisweber_joran', 'echohueter_nim'],
    boss: { trainer: 'vael', arena: 'arena_vael' },
    intro: 'act4_intro', outro: 'act4_outro',
    hidden: { encounters: [{ species: 'zeitwal', weight: 6 }, { species: 'schleierfuchs', weight: 5 }, { species: 'vergessling', weight: 3 }] },
    weatherPool: ['schneesturm', 'schneesturm', 'nebel', 'sturm'],
    variants: [
      {
        id: 'glasebene', name: 'Gläserne Ebene', background: 'glasebene', weather: null,
        palette: { sky: '#0f1e3a', far: '#3b5b8a', near: '#7aa2d6', light: '#e0f2fe' },
        encounters: [
          { species: 'reifkitz', weight: 20 }, { species: 'zahnradwicht', weight: 18 }, { species: 'scherbenkrebs', weight: 16 },
          { species: 'flimmerfalter', weight: 14 }, { species: 'echomotte', weight: 12 },
          { species: 'vergessling', weight: 5, minLayer: 4 }, { species: 'schleierfuchs', weight: 4, minLayer: 6 },
        ],
        events: EVENTS.concat(['schattenaltar']),
      },
      {
        id: 'sternenstrom', name: 'Sternenstrom', background: 'sternenstrom', weather: 'sturm',
        palette: { sky: '#120a2e', far: '#3b2a6b', near: '#5b4a9b', light: '#a7f3d0' },
        encounters: [
          { species: 'flimmerfalter', weight: 20 }, { species: 'echomotte', weight: 18 }, { species: 'zahnradwicht', weight: 14 },
          { species: 'reifkitz', weight: 12 }, { species: 'scherbenkrebs', weight: 10 },
          { species: 'vergessling', weight: 6, minLayer: 4 }, { species: 'zeitwal', weight: 3, minLayer: 7 },
        ],
        events: EVENTS.concat(['kristallecho']),
      },
    ],
  });
})(globalThis.LUM);
