// Monster-Arten aus Akt 3 (Der Sturmgipfel: Sturmpfad und Nebelkamm).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));
  const S = (def) => L.def.species(def);

  // --- Häufig ---
  S({
    id: 'blitzfink', name: 'Blitzfink', types: ['funke', 'wind'], base: { hp: 58, atk: 72, def: 55, spe: 100 }, ability: 'sturmfeder',
    rarity: 'common', baseExp: 60, ancientMove: 'urblitz',
    learnset: ls([1, 'funkenstoss'], [1, 'windstoss'], [20, 'zischflug'], [22, 'boe'], [24, 'sturmklaue'], [30, 'donnerkeil']),
    evolves: [{ to: 'donneradler', level: 28 }],
    dex: 'Ein kleiner Fink, der in Gewitterwolken nistet. Sein Gesang klingt wie knisternder Strom.',
    art: { body: 'bird', ears: 'none', tail: 'bolt', pattern: 'none', extras: ['wings', 'tuft'], palette: { main: '#fde047', belly: '#fffbe6', accent: '#2563eb', eye: '#1e3a8a' }, shinyPalette: { main: '#f0abfc', belly: '#fdf4ff', accent: '#7c3aed', eye: '#4c1d95' } },
  });
  S({
    id: 'donneradler', name: 'Donneradler', types: ['funke', 'stein'], base: { hp: 82, atk: 108, def: 78, spe: 118 }, ability: 'sturmfeder',
    rarity: 'common', baseExp: 150, ancientMove: 'urblitz',
    learnset: ls([1, 'sturmklaue'], [1, 'steinwurf'], [28, 'donnerkeil'], [32, 'felssturz'], [36, 'lawine']),
    dex: 'Ein riesiger Adler, der auf dem höchsten Gipfel thront. Wenn er die Flügel spreizt, zucken Blitze.',
    art: { body: 'bird', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'brows', 'claws'], palette: { main: '#facc15', belly: '#fef9c3', accent: '#1e3a8a', eye: '#b45309' }, shinyPalette: { main: '#e9d5ff', belly: '#faf5ff', accent: '#6d28d9', eye: '#4c1d95' } },
  });
  S({
    id: 'kraehling', name: 'Krähling', types: ['schatten'], base: { hp: 62, atk: 82, def: 58, spe: 92 }, ability: 'rabenblick',
    rarity: 'common', baseExp: 60, ancientMove: 'urschatten',
    learnset: ls([1, 'schattenklaue'], [1, 'schreckblick'], [20, 'nachtbiss'], [25, 'mondsichel'], [30, 'finsterstoss']),
    evolves: [{ to: 'rabenfuerst', level: 28 }],
    dex: 'Eine freche Krähe, die glänzende Dinge stiehlt. Man sagt, sie sammelt verlorene Erinnerungen.',
    art: { body: 'bird', ears: 'none', tail: 'fluffy', pattern: 'none', extras: ['wings', 'brows'], palette: { main: '#312e81', belly: '#818cf8', accent: '#facc15', eye: '#facc15' }, shinyPalette: { main: '#e5e7eb', belly: '#ffffff', accent: '#ef4444', eye: '#ef4444' } },
  });
  S({
    id: 'rabenfuerst', name: 'Rabenfürst', types: ['schatten', 'funke'], base: { hp: 85, atk: 112, def: 80, spe: 108 }, ability: 'rabenblick',
    rarity: 'common', baseExp: 150, ancientMove: 'urschatten',
    learnset: ls([1, 'mondsichel'], [1, 'funkenschweif'], [28, 'finsterstoss'], [33, 'donnerkeil'], [36, 'schattenfunke']),
    dex: 'Ein stolzer Rabe mit einer Krone aus Sturmfedern. Er herrscht über die Schwärme des Gipfels.',
    art: { body: 'bird', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'crown', 'brows'], palette: { main: '#1e1b4b', belly: '#6366f1', accent: '#facc15', eye: '#fde047' }, shinyPalette: { main: '#f8fafc', belly: '#e2e8f0', accent: '#dc2626', eye: '#dc2626' } },
  });
  S({
    id: 'windwiesel', name: 'Windwiesel', types: ['wind'], base: { hp: 65, atk: 80, def: 60, spe: 98 }, ability: 'wirbelwind',
    rarity: 'common', baseExp: 62, ancientMove: 'urblitz',
    learnset: ls([1, 'kratzer'], [1, 'windstoss'], [20, 'boe'], [22, 'wirbeltanz'], [24, 'sturmklaue'], [29, 'wirbelsturm']),
    evolves: [{ to: 'sturmmarder', level: 29 }],
    dex: 'Ein schlankes Wiesel, das auf Windböen reitet. Es ist so schnell, dass man nur seinen Schweif sieht.',
    art: { body: 'quad', ears: 'cat', tail: 'fluffy', pattern: 'stripes', extras: ['whiskers'], palette: { main: '#e0f2fe', belly: '#ffffff', accent: '#38bdf8', eye: '#0c4a6e' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#f59e0b', eye: '#78350f' } },
  });
  S({
    id: 'sturmmarder', name: 'Sturmmarder', types: ['wind', 'funke'], base: { hp: 82, atk: 110, def: 75, spe: 120 }, ability: 'gipfelmut',
    rarity: 'common', baseExp: 150, ancientMove: 'urblitz',
    learnset: ls([1, 'sturmklaue'], [1, 'boe'], [29, 'wirbelsturm'], [33, 'donnerkeil'], [37, 'rueckenwind']),
    dex: 'Ein Marder aus Sturm und Blitz. Wo er jagt, reißt der Wind die Laternen von den Haken.',
    art: { body: 'quad', ears: 'cat', tail: 'bolt', pattern: 'stripes', extras: ['whiskers', 'mane', 'brows'], palette: { main: '#64748b', belly: '#e2e8f0', accent: '#a78bfa', eye: '#facc15' }, shinyPalette: { main: '#fef3c7', belly: '#ffffff', accent: '#fb923c', eye: '#1e3a8a' } },
  });
  S({
    id: 'wolkenwoll', name: 'Wolkenwoll', types: ['flut', 'funke'], base: { hp: 92, atk: 62, def: 82, spe: 55 }, ability: 'gewitterwolle',
    rarity: 'common', baseExp: 65, ancientMove: 'urflut',
    learnset: ls([1, 'wasserschuss'], [1, 'surren'], [20, 'blubberstrahl'], [24, 'schockwelle'], [30, 'wolkenbruch']),
    dex: 'Ein Schaf mit Wolle aus Gewitterwolken. Wer es streichelt, bekommt einen kleinen Schlag.',
    art: { body: 'round', ears: 'long', tail: 'fluffy', pattern: 'none', extras: ['chestfluff', 'mist', 'tuft'], palette: { main: '#e2e8f0', belly: '#ffffff', accent: '#facc15', eye: '#334155' }, shinyPalette: { main: '#fecdd3', belly: '#fff1f2', accent: '#38bdf8', eye: '#334155' } },
  });
  S({
    id: 'gipfelbock', name: 'Gipfelbock', types: ['stein', 'frost'], base: { hp: 85, atk: 92, def: 98, spe: 72 }, ability: 'gipfelmut',
    rarity: 'common', baseExp: 70, ancientMove: 'urfels',
    learnset: ls([1, 'rempler'], [1, 'steinwurf'], [1, 'frosthauch'], [20, 'erdstoss'], [23, 'frostbiss'], [25, 'felssturz'], [31, 'lawine']),
    dex: 'Eine Bergziege, die auf den steilsten Felsen schläft. Ihr Fell ist mit Raureif überzogen.',
    art: { body: 'quad', ears: 'horn', tail: 'fluffy', pattern: 'spots', extras: ['chestfluff', 'brows'], palette: { main: '#cbd5e1', belly: '#f8fafc', accent: '#64748b', eye: '#1e293b' }, shinyPalette: { main: '#d6a77a', belly: '#fff7ed', accent: '#92400e', eye: '#1e293b' } },
  });
  S({
    id: 'alpenknospe', name: 'Alpenknospe', types: ['spross'], base: { hp: 70, atk: 60, def: 75, spe: 70 }, ability: 'edelglanz',
    rarity: 'common', baseExp: 60, ancientMove: 'urwurzel',
    learnset: ls([1, 'rankenhieb'], [1, 'wachstum'], [20, 'saugwurzel'], [24, 'alpenhauch'], [30, 'blattwirbel']),
    evolves: [{ to: 'edelweissa', level: 30 }],
    dex: 'Eine zähe kleine Blume, die selbst im Schnee blüht. Sie wendet sich immer dem Licht zu.',
    art: { body: 'blob', ears: 'leaf', tail: 'leaf', pattern: 'none', extras: ['flowers'], palette: { main: '#86efac', belly: '#f0fdf4', accent: '#ffffff', eye: '#14532d' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#f9a8d4', eye: '#78350f' } },
  });

  S({
    id: 'flockling', name: 'Flockling', types: ['frost'], base: { hp: 68, atk: 62, def: 70, spe: 75 }, ability: 'nebelhauch',
    rarity: 'common', baseExp: 62, ancientMove: 'urflut',
    learnset: ls([1, 'frosthauch'], [1, 'rempler'], [20, 'eissplitter'], [24, 'schneeruf'], [27, 'frostbiss'], [30, 'eiskaefig'], [32, 'blizzard']),
    evolves: [{ to: 'frostbaer', level: 28 }],
    dex: 'Eine kleine Schneeflocke, die zum Leben erwacht ist. Sie schmilzt nie, solange sie fröhlich bleibt.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'spots', extras: ['shine', 'glow', 'tuft'], palette: { main: '#e0f2fe', belly: '#ffffff', accent: '#7dd3fc', eye: '#0c4a6e' }, shinyPalette: { main: '#fbcfe8', belly: '#fff1f8', accent: '#c4b5fd', eye: '#4c1d95' } },
  });
  S({
    id: 'frostbaer', name: 'Frostbär', types: ['frost', 'stein'], base: { hp: 112, atk: 112, def: 100, spe: 62 }, ability: 'gipfelmut',
    rarity: 'common', baseExp: 150, ancientMove: 'urfels',
    learnset: ls([1, 'frostbiss'], [1, 'steinwurf'], [28, 'blizzard'], [31, 'lawine'], [35, 'eispanzer']),
    dex: 'Ein riesiger Bär mit einem Fell aus Raureif und Schultern aus Fels. Er schläft in Gletscherhöhlen.',
    art: { body: 'tall', ears: 'cat', tail: 'fluffy', pattern: 'spots', extras: ['chestfluff', 'claws', 'brows'], palette: { main: '#bae6fd', belly: '#f0f9ff', accent: '#64748b', eye: '#0c4a6e' }, shinyPalette: { main: '#e9d5ff', belly: '#faf5ff', accent: '#a16207', eye: '#4c1d95' } },
  });

  // --- Selten ---
  S({
    id: 'edelweissa', name: 'Edelweissa', types: ['spross', 'stern'], base: { hp: 88, atk: 92, def: 90, spe: 95 }, ability: 'edelglanz',
    rarity: 'rare', baseExp: 160, ancientMove: 'urwurzel',
    learnset: ls([1, 'alpenhauch'], [1, 'wachstum'], [30, 'sternenregen'], [34, 'blattwirbel']),
    dex: 'Eine Blütenfee, die nur auf dem höchsten Gipfel wächst. Ihre Blätter halten Sternenlicht fest.',
    art: { body: 'tall', ears: 'leaf', tail: 'leaf', pattern: 'none', extras: ['flowers', 'glow', 'gem'], palette: { main: '#f8fafc', belly: '#ffffff', accent: '#fde047', eye: '#14532d' }, shinyPalette: { main: '#fbcfe8', belly: '#fdf2f8', accent: '#a5f3fc', eye: '#831843' } },
  });
  S({
    id: 'nebelmotte', name: 'Nebelmotte', types: ['schatten', 'flut'], base: { hp: 80, atk: 75, def: 85, spe: 90 }, ability: 'nebelhauch',
    rarity: 'rare', baseExp: 100, ancientMove: 'urschatten',
    learnset: ls([1, 'russwolke'], [1, 'blubberstrahl'], [22, 'nachtbiss'], [27, 'wolkenbruch'], [32, 'finsterstoss']),
    dex: 'Eine große Motte, die im Nebel des Kamms lebt. Ihre Flügel tragen Augenmuster, die Wanderer verwirren.',
    art: { body: 'bird', ears: 'none', tail: 'none', pattern: 'spots', extras: ['wings', 'antennae', 'mist'], palette: { main: '#a5b4fc', belly: '#eef2ff', accent: '#4338ca', eye: '#1e1b4b' }, shinyPalette: { main: '#99f6e4', belly: '#f0fdfa', accent: '#0f766e', eye: '#134e4a' } },
  });
  S({
    id: 'himmelsdrache', name: 'Himmelsdrache', types: ['funke', 'stern'], base: { hp: 95, atk: 105, def: 92, spe: 108 }, ability: 'sturmfeder',
    rarity: 'veryRare', baseExp: 180, ancientMove: 'urblitz',
    learnset: ls([1, 'donnerkeil'], [1, 'sternenregen'], [1, 'sturmklaue'], [34, 'himmelszorn']),
    dex: 'Ein Drache aus Wolken und Blitzen. Nur wenige Wanderer haben ihn je gesehen, und keiner glaubt ihnen.',
    art: { body: 'serpent', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['mane', 'glow', 'whiskers'], palette: { main: '#7dd3fc', belly: '#f0f9ff', accent: '#facc15', eye: '#1e3a8a' }, shinyPalette: { main: '#fda4af', belly: '#fff1f2', accent: '#c4b5fd', eye: '#4c1d95' } },
  });

  // --- Einzigartig ---
  S({
    id: 'nyxelle', name: 'Nyxelle', types: ['schatten', 'funke'], base: { hp: 100, atk: 128, def: 92, spe: 138 }, ability: 'finsterschleier',
    rarity: 'unique', legend: { rank: 12 }, hint: 'Nur wenn der Mond verschwindet und das Echo stärker ist, streift eine Katze aus Nacht über den Gipfel.', baseExp: 200, ancientMove: 'urschatten',
    learnset: ls([1, 'mondsichel'], [1, 'schattenfunke'], [1, 'donnerkeil'], [30, 'finsterstoss']),
    dex: 'Eine Mondkatze, die nur während einer Mondfinsternis erscheint. In der Dunkelheit ist sie unantastbar.',
    art: { body: 'quad', ears: 'cat', tail: 'bolt', pattern: 'none', extras: ['veil', 'glow', 'gem', 'whiskers'], palette: { main: '#1e1b4b', belly: '#4338ca', accent: '#c4b5fd', eye: '#facc15' }, shinyPalette: { main: '#f8fafc', belly: '#e0e7ff', accent: '#facc15', eye: '#4338ca' } },
  });

  // --- Boss ---
  S({
    id: 'sturmkrone', name: 'Sturmkrone', types: ['funke', 'schatten'], base: { hp: 120, atk: 112, def: 100, spe: 100 }, ability: 'sturmkrone',
    rarity: 'boss', baseExp: 300, ancientMove: 'urblitz',
    learnset: ls([1, 'donnerkeil'], [1, 'mondsichel'], [1, 'sturmklaue'], [1, 'schreckblick']),
    dex: 'Solas Gefährtin, ein Greif aus Gewitter und Nacht. Der Schleier hat ihr die Sterne aus den Augen genommen.',
    art: { body: 'bird', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'crown', 'veil', 'glow', 'claws'], palette: { main: '#3730a3', belly: '#a5b4fc', accent: '#2b1a3a', eye: '#facc15' }, shinyPalette: { main: '#3730a3', belly: '#a5b4fc', accent: '#2b1a3a', eye: '#facc15' } },
  });
})(globalThis.LUM);
