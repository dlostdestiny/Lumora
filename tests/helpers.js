// Gemeinsame Test-Helfer für Kämpfe.
(function (G) {
  const L = G.LUM;
  let seq = 0;
  G.TH = {
    mon(species, level, extra) {
      const m = L.mon.create(Object.assign({ species, level, rng: L.rng.create(11), nature: 'mutig', uid: null, trait: null }, extra || {}));
      m.uid = 't' + (++seq);
      return m;
    },
    // enemyPolicy: feste Gegner-Aktion, damit Tests nicht von der KI abhängen.
    battle(pTeam, eTeam, opts) {
      opts = opts || {};
      const b = L.battle.create({
        player: Object.assign({ team: pTeam, items: {}, relics: [] }, opts.player || {}),
        enemy: Object.assign({ team: eTeam, kind: 'wild' }, opts.enemy || {}),
        weather: opts.weather || null,
        doubles: !!opts.doubles,
        rng: L.rng.create(opts.seed || 3),
        enemyPolicy: opts.enemyPolicy || (() => ({ type: 'move', index: 0 })),
      });
      L.battle.start(b);
      return b;
    },
    ofType(events, t) { return events.filter((e) => e.t === t); },
  };
})(globalThis);
