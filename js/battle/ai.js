// Gegner-KI: bewertet jede Aktion mit Punkten. Wild = gewichteter Zufall, Trainer = meist das Beste,
// Elite/Boss = immer das Beste. Auch für die automatische Balance-Simulation nutzbar (level-Parameter).
(function (L) {
  const R = () => L.registry;

  function typesOf(mon) { return L.mon.types(mon); }

  function scoreMove(battle, s, index) {
    const me = L.battle.active(battle, s);
    const foe = L.battle.active(battle, 1 - s);
    const side = battle.sides[s], foeSide = battle.sides[1 - s];
    const move = L.moves.resolve(me.moves[index]);
    let score = 0;

    if (move.power > 0) {
      const saved = Object.assign({}, battle.flags);
      const r = L.damage.calc({ attacker: me, defender: foe, move, battle, rng: battle.rng, atkSide: s, defSide: 1 - s, forceRoll: 0.925, forceCrit: false });
      battle.flags = saved;
      const multi = (move.effects || []).find((e) => e.kind === 'multiHit');
      const amount = r.amount * (multi ? (multi.min + multi.max) / 2 : 1);
      const hit = Math.min(1, L.battle.hitChance(battle, s, move));
      score += Math.min(100, amount / Math.max(1, foe.hp) * 100) * hit;
      if (amount >= foe.hp) score += 50 * hit;
    }
    for (const e of move.effects || []) {
      const targetSelf = e.target === 'self';
      if (e.kind === 'status') {
        const immune = R().get('status', e.status).immune.some((t) => typesOf(foe).indexOf(t) >= 0);
        if (move.power === 0) score += foe.status || immune ? -100 : 25;
        else if (!foe.status && !immune) score += 10 * (e.chance || 0);
      } else if (e.kind === 'stage') {
        const st = (targetSelf ? side : foeSide).stages[e.stat];
        if (targetSelf && e.delta > 0) score += st < 2 ? 15 * e.delta * (e.chance == null ? 1 : e.chance) : -5;
        else if (!targetSelf && e.delta < 0) score += st > -2 ? 10 * -e.delta * (e.chance == null ? 1 : e.chance) : -5;
      } else if (e.kind === 'heal') {
        const missing = 1 - me.hp / L.mon.maxHp(me);
        score += missing > 0.5 ? missing * 100 : -50;
      } else if (e.kind === 'weather') {
        score += battle.weather && battle.weather.id === e.weather ? -40 : 10;
      } else if (e.kind === 'critUp' && move.power === 0) {
        score += side.stages.crit < 1 ? 10 : -10;
      } else if (e.kind === 'confuse' && move.power === 0) {
        score += foeSide.volatile.verwirrt ? -50 : 15;
      }
    }
    return score;
  }

  function bestEffectiveness(mon, foe) {
    let best = 0;
    for (const ref of mon.moves) {
      const m = L.moves.resolve(ref);
      if (m.power > 0) best = Math.max(best, L.types.effectiveness(m.type, typesOf(foe)));
    }
    return best;
  }

  // Doppelkampf: bewertet jede Attacke gegen jedes gegnerische Monster und merkt sich das Ziel (foe = Platz).
  function doubleOptions(battle, s, me) {
    const options = [];
    for (const k of L.battle.liveSlots(battle, 1 - s)) {
      L.battle.focus(battle, 1 - s, k);
      me.moves.forEach((_, i) => options.push({ action: { type: 'move', index: i, foe: k }, score: scoreMove(battle, s, i) }));
    }
    return options;
  }

  // slot (nur Doppelkampf): für welchen eigenen Platz gewählt wird
  function choose(battle, s, rng, level, slot) {
    if (battle.doubles && slot !== undefined) L.battle.focus(battle, s, slot);
    const side = battle.sides[s];
    const me = L.battle.active(battle, s);
    const foe = L.battle.active(battle, 1 - s);
    level = level || (s === 1 ? battle.kind : 'elite');

    // Boss: einmal Heilung unter 25 % KP
    if (level === 'boss' && side.items.superheiltrank > 0 && me.hp < L.mon.maxHp(me) * 0.25 && L.registry.get('species', me.species).rarity === 'boss') {
      return { type: 'item', item: 'superheiltrank', target: side.active };
    }

    const options = battle.doubles ? doubleOptions(battle, s, me) : me.moves.map((_, i) => ({ action: { type: 'move', index: i }, score: scoreMove(battle, s, i) }));

    if (level !== 'wild' && bestEffectiveness(me, foe) <= 0.5) {
      const bench = side.team.map((m, i) => ({ m, i })).filter((x) => x.i !== side.active && x.m.hp > 0 && !side.slots.some((sl, k) => k !== side.slot && sl.active === x.i));
      const good = bench.find((x) => bestEffectiveness(x.m, foe) >= 2);
      if (good) options.push({ action: { type: 'switch', index: good.i }, score: 60 });
    }

    if (level === 'wild') {
      return rng.weighted(options, (o) => Math.max(1, o.score)).action;
    }
    options.sort((a, b) => b.score - a.score);
    if (level === 'trainer' && options.length > 1 && options[1].score >= options[0].score - 15 && rng.chance(0.2)) {
      return options[1].action;
    }
    return options[0].action;
  }

  L.ai = { choose, scoreMove };
})(globalThis.LUM);
