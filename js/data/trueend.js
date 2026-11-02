// Das wahre Ende: 9 Sternenfragmente (bleiben über Läufe), Stellio und der Endkampf gegen Ardan.
// Fragmente: je Akt eins vom Wächter (boss_), eins vom versteckten Pfad (hid_) und eins aus dem Ereignis „Sternensplitter“ (ev_).
(function (L) {
  const ls = (...pairs) => pairs.map(([level, move]) => ({ level, move }));

  // --- Stellio ---
  L.def.ability({ id: 'sternenecho', name: 'Sternenecho', desc: 'Einmal pro Kampf übersteht es einen K.-o.-Treffer mit 1 KP.',
    hooks: { modifySurvive: (v, c) => { const k = 'echo_' + c.mon.uid; if (v || c.battle.flags[k]) return v; c.battle.flags[k] = true; return true; } } });
  L.def.species({
    id: 'stellio', name: 'Stellio', types: ['stern'], base: { hp: 110, atk: 115, def: 110, spe: 120 }, ability: 'sternenecho',
    rarity: 'unique', baseExp: 220, ancientMove: 'urblitz',
    hint: 'Sammle alle neun Sternenfragmente. Dann öffnet sich auf dem Gipfel der Sternenriss.',
    learnset: ls([1, 'sternsplitter'], [1, 'sternenregen'], [1, 'konzentration'], [30, 'himmelszorn']),
    dex: 'Ein kleiner Drache aus reinem Sternenlicht. Er ist der Schlüssel zur Sternenquelle – und zum Ende der Zeitschleife.',
    art: { body: 'serpent', ears: 'horn', tail: 'bolt', pattern: 'spots', extras: ['glow', 'gem', 'mane', 'shine'], palette: { main: '#fef3c7', belly: '#ffffff', accent: '#fbbf24', eye: '#1e3a8a' }, shinyPalette: { main: '#e0e7ff', belly: '#ffffff', accent: '#a78bfa', eye: '#1e1b4b' } },
  });

  // --- Ardans Monster ---
  L.def.move({ id: 'schleiersturm', name: 'Schleiersturm', type: 'schatten', power: 110, accuracy: 90, priority: 0, effects: [{ kind: 'stage', stat: 'acc', delta: -1, chance: 0.3, target: 'foe' }], contact: false, signature: true,
    upgrades: { a: { name: 'Schleiersturm+', power: 125 }, b: { name: 'Schleiersturm (Rein)', accuracy: 100 } }, desc: 'Der schwarze Schleier selbst greift an.' });
  L.def.ability({ id: 'schwarzes_echo', name: 'Schwarzes Echo', desc: 'Schatten- und Stern-Attacken sind 15 % stärker. Heilt jede Runde 1/16 KP.',
    hooks: {
      modifyDamage: (v, c) => (c.move && (c.move.type === 'schatten' || c.move.type === 'stern') ? v * 1.15 : v),
      onTurnEnd: (c) => { if (c.mon.hp > 0 && c.mon.hp < L.mon.maxHp(c.mon)) c.api.heal(c.side, 1 / 16); },
    } });
  L.def.species({
    id: 'schleierdrache', name: 'Schleierdrache', types: ['schatten', 'stern'], base: { hp: 130, atk: 118, def: 108, spe: 104 }, ability: 'schwarzes_echo',
    rarity: 'boss', baseExp: 400, ancientMove: 'urschatten',
    learnset: ls([1, 'finsterstoss'], [1, 'mondsichel'], [1, 'sternsplitter'], [1, 'schreckblick']),
    dex: 'Ardans Gefährte. Einst ein Sternendrache wie Stellio, jetzt ganz vom Schleier verschlungen.',
    art: { body: 'serpent', ears: 'horn', tail: 'bolt', pattern: 'stripes', extras: ['veil', 'glow', 'crown', 'mane', 'claws'], palette: { main: '#1e1b4b', belly: '#4c1d95', accent: '#0f0a1a', eye: '#f0abfc' }, shinyPalette: { main: '#1e1b4b', belly: '#4c1d95', accent: '#0f0a1a', eye: '#f0abfc' } },
  });
  L.def.character({ id: 'ardan', name: 'Ardan', title: 'Träger des schwarzen Echo-Steins', portrait: { skin: '#e2c0a0', hair: { style: 'kapuze', color: '#9f1239' }, eyes: '#c084fc', outfit: '#3f3f46', accessory: 'schal' } });
  L.def.trainer({
    id: 'ardan', name: 'Ardan', character: 'ardan', ai: 'boss', boss: true,
    team: [{ species: 'aschegeist', levelOffset: -3 }, { species: 'sturmmarder', levelOffset: -2 }, { species: 'schleierdrache', levelOffset: 0 }],
    items: { superheiltrank: 2 },
    phases: [{ mon: 2, atHpBelow: 0.5, scene: 'ardan_phase2', weather: 'nebel', addMove: 'schleiersturm', stageBoost: { stat: 'spe', delta: 1 } }],
    lines: { start: 'Ich habe diesen Kampf tausendmal verloren. Diesmal nicht.', win: 'Kael … es tut mir leid …', lose: 'Die Schleife beginnt von vorn.' },
  });

  // --- Ereignisse ---
  L.def.event({
    id: 'sternensplitter', title: 'Ein Sternensplitter', icon: '🌠', rare: 0.6, condition: { fragmentMissingHere: 'ev_' },
    text: 'Zwischen den Steinen leuchtet ein Splitter, so hell wie ein kleiner Stern. Er summt dieselbe Melodie wie dein Echo-Stein.',
    options: [
      { label: 'Mit bloßen Händen greifen', preview: 'Sternenfragment, aber das Team verliert 25 % KP.', effect: (api) => { api.damageTeam(0.25); api.fragment('ev_'); api.text('Der Splitter brennt kalt in deiner Hand … und verschmilzt mit deinem Echo-Stein. Ein Sternenfragment!'); } },
      { label: 'Den Wächter des Splitters besiegen', preview: 'Ein harter Kampf, dann das Fragment.', effect: (api) => { api.fragment('ev_'); api.text('Ein Sternengeist erscheint und stellt sich dir in den Weg!'); api.battle({ team: [{ species: 'kristallwurm', levelOffset: 2 }], kind: 'trainer', trainerName: 'Sternengeist', rewardSource: 'elite' }); } },
      { label: 'Liegen lassen', effect: (api) => api.text('Du lässt den Splitter, wo er ist. Er flackert enttäuscht.') },
    ],
  });
  L.def.event({
    id: 'sternenriss', title: 'Der Sternenriss', icon: '🌌', condition: { fragmentsAtLeast: 9 },
    text: 'Der Himmel über dem Gipfel reißt auf. Neun Lichter kreisen um deinen Echo-Stein. Aus dem Riss schwebt ein kleiner Drache aus Sternenlicht herab und sieht dich an, als würde er dich schon ewig kennen.',
    options: [
      { label: 'Die Hand ausstrecken', preview: 'Stellio schließt sich an.', effect: (api) => { api.addMon('stellio', api.level + 2); api.flag('stellio'); api.text('Stellio schmiegt sich an dich. Du spürst: Jetzt kannst du die Schleife brechen.'); } },
    ],
  });

  // --- Szenen ---
  const S = (def) => L.def.scene(def);
  const l = (who, expr, text) => ({ who, expr, text });
  S({ id: 'ardan_pre', trigger: 'bossPre', once: false, condition: { runFlag: 'finale' }, lines: [
    l('erzaehler', null, 'Sola sinkt zu Boden. Doch der Sturm hört nicht auf. Er dreht sich schneller … und schwarz.'),
    l('ardan', 'ernst', 'Du hast ihn gefunden. Den Stern. Ich habe ihn in tausend Schleifen gesucht.'),
    l('kael', 'ueberrascht', 'Ardan! Bruder! Was tust du hier?!'),
    l('ardan', 'traurig', 'Ich wollte dich retten, Kael. In der ersten Schleife bist du im Schleier gestorben. Ich habe die Zeit zurückgedreht. Wieder und wieder.'),
    l('ardan', 'wuetend', 'Gib mir den Stern, {name}. Nur mit ihm kann ich alles für immer festhalten!'),
    l('erzaehler', null, 'Stellio leuchtet hell auf und stellt sich schützend vor dich.'),
  ] });
  S({ id: 'ardan_phase2', trigger: 'phase', once: false, condition: { runFlag: 'finale' }, lines: [
    l('ardan', 'wuetend', 'Nein! Ich habe zu viel geopfert, um jetzt zu verlieren!'),
    l('erzaehler', null, 'Der schwarze Echo-Stein zerspringt fast. Der Schleier hüllt alles ein.'),
  ] });
  S({ id: 'ardan_post', trigger: 'bossPost', once: false, condition: { runFlag: 'finale' }, lines: [
    l('ardan', 'traurig', 'Ich … habe verloren. Zum ersten Mal in tausend Schleifen.'),
    l('kael', 'traurig', 'Du hast mich nicht verloren, Ardan. Ich bin hier. Ich lebe.'),
    l('ardan', 'ueberrascht', 'Dann … war alles umsonst? Nein. Dann ist es endlich vorbei.'),
    l('erzaehler', null, 'Der schwarze Echo-Stein zerfällt zu Staub. Stellio breitet die Flügel aus, und Sternenlicht flutet den Himmel.'),
  ] });
  // Modus „Jenseits des Schleiers“: statt des Abspanns geht es direkt weiter in Akt 4
  S({ id: 'jenseits_riss', trigger: 'actOutro', once: false, condition: { mode: 'jenseits', act: 'act3', any: [{ runFlag: 'finale' }, { noTeamHasStellio: true }] }, lines: [
    l('erzaehler', null, 'Der Wind auf dem Gipfel verstummt. Für einen Atemzug ist alles still.'),
    l('mira', 'ueberrascht', 'Warte … hörst du das? Der Schleier … er reißt!'),
    l('erzaehler', null, 'Ein feiner Riss zieht sich quer über den Himmel. Dahinter schimmert etwas wie Glas, und ganz leise klingt ein Lied herüber.'),
    l('mira', 'ernst', 'Das ist noch nicht das Ende, {name}. Da drüben wartet jemand. Jemand, der viel älter ist als die Schleife.'),
    l('erzaehler', null, 'Dein Echo-Stein wird warm. Du machst einen Schritt nach vorn – mitten hinein in den Riss.'),
  ] });
  S({ id: 'true_end', trigger: 'actOutro', once: false, condition: { runFlag: 'finale', notMode: 'jenseits' }, lines: [
    l('mira', 'froh', 'Die Sternenquelle … sie leuchtet so hell wie noch nie! Der Schleier ist fort. Ganz fort.'),
    l('kael', 'froh', 'Danke, {name}. Für alles. Für jeden einzelnen Versuch.'),
    l('mira', 'ernst', 'Dein Echo-Stein ist still geworden. Die Schleife ist gebrochen. Ab jetzt zählt jeder Tag nur einmal.'),
    l('erzaehler', null, 'Und doch … manchmal, in klaren Nächten, summt der Stein ganz leise. Als wollte er sagen: Ich bin da, wenn du mich brauchst.'),
    l('erzaehler', null, '✨ DAS WAHRE ENDE ✨ – Danke fürs Spielen!'),
  ] });

  L.fragments = {
    ALL: ['boss_act1', 'hid_act1', 'ev_act1', 'boss_act2', 'hid_act2', 'ev_act2', 'boss_act3', 'hid_act3', 'ev_act3'],
    NAMES: { boss_: 'vom Wächter', hid_: 'vom versteckten Pfad', ev_: 'aus dem Sternensplitter' },
    // Alle im Lauf bekannten Fragmente (vorher gesammelte + in diesem Lauf gefundene)
    known(run) { return (run.knownFragments || []).concat(run.foundFragments || []); },
    has(run, id) { return L.fragments.known(run).indexOf(id) >= 0; },
    // Fragment im Lauf finden; gibt true zurück, wenn es neu ist
    find(run, id) {
      if (L.fragments.ALL.indexOf(id) < 0 || L.fragments.has(run, id)) return false;
      run.foundFragments = (run.foundFragments || []).concat([id]);
      return true;
    },
    // Beim Laufende in den Spielstand übernehmen
    merge(meta, run) {
      meta.fragments = meta.fragments || [];
      for (const f of run.foundFragments || []) if (meta.fragments.indexOf(f) < 0) meta.fragments.push(f);
    },
    label(id) { const k = Object.keys(L.fragments.NAMES).find((p) => id.indexOf(p) === 0); return 'Akt ' + id.slice(-1) + ' · ' + L.fragments.NAMES[k]; },
  };
})(globalThis.LUM);
