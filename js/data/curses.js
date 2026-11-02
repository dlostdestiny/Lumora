// Flüche: Nachteile für den Rest des Laufs. Man nimmt sie freiwillig für starke Belohnungen auf sich
// (verfluchte Truhen, Ereignisse, Tagesregeln). Reinigen kann man sie an Quellen oder bei Lotte.
// hooks wirken wie bei Relikten (aber auf dich), runMods ändern Lauf-Werte.
(function (L) {
  const C = (def) => L.def.curse(Object.assign({ hooks: {}, runMods: {} }, def));

  C({ id: 'bleierne_glieder', name: 'Bleierne Glieder', icon: '⛓️', desc: 'Tempo deiner Monster −15 %.',
    hooks: { modifyStat: (v, c) => (c.stat === 'spe' ? v * 0.85 : v) } });
  C({ id: 'bruechige_kugeln', name: 'Brüchige Kugeln', icon: '🥚', desc: 'Fangchance −30 %.',
    hooks: { modifyCatchRate: (v) => v * 0.7 } });
  C({ id: 'gieriger_schatten', name: 'Gieriger Schatten', icon: '🫥', desc: 'Gold aus Kämpfen −40 %.',
    hooks: { modifyGold: (v) => v * 0.6 } });
  C({ id: 'ruhelos', name: 'Ruhelos', icon: '😵', desc: 'Nach Kämpfen gibt es keine Heilung.',
    hooks: { modifyHealAfterBattle: () => 0 } });
  C({ id: 'verwundbar', name: 'Verwundbar', icon: '💔', desc: 'Deine Monster nehmen 12 % mehr Schaden.',
    hooks: { modifyIncomingDamage: (v) => v * 1.12 } });
  C({ id: 'vergessen', name: 'Vergessen', icon: '🌫️', desc: 'Erfahrung −25 %.',
    hooks: { modifyExp: (v) => v * 0.75 } });
  C({ id: 'zittrige_haende', name: 'Zittrige Hände', icon: '🫨', desc: 'Deine Attacken treffen 10 % schlechter.',
    hooks: { modifyAccuracy: (v) => v * 0.9 } });
  C({ id: 'wucherpreise', name: 'Wucherpreise', icon: '💸', desc: 'Alles bei Lotte kostet 40 % mehr.', runMods: { shopPriceMult: 1.4 } });
  C({ id: 'versiegte_quelle', name: 'Versiegte Quelle', icon: '🏜️', desc: 'Quellen heilen nur noch die Hälfte.', runMods: { springHeal: 0.5 } });

  L.curses = {
    PURGE_PRICE: 80,
    has(run, id) { return (run.curses || []).indexOf(id) >= 0; },
    immune(run) { return !!(run.blessing && L.registry.has('blessing', run.blessing) && L.registry.get('blessing', run.blessing).curseImmune); },
    add(run, id) {
      if (L.curses.immune(run)) return;
      run.curses = run.curses || [];
      if (run.curses.indexOf(id) < 0) run.curses.push(id);
    },
    remove(run, id) { run.curses = (run.curses || []).filter((x) => x !== id); },
    // Zufälliger Fluch, den der Lauf noch nicht hat (oder null)
    random(run, rng) {
      const pool = L.registry.all('curse').filter((c) => !L.curses.has(run, c.id));
      return pool.length ? rng.pick(pool).id : null;
    },
    // Produkt bzw. Wert der runMods aller Flüche (Faktoren werden multipliziert)
    mod(run, key, base) {
      let v = base;
      for (const id of run.curses || []) {
        const m = L.registry.get('curse', id).runMods[key];
        if (m !== undefined) v *= m;
      }
      return v;
    },
  };

  L.hooks.sources.push((side) => (side.curses || []).map((id) => ({ source: 'curse', hooks: L.registry.get('curse', id).hooks })));

  L.registry.addValidator('curse', (def) => {
    const errs = L.hooks.check(def.hooks);
    for (const k of Object.keys(def.runMods)) if (['shopPriceMult', 'springHeal'].indexOf(k) < 0) errs.push('unbekannte Regel ' + k);
    return errs;
  });
})(globalThis.LUM);
