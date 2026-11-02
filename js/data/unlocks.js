// Kristall-Shop: dauerhafte Freischaltungen für Kristalle. Gekauftes steht in meta.unlocks.
// Ein Lauf merkt sich beim Start, was freigeschaltet war (run.unlocks), damit er sich nicht mittendrin ändert.
// kind: starter (species), blessing (blessing-id), set (Relikt-Set), perk (kleiner Vorteil), frame (Kartenrahmen).
(function (L) {
  const U = (def) => L.def.unlock(def);

  // Schrein ausbauen (sichtbar im Schrein)
  U({ id: 'nest_2', kind: 'shrine', category: 'Schrein', icon: '🪺', name: 'Zweites Brutnest', cost: 60, desc: 'Ein zweites Ei kann gleichzeitig brüten.' });
  U({ id: 'nest_3', kind: 'shrine', category: 'Schrein', icon: '🪺', name: 'Drittes Brutnest', cost: 140, requires: 'nest_2', desc: 'Ein drittes Ei kann gleichzeitig brüten.' });
  U({ id: 'nest_4', kind: 'shrine', category: 'Schrein', icon: '🪺', name: 'Viertes Brutnest', cost: 280, requires: 'nest_3', desc: 'Ein viertes Ei kann gleichzeitig brüten.' });
  U({ id: 'garten', kind: 'shrine', category: 'Schrein', icon: '🌷', name: 'Wärmegarten', cost: 90, desc: 'Eier bekommen 25 % mehr Wärme.' });
  U({ id: 'hort_gross', kind: 'shrine', category: 'Schrein', icon: '🏡', name: 'Großer Hort', cost: 100, desc: 'Im Hort haben 12 statt 8 Schlüpflinge Platz.' });
  U({ id: 'glocke', kind: 'shrine', category: 'Schrein', icon: '🔔', name: 'Echo-Glocke', cost: 110, desc: 'Dein Echo-Begleiter behält die Hälfte seines Levels statt nur ein Drittel.' });
  U({ id: 'bibliothek', kind: 'shrine', category: 'Schrein', icon: '📚', name: 'Bibliothek', cost: 130, desc: 'Erfahrung +5 % in jedem Lauf.' });
  U({ id: 'ruhmeshalle', kind: 'shrine', category: 'Schrein', icon: '🏛️', name: 'Ruhmeshalle', cost: 50, desc: 'Zeigt die Trophäen besiegter Wächter im Schrein.' });
  U({ id: 'laternen', kind: 'shrine', category: 'Schrein', icon: '🏮', name: 'Laternenweg', cost: 40, desc: 'Schwebende Laternen erleuchten den Schrein.' });

  // Gefährten
  U({ id: 'starter_lumini', kind: 'starter', species: 'lumini', category: 'Gefährten', icon: '✨', name: 'Starter: Lumini', cost: 150,
    desc: 'Lumini (Glut/Funke) als Start-Gefährte. Entwickelt sich nicht, startet aber mit guten Werten.' });
  U({ id: 'starter_pilzpuff', kind: 'starter', species: 'pilzpuff', category: 'Gefährten', icon: '🍄', name: 'Starter: Pilzpuff', cost: 150,
    desc: 'Pilzpuff (Spross/Schatten) als Start-Gefährte. Entwickelt sich nicht, startet aber mit guten Werten.' });
  U({ id: 'starter_brummfels', kind: 'starter', species: 'brummfels', category: 'Gefährten', icon: '🪨', name: 'Starter: Brummfels', cost: 400, requires: 'starter_lumini',
    desc: 'Der seltene Brummfels (Stein) als Start-Gefährte. Sehr stark, sehr teuer.' });

  // Segen (neue Segen kommen in die Auswahl)
  U({ id: 'segen_zweiter_gefaehrte', kind: 'blessing', blessing: 'zweiter_gefaehrte', category: 'Segen', icon: '🐾', name: 'Segen: Zweiter Gefährte', cost: 100,
    desc: 'Neuer Segen: Du beginnst mit einem zweiten, zufälligen Monster.' });
  U({ id: 'segen_reliktfund', kind: 'blessing', blessing: 'reliktfund', category: 'Segen', icon: '🎁', name: 'Segen: Reliktfund', cost: 90,
    desc: 'Neuer Segen: Du beginnst mit zwei gewöhnlichen Relikten.' });
  U({ id: 'segen_fluchbrecher', kind: 'blessing', blessing: 'fluchbrecher', category: 'Segen', icon: '🔆', name: 'Segen: Fluchbrecher', cost: 120,
    desc: 'Neuer Segen: Flüche treffen dich nicht. Verfluchte Truhen geben nur ihr Relikt.' });

  // Relikt-Sets (ihre Teile erscheinen ab dann in Läufen)
  U({ id: 'set_jaeger', kind: 'set', set: 'jaeger', category: 'Relikt-Sets', icon: '🏹', name: 'Set: Jäger', cost: 120, desc: 'Bringt das Jagdhorn ins Spiel. Mit Schärfstein und Typprisma: Volltreffer +30 % Schaden.' });
  U({ id: 'set_faenger', kind: 'set', set: 'faenger', category: 'Relikt-Sets', icon: '🥅', name: 'Set: Fänger', cost: 100, desc: 'Bringt den Köderbeutel ins Spiel. Mit Fangnetz und Glücksklee: Fangchance +35 %, Gold +15 %.' });
  U({ id: 'set_sterne', kind: 'set', set: 'sternenwanderer', category: 'Relikt-Sets', icon: '🌠', name: 'Set: Sternenwanderer', cost: 150, desc: 'Bringt die Sternkarte ins Spiel. Mit Sternenstaub und Kompass: Kristalle ×1,5.' });
  U({ id: 'set_mond', kind: 'set', set: 'mondwacht', category: 'Relikt-Sets', icon: '🌙', name: 'Set: Mondwacht', cost: 180, desc: 'Bringt Mondsichel und Nachtauge ins Spiel. Mit dem Schutzamulett: 10 % Ausweichen.' });

  // Vorteile (klein, damit das Spiel fordernd bleibt)
  U({ id: 'rucksack', kind: 'perk', category: 'Vorteile', icon: '🎒', name: 'Größerer Rucksack', cost: 60, desc: 'Jeder Lauf beginnt mit 1 Fangkugel mehr.', apply: (run) => { run.items.fangkugel = (run.items.fangkugel || 0) + 1; } });
  U({ id: 'sparschwein', kind: 'perk', category: 'Vorteile', icon: '🐷', name: 'Sparschwein', cost: 60, desc: 'Jeder Lauf beginnt mit 30 Gold mehr.', apply: (run) => { run.gold += 30; } });
  U({ id: 'erste_hilfe', kind: 'perk', category: 'Vorteile', icon: '🧪', name: 'Erste Hilfe', cost: 80, desc: 'Jeder Lauf beginnt mit 1 Heiltrank mehr.', apply: (run) => { run.items.heiltrank = (run.items.heiltrank || 0) + 1; } });
  U({ id: 'lottes_rabatt', kind: 'perk', category: 'Vorteile', icon: '🏷️', name: 'Lottes Stammkunden-Rabatt', cost: 120, requires: 'sparschwein', desc: 'Alles bei Lotte kostet 10 % weniger.' });
  U({ id: 'superkugel_start', kind: 'perk', category: 'Vorteile', icon: '🔵', name: 'Superkugel im Gepäck', cost: 140, requires: 'rucksack', desc: 'Jeder Lauf beginnt mit 1 Superkugel.', apply: (run) => { run.items.superkugel = (run.items.superkugel || 0) + 1; } });

  // Kartenrahmen (nur Aussehen)
  U({ id: 'rahmen_sakura', kind: 'frame', frame: 'sakura', category: 'Kartenrahmen', icon: '🌸', name: 'Rahmen: Kirschblüte', cost: 40, desc: 'Ein rosa Rahmen mit Blütenglanz für deine Spielerkarte.' });
  U({ id: 'rahmen_meer', kind: 'frame', frame: 'meer', category: 'Kartenrahmen', icon: '🌊', name: 'Rahmen: Meeresglanz', cost: 40, desc: 'Ein blauer, schimmernder Rahmen.' });
  U({ id: 'rahmen_nacht', kind: 'frame', frame: 'nacht', category: 'Kartenrahmen', icon: '🌌', name: 'Rahmen: Sternennacht', cost: 90, desc: 'Ein dunkler Rahmen mit funkelnden Sternen.' });
  U({ id: 'rahmen_gold', kind: 'frame', frame: 'gold', category: 'Kartenrahmen', icon: '👑', name: 'Rahmen: Echo-Gold', cost: 250, desc: 'Ein leuchtender Goldrahmen. Nur für echte Bannträger.' });

  const BASE_STARTERS = ['glimmi', 'plitsch', 'knospi'];

  L.unlocks = {
    CATEGORIES: ['Schrein', 'Gefährten', 'Segen', 'Relikt-Sets', 'Vorteile', 'Kartenrahmen'],
    BASE_STARTERS,
    owned(meta, id) { return !!(meta.unlocks && meta.unlocks[id]); },
    // Kann man es kaufen? Gibt null oder den Grund zurück.
    blocker(meta, id) {
      const u = L.registry.get('unlock', id);
      if (L.unlocks.owned(meta, id)) return 'Schon gekauft';
      if (u.requires && !L.unlocks.owned(meta, u.requires)) return 'Erst „' + L.registry.get('unlock', u.requires).name + '“ kaufen';
      if (meta.crystals < u.cost) return 'Nicht genug Kristalle';
      return null;
    },
    buy(meta, id) {
      const why = L.unlocks.blocker(meta, id);
      if (why) throw new Error(why);
      const u = L.registry.get('unlock', id);
      meta.crystals -= u.cost;
      meta.unlocks[id] = Date.now();
      return u;
    },
    starters(meta) {
      return BASE_STARTERS.concat(L.registry.all('unlock').filter((u) => u.kind === 'starter' && L.unlocks.owned(meta, u.id)).map((u) => u.species));
    },
    // Segen, die im Lauf erscheinen dürfen
    blessings(unlockIds) {
      return L.registry.all('blessing').filter((b) => !b.unlock || unlockIds.indexOf(b.unlock) >= 0);
    },
    // Freischaltungen, die ein neuer Lauf übernimmt
    forRun(meta) { return meta ? Object.keys(meta.unlocks || {}) : []; },
    runHas(run, id) { return (run.unlocks || []).indexOf(id) >= 0; },
    // Vorteile auf einen neuen Lauf anwenden
    applyPerks(run) {
      for (const id of run.unlocks || []) {
        if (!L.registry.has('unlock', id)) continue;
        const u = L.registry.get('unlock', id);
        if (u.kind === 'perk' && u.apply) u.apply(run);
      }
    },
    frames(meta) { return L.registry.all('unlock').filter((u) => u.kind === 'frame' && L.unlocks.owned(meta, u.id)); },
  };

  L.registry.addValidator('unlock', (def, reg) => {
    const errs = [];
    if (L.unlocks.CATEGORIES.indexOf(def.category) < 0) errs.push('unbekannte Kategorie ' + def.category);
    if (!(def.cost > 0)) errs.push('Preis fehlt');
    if (def.requires && !reg.has('unlock', def.requires)) errs.push('unbekannte Voraussetzung ' + def.requires);
    if (def.kind === 'starter' && !reg.has('species', def.species)) errs.push('unbekannte Art ' + def.species);
    if (def.kind === 'blessing' && !reg.has('blessing', def.blessing)) errs.push('unbekannter Segen ' + def.blessing);
    if (def.kind === 'set' && !reg.has('relicSet', def.set)) errs.push('unbekanntes Set ' + def.set);
    return errs;
  });
})(globalThis.LUM);
