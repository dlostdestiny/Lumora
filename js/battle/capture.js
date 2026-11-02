// Fangen (Spezifikation 4).
(function (L) {
  const RARITY = { common: 1, rare: 0.6, veryRare: 0.35, unique: 0.15, starter: 1, boss: 0 };

  function chance(o) {
    const { target, ball, battle } = o;
    const now = o.now || (battle && battle.now) || L.clock.now();
    const sp = L.registry.get('species', target.species);
    const item = L.registry.get('item', ball);
    const hpPart = 1 - (2 / 3) * (target.hp / L.mon.maxHp(target));
    const rarity = RARITY[sp.rarity] === undefined ? 1 : RARITY[sp.rarity];
    const status = target.status === 'schlaf' ? 2 : target.status ? 1.5 : 1;
    const ballMod = item.nightBallMod && L.clock.isNight(now) ? item.nightBallMod : item.ballMod;
    let p = hpPart * rarity * status * ballMod;
    if (battle) p = L.hooks.run(L.battle.teamHandlers(battle.sides[0], 'modifyCatchRate'), 'modifyCatchRate', { battle, target }, p);
    if (rarity === 0) return 0;
    return Math.max(0.02, Math.min(0.95, p));
  }

  // Wird von der Engine aufgerufen. Gibt true zurück, wenn das Monster gefangen wurde.
  function attempt(battle, ball) {
    const side = battle.sides[0];
    side.items[ball]--;
    if (side.items[ball] <= 0) delete side.items[ball];
    const target = L.battle.active(battle, 1);
    const p = chance({ target, ball, battle });
    battle.flags.lockruf = false;
    const perShake = Math.pow(p, 1 / 3);
    let shakes = 0;
    while (shakes < 3 && battle.rng.chance(perShake)) shakes++;
    const success = shakes === 3;
    battle._events.push({ t: 'captureTry', ball, shakes, success });
    if (success) {
      battle.captured = target;
      battle.defeated.push({ species: target.species, level: target.level });
      const size = (battle.run && battle.run.teamSize) || L.config.teamSize;
      battle.pendingRelease = side.team.length >= size;
    }
    return success;
  }

  L.capture = { chance, attempt };
})(globalThis.LUM);
