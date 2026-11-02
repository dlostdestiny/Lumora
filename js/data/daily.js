// Tages-Herausforderung: Jeden Tag ein fester Lauf, für alle gleich (Seed aus dem Datum).
// Fester Starter, Segen und eine Tagesregel (Vorteil + Fluch). Nur der erste Versuch des Tages zählt.
(function (L) {
  const D = (def) => L.def.dailyRule(def);

  D({ id: 'goldrausch', name: 'Goldrausch', icon: '💰', desc: '+150 Gold zum Start, aber Lotte verlangt Wucherpreise.', curses: ['wucherpreise'], apply: (run) => { run.gold += 150; } });
  D({ id: 'glaskanone', name: 'Glaskanone', icon: '💥', desc: 'Schärfstein und Typprisma von Anfang an, aber deine Monster sind verwundbar.', curses: ['verwundbar'],
    apply: (run) => { for (const id of ['schaerfstein', 'typprisma']) if (run.relics.indexOf(id) < 0) run.relics.push(id); } });
  D({ id: 'jagdsaison', name: 'Jagdsaison', icon: '🏹', desc: '+5 Fangkugeln, aber die Kugeln sind brüchig.', curses: ['bruechige_kugeln'], apply: (run) => { run.items.fangkugel = (run.items.fangkugel || 0) + 5; } });
  D({ id: 'dauerlauf', name: 'Dauerlauf', icon: '🏃', desc: 'Lehrbuch und Heilmoos am Start, aber nach Kämpfen gibt es keine Heilung.', curses: ['ruhelos'],
    apply: (run) => { for (const id of ['lehrbuch', 'heilmoos']) if (run.relics.indexOf(id) < 0) run.relics.push(id); } });
  D({ id: 'fruehstarter', name: 'Frühstarter', icon: '⏩', desc: 'Dein Starter beginnt 4 Level höher, lernt aber langsamer.', curses: ['vergessen'],
    apply: (run) => { const m = run.team[0]; L.mon.gainExp(m, L.mon.expForLevel(m.level + 4) - m.exp); } });
  D({ id: 'duerre', name: 'Dürre', icon: '🏜️', desc: '3 Superheiltränke im Gepäck, aber die Quellen sind fast versiegt.', curses: ['versiegte_quelle'], apply: (run) => { run.items.superheiltrank = (run.items.superheiltrank || 0) + 3; } });
  D({ id: 'schwerer_schritt', name: 'Schwerer Schritt', icon: '⛓️', desc: 'Rindenschild und Schutzamulett, aber deine Monster sind langsam.', curses: ['bleierne_glieder'],
    apply: (run) => { for (const id of ['rindenschild', 'schutzamulett']) if (run.relics.indexOf(id) < 0) run.relics.push(id); } });

  const STARTERS = ['glimmi', 'plitsch', 'knospi', 'lumini', 'pilzpuff'];
  const pad = (n) => String(n).padStart(2, '0');

  L.daily = {
    ECHO: 1,
    key(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); },
    // Alles, was der heutige Lauf braucht (für alle Spieler gleich)
    setup(key) {
      const rng = L.rng.create('tag:' + key);
      const blessings = L.registry.all('blessing').filter((b) => !b.unlock);
      const rules = L.registry.all('dailyRule');
      return { key, seed: 'tag-' + key, starter: rng.pick(STARTERS), blessing: rng.pick(blessings).id, rule: rng.pick(rules).id, echo: L.daily.ECHO };
    },
    // Neuen Tageslauf erzeugen. Freischaltungen aus dem Kristall-Shop gelten hier nicht (fair für alle).
    createRun(key, meta, now) {
      const s = L.daily.setup(key);
      const run = L.run.create({ seed: s.seed, starter: s.starter, blessing: s.blessing, meta, now, echo: s.echo, unlocks: [], talents: [], companion: false, daily: key });
      const rule = L.registry.get('dailyRule', s.rule);
      run.dailyRule = rule.id;
      rule.apply(run, L.run.rng(run));
      run.curses = run.curses || [];
      for (const c of rule.curses) if (run.curses.indexOf(c) < 0) run.curses.push(c);
      return run;
    },
    played(meta, key) { return !!(meta.daily && meta.daily[key]); },
    score(run) {
      const layer = run.position && run.map.nodes[run.position] ? run.map.nodes[run.position].layer + 1 : 0;
      return run.stats.battlesWon * 10 + run.stats.caught.length * 5 + layer * 5 + run.actIndex * 60 + (run.finished === 'victory' ? 300 : 0);
    },
    // Wird beim Abschluss des Laufs aufgerufen. Gibt Bonus-Kristalle zurück (nur beim ersten Versuch des Tages).
    record(meta, run) {
      meta.daily = meta.daily || {};
      if (!run.daily || meta.daily[run.daily]) return 0;
      const score = L.daily.score(run);
      meta.daily[run.daily] = { result: run.finished, score, at: run.stats.startedAt || 0 };
      meta.stats.dailyPlayed = (meta.stats.dailyPlayed || 0) + 1;
      if (run.finished === 'victory') meta.stats.dailyWon = (meta.stats.dailyWon || 0) + 1;
      meta.stats.dailyBest = Math.max(meta.stats.dailyBest || 0, score);
      return run.finished === 'victory' ? 60 : 15;
    },
    // Ein laufender Tageslauf wird verworfen (z. B. durch einen neuen Lauf): zählt als Niederlage,
    // damit man den ersten Versuch nicht durch Neustarten wiederholen kann.
    abandon(meta, run) {
      if (!run || !run.daily || run.finished || run.result) return null;
      run.finished = 'defeat';
      return L.progress.finishRun(meta, run);
    },
    // Serie: wie viele Tage hintereinander bis heute gespielt
    streak(meta, today) {
      let n = 0;
      const d = new Date(today.getTime());
      while (meta.daily && meta.daily[L.daily.key(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
  };

  L.registry.addValidator('dailyRule', (def, reg) => {
    const errs = [];
    for (const c of def.curses || []) if (!reg.has('curse', c)) errs.push('unbekannter Fluch ' + c);
    if (typeof def.apply !== 'function') errs.push('apply fehlt');
    return errs;
  });
})(globalThis.LUM);
