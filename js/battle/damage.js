// Schadensformel (Spezifikation 4). battle darf null sein (Tests), dann ohne Stufen, Hooks und Wetter.
(function (L) {
  function critChance(stage) {
    if (stage <= 0) return 1 / 16;
    if (stage === 1) return 1 / 8;
    if (stage === 2) return 1 / 4;
    return 1 / 2;
  }

  function hooksFor(battle, sideIdx, name) {
    return battle && sideIdx !== undefined && L.battle && L.battle.handlers ? L.battle.handlers(battle, sideIdx, name) : [];
  }

  // Effektiver Wert eines Monsters inklusive Stufen und Hooks.
  function statOf(battle, sideIdx, mon, stat) {
    let v = L.mon.stats(mon)[stat];
    if (battle && sideIdx !== undefined) {
      const side = battle.sides[sideIdx];
      if (side.stages[stat]) v *= L.stats.stageMult(side.stages[stat]);
      v = L.hooks.run(hooksFor(battle, sideIdx, 'modifyStat'), 'modifyStat', ctxFor(battle, sideIdx, { stat }), v);
    }
    if (stat === 'atk' && mon.status === 'brand') v *= 0.75;
    if (stat === 'spe' && mon.status === 'laehmung') v *= 0.5;
    return v;
  }

  function ctxFor(battle, sideIdx, extra) {
    const side = battle.sides[sideIdx], foeSide = battle.sides[1 - sideIdx];
    return Object.assign({ battle, side: sideIdx, mon: side.team[side.active], foe: foeSide.team[foeSide.active], api: battle._api, rng: battle.rng }, extra || {});
  }

  function critStage(o) {
    const { battle, attacker, move, atkSide, defSide } = o;
    let stage = 0;
    if ((move.effects || []).some((e) => e.kind === 'critUp')) stage++;
    if (attacker.bond >= 70) stage++;
    if (battle && atkSide !== undefined) {
      stage += battle.sides[atkSide].stages.crit || 0;
      stage = L.hooks.run(hooksFor(battle, atkSide, 'modifyCritStage'), 'modifyCritStage', ctxFor(battle, atkSide, { move, defending: false }), stage);
      stage = L.hooks.run(hooksFor(battle, defSide, 'modifyCritStage'), 'modifyCritStage', ctxFor(battle, defSide, { move, defending: true }), stage);
    }
    return stage;
  }

  function calc(o) {
    const { attacker, defender, move, battle, rng, atkSide, defSide } = o;
    const defTypes = L.mon.types(defender);
    const atkTypes = L.mon.types(attacker);
    const atk = statOf(battle, atkSide, attacker, 'atk');
    const def = statOf(battle, defSide, defender, 'def');
    const power = o.power || move.power;

    let dmg = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * power * atk / def) / 50) + 2;

    if (battle && battle.weather && move.type) {
      const w = L.registry.get('weather', battle.weather.id);
      if (w.typeMods[move.type]) dmg *= w.typeMods[move.type];
    }
    const stab = !!move.type && atkTypes.indexOf(move.type) >= 0;
    if (stab) dmg *= 1.25;
    const effectiveness = L.types.effectiveness(move.type, defTypes);
    dmg *= effectiveness;

    let crit;
    if (o.forceCrit !== undefined && o.forceCrit !== null) crit = o.forceCrit;
    else {
      const stage = critStage(o);
      crit = stage > -50 && rng.chance(critChance(stage));
    }
    if (crit) dmg *= 1.5;
    dmg *= o.forceRoll !== undefined && o.forceRoll !== null ? o.forceRoll : 0.85 + rng.next() * 0.15;

    if (battle && atkSide !== undefined) {
      dmg = L.hooks.run(hooksFor(battle, atkSide, 'modifyDamage'), 'modifyDamage', ctxFor(battle, atkSide, { move, effectiveness, crit, target: defender }), dmg);
      dmg = L.hooks.run(hooksFor(battle, defSide, 'modifyIncomingDamage'), 'modifyIncomingDamage', ctxFor(battle, defSide, { move, effectiveness, crit, attacker }), dmg);
    }
    return { amount: Math.max(1, Math.floor(dmg)), effectiveness, crit, stab };
  }

  L.damage = { calc, critChance, critStage, statOf, ctxFor };
})(globalThis.LUM);
