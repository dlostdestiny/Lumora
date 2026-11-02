// Einzigartige Monster (Spezifikation 3.4). Jedes hat eine geheime Bedingung, siehe Akt- und Lauf-Daten.
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));

  L.def.species({
    id: 'wispelin', name: 'Wispelin', types: ['spross', 'schatten'], base: { hp: 105, atk: 118, def: 105, spe: 128 }, ability: 'irrlicht',
    rarity: 'unique', legend: { rank: 3 }, baseExp: 150, ancientMove: 'urschatten',
    learnset: ls([1, 'irrlichtschein'], [1, 'saugwurzel'], [1, 'gifthauch'], [1, 'schreckblick'], [20, 'blattwirbel']),
    hint: 'Folge im Flüsterwald keinem Quellwasser …',
    dex: 'Eine Laterne aus Blättern, in der ein Irrlicht wohnt. Zeigt sich nur denen, die das Leiden nicht scheuen.',
    art: { body: 'serpent', ears: 'leaf', tail: 'leaf', pattern: 'none', extras: ['lantern', 'glow'], palette: { main: '#5f8f6a', belly: '#e4f5e8', accent: '#c4b5fd', eye: '#7c3aed' }, shinyPalette: { main: '#e2c48f', belly: '#fff8ea', accent: '#fca5a5', eye: '#b91c1c' } },
  });
  L.def.species({
    id: 'pochi', name: 'Pochi', types: ['funke'], base: { hp: 70, atk: 70, def: 70, spe: 120 }, ability: 'glueckspfote',
    rarity: 'unique', baseExp: 150, ancientMove: 'urblitz',
    learnset: ls([1, 'funkenstoss'], [1, 'surren'], [1, 'rempler'], [10, 'funkenschweif'], [20, 'blitzschlag']),
    hint: 'Manchmal hat man einfach Glück.',
    dex: 'Ein unscheinbarer kleiner Hund mit Kleeblatt-Fleck. Wo er auftaucht, liegen Münzen.',
    art: { body: 'round', ears: 'long', tail: 'fluffy', pattern: 'spots', extras: ['clover', 'cheeks'], palette: { main: '#f5e6c8', belly: '#ffffff', accent: '#5fcf5a', eye: '#422006' }, shinyPalette: { main: '#ffd700', belly: '#fff8d6', accent: '#5fcf5a', eye: '#422006' } },
  });
})(globalThis.LUM);
