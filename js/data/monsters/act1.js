// Monster-Arten aus Akt 1 (Flüsterwald). art beschreibt das gezeichnete Aussehen (js/art/monsterArt.js).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));

  // --- Starter ---
  L.def.species({
    id: 'glimmi', name: 'Glimmi', types: ['glut'], base: { hp: 75, atk: 85, def: 65, spe: 90 }, ability: 'glutherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urflamme',
    learnset: ls([1, 'kratzer'], [1, 'brueller'], [1, 'glutbiss'], [8, 'aufheizen'], [12, 'funkenregen'], [18, 'konzentration'], [22, 'flammenwirbel'], [30, 'glutatem']),
    evolves: [{ to: 'glutaro', level: 14 }],
    dex: 'Eine kleine Feuermaus. Ihre Schwanzflamme flackert heller, wenn sie sich freut.',
    art: { body: 'round', ears: 'cat', tail: 'flame', pattern: 'none', palette: { main: '#ff9a5a', belly: '#ffe2c4', accent: '#ffd23f', eye: '#c2410c' }, shinyPalette: { main: '#ffd1e8', belly: '#fff3f8', accent: '#ff6fae', eye: '#9d174d' } },
  });
  L.def.species({
    id: 'glutaro', name: 'Glutaro', types: ['glut'], base: { hp: 95, atk: 115, def: 85, spe: 120 }, ability: 'glutherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urflamme',
    learnset: ls([1, 'kratzer'], [1, 'glutbiss'], [8, 'aufheizen'], [12, 'funkenregen'], [14, 'nachtbiss'], [17, 'erdstoss'], [18, 'konzentration'], [22, 'flammenwirbel'], [30, 'glutatem']),
    dex: 'Ein flinker Glutfuchs. Wo er rennt, bleibt eine Funkenspur zurück.',
    art: { body: 'quad', ears: 'long', tail: 'flame', pattern: 'stripes', extras: ['mane'], palette: { main: '#ff7a3d', belly: '#ffe2c4', accent: '#ffd23f', eye: '#b91c1c' }, shinyPalette: { main: '#ff9fd0', belly: '#fff3f8', accent: '#ffe066', eye: '#9d174d' } },
  });
  L.def.species({
    id: 'plitsch', name: 'Plitsch', types: ['flut'], base: { hp: 92, atk: 86, def: 74, spe: 78 }, ability: 'flutherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urflut',
    learnset: ls([1, 'rempler'], [1, 'brueller'], [1, 'wasserschuss'], [7, 'blubberstrahl'], [10, 'erdstoss'], [11, 'quellwasser'], [13, 'flutwelle'], [20, 'regentanz']),
    evolves: [{ to: 'platschotter', level: 14 }],
    dex: 'Ein verspielter Otter. Er hält beim Schlafen gern ein Seeblatt fest.',
    art: { body: 'round', ears: 'fin', tail: 'fin', pattern: 'none', palette: { main: '#5bb8ff', belly: '#e3f4ff', accent: '#2563eb', eye: '#1e3a8a' }, shinyPalette: { main: '#7ee0c8', belly: '#e9fff8', accent: '#0f766e', eye: '#134e4a' } },
  });
  L.def.species({
    id: 'platschotter', name: 'Platschotter', types: ['flut'], base: { hp: 115, atk: 116, def: 98, spe: 104 }, ability: 'flutherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urflut',
    learnset: ls([1, 'rempler'], [1, 'wasserschuss'], [7, 'blubberstrahl'], [10, 'erdstoss'], [11, 'quellwasser'], [13, 'flutwelle'], [20, 'regentanz']),
    dex: 'Ein stolzer Flussotter. Sein Schweif schlägt Wellen, die Felsen glätten.',
    art: { body: 'tall', ears: 'fin', tail: 'fin', pattern: 'spots', extras: ['scarf'], palette: { main: '#3fa7ff', belly: '#e3f4ff', accent: '#1d4ed8', eye: '#1e3a8a' }, shinyPalette: { main: '#5fd4b4', belly: '#e9fff8', accent: '#0f766e', eye: '#134e4a' } },
  });
  L.def.species({
    id: 'knospi', name: 'Knospi', types: ['spross'], base: { hp: 90, atk: 75, def: 85, spe: 65 }, ability: 'sprossherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urwurzel',
    learnset: ls([1, 'rempler'], [1, 'brueller'], [1, 'rankenhieb'], [8, 'saugwurzel'], [11, 'wachstum'], [13, 'blattwirbel'], [26, 'sporen']),
    evolves: [{ to: 'bluehreh', level: 14 }],
    dex: 'Ein schüchternes Kitz mit einer Knospe auf dem Kopf. Bei Sonne blüht sie auf.',
    art: { body: 'quad', ears: 'leaf', tail: 'leaf', pattern: 'spots', palette: { main: '#8fd16a', belly: '#f1ffe4', accent: '#f9a8d4', eye: '#166534' }, shinyPalette: { main: '#f2c94c', belly: '#fffbe6', accent: '#f472b6', eye: '#92400e' } },
  });
  L.def.species({
    id: 'bluehreh', name: 'Blühreh', types: ['spross'], base: { hp: 115, atk: 100, def: 110, spe: 90 }, ability: 'sprossherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urwurzel',
    learnset: ls([1, 'rempler'], [1, 'rankenhieb'], [8, 'saugwurzel'], [11, 'wachstum'], [13, 'blattwirbel'], [14, 'erdstoss'], [26, 'sporen']),
    dex: 'Ein anmutiges Reh. Auf seinem Geweih wachsen Blüten, die nie welken.',
    art: { body: 'tall', ears: 'leaf', tail: 'leaf', pattern: 'spots', extras: ['antlers', 'flowers'], palette: { main: '#5fcf5a', belly: '#f1ffe4', accent: '#f472b6', eye: '#14532d' }, shinyPalette: { main: '#e5b93a', belly: '#fffbe6', accent: '#c084fc', eye: '#78350f' } },
  });

  // --- Häufig ---
  L.def.species({
    id: 'summsel', name: 'Summsel', types: ['funke'], base: { hp: 60, atk: 70, def: 55, spe: 95 }, ability: 'summflug',
    rarity: 'common', baseExp: 50, ancientMove: 'urblitz',
    learnset: ls([1, 'funkenstoss'], [3, 'surren'], [7, 'funkenschweif'], [13, 'schockwelle'], [18, 'blitzschlag']),
    dex: 'Eine runde Hummel. Ihre Flügel summen so schnell, dass sie Funken schlagen.',
    art: { body: 'bird', ears: 'none', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'antennae'], palette: { main: '#ffd23f', belly: '#fff6c9', accent: '#3b2f1a', eye: '#3b2f1a' }, shinyPalette: { main: '#a5f3fc', belly: '#ecfeff', accent: '#1e3a8a', eye: '#1e3a8a' } },
  });
  L.def.species({
    id: 'kieselkrabb', name: 'Kieselkrabb', types: ['stein'], base: { hp: 70, atk: 75, def: 105, spe: 40 }, ability: 'panzerschale',
    rarity: 'common', baseExp: 55, ancientMove: 'urfels',
    learnset: ls([1, 'kratzer'], [1, 'haerten'], [5, 'steinwurf'], [9, 'kieselhagel'], [12, 'erdstoss'], [20, 'felsbrocken']),
    dex: 'Trägt einen Kiesel als Panzer. Findet es einen schöneren, wechselt es sofort.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'spots', extras: ['claws', 'shell'], palette: { main: '#c9a27a', belly: '#f4e6d4', accent: '#7c5a3a', eye: '#3f2a1a' }, shinyPalette: { main: '#9fb4d6', belly: '#eef3fb', accent: '#475569', eye: '#1e293b' } },
  });
  L.def.species({
    id: 'moosling', name: 'Moosling', types: ['spross'], base: { hp: 80, atk: 60, def: 80, spe: 50 }, ability: 'sporenwolke',
    rarity: 'common', baseExp: 50, ancientMove: 'urwurzel',
    learnset: ls([1, 'rempler'], [1, 'rankenhieb'], [5, 'saugwurzel'], [10, 'sporen'], [13, 'blattwirbel'], [18, 'wachstum']),
    dex: 'Ein kleines Pilzwesen. Wenn es niest, rieseln schläfrige Sporen.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'spots', extras: ['mushroomcap'], palette: { main: '#9ccf7a', belly: '#f3ffe8', accent: '#e05656', eye: '#1f3d1a' }, shinyPalette: { main: '#c4b5fd', belly: '#f5f3ff', accent: '#38bdf8', eye: '#312e81' } },
  });
  L.def.species({
    id: 'tropfling', name: 'Tropfling', types: ['flut'], base: { hp: 95, atk: 55, def: 75, spe: 50 }, ability: 'schleimhaut',
    rarity: 'common', baseExp: 50, ancientMove: 'urflut',
    learnset: ls([1, 'rempler'], [1, 'wasserschuss'], [6, 'blubberstrahl'], [11, 'quellwasser'], [15, 'flutwelle']),
    dex: 'Ein wackeliger Wassertropfen. Lebt in Pfützen und spiegelt den Himmel.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'none', extras: ['drop', 'shine'], palette: { main: '#7cc8ff', belly: '#d9f0ff', accent: '#ffffff', eye: '#1e3a8a' }, shinyPalette: { main: '#ffb3c7', belly: '#ffe4ec', accent: '#ffffff', eye: '#9d174d' } },
  });
  L.def.species({
    id: 'nachtschu', name: 'Nachtschu', types: ['schatten'], base: { hp: 70, atk: 75, def: 60, spe: 85 }, ability: 'nachtauge',
    rarity: 'common', baseExp: 55, ancientMove: 'urschatten',
    learnset: ls([1, 'kratzer'], [1, 'schreckblick'], [5, 'schattenklaue'], [9, 'nachtbiss'], [13, 'gifthauch'], [18, 'finsterstoss']),
    dex: 'Eine kleine Eule mit leuchtenden Augen. Sieht im Dunkeln jede Bewegung.',
    art: { body: 'bird', ears: 'cat', tail: 'none', pattern: 'none', extras: ['wings', 'brows'], palette: { main: '#7a5cc4', belly: '#d9ccf5', accent: '#ffd23f', eye: '#f59e0b' }, shinyPalette: { main: '#5a6b7c', belly: '#d7dee6', accent: '#7dd3fc', eye: '#0ea5e9' } },
  });
  L.def.species({
    id: 'zwirbel', name: 'Zwirbel', types: ['funke'], base: { hp: 65, atk: 70, def: 60, spe: 90 }, ability: 'wirbelwind',
    rarity: 'common', baseExp: 55, ancientMove: 'urblitz',
    learnset: ls([1, 'kratzer'], [1, 'funkenstoss'], [6, 'surren'], [9, 'funkenschweif'], [14, 'schockwelle'], [18, 'blitzschlag']),
    dex: 'Ein Eichhörnchen mit Zackenschweif. Sammelt glänzende Dinge statt Nüsse.',
    art: { body: 'round', ears: 'cat', tail: 'fluffy', pattern: 'stripes', extras: ['cheeks'], palette: { main: '#f0b84a', belly: '#fff3d6', accent: '#ffe066', eye: '#7c2d12' }, shinyPalette: { main: '#e0e0e0', belly: '#ffffff', accent: '#93c5fd', eye: '#1e3a8a' } },
  });

  // --- Selten ---
  L.def.species({
    id: 'pilzpuff', name: 'Pilzpuff', types: ['spross', 'schatten'], base: { hp: 95, atk: 80, def: 95, spe: 60 }, ability: 'nebelhauch',
    rarity: 'rare', baseExp: 75, ancientMove: 'urschatten',
    learnset: ls([1, 'sporen'], [1, 'saugwurzel'], [1, 'gifthauch'], [8, 'nachtbiss'], [14, 'blattwirbel'], [20, 'dornenwirbel']),
    dex: 'Lebt nur im Moor. Sein Hut stößt einen Nebel aus, in dem man sich verirrt.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'spots', extras: ['mushroomcap', 'mist'], palette: { main: '#8e7cc3', belly: '#ece6fb', accent: '#5fcf5a', eye: '#3b0764' }, shinyPalette: { main: '#f59e9e', belly: '#fff1f1', accent: '#fde047', eye: '#7f1d1d' } },
  });
  L.def.species({
    id: 'lumini', name: 'Lumini', types: ['glut', 'funke'], base: { hp: 70, atk: 90, def: 65, spe: 110 }, ability: 'gluehlicht',
    rarity: 'rare', baseExp: 75, ancientMove: 'urflamme',
    learnset: ls([1, 'glutbiss'], [1, 'funkenstoss'], [6, 'surren'], [10, 'funkenregen'], [16, 'funkenschweif'], [22, 'blitzschlag']),
    dex: 'Ein Glühwürmchen, das nur nachts erscheint. Tanzt in Schwärmen über Lichtungen.',
    art: { body: 'bird', ears: 'none', tail: 'flame', pattern: 'none', extras: ['wings', 'antennae', 'glow'], palette: { main: '#ffb347', belly: '#fff3c4', accent: '#fff59d', eye: '#7c2d12' }, shinyPalette: { main: '#86efac', belly: '#f0fdf4', accent: '#bbf7d0', eye: '#14532d' } },
  });

  // --- Sehr selten ---
  L.def.species({
    id: 'brummfels', name: 'Brummfels', types: ['stein'], base: { hp: 110, atk: 110, def: 120, spe: 60 }, ability: 'felsenfest',
    rarity: 'veryRare', baseExp: 110, ancientMove: 'urfels',
    learnset: ls([1, 'erdstoss'], [1, 'haerten'], [1, 'steinwurf'], [1, 'brueller'], [20, 'felsbrocken']),
    dex: 'Ein Bär aus moosbewachsenem Fels. Schläft jahrelang an verborgenen Orten.',
    art: { body: 'tall', ears: 'cat', tail: 'none', pattern: 'spots', extras: ['moss', 'brows'], palette: { main: '#9a8a78', belly: '#e9e1d6', accent: '#6fae5a', eye: '#1c1917' }, shinyPalette: { main: '#d4b483', belly: '#fff7e6', accent: '#e879f9', eye: '#1c1917' } },
  });

  // --- Wind im Wald ---
  L.def.species({
    id: 'pustelinchen', name: 'Pustelinchen', types: ['spross', 'wind'], base: { hp: 60, atk: 62, def: 58, spe: 92 }, ability: 'wirbelwind',
    rarity: 'common', baseExp: 55, ancientMove: 'urwurzel',
    learnset: ls([1, 'rankenhieb'], [1, 'windstoss'], [6, 'rueckenwind'], [10, 'saugwurzel'], [13, 'wirbeltanz'], [15, 'boe'], [22, 'blattwirbel']),
    dex: 'Eine Pusteblume mit Gesicht. Bei starkem Wind lässt sie sich einfach davontragen und landet irgendwo neu.',
    art: { body: 'blob', ears: 'leaf', tail: 'leaf', pattern: 'none', extras: ['flowers', 'tuft'], palette: { main: '#bef264', belly: '#f7fee7', accent: '#ffffff', eye: '#365314' }, shinyPalette: { main: '#f9a8d4', belly: '#fdf2f8', accent: '#e0e7ff', eye: '#831843' } },
  });

  // --- Boss ---
  L.def.species({
    id: 'dornkoenigin', name: 'Dornkönigin', types: ['schatten'], base: { hp: 115, atk: 96, def: 95, spe: 80 }, ability: 'dornenkrone',
    rarity: 'boss', baseExp: 220, ancientMove: 'urwurzel',
    learnset: ls([1, 'erdstoss'], [1, 'nachtbiss'], [1, 'schattenklaue'], [1, 'schreckblick']),
    dex: 'Fennas Gefährtin, vom Schleier verdorben. Ihre Dornen tragen schwarze Blüten.',
    art: { body: 'tall', ears: 'leaf', tail: 'leaf', pattern: 'stripes', extras: ['crown', 'thorns', 'veil'], palette: { main: '#4a7c4a', belly: '#d9ecd0', accent: '#2b1a3a', eye: '#a21caf' }, shinyPalette: { main: '#4a7c4a', belly: '#d9ecd0', accent: '#2b1a3a', eye: '#a21caf' } },
  });

  const RARITIES = ['starter', 'common', 'rare', 'veryRare', 'unique', 'boss'];
  L.registry.addValidator('species', (def, reg) => {
    const errs = [];
    for (const t of def.types) if (!reg.has('type', t)) errs.push('unbekannter Typ ' + t);
    if (!reg.has('ability', def.ability)) errs.push('unbekannte Fähigkeit ' + def.ability);
    for (const e of def.learnset) if (!reg.has('move', e.move)) errs.push('unbekannte Attacke ' + e.move);
    if (def.ancientMove && !reg.has('move', def.ancientMove)) errs.push('unbekannte uralte Attacke ' + def.ancientMove);
    if (def.bondMove && !reg.has('move', def.bondMove)) errs.push('unbekannte Bindungs-Attacke ' + def.bondMove);
    for (const ev of def.evolves || []) if (!reg.has('species', ev.to)) errs.push('unbekannte Entwicklung ' + ev.to);
    if (RARITIES.indexOf(def.rarity) < 0) errs.push('unbekannte Seltenheit ' + def.rarity);
    if (def.legend && !(def.legend.rank >= 1)) errs.push('legend.rank fehlt');
    const sum = def.base.hp + def.base.atk + def.base.def + def.base.spe;
    const max = def.rarity === 'boss' ? 650 : 520;
    if (sum < 200 || sum > max) errs.push('Basiswerte-Summe ' + sum + ' außerhalb 200–' + max);
    if (!def.art || !def.art.palette || !def.art.shinyPalette) errs.push('art/palette fehlt');
    return errs;
  });
})(globalThis.LUM);
