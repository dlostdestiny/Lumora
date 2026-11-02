// Akt 3: Der Sturmgipfel. Sturmpfad und Nebelkamm, Wächterin Sola. Danach ist der Lauf gewonnen.
(function (L) {
  L.def.act({
    id: 'act3', order: 3, name: 'Der Sturmgipfel',
    levelRange: [21, 31],
    map: { layers: 13, hiddenChance: 0.35, nodeWeights: { battle: 44, elite: 12, spring: 10, shop: 8, event: 22 } },
    rival: 'kael_act3',
    elites: ['bergfuehrerin_maren', 'sturmjaeger_ruvik', 'sterndeuterin_ella'],
    boss: { trainer: 'sola', arena: 'arena_sola' },
    intro: 'act3_intro', outro: 'act3_outro',
    hidden: { encounters: [{ species: 'himmelsdrache', weight: 4 }, { species: 'edelweissa', weight: 6 }] },
    weatherPool: ['sturm', 'sturm', 'nebel', 'schneesturm', 'schneesturm'],
    variants: [
      {
        id: 'sturmpfad', name: 'Sturmpfad', background: 'gipfel', weather: null,
        palette: { sky: '#1e2a4a', far: '#3b4a6b', near: '#4a5568', light: '#fde68a' },
        encounters: [
          { species: 'blitzfink', weight: 20 }, { species: 'windwiesel', weight: 18 }, { species: 'kraehling', weight: 16 },
          { species: 'gipfelbock', weight: 16 }, { species: 'wolkenwoll', weight: 14 }, { species: 'alpenknospe', weight: 10 }, { species: 'flockling', weight: 14 },
          { species: 'nebelmotte', weight: 4, minLayer: 4 },
        ],
        events: ['sternenriss', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'mondfinsternis', 'seilbruecke', 'sturmschrein', 'einsiedler', 'sternwarte', 'wandernde_haendlerin', 'schattenaltar'],
      },
      {
        id: 'nebelkamm', name: 'Nebelkamm', background: 'nebelkamm', weather: 'nebel',
        palette: { sky: '#2a2f45', far: '#4b5270', near: '#3a3f58', light: '#c7d2fe' },
        encounters: [
          { species: 'kraehling', weight: 20 }, { species: 'wolkenwoll', weight: 18 }, { species: 'nebelmotte', weight: 10 },
          { species: 'windwiesel', weight: 14 }, { species: 'gipfelbock', weight: 14 }, { species: 'alpenknospe', weight: 12 },
          { species: 'blitzfink', weight: 10 }, { species: 'russmaus', weight: 6 }, { species: 'flockling', weight: 12 },
        ],
        events: ['sternenriss', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'mondfinsternis', 'seilbruecke', 'sturmschrein', 'einsiedler', 'sternwarte', 'wandernde_haendlerin', 'kristallecho'],
      },
    ],
  });
})(globalThis.LUM);
