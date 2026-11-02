// Akt 2: Die Glutschmiede. Vulkanpfade und Kristallgrotten, Wächter Brakk.
(function (L) {
  L.def.act({
    id: 'act2', order: 2, name: 'Die Glutschmiede',
    levelRange: [12, 22],
    map: { layers: 13, hiddenChance: 0.35, nodeWeights: { battle: 44, elite: 12, spring: 10, shop: 8, event: 22 } },
    rival: 'kael_act2',
    elites: ['schmied_gero', 'forscherin_lia', 'aschenmoench_tao'],
    boss: { trainer: 'brakk', arena: 'arena_brakk' },
    intro: 'act2_intro', outro: 'act2_outro',
    // Versteckte Pfade: hier kann das einzigartige Mirrok auftauchen
    hidden: { encounters: [{ species: 'kristallwurm', weight: 7 }, { species: 'mirrok', weight: 3, condition: { rankAtLeast: 6 } }] },
    weatherPool: ['glutregen', 'glutregen', 'sturm', 'nebel', 'stroemung'],
    secrets: [{
      id: 'sunnyfex', at: 'spring', option: 'sonnenfeuer', condition: { teamTypeCount: { type: 'glut', min: 3 }, rankAtLeast: 8 }, species: 'sunnyfex',
      icon: '☀️', title: 'Sonnenfeuer', text: 'Das Wasser der Quelle beginnt zu glühen. Deine Glut-Monster werden ganz unruhig …',
      reveal: 'Die Quelle verdampft in einem Sonnenstrahl. Daraus springt ein Fuchs aus reinem Feuer!',
    }],
    variants: [
      {
        id: 'aschepfad', name: 'Aschepfad', background: 'vulkan', weather: null,
        palette: { sky: '#3a1a14', far: '#5a2a1e', near: '#2a1a18', light: '#ffb36b' },
        encounters: [
          { species: 'aschling', weight: 20 }, { species: 'magmolch', weight: 18 }, { species: 'steinspatz', weight: 16 },
          { species: 'russmaus', weight: 14 }, { species: 'zischkaefer', weight: 14 }, { species: 'kieselkrabb', weight: 8 },
          { species: 'geysirling', weight: 8 }, { species: 'rostratte', weight: 8 }, { species: 'basaltbock', weight: 5, minLayer: 4 },
          { species: 'lumini', weight: 5, condition: { realTime: 'night' } },
        ],
        events: ['strudel', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'heisse_quelle', 'verschuettete_mine', 'alte_schmiede', 'aschenregen', 'wandernde_haendlerin', 'schattenaltar', 'moosaltar'],
      },
      {
        id: 'kristallgrotten', name: 'Kristallgrotten', background: 'grotte', weather: null,
        palette: { sky: '#121a2e', far: '#1f2b4a', near: '#2a2440', light: '#a5b4fc' },
        encounters: [
          { species: 'geysirling', weight: 20 }, { species: 'russmaus', weight: 16 }, { species: 'kieselkrabb', weight: 14 },
          { species: 'zischkaefer', weight: 12 }, { species: 'steinspatz', weight: 12 }, { species: 'magmolch', weight: 10 },
          { species: 'nachtschu', weight: 8 }, { species: 'rostratte', weight: 14 }, { species: 'basaltbock', weight: 6, minLayer: 3 },
        ],
        events: ['strudel', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'heisse_quelle', 'verschuettete_mine', 'alte_schmiede', 'kristallecho', 'wandernde_haendlerin', 'schattenaltar', 'sprechender_pilz'],
      },
    ],
  });
})(globalThis.LUM);
