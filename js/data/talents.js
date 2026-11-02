// Bannträger-Rang und Talente: Nach jedem Lauf gibt es Rang-Erfahrung, jeder neue Rang einen Talentpunkt.
// Talente sind klein, damit das Spiel fordernd bleibt, und summieren sich über viele Läufe.
// hooks(level) liefert Hooks wie bei Relikten; start(run, level) verändert einen neuen Lauf.
(function (L) {
  const T = (def) => L.def.talent(def);

  // ⚔️ Kämpfer
  T({ id: 'scharfe_krallen', path: 'kaempfer', icon: '🗡️', name: 'Scharfe Krallen', max: 5, per: 'Schaden +3 %',
    hooks: (lv) => ({ modifyDamage: (v) => v * (1 + 0.03 * lv) }) });
  T({ id: 'zaehigkeit', path: 'kaempfer', icon: '🛡️', name: 'Zähigkeit', max: 5, per: 'Erlittener Schaden −3 %',
    hooks: (lv) => ({ modifyIncomingDamage: (v) => v * (1 - 0.03 * lv) }) });
  T({ id: 'flinke_fuesse', path: 'kaempfer', icon: '💨', name: 'Flinke Füße', max: 3, per: 'Tempo +3 %',
    hooks: (lv) => ({ modifyStat: (v, c) => (c.stat === 'spe' ? v * (1 + 0.03 * lv) : v) }) });
  T({ id: 'bindungskraft', path: 'kaempfer', icon: '💞', name: 'Bindungskraft', max: 3, per: 'Bindung wächst 15 % schneller',
    hooks: (lv) => ({ modifyBondGain: (v) => v * (1 + 0.15 * lv) }) });

  // 💚 Hüter
  T({ id: 'feldsanitaeter', path: 'hueter', icon: '🩹', name: 'Feldsanitäter', max: 5, per: 'Heilung nach Kämpfen +3 %',
    hooks: (lv) => ({ modifyHealAfterBattle: (v) => (v > 0 ? v + 0.03 * lv : v) }) });
  T({ id: 'vorrat', path: 'hueter', icon: '🧪', name: 'Vorratstasche', max: 3, per: '+1 Heiltrank zum Start',
    start: (run, lv) => { run.items.heiltrank = (run.items.heiltrank || 0) + lv; } });
  T({ id: 'lehrmeister', path: 'hueter', icon: '📘', name: 'Lehrmeister', max: 5, per: 'Erfahrung +5 %',
    hooks: (lv) => ({ modifyExp: (v) => v * (1 + 0.05 * lv) }) });
  T({ id: 'zweite_chance', path: 'hueter', icon: '🪶', name: 'Zweite Chance', max: 1, per: '1 Beleber zum Start',
    start: (run, lv) => { run.items.beleber = (run.items.beleber || 0) + lv; } });

  // 🎒 Sammler
  T({ id: 'fangkunst', path: 'sammler', icon: '⚪', name: 'Fangkunst', max: 5, per: 'Fangchance +5 %',
    hooks: (lv) => ({ modifyCatchRate: (v) => v * (1 + 0.05 * lv) }) });
  T({ id: 'kugelvorrat', path: 'sammler', icon: '🎒', name: 'Kugelvorrat', max: 3, per: '+1 Fangkugel zum Start',
    start: (run, lv) => { run.items.fangkugel = (run.items.fangkugel || 0) + lv; } });
  T({ id: 'goldnase', path: 'sammler', icon: '🪙', name: 'Goldnase', max: 5, per: 'Gold +8 %',
    hooks: (lv) => ({ modifyGold: (v) => v * (1 + 0.08 * lv) }) });
  T({ id: 'kristallsinn', path: 'sammler', icon: '💎', name: 'Kristallsinn', max: 3, per: '+1 Kristall nach Elite- und Wächterkämpfen',
    hooks: (lv) => ({ modifyCrystals: (v) => (v >= 3 ? v + lv : v) }) });
  T({ id: 'starthilfe', path: 'sammler', icon: '⏫', name: 'Starthilfe', max: 3, per: 'Starter +1 Level',
    start: (run, lv) => { const m = run.team[0]; L.mon.gainExp(m, L.mon.expForLevel(Math.min(L.config.maxLevel, m.level + lv)) - m.exp); } });

  const PATHS = {
    kaempfer: { name: 'Kämpfer', icon: '⚔️', color: '#ff7a7a', desc: 'Mehr Schaden, mehr Ausdauer.' },
    hueter: { name: 'Hüter', icon: '💚', color: '#7ee08a', desc: 'Heilung, Erfahrung und Vorräte.' },
    sammler: { name: 'Sammler', icon: '🎒', color: '#ffd23f', desc: 'Fangen, Gold und Kristalle.' },
  };
  // Starter, die mit dem Rang freigeschaltet werden
  const RANK_STARTERS = [{ rank: 3, species: 'zapfi' }, { rank: 6, species: 'kiesi' }, { rank: 10, species: 'nachtmiez' }];
  const MAX_RANK = 50;

  const rank = {
    PATHS, RANK_STARTERS, MAX_RANK,
    // Erfahrung für den Schritt von Rang r auf r+1
    xpToNext(r) { return 100 + 40 * (r - 1); },
    // Rang und Fortschritt aus der Gesamt-Erfahrung
    info(meta) {
      let r = 1, xp = meta.rankXp || 0;
      while (r < MAX_RANK && xp >= rank.xpToNext(r)) { xp -= rank.xpToNext(r); r++; }
      return { rank: r, xp, need: r < MAX_RANK ? rank.xpToNext(r) : 0 };
    },
    level(meta) { return rank.info(meta).rank; },
    // Erfahrung für einen beendeten Lauf: je weiter, desto mehr; Echo-Stufen geben einen Bonus.
    runXp(run) {
      const acts = L.run.acts();
      const layer = run.position && run.map && run.map.nodes[run.position] ? run.map.nodes[run.position].layer + 1 : 0;
      const tower = run.mode === 'turm' && L.tower;
      const progress = tower ? L.tower.floors(run) : Math.min(run.actIndex, acts.length) * 13 + (run.finished === 'victory' ? 0 : layer);
      const bosses = run.stats && run.stats.bossTrainers ? run.stats.bossTrainers.length : Object.keys(run.flags || {}).filter((k) => k.indexOf('boss_') === 0).length;
      const base = 20 + progress * 4 + bosses * 50 + (run.finished === 'victory' ? 150 : 0);
      return Math.round(base * (1 + 0.2 * (run.echo || 0)));
    },
    spent(meta) { return Object.values(meta.talents || {}).reduce((a, b) => a + b, 0); },
    points(meta) { return rank.level(meta) - 1 - rank.spent(meta); },
    canLearn(meta, id) {
      const t = L.registry.get('talent', id);
      return rank.points(meta) > 0 && ((meta.talents || {})[id] || 0) < t.max;
    },
    learn(meta, id) {
      if (!rank.canLearn(meta, id)) throw new Error('Talent nicht lernbar');
      meta.talents[id] = (meta.talents[id] || 0) + 1;
    },
    reset(meta) { meta.talents = {}; },
    // Talente, die ein neuer Lauf übernimmt: [{ id, level }]
    forRun(meta) { return meta ? Object.keys(meta.talents || {}).filter((id) => meta.talents[id] > 0 && L.registry.has('talent', id)).map((id) => ({ id, level: meta.talents[id] })) : []; },
    applyStart(run) {
      for (const t of run.talents || []) {
        const def = L.registry.get('talent', t.id);
        if (def.start) def.start(run, t.level);
      }
    },
    starters(meta) { const r = rank.level(meta); return RANK_STARTERS.filter((s) => s.rank <= r).map((s) => s.species); },
  };
  L.rank = rank;

  // Talente wirken im Kampf wie Relikte (nur auf deiner Seite).
  L.hooks.sources.push((side) => (side.talents || []).map((t) => {
    const def = L.registry.get('talent', t.id);
    return { source: 'talent', hooks: def.hooks ? def.hooks(t.level) : {} };
  }));

  L.registry.addValidator('talent', (def) => {
    const errs = [];
    if (!PATHS[def.path]) errs.push('unbekannter Weg ' + def.path);
    if (!(def.max > 0)) errs.push('max fehlt');
    if (def.hooks) errs.push(...L.hooks.check(def.hooks(1)));
    return errs;
  });
})(globalThis.LUM);
