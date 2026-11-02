// Herausforderungs-Modi: freiwillige Zusatzregeln für einen Lauf, mit mehr Kristallen als Lohn.
(function (L) {
  const M = (def) => L.def.mode(def);
  M({ id: 'solo', name: 'Allein', icon: '🦸', crystalMult: 2, desc: 'Nur dein Starter. Du kannst keine weiteren Monster mitnehmen.', apply: (run) => { run.teamSize = 1; run.team = run.team.slice(0, 1); } });
  M({ id: 'monotyp', name: 'Ein Typ', icon: '🎨', crystalMult: 1.75, desc: 'Nur Monster, die einen Typ mit deinem Starter teilen, können fangen oder sich anschließen.' });
  M({ id: 'turm', name: 'Echo-Turm', icon: '🗼', crystalMult: 1, requiresWin: true, desc: 'Endlos-Modus: Block für Block wird es härter. Wie hoch kommst du? Freigeschaltet nach deinem ersten Sieg.',
    apply: (run) => { run.sideAct = 'echoturm'; run.tower = { block: 1 }; run.sideLevelBonus = 0; } });
  M({ id: 'jenseits', name: 'Jenseits des Schleiers', icon: '🌌', crystalMult: 1.5, requiresTrueEnd: true, desc: 'Nach Sola geht es weiter: Akt 4 hinter dem Schleier. Woher kommt er wirklich? Freigeschaltet nach dem wahren Ende.' });
  M({ id: 'ohneheilung', name: 'Ohne Heilung', icon: '🩸', crystalMult: 1.75, desc: 'Nach Kämpfen keine Heilung, und an Quellen kannst du nicht ausruhen.' });

  L.modes = {
    of(run) { return run && run.mode && L.registry.has('mode', run.mode) ? L.registry.get('mode', run.mode) : null; },
    // Darf dieses Monster im Lauf dazukommen?
    allows(run, speciesId) {
      if (!run || run.mode !== 'monotyp') return true;
      const starterTypes = L.registry.get('species', run.starter).types;
      return L.registry.get('species', speciesId).types.some((t) => starterTypes.indexOf(t) >= 0);
    },
    // Ist der Modus für diesen Spielstand schon offen?
    open(meta, md) {
      if (md.requiresWin && !(meta && meta.stats && meta.stats.victories > 0)) return false;
      if (md.requiresTrueEnd && !(meta && meta.flags && meta.flags.trueEnd)) return false;
      return true;
    },
    crystalMult(run) { const m = L.modes.of(run); return m ? m.crystalMult : 1; },
  };
})(globalThis.LUM);
