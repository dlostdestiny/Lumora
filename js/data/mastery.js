// Monster-Album: Jede Art sammelt über viele Läufe Meisterschaft (Bronze, Silber, Gold).
// Punkte gibt es am Laufende für jedes Monster im Team. Höhere Stufen lassen diese Art mit mehr Bindung starten.
(function (L) {
  const LEVELS = [
    { name: 'Neu', icon: '', need: 0, bond: 0 },
    { name: 'Bronze', icon: '🥉', need: 3, bond: 15 },
    { name: 'Silber', icon: '🥈', need: 10, bond: 30 },
    { name: 'Gold', icon: '🥇', need: 25, bond: 50 },
  ];
  L.mastery = {
    LEVELS,
    points(meta, sp) { return (meta.mastery && meta.mastery[sp]) || 0; },
    level(points) { let l = 0; for (let i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i].need) l = i; return l; },
    of(meta, sp) { return L.mastery.level(L.mastery.points(meta, sp)); },
    // Punkte am Laufende: 1 pro Lauf im Team, +2 bei Sieg, +1 ab Level 30
    award(meta, run) {
      meta.mastery = meta.mastery || {};
      const gained = {};
      for (const m of run.team) {
        const p = 1 + (run.finished === 'victory' ? 2 : 0) + (m.level >= 30 ? 1 : 0);
        meta.mastery[m.species] = (meta.mastery[m.species] || 0) + p;
        gained[m.species] = (gained[m.species] || 0) + p;
      }
      return gained;
    },
    // Für einen neuen Lauf: Art → Stufe (ab Bronze)
    forRun(meta) {
      const out = {};
      for (const sp of Object.keys((meta && meta.mastery) || {})) { const l = L.mastery.of(meta, sp); if (l > 0) out[sp] = l; }
      return out;
    },
    startBond(run, sp) { return LEVELS[(run.mastery || {})[sp] || 0].bond; },
  };
})(globalThis.LUM);
