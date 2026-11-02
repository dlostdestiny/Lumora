// Nebenakt „Die Versunkene Tiefe“: Wer im Strudel-Ereignis (Akt 1 oder 2) springt, erlebt nach dem Wächter
// zuerst diesen kurzen Unterwasser-Akt und kehrt danach in den normalen Lauf zurück. side: true = kein Haupt-Akt.
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));
  const S = (def) => L.def.species(def);

  // --- Monster der Tiefe ---
  S({
    id: 'blubbfisch', name: 'Blubbfisch', types: ['flut'], base: { hp: 70, atk: 72, def: 62, spe: 88 }, ability: 'schleimhaut', rarity: 'common', baseExp: 60, ancientMove: 'urflut',
    learnset: ls([1, 'wasserschuss'], [1, 'rempler'], [12, 'blubberstrahl'], [17, 'geysir'], [22, 'flutwelle']),
    evolves: [{ to: 'schillerhai', level: 20 }],
    dex: 'Ein rundlicher Fisch, der beim Schwimmen Luftblasen in Herzform macht.',
    art: { body: 'round', ears: 'fin', tail: 'fin', pattern: 'spots', extras: ['shine', 'drop'], palette: { main: '#60a5fa', belly: '#e0f2fe', accent: '#f472b6', eye: '#1e3a8a' }, shinyPalette: { main: '#fbbf24', belly: '#fffbeb', accent: '#22d3ee', eye: '#1e3a8a' } },
  });
  S({
    id: 'schillerhai', name: 'Schillerhai', types: ['flut', 'schatten'], base: { hp: 92, atk: 112, def: 80, spe: 106 }, ability: 'rabenblick', rarity: 'common', baseExp: 140, ancientMove: 'urflut',
    learnset: ls([1, 'blubberstrahl'], [1, 'nachtbiss'], [20, 'wolkenbruch'], [24, 'mondsichel'], [28, 'flutwelle']),
    dex: 'Ein Hai, dessen Schuppen in allen Farben schillern. Er jagt im Dunkeln nach Glanz.',
    art: { body: 'serpent', ears: 'fin', tail: 'fin', pattern: 'stripes', extras: ['brows', 'shine'], palette: { main: '#3b82f6', belly: '#dbeafe', accent: '#a855f7', eye: '#fde047' }, shinyPalette: { main: '#f59e0b', belly: '#fef3c7', accent: '#06b6d4', eye: '#1e3a8a' } },
  });
  S({
    id: 'korallino', name: 'Korallino', types: ['flut', 'stein'], base: { hp: 85, atk: 65, def: 100, spe: 45 }, ability: 'kristallkern', rarity: 'common', baseExp: 65, ancientMove: 'urfels',
    learnset: ls([1, 'steinwurf'], [1, 'wasserschuss'], [10, 'haerten'], [15, 'erdstoss'], [20, 'geysir'], [26, 'felssturz']),
    dex: 'Eine kleine Koralle mit Beinchen. Fische schlafen gern in ihren Ästen.',
    art: { body: 'blob', ears: 'horn', tail: 'none', pattern: 'spots', extras: ['flowers', 'shell'], palette: { main: '#fb7185', belly: '#ffe4e6', accent: '#fde047', eye: '#4c0519' }, shinyPalette: { main: '#a3e635', belly: '#f7fee7', accent: '#38bdf8', eye: '#1a2e05' } },
  });
  S({
    id: 'quallie', name: 'Quallie', types: ['flut', 'funke'], base: { hp: 72, atk: 70, def: 70, spe: 80 }, ability: 'gewitterwolle', rarity: 'common', baseExp: 65, ancientMove: 'urblitz',
    learnset: ls([1, 'funkenstoss'], [1, 'wasserschuss'], [11, 'schockwelle'], [16, 'blubberstrahl'], [21, 'blitzschlag']),
    dex: 'Eine leuchtende Qualle. Wer sie berührt, kribbelt noch stundenlang.',
    art: { body: 'blob', ears: 'none', tail: 'bolt', pattern: 'none', extras: ['glow', 'antennae', 'shine'], palette: { main: '#c4b5fd', belly: '#f5f3ff', accent: '#facc15', eye: '#3b0764' }, shinyPalette: { main: '#86efac', belly: '#f0fdf4', accent: '#fb7185', eye: '#14532d' } },
  });
  S({
    id: 'tiefenlaterne', name: 'Tiefenlaterne', types: ['schatten', 'flut'], base: { hp: 90, atk: 92, def: 85, spe: 78 }, ability: 'gluehlicht', rarity: 'rare', baseExp: 110, ancientMove: 'urschatten',
    learnset: ls([1, 'nachtbiss'], [1, 'blubberstrahl'], [16, 'schattenfunke'], [22, 'flutwelle'], [28, 'finsterstoss']),
    dex: 'Ein Anglerfisch mit einer Laterne, die Wanderer in die Tiefe lockt. Manche sagen, das Licht flüstert.',
    art: { body: 'round', ears: 'none', tail: 'fin', pattern: 'spots', extras: ['lantern', 'brows', 'glow'], palette: { main: '#1e293b', belly: '#475569', accent: '#fde047', eye: '#fde047' }, shinyPalette: { main: '#7f1d1d', belly: '#fecaca', accent: '#22d3ee', eye: '#22d3ee' } },
  });
  S({
    id: 'abyssa', name: 'Abyssa', types: ['flut', 'schatten'], base: { hp: 130, atk: 110, def: 110, spe: 85 }, ability: 'geysirkraft', rarity: 'boss', baseExp: 260, ancientMove: 'urflut',
    learnset: ls([1, 'flutwelle'], [1, 'finsterstoss'], [1, 'regentanz'], [1, 'schreckblick']),
    dex: 'Maris’ Gefährtin, eine riesige Seeschlange. Der Schleier hat das Meer um sie herum schwarz gefärbt.',
    art: { body: 'serpent', ears: 'fin', tail: 'fin', pattern: 'stripes', extras: ['crown', 'veil', 'glow', 'mane'], palette: { main: '#0e7490', belly: '#a5f3fc', accent: '#2b1a3a', eye: '#f0abfc' }, shinyPalette: { main: '#0e7490', belly: '#a5f3fc', accent: '#2b1a3a', eye: '#f0abfc' } },
  });

  // --- Relikt der Tiefe ---
  L.def.relic({ id: 'perle_der_tiefe', name: 'Perle der Tiefe', icon: '🦪', rarity: 'rare', unlock: 'never', desc: 'Flut-Attacken +15 %, Heilung nach Kämpfen +5 %.',
    hooks: { modifyDamage: (v, c) => (c.move && c.move.type === 'flut' ? v * 1.15 : v), modifyHealAfterBattle: (v) => (v > 0 ? v + 0.05 : v) } });

  // --- Figuren und Trainer ---
  L.def.character({ id: 'maris', name: 'Maris', title: 'Nixe der Tiefe', portrait: { skin: '#cfe8f0', hair: { style: 'lang', color: '#0891b2' }, eyes: '#a21caf', outfit: '#164e63', accessory: 'krone' } });
  L.def.character({ id: 'finn', name: 'Finn', title: 'Perlentaucher', portrait: { skin: '#e2b48c', hair: { style: 'kurz', color: '#0f766e' }, eyes: '#0369a1', outfit: '#0e7490', accessory: 'brille' } });
  L.def.trainer({ id: 'taucher_finn', name: 'Perlentaucher Finn', character: 'finn', ai: 'elite',
    team: [{ species: 'korallino', levelOffset: -1 }, { species: 'quallie', levelOffset: 0 }, { species: 'tiefenlaterne', levelOffset: 1 }],
    lines: { start: 'Hier unten ist mein Revier! Keine Perle für dich!', win: 'Blubb … verloren.', lose: 'Zu wenig Luft, was?' } });
  L.def.trainer({ id: 'maris', name: 'Nixe Maris', character: 'maris', ai: 'boss', boss: true,
    team: [{ species: 'quallie', levelOffset: -3 }, { species: 'schillerhai', levelOffset: -2 }, { species: 'abyssa', levelOffset: -1 }],
    items: { superheiltrank: 1 },
    phases: [{ mon: 2, atHpBelow: 0.5, scene: 'maris_phase2', weather: 'stroemung', addMove: 'wolkenbruch', stageBoost: { stat: 'def', delta: 1 } }],
    lines: { start: 'Niemand kommt hierher. Und niemand geht.', win: 'Das Meer … es wird wieder blau …', lose: 'Bleib hier unten. Für immer.' } });

  // --- Szenen ---
  const l = (who, expr, text) => ({ who, expr, text });
  L.def.scene({ id: 'tiefe_intro', trigger: 'actIntro', once: false, condition: { act: 'tiefe' }, lines: [
    l('erzaehler', null, 'Nebenakt – Die Versunkene Tiefe'),
    l('erzaehler', null, 'Der Strudel zieht dich hinab. Doch du kannst atmen. Um dich herum leuchten Korallen, und tief unten schimmert eine versunkene Stadt.'),
    l('mira', 'ueberrascht', '{name}? Ich höre dich kaum … Wo bist du? Das ist kein Ort, den ich kenne!'),
  ] });
  L.def.scene({ id: 'maris_pre', trigger: 'bossPre', once: false, condition: { act: 'tiefe' }, lines: [
    l('maris', 'traurig', 'Ein Mensch, hier unten? Der Mann in Grau hat gesagt, die Tiefe sei sicher vor dem Schleier.'),
    l('maris', 'wuetend', 'Er hat gelogen. Und jetzt ist das Meer schwarz. Abyssa! Verschlinge den Eindringling!'),
  ] });
  L.def.scene({ id: 'maris_phase2', trigger: 'phase', once: false, condition: { act: 'tiefe' }, lines: [
    l('maris', 'wuetend', 'Die Strömung gehört mir!'),
  ] });
  L.def.scene({ id: 'maris_post', trigger: 'bossPost', once: false, condition: { act: 'tiefe' }, lines: [
    l('maris', 'froh', 'Das Wasser wird klar. Danke, Bannträger. Nimm diese Perle. Sie gehört dem, der die Tiefe befreit.'),
    l('erzaehler', null, 'Ein warmer Strom trägt dich nach oben. Du tauchst auf … genau dort, wo dein Weg weitergeht.'),
  ] });

  // --- Ereignisse ---
  L.def.event({ id: 'strudel', title: 'Der Strudel', icon: '🌀', rare: 0.45, condition: { noRunFlag: 'nebenakt' },
    text: 'In einem stillen Teich dreht sich plötzlich ein leuchtender Strudel. Aus der Tiefe klingt ein leises Lied.',
    options: [
      { label: 'Hineinspringen', preview: 'Nach dem nächsten Wächter führt dich der Weg in die Tiefe (ein Extra-Akt).', effect: (api) => { api.flag('nebenakt'); api.text('Du springst! Das Wasser ist warm … und dann ist alles still. Etwas hat dich bemerkt.'); } },
      { label: 'Eine Münze hineinwerfen', preview: 'Wünsch dir was.', effect: (api) => { api.gold(-5); if (api.rng.chance(0.5)) { api.heal(0.3); api.text('Der Strudel leuchtet. Dein Team fühlt sich erfrischt.'); } else api.text('Die Münze verschwindet. Nichts passiert.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Das Lied verstummt hinter dir.') },
    ] });
  L.def.event({ id: 'versunkene_truhe', title: 'Die versunkene Truhe', icon: '🧰',
    text: 'Zwischen Korallen liegt eine alte Truhe. Seegras wächst über das Schloss.',
    options: [
      { label: 'Aufbrechen', preview: 'Gold oder ein Relikt … oder ein Biss.', effect: (api) => { if (api.rng.chance(0.6)) { const r = api.relic('random'); api.text('In der Truhe glitzert: ' + r + '.'); } else { api.text('Ein Schillerhai hat in der Truhe geschlafen!'); api.battle({ team: [{ species: 'schillerhai', levelOffset: 1 }], kind: 'wild', rewardSource: 'elite' }); } } },
      { label: 'Liegen lassen', effect: (api) => api.text('Manche Schätze bleiben besser, wo sie sind.') },
    ] });

  // --- Der Akt selbst ---
  L.def.act({
    id: 'tiefe', order: 99, side: true, name: 'Die Versunkene Tiefe',
    levelRange: [12, 18],
    map: { layers: 9, hiddenChance: 0, nodeWeights: { battle: 50, elite: 10, spring: 12, shop: 6, event: 22 } },
    rival: null,
    elites: ['taucher_finn'],
    boss: { trainer: 'maris', arena: 'tiefsee' },
    intro: 'tiefe_intro', outro: null,
    hidden: { encounters: [{ species: 'tiefenlaterne', weight: 1 }] },
    weatherPool: ['stroemung', 'stroemung', 'nebel'],
    variants: [{
      id: 'korallenstadt', name: 'Korallenstadt', background: 'tiefsee', weather: 'stroemung',
      palette: { sky: '#082f49', far: '#0c4a6e', near: '#164e63', light: '#67e8f9' },
      encounters: [{ species: 'blubbfisch', weight: 22 }, { species: 'korallino', weight: 18 }, { species: 'quallie', weight: 18 }, { species: 'tropfling', weight: 10 }, { species: 'tiefenlaterne', weight: 5, minLayer: 3 }],
      events: ['versunkene_truhe', 'wandernde_haendlerin', 'tauschhaendler', 'sprechender_pilz'],
    }],
  });
})(globalThis.LUM);
