// Monster-Arten aus Akt 4 (Jenseits des Schleiers: Gläserne Ebene und Sternenstrom).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));
  const S = (def) => L.def.species(def);

  // --- Häufig ---
  S({
    id: 'flimmerfalter', name: 'Flimmerfalter', types: ['wind', 'funke'], base: { hp: 68, atk: 78, def: 64, spe: 106 }, ability: 'sturmfeder',
    rarity: 'common', baseExp: 80, ancientMove: 'urblitz',
    learnset: ls([1, 'windstoss'], [1, 'funkenstoss'], [24, 'zischflug'], [27, 'boe'], [30, 'funkenschweif'], [34, 'wirbeltanz']),
    evolves: [{ to: 'aurorafalter', level: 34 }],
    dex: 'Ein Falter, dessen Flügel wie Glas im Sternenwind flimmern. Wo er fliegt, knistert die Luft ganz leise.',
    art: { body: 'bird', ears: 'none', tail: 'none', pattern: 'spots', extras: ['wings', 'antennae', 'shine'], palette: { main: '#a5f3fc', belly: '#ecfeff', accent: '#facc15', eye: '#164e63' }, shinyPalette: { main: '#fbcfe8', belly: '#fff1f8', accent: '#a78bfa', eye: '#581c87' } },
  });
  S({
    id: 'aurorafalter', name: 'Aurorafalter', types: ['wind', 'funke'], base: { hp: 90, atk: 105, def: 85, spe: 138 }, ability: 'sturmfeder',
    rarity: 'common', baseExp: 170, ancientMove: 'urblitz',
    learnset: ls([1, 'boe'], [1, 'donnerkeil'], [34, 'wirbelsturm'], [38, 'blitzschlag'], [42, 'rueckenwind']),
    dex: 'Seine riesigen Flügel schimmern wie ein Nordlicht. Wer ihm nachsieht, vergisst für einen Moment alle Sorgen.',
    art: { body: 'bird', ears: 'none', tail: 'bolt', pattern: 'stripes', extras: ['wings', 'antennae', 'glow', 'gem'], palette: { main: '#5eead4', belly: '#f0fdfa', accent: '#c084fc', eye: '#134e4a' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#f472b6', eye: '#78350f' } },
  });
  S({
    id: 'zahnradwicht', name: 'Zahnradwicht', types: ['metall'], base: { hp: 68, atk: 76, def: 84, spe: 82 }, ability: 'panzerschale',
    rarity: 'common', baseExp: 82, ancientMove: 'urfels',
    learnset: ls([1, 'eisenkralle'], [1, 'rempler'], [24, 'magnetfeld'], [27, 'stahlschlag'], [30, 'kristallsplitter'], [34, 'haerten']),
    // Verzweigte Entwicklung: Bei Lv 34 entscheidest du, welche Form es annimmt.
    evolves: [{ to: 'uhrwerkritter', level: 34 }, { to: 'taktgeist', level: 34 }],
    dex: 'Ein winziger Wicht aus Zahnrädern. Er tickt fröhlich vor sich hin und bleibt nie stehen.',
    art: { body: 'round', ears: 'none', tail: 'none', pattern: 'spots', extras: ['gem', 'cheeks', 'tuft'], palette: { main: '#94a3b8', belly: '#e2e8f0', accent: '#fbbf24', eye: '#1e293b' }, shinyPalette: { main: '#fcd34d', belly: '#fffbeb', accent: '#38bdf8', eye: '#78350f' } },
  });
  S({
    id: 'uhrwerkritter', name: 'Uhrwerkritter', types: ['metall', 'stein'], base: { hp: 98, atk: 110, def: 128, spe: 78 }, ability: 'felsenfest',
    rarity: 'common', baseExp: 175, ancientMove: 'urfels',
    learnset: ls([1, 'stahlschlag'], [1, 'steinwurf'], [34, 'metallsturm'], [38, 'felssturz'], [42, 'lawine']),
    dex: 'Ein Ritter, der Takt für Takt marschiert. Sein Schwert schlägt jede Stunde einmal zu, immer auf die Sekunde.',
    art: { body: 'tall', ears: 'horn', tail: 'none', pattern: 'stripes', extras: ['claws', 'brows', 'crown', 'shell'], palette: { main: '#64748b', belly: '#cbd5e1', accent: '#f59e0b', eye: '#0f172a' }, shinyPalette: { main: '#d6a77a', belly: '#fff7ed', accent: '#0ea5e9', eye: '#451a03' } },
  });
  S({
    id: 'taktgeist', name: 'Taktgeist', types: ['metall', 'schatten'], base: { hp: 82, atk: 108, def: 92, spe: 128 }, ability: 'schattenherz',
    rarity: 'common', baseExp: 175, ancientMove: 'urschatten',
    learnset: ls([1, 'stahlschlag'], [1, 'schattenklaue'], [34, 'metallsturm'], [38, 'finsterstoss'], [42, 'schattenfunke']),
    dex: 'Ein Geist, der aus der Zeit zwischen zwei Ticks gemacht ist. Man hört ihn nur, wenn die Uhr stillsteht.',
    art: { body: 'tall', ears: 'none', tail: 'fluffy', pattern: 'none', extras: ['veil', 'glow', 'gem', 'brows'], palette: { main: '#4c1d95', belly: '#a78bfa', accent: '#fbbf24', eye: '#fde047' }, shinyPalette: { main: '#e2e8f0', belly: '#ffffff', accent: '#f87171', eye: '#dc2626' } },
  });
  S({
    id: 'reifkitz', name: 'Reifkitz', types: ['frost'], base: { hp: 70, atk: 76, def: 66, spe: 100 }, ability: 'nebelhauch',
    rarity: 'common', baseExp: 80, ancientMove: 'urflut',
    learnset: ls([1, 'frosthauch'], [1, 'kratzer'], [24, 'eissplitter'], [27, 'frostbiss'], [31, 'schneeruf'], [35, 'blizzard']),
    evolves: [{ to: 'polarhirsch', level: 35 }],
    dex: 'Ein flinkes Kitz mit Fell aus Raureif. Wo es hüpft, bleiben kleine Eisblumen im Gras zurück.',
    art: { body: 'quad', ears: 'leaf', tail: 'fluffy', pattern: 'spots', extras: ['chestfluff', 'shine', 'tuft'], palette: { main: '#bae6fd', belly: '#f0f9ff', accent: '#e0f2fe', eye: '#075985' }, shinyPalette: { main: '#fbcfe8', belly: '#fdf2f8', accent: '#f9a8d4', eye: '#9d174d' } },
  });
  S({
    id: 'polarhirsch', name: 'Polarhirsch', types: ['frost', 'spross'], base: { hp: 108, atk: 106, def: 98, spe: 96 }, ability: 'edelglanz',
    rarity: 'common', baseExp: 172, ancientMove: 'urwurzel',
    learnset: ls([1, 'frostbiss'], [1, 'alpenhauch'], [35, 'blizzard'], [38, 'blattwirbel'], [42, 'eispanzer']),
    dex: 'Ein stolzer Hirsch, auf dessen Geweih Eiskristalle und Blüten zugleich wachsen. Winter und Frühling wohnen in ihm.',
    art: { body: 'quad', ears: 'leaf', tail: 'fluffy', pattern: 'none', extras: ['antlers', 'flowers', 'mane', 'glow'], palette: { main: '#e0f2fe', belly: '#ffffff', accent: '#86efac', eye: '#0c4a6e' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#fb923c', eye: '#78350f' } },
  });
  S({
    id: 'echomotte', name: 'Echomotte', types: ['schatten', 'wind'], base: { hp: 82, atk: 88, def: 72, spe: 108 }, ability: 'nachtauge',
    rarity: 'common', baseExp: 105, ancientMove: 'urschatten',
    learnset: ls([1, 'windstoss'], [1, 'schattenklaue'], [24, 'nachtbiss'], [28, 'boe'], [32, 'irrlichtschein'], [37, 'finsterstoss']),
    dex: 'Eine Motte, die jeden Laut zweimal flattert. Sie wiederholt die Geräusche, die der Schleier verschluckt hat.',
    art: { body: 'bird', ears: 'none', tail: 'none', pattern: 'spots', extras: ['wings', 'antennae', 'mist'], palette: { main: '#7c3aed', belly: '#ddd6fe', accent: '#67e8f9', eye: '#2e1065' }, shinyPalette: { main: '#fef3c7', belly: '#ffffff', accent: '#fb7185', eye: '#7f1d1d' } },
  });
  S({
    id: 'scherbenkrebs', name: 'Scherbenkrebs', types: ['metall', 'flut'], base: { hp: 72, atk: 92, def: 108, spe: 54 }, ability: 'kristallkern',
    rarity: 'common', baseExp: 95, ancientMove: 'urflut',
    learnset: ls([1, 'eisenkralle'], [1, 'wasserschuss'], [24, 'kristallsplitter'], [27, 'blubberstrahl'], [31, 'stahlschlag'], [36, 'flutwelle']),
    dex: 'Ein Krebs, dessen Panzer aus lauter Glasscherben besteht. Bei Sonnenschein funkelt er wie ein wandernder Kronleuchter.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'spots', extras: ['claws', 'shell', 'shine', 'gem'], palette: { main: '#7dd3fc', belly: '#e0f2fe', accent: '#94a3b8', eye: '#0c4a6e' }, shinyPalette: { main: '#fda4af', belly: '#fff1f2', accent: '#fbbf24', eye: '#7f1d1d' } },
  });

  // --- Selten ---
  S({
    id: 'vergessling', name: 'Vergessling', types: ['schatten'], base: { hp: 100, atk: 90, def: 88, spe: 92 }, ability: 'irrlicht',
    rarity: 'rare', baseExp: 130, ancientMove: 'urschatten',
    learnset: ls([1, 'irrlichtschein'], [1, 'schreckblick'], [26, 'nachtbiss'], [30, 'schattenfunke'], [34, 'mondsichel'], [40, 'finsterstoss']),
    dex: 'Ein sanftes Wesen aus Erinnerungen, die niemand mehr hat. Es sucht jemanden, der sich an seinen Namen erinnert.',
    art: { body: 'blob', ears: 'none', tail: 'none', pattern: 'none', extras: ['veil', 'glow', 'mist', 'cheeks'], palette: { main: '#c4b5fd', belly: '#f5f3ff', accent: '#818cf8', eye: '#312e81' }, shinyPalette: { main: '#fde68a', belly: '#fffbeb', accent: '#fb923c', eye: '#78350f' } },
  });
  S({
    id: 'schleierfuchs', name: 'Schleierfuchs', types: ['frost', 'schatten'], base: { hp: 85, atk: 105, def: 80, spe: 115 }, ability: 'finsterschleier',
    rarity: 'rare', baseExp: 140, ancientMove: 'urschatten',
    learnset: ls([1, 'frostbiss'], [1, 'schattenklaue'], [28, 'eissplitter'], [32, 'mondsichel'], [36, 'blizzard'], [41, 'schattenfunke']),
    dex: 'Ein Fuchs mit einem Schweif wie ein dünner Schleier aus Eis. Er führt Wanderer im Kreis, ganz ohne böse Absicht.',
    art: { body: 'quad', ears: 'cat', tail: 'fluffy', pattern: 'stripes', extras: ['veil', 'whiskers', 'gem', 'glow'], palette: { main: '#a5b4fc', belly: '#eef2ff', accent: '#7c3aed', eye: '#facc15' }, shinyPalette: { main: '#fecdd3', belly: '#fff1f2', accent: '#f43f5e', eye: '#0e7490' } },
  });
  S({
    id: 'zeitwal', name: 'Zeitwal', types: ['wind', 'metall'], base: { hp: 140, atk: 85, def: 115, spe: 60 }, ability: 'kristallkern',
    rarity: 'rare', baseExp: 150, ancientMove: 'urflut',
    learnset: ls([1, 'windstoss'], [1, 'magnetfeld'], [28, 'boe'], [32, 'stahlschlag'], [36, 'wirbelsturm'], [40, 'metallsturm']),
    dex: 'Ein riesiger, sanfter Wal, der durch den Sternenwind schwimmt. Wenn er singt, ticken alle Uhren im Takt seines Herzens.',
    art: { body: 'serpent', ears: 'fin', tail: 'fin', pattern: 'spots', extras: ['gem', 'glow', 'mist', 'cheeks'], palette: { main: '#94a3b8', belly: '#e2e8f0', accent: '#fbbf24', eye: '#1e293b' }, shinyPalette: { main: '#fbcfe8', belly: '#fdf2f8', accent: '#38bdf8', eye: '#831843' } },
  });

  // --- Boss ---
  S({
    id: 'velumora', name: 'Velumora', types: ['frost', 'schatten'], base: { hp: 125, atk: 118, def: 105, spe: 122 }, ability: 'finsterschleier',
    rarity: 'boss', baseExp: 350, ancientMove: 'urschatten',
    learnset: ls([1, 'blizzard'], [1, 'mondsichel'], [1, 'eiskaefig'], [1, 'schattenfunke']),
    dex: 'Vaels einstiger Gefährte, ein Hirsch aus Eis und Nacht. Er hat all die Jahre auf sie gewartet und nie aufgehört, sie zu lieben.',
    art: { body: 'quad', ears: 'leaf', tail: 'fluffy', pattern: 'stripes', extras: ['antlers', 'veil', 'glow', 'gem', 'mane'], palette: { main: '#6366f1', belly: '#c7d2fe', accent: '#a5f3fc', eye: '#fde68a' }, shinyPalette: { main: '#6366f1', belly: '#c7d2fe', accent: '#a5f3fc', eye: '#fde68a' } },
  });
})(globalThis.LUM);
