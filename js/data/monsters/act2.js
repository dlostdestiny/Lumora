// Monster-Arten aus Akt 2 (Die Glutschmiede: Aschepfad und Kristallgrotten).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));
  const S = (def) => L.def.species(def);

  // --- Häufig ---
  S({
    id: 'aschling', name: 'Aschling', types: ['glut'], base: { hp: 55, atk: 62, def: 55, spe: 80 }, ability: 'hitzeschub',
    rarity: 'common', baseExp: 55, ancientMove: 'urflamme',
    learnset: ls([1, 'kratzer'], [1, 'glutbiss'], [6, 'aufheizen'], [14, 'funkenregen'], [20, 'glutatem'], [24, 'flammenwirbel']),
    // Verzweigte Entwicklung: Bei Lv 18 entscheidest du, welche Form es annimmt.
    evolves: [{ to: 'flammfee', level: 18 }, { to: 'aschegeist', level: 18 }],
    dex: 'Ein Häufchen lebendiger Asche. Wenn es sich freut, glimmen kleine Funken in ihm auf.',
    art: { body: 'blob', ears: 'none', tail: 'flame', pattern: 'spots', extras: ['tuft', 'glow'], palette: { main: '#7d6b70', belly: '#c9b8b0', accent: '#ff8a3d', eye: '#ffd23f' }, shinyPalette: { main: '#b8c7e0', belly: '#eef3ff', accent: '#5fb4ff', eye: '#1e3a8a' } },
  });
  S({
    id: 'flammfee', name: 'Flammfee', types: ['glut', 'funke'], base: { hp: 70, atk: 100, def: 62, spe: 118 }, ability: 'gluehlicht',
    rarity: 'common', baseExp: 130, ancientMove: 'urflamme',
    learnset: ls([1, 'glutbiss'], [1, 'funkenregen'], [18, 'zischflug'], [22, 'flammenwirbel'], [26, 'blitzschlag'], [30, 'lavaguss']),
    dex: 'Wenn ein Aschling die Sonne liebt, wird er zur Flammfee. Sie tanzt auf Funken und ist kaum zu fangen.',
    art: { body: 'bird', ears: 'long', tail: 'flame', pattern: 'none', extras: ['wings', 'glow', 'antennae'], palette: { main: '#ff9a4d', belly: '#ffe7c4', accent: '#fff07a', eye: '#c2410c' }, shinyPalette: { main: '#ff9fd0', belly: '#fff3f8', accent: '#a5f3fc', eye: '#9d174d' } },
  });
  S({
    id: 'aschegeist', name: 'Aschegeist', types: ['glut', 'schatten'], base: { hp: 88, atk: 95, def: 88, spe: 78 }, ability: 'russschleier',
    rarity: 'common', baseExp: 130, ancientMove: 'urschatten',
    learnset: ls([1, 'glutbiss'], [1, 'russwolke'], [18, 'schattenfunke'], [22, 'nachtbiss'], [26, 'flammenwirbel'], [30, 'finsterstoss']),
    dex: 'Wenn ein Aschling die Nacht liebt, wird er zum Aschegeist. Er wandert lautlos durch erloschene Schmieden.',
    art: { body: 'blob', ears: 'horn', tail: 'flame', pattern: 'stripes', extras: ['veil', 'glow', 'brows'], palette: { main: '#3d3346', belly: '#7a6a80', accent: '#ff6a3d', eye: '#ff9a3d' }, shinyPalette: { main: '#e8e0f0', belly: '#ffffff', accent: '#8b7bff', eye: '#5b21b6' } },
  });
  S({
    id: 'magmolch', name: 'Magmolch', types: ['glut', 'stein'], base: { hp: 75, atk: 72, def: 82, spe: 45 }, ability: 'magmahaut',
    rarity: 'common', baseExp: 60, ancientMove: 'urfels',
    learnset: ls([1, 'rempler'], [1, 'glutbiss'], [8, 'steinwurf'], [13, 'haerten'], [17, 'schmiedehammer'], [24, 'felssturz']),
    evolves: [{ to: 'lavarisk', level: 21 }],
    dex: 'Ein träger Molch, der in warmer Lava badet. Seine Haut ist heiß wie eine Herdplatte.',
    art: { body: 'serpent', ears: 'none', tail: 'flame', pattern: 'spots', extras: ['markings'], palette: { main: '#c2410c', belly: '#ffd2a6', accent: '#3b1f12', eye: '#fde047' }, shinyPalette: { main: '#3f8f6a', belly: '#d4f5e2', accent: '#14352a', eye: '#fde047' } },
  });
  S({
    id: 'lavarisk', name: 'Lavarisk', types: ['glut', 'stein'], base: { hp: 100, atk: 108, def: 108, spe: 58 }, ability: 'magmahaut',
    rarity: 'common', baseExp: 140, ancientMove: 'urfels',
    learnset: ls([1, 'glutbiss'], [1, 'steinwurf'], [17, 'schmiedehammer'], [21, 'felssturz'], [26, 'lavaguss'], [32, 'felsbrocken']),
    dex: 'Ein schwerer Lavadrache. Wo er geht, erstarrt die Lava hinter ihm zu schwarzem Glas.',
    art: { body: 'quad', ears: 'horn', tail: 'flame', pattern: 'stripes', extras: ['claws', 'markings', 'brows'], palette: { main: '#9a2f0c', belly: '#ffb27a', accent: '#2a140b', eye: '#fde047' }, shinyPalette: { main: '#2f6f55', belly: '#b9f0d6', accent: '#0f2a20', eye: '#fde047' } },
  });
  S({
    id: 'steinspatz', name: 'Steinspatz', types: ['stein', 'wind'], base: { hp: 55, atk: 72, def: 62, spe: 86 }, ability: 'wirbelwind',
    rarity: 'common', baseExp: 55, ancientMove: 'urfels',
    learnset: ls([1, 'kratzer'], [1, 'windstoss'], [7, 'steinwurf'], [12, 'rueckenwind'], [16, 'boe'], [22, 'felssturz']),
    evolves: [{ to: 'felsfalke', level: 20 }],
    dex: 'Ein kleiner Vogel mit Federn aus Schiefer. Er reitet auf den heißen Aufwinden über den Vulkanen.',
    art: { body: 'bird', ears: 'none', tail: 'bolt', pattern: 'spots', extras: ['wings', 'tuft'], palette: { main: '#8a8f9c', belly: '#e4e6ec', accent: '#ffd23f', eye: '#1f2937' }, shinyPalette: { main: '#c9a27a', belly: '#fff3e0', accent: '#5fd4ff', eye: '#1f2937' } },
  });
  S({
    id: 'felsfalke', name: 'Felsfalke', types: ['wind', 'stein'], base: { hp: 75, atk: 102, def: 80, spe: 112 }, ability: 'wirbelwind',
    rarity: 'common', baseExp: 135, ancientMove: 'urblitz',
    learnset: ls([1, 'steinwurf'], [1, 'boe'], [20, 'kristallsplitter'], [24, 'felssturz'], [28, 'wirbelsturm'], [33, 'felsbrocken']),
    dex: 'Ein stolzer Falke mit Schwingen aus Stein. Wenn er herabstößt, heult der Wind wie ein Sturm.',
    art: { body: 'bird', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'brows', 'claws'], palette: { main: '#5f6675', belly: '#d6d9e0', accent: '#ffd23f', eye: '#b45309' }, shinyPalette: { main: '#a07a52', belly: '#f6e7d4', accent: '#5fd4ff', eye: '#0e7490' } },
  });
  S({
    id: 'zischkaefer', name: 'Zischkäfer', types: ['metall', 'glut'], base: { hp: 62, atk: 82, def: 88, spe: 52 }, ability: 'panzerschale',
    rarity: 'common', baseExp: 60, ancientMove: 'urblitz',
    learnset: ls([1, 'eisenkralle'], [1, 'glutbiss'], [9, 'magnetfeld'], [14, 'stahlschlag'], [19, 'schmiedehammer'], [25, 'metallsturm']),
    dex: 'Ein Käfer mit einem Panzer aus glühendem Eisen. Wenn er sich ärgert, zischt er wie Wasser auf heißem Stahl.',
    art: { body: 'round', ears: 'none', tail: 'none', pattern: 'stripes', extras: ['shell', 'antennae', 'claws'], palette: { main: '#2f3b52', belly: '#ffd2a6', accent: '#ff8a3d', eye: '#fde047' }, shinyPalette: { main: '#4c1d95', belly: '#f3e8ff', accent: '#5fd4ff', eye: '#fde047' } },
  });
  S({
    id: 'russmaus', name: 'Rußmaus', types: ['schatten'], base: { hp: 60, atk: 70, def: 55, spe: 92 }, ability: 'russschleier',
    rarity: 'common', baseExp: 55, ancientMove: 'urschatten',
    learnset: ls([1, 'kratzer'], [1, 'schattenklaue'], [6, 'russwolke'], [11, 'nachtbiss'], [17, 'schattenfunke'], [24, 'finsterstoss']),
    dex: 'Eine flinke Maus aus den Kohlestollen. Sie hinterlässt kleine schwarze Pfotenabdrücke.',
    art: { body: 'round', ears: 'cat', tail: 'fluffy', pattern: 'none', extras: ['whiskers', 'chestfluff'], palette: { main: '#3a3440', belly: '#8a8090', accent: '#ff8a3d', eye: '#fde047' }, shinyPalette: { main: '#e5e7eb', belly: '#ffffff', accent: '#f472b6', eye: '#7c3aed' } },
  });
  S({
    id: 'geysirling', name: 'Geysirling', types: ['flut'], base: { hp: 82, atk: 66, def: 72, spe: 58 }, ability: 'geysirkraft',
    rarity: 'common', baseExp: 60, ancientMove: 'urflut',
    learnset: ls([1, 'wasserschuss'], [1, 'rempler'], [8, 'blubberstrahl'], [13, 'regentanz'], [18, 'geysir'], [25, 'flutwelle']),
    dex: 'Lebt in heißen Quellen tief in den Grotten. Alle paar Minuten schießt es eine Dampffontäne in die Luft.',
    art: { body: 'blob', ears: 'fin', tail: 'none', pattern: 'spots', extras: ['drop', 'shine', 'mist'], palette: { main: '#38bdf8', belly: '#e0f7ff', accent: '#ffffff', eye: '#0c4a6e' }, shinyPalette: { main: '#f9a8d4', belly: '#fff1f8', accent: '#ffffff', eye: '#831843' } },
  });

  S({
    id: 'rostratte', name: 'Rostratte', types: ['metall'], base: { hp: 65, atk: 75, def: 80, spe: 72 }, ability: 'panzerschale',
    rarity: 'common', baseExp: 60, ancientMove: 'urfels',
    learnset: ls([1, 'kratzer'], [1, 'eisenkralle'], [10, 'magnetfeld'], [16, 'stahlschlag'], [21, 'nachtbiss'], [26, 'metallsturm']),
    evolves: [{ to: 'stahlratte', level: 22 }],
    dex: 'Eine Ratte, die alte Nägel und Schrauben frisst. Ihr Fell ist rostrot und klirrt leise.',
    art: { body: 'round', ears: 'cat', tail: 'fluffy', pattern: 'spots', extras: ['whiskers', 'claws'], palette: { main: '#b45309', belly: '#fde7c8', accent: '#64748b', eye: '#1c1917' }, shinyPalette: { main: '#64748b', belly: '#e2e8f0', accent: '#facc15', eye: '#1c1917' } },
  });
  S({
    id: 'stahlratte', name: 'Stahlratte', types: ['metall', 'schatten'], base: { hp: 85, atk: 105, def: 105, spe: 85 }, ability: 'panzerschale',
    rarity: 'common', baseExp: 140, ancientMove: 'urschatten',
    learnset: ls([1, 'eisenkralle'], [1, 'nachtbiss'], [22, 'stahlschlag'], [26, 'metallsturm'], [30, 'finsterstoss']),
    dex: 'Die Königin der Stollen. Ihr Panzer glänzt wie poliertes Silber, ihre Augen wie zwei Laternen.',
    art: { body: 'quad', ears: 'cat', tail: 'bolt', pattern: 'stripes', extras: ['whiskers', 'claws', 'brows', 'crown'], palette: { main: '#94a3b8', belly: '#f1f5f9', accent: '#4c1d95', eye: '#facc15' }, shinyPalette: { main: '#fbbf24', belly: '#fffbeb', accent: '#1e3a8a', eye: '#1e3a8a' } },
  });

  // --- Selten ---
  S({
    id: 'basaltbock', name: 'Basaltbock', types: ['stein'], base: { hp: 95, atk: 102, def: 108, spe: 62 }, ability: 'kristallkern',
    rarity: 'rare', baseExp: 90, ancientMove: 'urfels',
    learnset: ls([1, 'rempler'], [1, 'steinwurf'], [1, 'haerten'], [16, 'erdstoss'], [22, 'felssturz'], [28, 'felsbrocken']),
    dex: 'Ein Widder mit Hörnern aus schwarzem Basalt. Er springt sicher über glühende Spalten.',
    art: { body: 'quad', ears: 'horn', tail: 'fluffy', pattern: 'none', extras: ['brows', 'chestfluff', 'gem'], palette: { main: '#3f3f46', belly: '#d4d4d8', accent: '#f97316', eye: '#fde047' }, shinyPalette: { main: '#f5f5f4', belly: '#ffffff', accent: '#a855f7', eye: '#7c3aed' } },
  });
  S({
    id: 'kristallwurm', name: 'Kristallwurm', types: ['stein', 'stern'], base: { hp: 90, atk: 92, def: 112, spe: 72 }, ability: 'kristallkern',
    rarity: 'veryRare', baseExp: 120, ancientMove: 'urfels',
    learnset: ls([1, 'kristallsplitter'], [1, 'haerten'], [1, 'sternsplitter'], [20, 'felssturz'], [28, 'felsbrocken']),
    dex: 'Ein sehr seltener Wurm, dessen Körper aus wachsendem Kristall besteht. In ihm leuchtet ein Funken Sternenlicht.',
    art: { body: 'serpent', ears: 'horn', tail: 'none', pattern: 'spots', extras: ['gem', 'glow', 'shine'], palette: { main: '#a5b4fc', belly: '#eef2ff', accent: '#f0abfc', eye: '#312e81' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#fb7185', eye: '#7c2d12' } },
  });

  // --- Einzigartig ---
  S({
    id: 'mirrok', name: 'Mirrok', types: ['stein'], base: { hp: 115, atk: 110, def: 130, spe: 95 }, ability: 'spiegelkern',
    rarity: 'unique', legend: { rank: 6 }, hint: 'Gerüchte erzählen von einem Spiegel, der auf geheimen Pfaden in den Glutbergen wandert.', baseExp: 160, ancientMove: 'urfels',
    learnset: ls([1, 'kristallsplitter'], [1, 'haerten'], [1, 'erdstoss'], [24, 'felssturz'], [30, 'felsbrocken']),
    dex: 'Ein Golem mit einem Spiegel als Herz. Wer hineinsieht, sieht sich selbst … und Mirrok wird zu dem, was es sieht.',
    art: { body: 'tall', ears: 'horn', tail: 'none', pattern: 'none', extras: ['gem', 'shine', 'glow', 'brows'], palette: { main: '#94a3b8', belly: '#e2e8f0', accent: '#c4b5fd', eye: '#1e1b4b' }, shinyPalette: { main: '#fcd34d', belly: '#fffbeb', accent: '#f472b6', eye: '#1e1b4b' } },
  });
  S({
    id: 'sunnyfex', name: 'Sunnyfex', types: ['glut'], base: { hp: 105, atk: 128, def: 92, spe: 130 }, ability: 'wiedergeburt',
    rarity: 'unique', legend: { rank: 8 }, hint: 'Man sagt, ein Sonnenfuchs zeigt sich nur denen, die mit drei Feuer-Herzen an eine Quelle treten.', baseExp: 160, ancientMove: 'urflamme',
    learnset: ls([1, 'glutbiss'], [1, 'aufheizen'], [1, 'funkenregen'], [22, 'flammenwirbel'], [28, 'lavaguss']),
    dex: 'Ein Fuchs aus Sonnenfeuer. Man sagt, er erscheint nur denen, die das Feuer wirklich lieben. Er stirbt nie ganz.',
    art: { body: 'quad', ears: 'long', tail: 'flame', pattern: 'none', extras: ['mane', 'glow', 'gem'], palette: { main: '#ffb627', belly: '#fff3c4', accent: '#ff5a1f', eye: '#b45309' }, shinyPalette: { main: '#fff7ed', belly: '#ffffff', accent: '#facc15', eye: '#0369a1' } },
  });

  // --- Boss ---
  S({
    id: 'schmiedgolem', name: 'Schmiedgolem', types: ['stein'], base: { hp: 115, atk: 105, def: 106, spe: 60 }, ability: 'schmiedeherz',
    rarity: 'boss', baseExp: 260, ancientMove: 'urfels',
    learnset: ls([1, 'schmiedehammer'], [1, 'felssturz'], [1, 'haerten'], [1, 'erdstoss']),
    dex: 'Brakks Gefährte, aus der Großen Schmiede geboren. Der Schleier hat sein Herzfeuer schwarz gefärbt.',
    art: { body: 'tall', ears: 'horn', tail: 'none', pattern: 'stripes', extras: ['crown', 'veil', 'claws', 'brows', 'glow'], palette: { main: '#57534e', belly: '#fdba74', accent: '#2b1a3a', eye: '#f97316' }, shinyPalette: { main: '#57534e', belly: '#fdba74', accent: '#2b1a3a', eye: '#f97316' } },
  });
})(globalThis.LUM);
