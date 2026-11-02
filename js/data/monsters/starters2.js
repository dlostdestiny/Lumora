// Weitere Starter, die mit dem Bannträger-Rang freigeschaltet werden (js/data/talents.js, RANK_STARTERS).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));
  const S = (def) => L.def.species(def);

  // Rang 3: Funke
  S({
    id: 'zapfi', name: 'Zapfi', types: ['funke'], base: { hp: 75, atk: 84, def: 72, spe: 99 }, ability: 'funkenherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urblitz',
    learnset: ls([1, 'rempler'], [1, 'brueller'], [1, 'funkenstoss'], [6, 'funkenschweif'], [9, 'surren'], [13, 'steinwurf'], [20, 'blitzschlag'], [28, 'donnerkeil']),
    evolves: [{ to: 'blitzigel', level: 12 }],
    dex: 'Ein kleiner Igel, dessen Stacheln sich bei Gefahr elektrisch aufladen. Er rollt sich zum Schlafen in eine Funkenkugel.',
    art: { body: 'round', ears: 'cat', tail: 'bolt', pattern: 'spots', extras: ['tuft', 'whiskers'], palette: { main: '#fcd34d', belly: '#fff7d6', accent: '#2563eb', eye: '#1e3a8a' }, shinyPalette: { main: '#c4b5fd', belly: '#f5f3ff', accent: '#ec4899', eye: '#4c1d95' } },
  });
  S({
    id: 'blitzigel', name: 'Blitzigel', types: ['funke'], base: { hp: 98, atk: 115, def: 92, spe: 124 }, ability: 'funkenherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urblitz',
    learnset: ls([1, 'funkenstoss'], [1, 'funkenschweif'], [14, 'sturmklaue'], [16, 'steinwurf'], [20, 'blitzschlag'], [24, 'felssturz'], [28, 'donnerkeil']),
    dex: 'Ein flinker Igel mit Stacheln aus reinem Blitz. Wenn er rennt, hinterlässt er ein Gewitter.',
    art: { body: 'quad', ears: 'cat', tail: 'bolt', pattern: 'stripes', extras: ['mane', 'brows', 'glow'], palette: { main: '#facc15', belly: '#fef9c3', accent: '#1d4ed8', eye: '#1e3a8a' }, shinyPalette: { main: '#a78bfa', belly: '#f5f3ff', accent: '#db2777', eye: '#4c1d95' } },
  });

  // Rang 6: Stein
  S({
    id: 'kiesi', name: 'Kiesi', types: ['stein'], base: { hp: 100, atk: 82, def: 98, spe: 50 }, ability: 'steinherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urfels',
    learnset: ls([1, 'rempler'], [1, 'brueller'], [1, 'steinwurf'], [6, 'erdstoss'], [9, 'haerten'], [13, 'saugwurzel'], [20, 'felsbrocken'], [26, 'lawine']),
    evolves: [{ to: 'felspanzer', level: 12 }],
    dex: 'Eine kleine Schildkröte mit einem Panzer aus buntem Kies. Auf ihrem Rücken wächst ein winziger Busch.',
    art: { body: 'round', ears: 'none', tail: 'leaf', pattern: 'spots', extras: ['shell', 'moss'], palette: { main: '#a8a29e', belly: '#f5f5f4', accent: '#65a30d', eye: '#292524' }, shinyPalette: { main: '#f9a8d4', belly: '#fdf2f8', accent: '#0ea5e9', eye: '#292524' } },
  });
  S({
    id: 'felspanzer', name: 'Felspanzer', types: ['stein'], base: { hp: 128, atk: 108, def: 128, spe: 66 }, ability: 'steinherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urfels',
    learnset: ls([1, 'steinwurf'], [1, 'haerten'], [11, 'erdstoss'], [14, 'kristallsplitter'], [15, 'saugwurzel'], [20, 'felsbrocken'], [26, 'lawine']),
    dex: 'Eine mächtige Schildkröte, auf deren Panzer ein kleiner Wald wächst. Sie bewegt sich langsam, aber nichts hält sie auf.',
    art: { body: 'quad', ears: 'none', tail: 'leaf', pattern: 'spots', extras: ['shell', 'moss', 'brows', 'flowers'], palette: { main: '#78716c', belly: '#e7e5e4', accent: '#4d7c0f', eye: '#1c1917' }, shinyPalette: { main: '#f472b6', belly: '#fdf2f8', accent: '#0284c7', eye: '#1c1917' } },
  });

  // Rang 10: Schatten
  S({
    id: 'nachtmiez', name: 'Nachtmiez', types: ['schatten'], base: { hp: 72, atk: 92, def: 66, spe: 100 }, ability: 'schattenherz',
    rarity: 'starter', baseExp: 60, ancientMove: 'urschatten',
    learnset: ls([1, 'kratzer'], [1, 'brueller'], [1, 'schattenklaue'], [6, 'nachtbiss'], [10, 'schreckblick'], [16, 'funkenstoss'], [20, 'finsterstoss'], [27, 'mondsichel']),
    // Bei der Entwicklung wählst du: männlich (Schattenpanther) oder weiblich (Schattenpantherin)
    evolves: [{ to: 'schattenpanther', level: 12 }, { to: 'schattenpantherin', level: 12 }],
    dex: 'Ein Kätzchen aus Dämmerlicht. Tagsüber schläft es in Schatten, nachts leuchten seine Augen wie Laternen.',
    art: { body: 'round', ears: 'cat', tail: 'fluffy', pattern: 'none', extras: ['whiskers', 'gem'], palette: { main: '#4c1d95', belly: '#a78bfa', accent: '#fde047', eye: '#fde047' }, shinyPalette: { main: '#e2e8f0', belly: '#ffffff', accent: '#38bdf8', eye: '#0ea5e9' } },
  });
  S({
    id: 'schattenpanther', name: 'Schattenpanther ♂', types: ['schatten'], base: { hp: 95, atk: 118, def: 82, spe: 120 }, ability: 'schattenherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urschatten',
    learnset: ls([1, 'schattenklaue'], [1, 'nachtbiss'], [14, 'mondsichel'], [16, 'funkenstoss'], [20, 'finsterstoss'], [24, 'sturmklaue'], [30, 'schattenfunke']),
    dex: 'Ein Panther, der mit der Nacht verschmilzt. Nur das goldene Juwel auf seiner Stirn verrät ihn.',
    art: { body: 'quad', ears: 'cat', tail: 'fluffy', pattern: 'stripes', extras: ['whiskers', 'gem', 'brows', 'veil'], palette: { main: '#2e1065', belly: '#7c3aed', accent: '#facc15', eye: '#facc15' }, shinyPalette: { main: '#cbd5e1', belly: '#f8fafc', accent: '#0ea5e9', eye: '#0284c7' } },
  });
  S({
    id: 'schattenpantherin', name: 'Schattenpantherin ♀', types: ['schatten'], base: { hp: 95, atk: 118, def: 82, spe: 120 }, ability: 'schattenherz',
    rarity: 'starter', baseExp: 140, ancientMove: 'urschatten',
    learnset: ls([1, 'schattenklaue'], [1, 'nachtbiss'], [14, 'mondsichel'], [16, 'funkenstoss'], [20, 'finsterstoss'], [24, 'sturmklaue'], [30, 'schattenfunke']),
    dex: 'Die weibliche Form des Schattenpanthers. Auf ihrem Fell leuchten Mondsicheln, und sie jagt so leise wie das Mondlicht selbst.',
    art: { body: 'quad', ears: 'cat', tail: 'fluffy', pattern: 'stripes', extras: ['whiskers', 'gem', 'veil'], palette: { main: '#3b0764', belly: '#a78bfa', accent: '#facc15', eye: '#facc15' }, shinyPalette: { main: '#e2e8f0', belly: '#f8fafc', accent: '#0ea5e9', eye: '#0284c7' } },
  });
})(globalThis.LUM);
