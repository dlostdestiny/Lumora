// Typen und Effektivität (Spezifikation 3.1).
(function (L) {
  const NORMAL = ['glut', 'flut', 'spross', 'funke', 'stein', 'schatten', 'frost', 'wind', 'metall'];
  L.def.type({ id: 'glut', name: 'Glut', color: '#ff7a3d', icon: '🔥', strong: ['spross', 'schatten', 'frost', 'metall'], weak: ['flut', 'stein', 'glut'] });
  L.def.type({ id: 'flut', name: 'Flut', color: '#3fa7ff', icon: '💧', strong: ['glut', 'stein', 'metall'], weak: ['spross', 'flut', 'frost'] });
  L.def.type({ id: 'spross', name: 'Spross', color: '#5fcf5a', icon: '🌿', strong: ['flut', 'stein'], weak: ['glut', 'spross', 'wind', 'metall'] });
  L.def.type({ id: 'funke', name: 'Funke', color: '#ffd23f', icon: '⚡', strong: ['flut', 'schatten', 'wind'], weak: ['stein', 'funke'] });
  L.def.type({ id: 'stein', name: 'Stein', color: '#b8946a', icon: '🪨', strong: ['glut', 'funke', 'frost', 'wind'], weak: ['spross', 'flut', 'metall'] });
  L.def.type({ id: 'schatten', name: 'Schatten', color: '#8a5cd6', icon: '🌑', strong: ['funke', 'stern'], weak: ['glut', 'schatten', 'wind'] });
  // Neue Typen
  L.def.type({ id: 'frost', name: 'Frost', color: '#7dd3fc', icon: '❄️', strong: ['spross', 'wind'], weak: ['glut', 'metall', 'frost', 'flut'] });
  L.def.type({ id: 'wind', name: 'Wind', color: '#86efac', icon: '🌪️', strong: ['spross', 'schatten'], weak: ['stein', 'metall', 'funke'] });
  L.def.type({ id: 'metall', name: 'Metall', color: '#94a3b8', icon: '⚙️', strong: ['frost', 'stein'], weak: ['glut', 'flut', 'funke', 'metall'] });
  L.def.type({ id: 'stern', name: 'Stern', color: '#ffe9a8', icon: '✨', strong: NORMAL.slice(), weak: ['stern'], secret: true });

  L.types = {
    NORMAL,
    effectiveness(attackType, defenderTypes) {
      if (!attackType) return 1;
      const t = L.registry.get('type', attackType);
      let m = 1;
      for (const d of defenderTypes) {
        if (t.strong.indexOf(d) >= 0) m *= 2;
        else if (t.weak.indexOf(d) >= 0) m *= 0.5;
      }
      return m;
    },
    // Typen für Übersichten; der geheime Stern-Typ nur mit { secret: true }.
    visible(opts) {
      return L.registry.all('type').filter((t) => !t.secret || (opts && opts.secret)).map((t) => t.id);
    },
    // Allgemeine Stärken und Schwächen eines Typs (unabhängig vom eigenen Team).
    matchups(typeId, opts) {
      const all = L.types.visible(opts);
      const eff = L.types.effectiveness;
      return {
        strongVs: all.filter((d) => eff(typeId, [d]) > 1),
        weakVs: all.filter((d) => eff(typeId, [d]) < 1),
        vulnerableTo: all.filter((a) => eff(a, [typeId]) > 1),
        resists: all.filter((a) => eff(a, [typeId]) < 1),
      };
    },
  };

  L.registry.addValidator('type', (def, reg) =>
    def.strong.concat(def.weak).filter((t) => !reg.has('type', t)).map((t) => 'unbekannter Typ ' + t));
})(globalThis.LUM);
