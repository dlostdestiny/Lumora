// Bannträger-Wege: Vor jedem Lauf wählst du einen Weg. Er gibt einen kleinen Dauer-Vorteil (hooks)
// und eine Bannträger-Kunst, die du einmal pro Kampf statt einer Attacke einsetzt (art(c) mit Kampf-API).
(function (L) {
  const P = (def) => L.def.path(def);
  P({ id: 'kaempfer', name: 'Kämpfer', icon: '⚔️', rank: 1, color: '#ff7a7a',
    desc: 'Bindungs-Attacken +15 % Schaden.', artName: 'Anfeuern', artDesc: 'Dein aktives Monster: Angriff +2 Stufen und Bindung +20.',
    hooks: { modifyDamage: (v, c) => (c.move && c.move.bond ? v * 1.15 : v) },
    art: (c) => { c.api.stage(c.side, 'atk', 2); c.mon.bond = Math.min(100, (c.mon.bond || 0) + 20); c.api.text('Du feuerst ' + c.name + ' an! Es brennt vor Kampfgeist!'); } });
  P({ id: 'hueter', name: 'Hüter', icon: '💚', rank: 1, color: '#7ee08a',
    desc: 'Heilung nach Kämpfen +5 %.', artName: 'Schutzlied', artDesc: 'Das ganze Team heilt 20 %, dein aktives Monster verliert seinen Status.',
    hooks: { modifyHealAfterBattle: (v) => (v > 0 ? v + 0.05 : v) },
    art: (c) => {
      for (const m of c.battle.sides[c.side].team) if (m.hp > 0 && m !== c.mon) m.hp = Math.min(L.mon.maxHp(m), m.hp + Math.floor(L.mon.maxHp(m) * 0.2));
      c.mon.status = null;
      c.api.heal(c.side, 0.2);
      c.api.text('Du singst ein altes Schutzlied. Dein Team schöpft neue Kraft.');
    } });
  P({ id: 'faenger', name: 'Fänger', icon: '🎒', rank: 4, color: '#ffd23f',
    desc: 'Fangchance +10 % und 1 Fangkugel mehr zum Start.', artName: 'Lockruf', artDesc: 'Der Gegner wird langsamer (Tempo −1), und dein nächster Fangversuch in diesem Kampf ist 60 % besser.',
    start: (run) => { run.items.fangkugel = (run.items.fangkugel || 0) + 1; },
    hooks: { modifyCatchRate: (v, c) => v * 1.1 * (c.battle && c.battle.flags.lockruf ? 1.6 : 1) },
    art: (c) => { c.battle.flags.lockruf = true; if (c.foe && c.foe.hp > 0) c.api.stage(1 - c.side, 'spe', -1); c.api.text('Du lockst mit einem leisen Ruf. Das Monster wird neugierig …'); } });
  P({ id: 'mystiker', name: 'Mystiker', icon: '🔮', rank: 8, color: '#c084fc',
    desc: 'Status-Chancen +10 %, eigenes Wetter hält 2 Runden länger.', artName: 'Sternensicht', artDesc: 'Gegner: Genauigkeit −1. Dein aktives Monster: Ausweichen +1 und Tempo +1.',
    hooks: { modifyStatusChance: (v) => v + 0.1, modifyWeatherTurns: (v) => v + 2 },
    art: (c) => { if (c.foe && c.foe.hp > 0) c.api.stage(1 - c.side, 'acc', -1); c.api.stage(c.side, 'eva', 1); c.api.stage(c.side, 'spe', 1); c.api.text('Du liest in den Sternen. Die Zukunft des Kampfes liegt offen vor dir.'); } });

  L.paths = {
    of(id) { return id && L.registry.has('path', id) ? L.registry.get('path', id) : null; },
    available(meta) { const r = L.rank ? L.rank.level(meta) : 1; return L.registry.all('path').filter((p) => p.rank <= r); },
  };
  // Dauer-Vorteil des Weges auf deiner Seite
  L.hooks.sources.push((side) => { const p = L.paths.of(side.path); return p ? [{ source: 'path', hooks: p.hooks }] : []; });

  L.registry.addValidator('path', (def) => L.hooks.check(def.hooks).concat(typeof def.art === 'function' ? [] : ['art fehlt']));
})(globalThis.LUM);
