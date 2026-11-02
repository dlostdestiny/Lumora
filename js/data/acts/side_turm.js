// Echo-Turm (Endlos-Modus): Stockwerk-Blöcke mit je 8 Ebenen. Nach jedem Wächter geht es einen Block höher,
// die Gegner werden 6 Level stärker. Der Lauf endet erst mit einer Niederlage. Freigeschaltet nach dem ersten Sieg.
(function (L) {
  const R = () => L.registry;
  const BOSSES = [
    { trainer: 'fenna', arena: 'arena_boss' }, { trainer: 'maris', arena: 'tiefsee' },
    { trainer: 'brakk', arena: 'arena_brakk' }, { trainer: 'sola', arena: 'arena_sola' },
  ];

  // Begegnungen aus allen Akten (ohne Bedingungen), damit jeder Block anders wirkt
  const mix = [];
  for (const id of ['act1', 'act2', 'act3', 'tiefe']) {
    if (!R().has('act', id)) continue;
    for (const v of R().get('act', id).variants) for (const e of v.encounters) if (!e.condition && !mix.some((x) => x.species === e.species)) mix.push({ species: e.species, weight: e.weight });
  }
  const elites = [];
  for (const a of ['act1', 'act2', 'act3']) if (R().has('act', a)) elites.push(...R().get('act', a).elites);

  L.def.act({
    id: 'echoturm', order: 98, side: true, name: 'Der Echo-Turm',
    levelRange: [6, 12],
    map: { layers: 8, hiddenChance: 0.25, nodeWeights: { battle: 46, elite: 14, spring: 10, shop: 8, event: 22 } },
    rival: null,
    elites,
    boss: { trainer: 'fenna', arena: 'arena_boss', pool: BOSSES },
    intro: 'turm_intro', outro: null,
    hidden: { encounters: [{ species: 'brummfels', weight: 3 }, { species: 'kristallwurm', weight: 2 }, { species: 'himmelsdrache', weight: 1 }] },
    weatherPool: ['nebel', 'glutregen', 'stroemung', 'sturm', 'schneesturm'],
    variants: [{
      id: 'turmhallen', name: 'Turmhallen', background: 'turm', weather: null,
      palette: { sky: '#1a1033', far: '#2e1f52', near: '#3b2a63', light: '#c4b5fd' },
      encounters: mix,
      events: ['tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'wandernde_haendlerin', 'schattenaltar', 'moosaltar', 'sprechender_pilz', 'alte_schmiede'],
    }],
  });

  L.def.scene({ id: 'turm_intro', trigger: 'actIntro', once: false, condition: { act: 'echoturm' }, lines: [
    { who: 'erzaehler', expr: null, text: 'Der Echo-Turm. Jedes Stockwerk ist eine Erinnerung an einen Kampf, den du schon gekämpft hast.' },
    { who: 'mira', expr: 'ernst', text: 'Niemand weiß, wie hoch er ist, {name}. Geh so weit, wie du kannst.' },
  ] });

  L.tower = {
    BLOCK: 8,
    floors(run) {
      const layer = run.position && run.map && run.map.nodes[run.position] ? run.map.nodes[run.position].layer + 1 : 0;
      return ((run.tower ? run.tower.block : 1) - 1) * L.tower.BLOCK + layer;
    },
    bossFor(run) { const i = ((run.tower ? run.tower.block : 1) - 1) % BOSSES.length; return BOSSES[i]; },
  };

})(globalThis.LUM);
