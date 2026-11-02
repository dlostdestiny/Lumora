// Akt 1: Der Flüsterwald. Ein neuer Akt ist eine neue Datei wie diese (plus Eintrag in js/files.js).
(function (L) {
  L.def.act({
    id: 'act1', order: 1, name: 'Der Flüsterwald',
    levelRange: [2, 12],
    map: { layers: 13, hiddenChance: 0.35, nodeWeights: { battle: 45, elite: 10, spring: 10, shop: 8, event: 22 } },
    rival: 'kael_act1',
    elites: ['pilz_theo', 'ida_waldlaeuferin', 'jonas_schueler'],
    boss: { trainer: 'fenna', arena: 'arena_boss' },
    intro: 'act1_intro', outro: 'act1_outro',
    hidden: { encounters: [{ species: 'brummfels', weight: 1 }] },
    weatherPool: ['nebel', 'stroemung', 'glutregen', 'sturm'],
    secrets: [{ id: 'wispelin', at: 'lastSpring', condition: { noHealInAct: 'act1', rankAtLeast: 3 }, species: 'wispelin' }],
    variants: [
      {
        id: 'fluesterwald', name: 'Flüsterwald', background: 'wald', weather: null,
        palette: { sky: '#1d3b2f', far: '#2f5a43', near: '#3f7a4a', light: '#f7e9a0' },
        encounters: [
          { species: 'summsel', weight: 20 }, { species: 'kieselkrabb', weight: 15 }, { species: 'moosling', weight: 20 },
          { species: 'tropfling', weight: 15 }, { species: 'nachtschu', weight: 12 }, { species: 'zwirbel', weight: 15 },
          { species: 'pustelinchen', weight: 10, minLayer: 2 },
          { species: 'lumini', weight: 6, condition: { realTime: 'night' } },
        ],
        events: ['strudel', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'verirrtes_junges', 'moosaltar', 'wandernde_haendlerin', 'sprechender_pilz', 'schattenaltar', 'beerenstrauch', 'alter_trainer', 'gluehwuermchentanz', 'kaputte_bruecke'],
      },
      {
        id: 'moorlichtung', name: 'Moorlichtung', background: 'moor', weather: 'nebel',
        palette: { sky: '#26303a', far: '#3b4a4f', near: '#4f6a5a', light: '#c9d6e3' },
        encounters: [
          { species: 'tropfling', weight: 25 }, { species: 'moosling', weight: 14 }, { species: 'nachtschu', weight: 18 },
          { species: 'pilzpuff', weight: 10, minLayer: 3 }, { species: 'kieselkrabb', weight: 12 }, { species: 'summsel', weight: 10 },
          { species: 'lumini', weight: 6, condition: { realTime: 'night' } },
        ],
        events: ['strudel', 'sternensplitter', 'tauschhaendler', 'wetterumschwung', 'verlassenes_nest', 'verirrtes_junges', 'moosaltar', 'wandernde_haendlerin', 'sprechender_pilz', 'schattenaltar', 'beerenstrauch', 'alter_trainer', 'gluehwuermchentanz', 'nebelspiegel'],
      },
    ],
  });

  L.registry.addValidator('act', (def, reg) => {
    const errs = [];
    for (const v of def.variants) {
      for (const e of v.encounters) if (!reg.has('species', e.species)) errs.push(v.id + ': unbekannte Art ' + e.species);
      for (const e of v.events) if (!reg.has('event', e)) errs.push(v.id + ': unbekanntes Ereignis ' + e);
      if (v.weather && !reg.has('weather', v.weather)) errs.push(v.id + ': unbekanntes Wetter ' + v.weather);
    }
    for (const t of def.elites) if (!reg.has('trainer', t)) errs.push('unbekannter Trainer ' + t);
    if (def.rival && !reg.has('trainer', def.rival)) errs.push('unbekannter Rivale ' + def.rival);
    if (!reg.has('trainer', def.boss.trainer)) errs.push('unbekannter Boss ' + def.boss.trainer);
    for (const s of [def.intro, def.outro]) if (s && !reg.has('scene', s)) errs.push('unbekannte Szene ' + s);
    for (const e of def.hidden.encounters) if (!reg.has('species', e.species)) errs.push('unbekannte Art ' + e.species);
    return errs;
  });
})(globalThis.LUM);
