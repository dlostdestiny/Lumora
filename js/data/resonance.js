// Resonanz: Typ-Kombinationen im Team geben Boni (Spezifikation 7a). Nur kampffähige Monster zählen.
(function (L) {
  const typesOf = (m) => L.registry.get('species', m.species).types;
  const count = (team, type) => team.filter((m) => typesOf(m).indexOf(type) >= 0).length;
  const has = (team, type) => count(team, type) > 0;
  const typeBoost = (type, f) => ({ modifyDamage: (v, c) => (c.move && c.move.type === type ? v * f : v) });

  for (const t of L.types.NORMAL) {
    const tn = L.registry.get('type', t).name;
    L.def.resonance({ id: 'duo_' + t, name: tn + '-Duo', desc: '2 ' + tn + '-Monster: ' + tn + '-Attacken +10 %.', check: (team) => count(team, t) === 2, hooks: typeBoost(t, 1.1) });
    L.def.resonance({
      id: 'trio_' + t, name: tn + '-Trio', desc: '3+ ' + tn + '-Monster: ' + tn + '-Attacken +20 %, Verteidigung +10 %.', check: (team) => count(team, t) >= 3,
      hooks: Object.assign(typeBoost(t, 1.2), { modifyStat: (v, c) => (c.stat === 'def' ? v * 1.1 : v) }),
    });
  }
  L.def.resonance({ id: 'gewitter', name: 'Gewitter', desc: 'Flut + Funke: Funke-Attacken treffen immer.', check: (t) => has(t, 'flut') && has(t, 'funke'),
    hooks: { modifyAccuracy: (v, c) => (c.move && c.move.type === 'funke' ? 1 : v) } });
  L.def.resonance({ id: 'waldbrand', name: 'Waldbrand', desc: 'Glut + Spross: Brand-Chancen +10 %.', check: (t) => has(t, 'glut') && has(t, 'spross'),
    hooks: { modifyStatusChance: (v, c) => (c.status === 'brand' ? v + 0.1 : v) } });
  L.def.resonance({ id: 'wurzelfels', name: 'Wurzelfels', desc: 'Stein + Spross: Verteidigung +1 Stufe beim Einwechseln.', check: (t) => has(t, 'stein') && has(t, 'spross'),
    hooks: { onSwitchIn: (c) => c.api.stage(c.side, 'def', 1) } });
  L.def.resonance({ id: 'nachtblitz', name: 'Nachtblitz', desc: 'Schatten + Funke: Volltreffer-Stufe +1.', check: (t) => has(t, 'schatten') && has(t, 'funke'),
    hooks: { modifyCritStage: (v, c) => (c.defending ? v : v + 1) } });
  L.def.resonance({
    id: 'harmonie', name: 'Harmonie', desc: '4 verschiedene Haupt-Typen: Angriff, Verteidigung und Tempo +5 %.',
    check: (t) => new Set(t.map((m) => typesOf(m)[0])).size >= 4,
    hooks: { modifyStat: (v, c) => (c.stat !== 'hp' ? v * 1.05 : v) },
  });

  L.resonance = {
    active(team) {
      const alive = team.filter((m) => m.hp > 0);
      return L.registry.all('resonance').filter((r) => r.check(alive));
    },
  };

  L.registry.addValidator('resonance', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
