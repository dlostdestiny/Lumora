// Kampf-Engine: Zustandsmaschine ohne DOM. step() liefert eine Liste von Ereignissen, die die UI abspielt.
// Seite 0 = Spieler, Seite 1 = Gegner.
// Jede Seite hat eine Liste von Plätzen (side.slots): im Einzelkampf einen, im Doppelkampf zwei.
// side.active, side.stages und side.volatile zeigen immer auf den Platz, auf dem gerade der Blick liegt (side.slot).
// focus() setzt den Blick um. So arbeiten alle Hooks, Effekte und die Schadensformel unverändert mit „dem aktiven Monster“.
(function (L) {
  const R = () => L.registry;
  const STAGE_KEYS = ['atk', 'def', 'spe', 'acc', 'eva', 'crit'];
  const STAT_NAMES = { atk: 'Angriff', def: 'Verteidigung', spe: 'Tempo', acc: 'Genauigkeit', eva: 'Ausweichen', crit: 'Volltreffer-Chance' };

  function freshStages() { return { atk: 0, def: 0, spe: 0, acc: 0, eva: 0, crit: 0 }; }
  function name(mon) { return R().get('species', mon.species).name; }
  function active(battle, s) { const side = battle.sides[s]; return side.team[side.active]; }
  function alive(team) { return team.filter((m) => m.hp > 0); }

  function makeSide(o, isPlayer, count) {
    const slots = [];
    for (let k = 0; k < (count || 1); k++) {
      const i = o.team.findIndex((m, j) => m.hp > 0 && !slots.some((sl) => sl.active === j));
      if (k > 0 && i < 0) break;
      slots.push({ active: Math.max(0, i), stages: freshStages(), volatile: {} });
    }
    return {
      isPlayer,
      team: o.team,
      slots,
      slot: 0,
      active: slots[0].active,
      stages: slots[0].stages,
      volatile: slots[0].volatile,
      items: o.items || {},
      relics: o.relics || [],
      curses: o.curses || [],
      talents: o.talents || [],
      path: o.path || null,
      artUsed: false,
      unlocks: o.unlocks || [],
      blessing: o.blessing || null,
      affixes: o.affixes || [],
      trainer: o.trainer || null,
      bondUsed: false,
      participants: [],
    };
  }

  // ---- Plätze (Doppelkampf) ----
  // Richtet den Blick einer Seite auf Platz k. Im Einzelkampf gibt es nur Platz 0, dann passiert nichts.
  function focus(battle, s, k) {
    const side = battle.sides[s];
    if (k === side.slot || !side.slots[k]) return;
    const cur = side.slots[side.slot];
    cur.active = side.active; cur.stages = side.stages; cur.volatile = side.volatile;
    const sl = side.slots[k];
    side.slot = k;
    side.active = sl.active; side.stages = sl.stages; side.volatile = sl.volatile;
  }
  function slotMon(battle, s, k) {
    const side = battle.sides[s];
    return side.team[k === side.slot ? side.active : side.slots[k].active];
  }
  // Plätze, auf denen ein kampffähiges Monster steht
  function liveSlots(battle, s) {
    return battle.sides[s].slots.map((_, k) => k).filter((k) => slotMon(battle, s, k).hp > 0);
  }
  // Steht Teammitglied i auf einem anderen Platz als dem gerade betrachteten?
  function inOtherSlot(side, i) {
    return side.slots.some((sl, k) => k !== side.slot && sl.active === i);
  }
  function actives(battle, s) { return liveSlots(battle, s).map((k) => slotMon(battle, s, k)); }
  // Ereignisliste: im Doppelkampf bekommt jedes Ereignis mit Seite auch den Platz (für die Anzeige).
  function eventList(battle) {
    const list = [];
    if (!battle.doubles) return list;
    list.push = function () {
      for (const e of arguments) {
        if (e && e.side !== undefined && e.slot === undefined) e.slot = battle.sides[e.side].slot;
        if (e && e.t === 'move' && e.foeSlot === undefined) e.foeSlot = battle.sides[1 - e.side].slot;
        Array.prototype.push.call(this, e);
      }
      return this.length;
    };
    return list;
  }

  // ---- Hooks sammeln ----
  function wrap(source, hooks, out) {
    for (const k of Object.keys(hooks || {})) out.push({ source, name: k, fn: hooks[k] });
  }
  function collect(battle, s) {
    const side = battle.sides[s];
    const mon = side.team[side.active];
    const out = [];
    if (mon) {
      wrap('ability', R().get('ability', L.mon.abilityId(mon)).hooks, out);
      if (mon.trait) wrap('trait', R().get('trait', mon.trait).hooks, out);
      if (mon.held) wrap('held', R().get('item', mon.held).hooks, out);
    }
    if (L.resonance) for (const r of L.resonance.active(side.team)) wrap('resonance', r.hooks, out);
    for (const id of side.relics) wrap('relic', R().get('relic', id).hooks, out);
    for (const x of L.hooks.extra(side)) wrap(x.source, x.hooks, out);
    if (side.blessing && R().has('blessing', side.blessing)) wrap('blessing', R().get('blessing', side.blessing).hooks, out);
    for (const id of side.affixes) wrap('affix', R().get('affix', id).hooks, out);
    return out;
  }
  // Liefert die Handler einer Seite. Mit Namen gefiltert, sonst alle (für L.hooks.run mit Name).
  function handlers(battle, s, hookName) {
    const all = collect(battle, s);
    return all.filter((h) => !hookName || h.name === hookName);
  }
  function runHook(battle, s, hookName, extra, initial) {
    const hs = handlers(battle, s, hookName);
    if (!hs.length) return initial;
    return L.hooks.run(hs, hookName, ctx(battle, s, extra), initial);
  }
  function ctx(battle, s, extra) {
    return Object.assign({ battle, side: s, mon: active(battle, s), foe: active(battle, 1 - s), api: battle._api, rng: battle.rng }, extra || {});
  }

  // ---- API für Hooks und Effekte ----
  function makeApi(battle) {
    return {
      text(text) { battle._events.push({ t: 'text', text }); },
      damage(s, amount, reason) { applyDirectDamage(battle, s, amount, reason); },
      heal(s, fraction) { healSide(battle, s, fraction); },
      inflict(s, status) { return inflict(battle, s, status, battle._events); },
      stage(s, stat, delta) { changeStage(battle, s, stat, delta); },
      setWeather(id, setter) { setWeather(battle, id, setter); },
      addToTeam(s, mon) { battle.sides[s].team.push(mon); },
    };
  }

  // ---- Grundbausteine ----
  function applyDirectDamage(battle, s, amount, reason) {
    const mon = active(battle, s);
    if (mon.hp <= 0) return;
    amount = Math.max(1, Math.floor(amount));
    mon.hp = Math.max(0, mon.hp - amount);
    battle._events.push({ t: 'damage', side: s, amount, hp: mon.hp, maxHp: L.mon.maxHp(mon), effectiveness: 1, crit: false, reason: reason || 'effect' });
    checkFaint(battle, s);
  }

  function healSide(battle, s, fraction) {
    const mon = active(battle, s);
    if (mon.hp <= 0) return 0;
    const max = L.mon.maxHp(mon);
    const before = mon.hp;
    mon.hp = Math.min(max, mon.hp + Math.max(1, Math.floor(max * fraction)));
    const amount = mon.hp - before;
    if (amount > 0) battle._events.push({ t: 'heal', side: s, amount, hp: mon.hp, maxHp: max });
    return amount;
  }

  function changeStage(battle, s, stat, delta) {
    const st = battle.sides[s].stages;
    const mon = active(battle, s);
    if (stat === 'acc' && delta < 0 && R().get('ability', L.mon.abilityId(mon)).blockAccDrop) {
      battle._events.push({ t: 'text', text: name(mon) + 's Genauigkeit lässt sich nicht senken.' });
      return;
    }
    const before = st[stat];
    st[stat] = Math.max(-3, Math.min(3, st[stat] + delta));
    const real = st[stat] - before;
    if (real === 0) {
      battle._events.push({ t: 'text', text: name(active(battle, s)) + 's ' + STAT_NAMES[stat] + ' kann sich nicht weiter ändern.' });
    } else {
      battle._events.push({ t: 'stage', side: s, stat, delta: real, now: st[stat] });
    }
  }

  function setWeather(battle, id, setter) {
    const w = R().get('weather', id);
    const turns = setter === undefined ? w.turns : runHook(battle, setter, 'modifyWeatherTurns', {}, w.turns);
    battle.weather = { id, turnsLeft: turns };
    battle._events.push({ t: 'weather', id });
  }

  // Setzt einen Haupt-Status. Gibt true zurück, wenn er wirkt.
  function inflict(battle, s, status, events) {
    const prevEvents = battle._events;
    battle._events = events || battle._events || [];
    try {
      const mon = active(battle, s);
      if (!mon || mon.hp <= 0 || mon.status) return false;
      const def = R().get('status', status);
      const types = L.mon.types(mon);
      if (def.immune.some((t) => types.indexOf(t) >= 0)) return false;
      mon.status = status;
      mon.statusTurns = status === 'schlaf' ? battle.rng.int(1, 3) : status === 'frost' ? battle.rng.int(1, 2) : 0;
      if (status === 'gift') battle.sides[s].volatile.giftN = 1;
      battle._events.push({ t: 'status', side: s, status });
      return true;
    } finally {
      if (events) battle._events = prevEvents;
    }
  }

  function checkFaint(battle, s) {
    const mon = active(battle, s);
    if (mon.hp > 0 || battle.sides[s].volatile.fainted) return;
    battle.sides[s].volatile.fainted = true;
    battle._events.push({ t: 'faint', side: s, uid: mon.uid });
    if (s === 1) battle.defeated.push({ species: mon.species, level: mon.level });
    runHook(battle, s, 'onFaint', {});
  }

  function checkPhases(battle) {
    const phases = battle.phases || [];
    const s = 1;
    const mon = active(battle, s);
    if (!mon || mon.hp <= 0) return;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      if (battle.phasesDone.indexOf(i) >= 0) continue;
      if (p.mon !== undefined && battle.sides[s].active !== p.mon) continue;
      if (mon.hp / L.mon.maxHp(mon) < p.atHpBelow) {
        battle.phasesDone.push(i);
        battle._events.push({ t: 'phase', index: i, scene: p.scene || null });
        if (p.text) battle._events.push({ t: 'text', text: p.text });
        if (p.weather) setWeather(battle, p.weather);
        if (p.addMove && !mon.moves.some((m) => m.id === p.addMove)) {
          if (mon.moves.length >= 4) mon.moves[0] = { id: p.addMove, upgrade: null };
          else mon.moves.push({ id: p.addMove, upgrade: null });
          battle._events.push({ t: 'text', text: name(mon) + ' erlernt ' + R().get('move', p.addMove).name + '!' });
        }
        if (p.stageBoost) changeStage(battle, s, p.stageBoost.stat, p.stageBoost.delta);
        if (p.heal) healSide(battle, s, p.heal);
      }
    }
  }

  function switchIn(battle, s, index) {
    const side = battle.sides[s];
    const from = side.active;
    const sl = side.slots[side.slot];
    sl.active = side.active = index;
    sl.stages = side.stages = freshStages();
    sl.volatile = side.volatile = {};
    const mon = side.team[index];
    if (side.isPlayer && side.participants.indexOf(mon.uid) < 0) side.participants.push(mon.uid);
    battle._events.push({ t: 'switch', side: s, from, to: index, uid: mon.uid });
    runHook(battle, s, 'onSwitchIn', {});
  }

  // ---- Attacken ----
  function bondMoveFor(mon) {
    const sp = R().get('species', mon.species);
    if (sp.bondMove) return Object.assign({}, R().get('move', sp.bondMove), { bond: true });
    let best = 0;
    for (const ref of mon.moves) best = Math.max(best, L.moves.resolve(ref).power || 0);
    return {
      id: '_bond', name: 'Bindungs-' + sp.name.replace(/ /g, ''), type: sp.types[0], power: Math.max(90, Math.round(best * 1.5)),
      accuracy: 0, priority: 0, effects: [{ kind: 'critUp' }], contact: false, bond: true,
    };
  }

  function hitChance(battle, s, move) {
    if (!move.accuracy) return 1;
    const w = battle.weather ? R().get('weather', battle.weather.id) : null;
    if (w && w.alwaysHitTypes && w.alwaysHitTypes.indexOf(move.type) >= 0) return 1;
    const atkSide = battle.sides[s], defSide = battle.sides[1 - s];
    let p = move.accuracy / 100 * L.stats.stageMult(atkSide.stages.acc - defSide.stages.eva);
    if (w && w.accuracyMod) p *= w.accuracyMod;
    p = runHook(battle, s, 'modifyAccuracy', { move }, p);
    p = runHook(battle, 1 - s, 'modifyEvasion', { move, attacker: active(battle, s) }, p);
    return p;
  }

  function applyEffect(battle, s, e, move, dealt) {
    const foeS = 1 - s;
    const targetS = e.target === 'self' ? s : foeS;
    const target = active(battle, targetS);
    const user = active(battle, s);
    const chance = e.chance === undefined ? 1 : e.chance;
    switch (e.kind) {
      case 'status': {
        if (target.hp <= 0) return;
        let c = runHook(battle, s, 'modifyStatusChance', { status: e.status, move }, chance);
        if (!battle.rng.chance(c)) return;
        if (targetS !== s) {
          const answer = statusInflictAnswer(battle, targetS, e.status, move);
          if (answer === 'block') return;
          if (answer === 'reflect') {
            battle._events.push({ t: 'ability', side: targetS, uid: target.uid, ability: L.mon.abilityId(target) });
            if (!inflict(battle, s, e.status) && move.power === 0) battle._events.push({ t: 'text', text: 'Es hat keine Wirkung …' });
            return;
          }
        }
        const ok = inflict(battle, targetS, e.status);
        if (!ok && move.power === 0) battle._events.push({ t: 'text', text: 'Es hat keine Wirkung …' });
        return;
      }
      case 'stage':
        if (target.hp <= 0) return;
        if (!battle.rng.chance(chance)) return;
        changeStage(battle, targetS, e.stat, e.delta);
        return;
      case 'heal':
        healSide(battle, s, e.fraction);
        return;
      case 'drain':
        if (dealt > 0 && user.hp > 0) {
          const max = L.mon.maxHp(user);
          const amount = Math.min(max - user.hp, Math.max(1, Math.floor(dealt * e.fraction)));
          if (amount > 0) {
            user.hp += amount;
            battle._events.push({ t: 'heal', side: s, amount, hp: user.hp, maxHp: max });
          }
        }
        return;
      case 'recoil':
        if (dealt > 0) applyDirectDamage(battle, s, dealt * e.fraction, 'recoil');
        return;
      case 'weather':
        setWeather(battle, e.weather, s);
        return;
      case 'confuse':
        if (target.hp <= 0 || battle.sides[targetS].volatile.verwirrt) return;
        if (!battle.rng.chance(chance)) return;
        battle.sides[targetS].volatile.verwirrt = battle.rng.int(2, 4);
        battle._events.push({ t: 'text', text: name(target) + ' ist verwirrt!' });
        return;
      case 'critUp':
        if (move.power === 0) changeStage(battle, s, 'crit', 1);
        return;
      case 'cleanse':
        if (user.status) {
          battle._events.push({ t: 'statusEnd', side: s, status: user.status });
          user.status = null;
        }
        return;
      case 'multiHit':
        return;
    }
  }

  // onStatusInflict-Hooks des Ziels dürfen {block:true} oder {reflect:true} zurückgeben.
  function statusInflictAnswer(battle, s, status, move) {
    for (const h of handlers(battle, s, 'onStatusInflict')) {
      const r = h.fn(ctx(battle, s, { status, move }));
      if (r && r.block) return 'block';
      if (r && r.reflect) return 'reflect';
    }
    return null;
  }

  function useMove(battle, s, action) {
    const side = battle.sides[s];
    const user = active(battle, s);
    const foeS = 1 - s;
    if (user.hp <= 0) return;

    // Status prüfen
    if (user.status === 'schlaf') {
      if (user.statusTurns > 0) {
        user.statusTurns--;
        battle._events.push({ t: 'cantMove', side: s, reason: 'schlaf' });
        return;
      }
      user.status = null;
      battle._events.push({ t: 'statusEnd', side: s, status: 'schlaf' });
    }
    if (user.status === 'frost') {
      if (user.statusTurns > 0) {
        user.statusTurns--;
        battle._events.push({ t: 'cantMove', side: s, reason: 'frost' });
        return;
      }
      user.status = null;
      battle._events.push({ t: 'statusEnd', side: s, status: 'frost' });
    }
    if (user.status === 'laehmung' && battle.rng.chance(0.25)) {
      battle._events.push({ t: 'cantMove', side: s, reason: 'laehmung' });
      return;
    }
    if (side.volatile.verwirrt) {
      side.volatile.verwirrt--;
      if (side.volatile.verwirrt <= 0) {
        delete side.volatile.verwirrt;
        battle._events.push({ t: 'text', text: name(user) + ' ist nicht mehr verwirrt.' });
      } else if (battle.rng.chance(0.33)) {
        battle._events.push({ t: 'cantMove', side: s, reason: 'verwirrt' });
        const r = L.damage.calc({ attacker: user, defender: user, move: { type: null, power: 40, effects: [] }, battle: null, rng: battle.rng, forceCrit: false });
        user.hp = Math.max(0, user.hp - r.amount);
        battle._events.push({ t: 'damage', side: s, amount: r.amount, hp: user.hp, maxHp: L.mon.maxHp(user), effectiveness: 1, crit: false, self: true });
        checkFaint(battle, s);
        return;
      }
    }

    let move;
    if (action.type === 'bond') {
      move = bondMoveFor(user);
      side.bondUsed = true;
      user.bond = 60;
      battle._events.push({ t: 'bondMove', side: s, uid: user.uid, name: move.name, type: move.type });
    } else {
      move = L.moves.resolve(user.moves[action.index]);
    }
    side.volatile.movesUsed = (side.volatile.movesUsed || 0) + 1;
    battle._events.push({ t: 'move', side: s, move: move.id, name: move.name, type: move.type, bond: !!move.bond });

    const target = active(battle, foeS);
    const selfOnly = move.power === 0 && (move.effects || []).every((e) => e.target === 'self' || ['heal', 'weather', 'critUp', 'cleanse'].indexOf(e.kind) >= 0);
    if (!selfOnly) {
      if (target.hp <= 0) {
        battle._events.push({ t: 'text', text: 'Kein Ziel …' });
        return;
      }
      if (!battle.rng.chance(hitChance(battle, s, move))) {
        battle._events.push({ t: 'miss', side: s });
        return;
      }
    }

    let dealt = 0;
    if (move.power > 0) {
      const multi = (move.effects || []).find((e) => e.kind === 'multiHit');
      const hits = multi ? battle.rng.int(multi.min, multi.max) : 1;
      for (let i = 0; i < hits && target.hp > 0 && user.hp > 0; i++) {
        const r = L.damage.calc({ attacker: user, defender: target, move, battle, rng: battle.rng, atkSide: s, defSide: foeS, forceCrit: move.bond ? null : undefined });
        let amount = r.amount;
        const hpBefore = target.hp;
        const max = L.mon.maxHp(target);
        if (amount >= hpBefore) {
          const survive = runHook(battle, foeS, 'modifySurvive', { damage: amount, hpBefore, maxHp: max, move }, false);
          if (survive) {
            amount = hpBefore - 1;
            battle._events.push({ t: 'ability', side: foeS, uid: target.uid, ability: L.mon.abilityId(target), text: name(target) + ' hält durch!' });
          }
        }
        target.hp = Math.max(0, target.hp - amount);
        dealt += amount;
        battle._events.push({ t: 'damage', side: foeS, amount, hp: target.hp, maxHp: max, effectiveness: r.effectiveness, crit: r.crit });
        if (target.status === 'frost' && move.type === 'glut' && target.hp > 0) { target.status = null; battle._events.push({ t: 'statusEnd', side: foeS, status: 'frost' }); }
        runHook(battle, foeS, 'onHit', { move, damage: amount, attacker: user, attackerSide: s });
        runHook(battle, s, 'onDealDamage', { move, damage: amount, target });
        checkFaint(battle, foeS);
      }
      if (hits > 1) battle._events.push({ t: 'text', text: hits + ' Treffer!' });
    }
    for (const e of move.effects || []) applyEffect(battle, s, e, move, dealt);
    checkFaint(battle, s);
    checkPhases(battle);
  }

  // ---- Items ----
  function itemTargets(battle, s, itemId) {
    const side = battle.sides[s];
    const item = R().get('item', itemId);
    const out = [];
    side.team.forEach((m, i) => {
      const max = L.mon.maxHp(m);
      if (item.kind === 'heal' && m.hp > 0 && m.hp < max) out.push(i);
      if (item.kind === 'revive' && m.hp <= 0) out.push(i);
      if (item.kind === 'cure' && m.hp > 0 && m.status) out.push(i);
    });
    return out;
  }

  // Bannträger-Kunst: einmal pro Kampf statt einer Attacke
  function useArt(battle, s) {
    const side = battle.sides[s];
    const p = L.paths.of(side.path);
    side.artUsed = true;
    battle._events.push({ t: 'art', side: s, path: p.id, name: p.artName });
    p.art(ctx(battle, s, { name: name(active(battle, s)) }));
  }

  function useItem(battle, s, action) {
    const side = battle.sides[s];
    const item = R().get('item', action.item);
    const mon = side.team[action.target];
    side.items[action.item]--;
    if (side.items[action.item] <= 0) delete side.items[action.item];
    battle._events.push({ t: 'item', side: s, item: item.id, target: action.target });
    const max = L.mon.maxHp(mon);
    if (item.kind === 'heal') {
      const before = mon.hp;
      mon.hp = Math.min(max, mon.hp + Math.floor(max * item.value));
      const k = battle.doubles ? side.slots.findIndex((sl, j) => slotMon(battle, s, j) === mon) : (action.target === side.active ? 0 : -1);
      if (k >= 0) battle._events.push(Object.assign({ t: 'heal', side: s, amount: mon.hp - before, hp: mon.hp, maxHp: max }, battle.doubles ? { slot: k } : {}));
      else battle._events.push({ t: 'text', text: name(mon) + ' wurde geheilt.' });
    } else if (item.kind === 'revive') {
      mon.hp = Math.floor(max * item.value);
      mon.status = null;
      battle._events.push({ t: 'text', text: name(mon) + ' ist wieder bei Kräften!' });
    } else if (item.kind === 'cure') {
      battle._events.push({ t: 'statusEnd', side: s, status: mon.status, target: action.target });
      mon.status = null;
    }
  }

  // ---- Öffentliche API ----
  function create(o) {
    const count = o.doubles ? 2 : 1;
    const battle = {
      kind: o.enemy.kind || 'wild',
      doubles: !!o.doubles,
      sides: [makeSide(o.player, true, count), makeSide(o.enemy, false, count)],
      turn: 0,
      weather: null,
      state: 'choose',
      rng: o.rng,
      run: o.run || null,
      flags: {},
      defeated: [],
      phases: o.enemy.phases || [],
      phasesDone: [],
      enemyPolicy: o.enemyPolicy || null,
      captured: null,
      pendingRelease: false,
      result: null,
      startWeather: o.weather || null,
      now: o.now || null,
      _events: [],
    };
    battle._api = makeApi(battle);
    return battle;
  }

  function start(battle) {
    if (battle.doubles) return startDouble(battle);
    battle._events = [];
    const p = battle.sides[0];
    p.participants.push(p.team[p.active].uid);
    if (battle.startWeather) setWeather(battle, battle.startWeather);
    for (const s of [0, 1]) runHook(battle, s, 'onBattleStart', {});
    for (const s of [0, 1]) runHook(battle, s, 'onSwitchIn', {});
    return battle._events;
  }

  // slot (nur Doppelkampf): für welchen Platz die Aktionen gelten.
  // pending (nur Doppelkampf): schon gewählte Aktionen der anderen Plätze in dieser Runde –
  // verbrauchte Items/Kugeln, Bindung, Kunst und eingeplante Wechsel werden dann nicht noch einmal angeboten.
  function legal(battle, s, slot, pending) {
    const out = legalRaw(battle, s, slot);
    if (!pending || !pending.length) return out;
    const used = {};
    for (const p of pending) {
      const id = p.type === 'item' ? p.item : p.type === 'capture' ? p.ball : null;
      if (id) used[id] = (used[id] || 0) + 1;
    }
    const items = battle.sides[s].items || {};
    return out.filter((a) => {
      const id = a.type === 'item' ? a.item : a.type === 'capture' ? a.ball : null;
      if (id && (items[id] || 0) - (used[id] || 0) <= 0) return false;
      if ((a.type === 'bond' || a.type === 'art') && pending.some((p) => p.type === a.type)) return false;
      if (a.type === 'switch' && pending.some((p) => p.type === 'switch' && p.index === a.index)) return false;
      return true;
    });
  }

  function legalRaw(battle, s, slot) {
    if (battle.doubles) focus(battle, s, slot !== undefined ? slot : battle.state === 'forceSwitch' && s === 0 && battle.pendingSlots.length ? battle.pendingSlots[0] : battle.sides[s].slot);
    const side = battle.sides[s];
    const mon = side.team[side.active];
    const out = [];
    if (battle.state === 'forceSwitch' && s === 0) {
      side.team.forEach((m, i) => { if (m.hp > 0 && !inOtherSlot(side, i)) out.push({ type: 'switch', index: i }); });
      return out;
    }
    mon.moves.forEach((_, i) => out.push({ type: 'move', index: i }));
    if (s === 0 && mon.bond >= 100 && !side.bondUsed) out.push({ type: 'bond' });
    if (s === 0 && side.path && !side.artUsed && L.paths && L.paths.of(side.path)) out.push({ type: 'art' });
    side.team.forEach((m, i) => { if (i !== side.active && m.hp > 0 && !inOtherSlot(side, i)) out.push({ type: 'switch', index: i }); });
    if (s === 0) {
      for (const id of Object.keys(side.items)) {
        if (!side.items[id]) continue;
        const item = R().get('item', id);
        if (item.kind === 'ball') {
          const foe = active(battle, 1);
          if (battle.kind === 'wild' && R().get('species', foe.species).rarity !== 'boss' && (!L.modes || L.modes.allows(battle.run, foe.species))) out.push({ type: 'capture', ball: id });
        } else if (['heal', 'revive', 'cure'].indexOf(item.kind) >= 0) {
          for (const t of itemTargets(battle, s, id)) out.push({ type: 'item', item: id, target: t });
        }
      }
    }
    return out;
  }

  function sameAction(a, b) {
    return a.type === b.type && a.index === b.index && a.item === b.item && a.target === b.target && a.ball === b.ball;
  }

  function enemyAction(battle, slot) {
    if (slot !== undefined) focus(battle, 1, slot);
    if (battle.enemyPolicy) return battle.enemyPolicy(battle, slot);
    if (L.ai && L.ai.choose) return L.ai.choose(battle, 1, battle.rng, undefined, slot);
    return { type: 'move', index: 0 };
  }

  function priorityOf(battle, s, action) {
    const mon = active(battle, s);
    if (action.type === 'bond') return 0;
    const move = L.moves.resolve(mon.moves[action.index]);
    return runHook(battle, s, 'modifyPriority', { move }, move.priority || 0);
  }

  function endOfTurn(battle) {
    for (const s of [0, 1]) tickMon(battle, s);
    bondTick(battle);
    weatherTick(battle);
    exhaustionTick(battle);
  }

  // Sicherung gegen Endlos-Kämpfe: ab config.exhaustionTurn verlieren alle Monster im Feld
  // jede Runde mehr KP (deterministisch, ohne Zufall)
  function exhaustionTick(battle) {
    const start = L.config.exhaustionTurn;
    if (!start || battle.turn < start) return;
    if (!alive(battle.sides[0].team).length || !alive(battle.sides[1].team).length) return;
    if (battle.turn === start) battle._events.push({ t: 'text', text: 'Der Kampf dauert schon ewig … Erschöpfung setzt ein! Beide Seiten verlieren jetzt jede Runde mehr KP.' });
    const frac = Math.min(1, (battle.turn - start + 1) * (L.config.exhaustionStep || 0.05));
    for (const s of [0, 1]) {
      const slots = battle.doubles ? liveSlots(battle, s) : [null];
      for (const k of slots) {
        if (k !== null) focus(battle, s, k);
        const mon = active(battle, s);
        if (mon.hp <= 0) continue;
        const max = L.mon.maxHp(mon);
        const amount = Math.min(mon.hp, Math.max(1, Math.floor(max * frac)));
        mon.hp -= amount;
        battle._events.push({ t: 'damage', side: s, amount, hp: mon.hp, maxHp: max, effectiveness: 1, crit: false, reason: 'exhaustion' });
        checkFaint(battle, s);
      }
    }
  }

  // Ende der Runde für das betrachtete Monster einer Seite: Verbrennung, Gift, onTurnEnd
  function tickMon(battle, s) {
    {
      const mon = active(battle, s);
      if (mon.hp <= 0) return;
      const max = L.mon.maxHp(mon);
      if (mon.status === 'brand') {
        const amount = Math.max(1, Math.floor(max / 16));
        mon.hp = Math.max(0, mon.hp - amount);
        battle._events.push({ t: 'statusTick', side: s, status: 'brand', amount, hp: mon.hp, maxHp: max });
        checkFaint(battle, s);
      } else if (mon.status === 'gift') {
        const v = battle.sides[s].volatile;
        const n = v.giftN || 1;
        const amount = Math.max(1, Math.floor(max * n / 16));
        v.giftN = Math.min(4, n + 1);
        mon.hp = Math.max(0, mon.hp - amount);
        battle._events.push({ t: 'statusTick', side: s, status: 'gift', amount, hp: mon.hp, maxHp: max });
        checkFaint(battle, s);
      }
      if (mon.hp > 0) runHook(battle, s, 'onTurnEnd', {});
    }
  }

  // Bindung wächst für das aktive Monster des Spielers
  function bondTick(battle) {
    const p = active(battle, 0);
    if (p.hp > 0 && p.bond < 100) {
      const rate = p.trait ? (R().get('trait', p.trait).bondRate || 1) : 1;
      const gain = runHook(battle, 0, 'modifyBondGain', {}, 3 * rate);
      const before = p.bond;
      p.bond = Math.min(100, Math.round((p.bond + gain) * 10) / 10);
      if (Math.floor(before) !== Math.floor(p.bond)) battle._events.push({ t: 'bond', side: 0, uid: p.uid, value: p.bond });
    }
  }

  function weatherTick(battle) {
    if (battle.weather) {
      battle.weather.turnsLeft--;
      if (battle.weather.turnsLeft <= 0) {
        battle._events.push({ t: 'weatherEnd', id: battle.weather.id });
        battle.weather = null;
      }
    }
  }

  function finish(battle, result) {
    battle.state = result;
    battle.result = result;
    if (result === 'won' || result === 'captured') {
      for (const m of battle.sides[0].team) {
        if (m.hp > 0 && battle.sides[0].participants.indexOf(m.uid) >= 0) {
          const rate = m.trait ? (R().get('trait', m.trait).bondRate || 1) : 1;
          m.bond = Math.min(100, m.bond + 10 * rate);
        }
      }
    }
    battle._events.push({ t: 'end', result });
  }

  function resolveFaints(battle) {
    const enemy = battle.sides[1], player = battle.sides[0];
    if (alive(player.team).length === 0) return finish(battle, 'lost');
    if (alive(enemy.team).length === 0) return finish(battle, 'won');
    if (active(battle, 1).hp <= 0) {
      const next = enemy.team.findIndex((m) => m.hp > 0);
      switchIn(battle, 1, next);
      battle._events.push({ t: 'text', text: (enemy.trainer ? 'Der Gegner schickt ' + name(active(battle, 1)) + ' in den Kampf!' : name(active(battle, 1)) + ' erscheint!') });
    }
    if (active(battle, 0).hp <= 0) {
      battle.state = 'forceSwitch';
      return;
    }
    battle.state = 'choose';
  }

  function step(battle, playerAction) {
    if (battle.doubles) return stepDouble(battle, playerAction);
    if (battle.state !== 'choose') throw new Error('Kampf ist nicht im Zustand choose (' + battle.state + ')');
    if (!legal(battle, 0).some((a) => sameAction(a, playerAction))) throw new Error('Aktion nicht erlaubt: ' + JSON.stringify(playerAction));
    battle._events = [];
    battle.turn++;
    battle._events.push({ t: 'turnStart', turn: battle.turn });
    const actions = [{ s: 0, a: playerAction }, { s: 1, a: enemyAction(battle) }];

    for (const x of actions) if (x.a.type === 'switch') switchIn(battle, x.s, x.a.index);
    for (const x of actions) if (x.a.type === 'item') useItem(battle, x.s, x.a);
    for (const x of actions) if (x.a.type === 'art') useArt(battle, x.s);
    for (const x of actions) {
      if (x.a.type !== 'capture') continue;
      const done = L.capture ? L.capture.attempt(battle, x.a.ball) : false;
      if (done) { finish(battle, 'captured'); return battle._events; }
    }
    const movers = actions.filter((x) => x.a.type === 'move' || x.a.type === 'bond');
    const order = movers.map((x) => ({
      x,
      prio: priorityOf(battle, x.s, x.a),
      spe: L.damage.statOf(battle, x.s, active(battle, x.s), 'spe'),
      tie: battle.rng.next(),
    }));
    order.sort((a, b) => b.prio - a.prio || b.spe - a.spe || a.tie - b.tie);
    for (const o of order) {
      if (battle.state !== 'choose') break;
      useMove(battle, o.x.s, o.x.a);
      if (alive(battle.sides[0].team).length === 0 || alive(battle.sides[1].team).length === 0) break;
    }
    if (alive(battle.sides[0].team).length && alive(battle.sides[1].team).length) endOfTurn(battle);
    checkPhases(battle);
    resolveFaints(battle);
    return battle._events;
  }

  function forceSwitch(battle, index) {
    if (battle.state !== 'forceSwitch') throw new Error('Kein Wechsel nötig');
    if (battle.doubles) return forceSwitchDouble(battle, index);
    const m = battle.sides[0].team[index];
    if (!m || m.hp <= 0) throw new Error('Monster kann nicht kämpfen');
    battle._events = [];
    switchIn(battle, 0, index);
    battle.state = 'choose';
    return battle._events;
  }

  // ---- Doppelkampf (2 gegen 2) ----
  function startDouble(battle) {
    battle._events = eventList(battle);
    battle.pendingSlots = [];
    const p = battle.sides[0];
    for (const m of actives(battle, 0)) if (p.participants.indexOf(m.uid) < 0) p.participants.push(m.uid);
    if (battle.startWeather) setWeather(battle, battle.startWeather);
    for (const s of [0, 1]) { focus(battle, s, 0); runHook(battle, s, 'onBattleStart', {}); }
    for (const s of [0, 1]) for (const k of liveSlots(battle, s)) { focus(battle, s, k); runHook(battle, s, 'onSwitchIn', {}); }
    return battle._events;
  }

  // Ziel-Platz auf der Gegenseite: der gewünschte, sonst der andere, solange dort noch jemand steht
  function targetSlot(battle, s, wanted) {
    const live = liveSlots(battle, 1 - s);
    if (!live.length) return -1;
    return live.indexOf(wanted) >= 0 ? wanted : live[0];
  }

  // playerActions: eine Aktion je kampffähigem Platz, z. B. [{ type: 'move', index: 0, foe: 1 }, { type: 'switch', index: 3 }].
  // slot (optional) sagt, für welchen Platz die Aktion gilt, sonst gilt die Reihenfolge. foe = Ziel-Platz beim Gegner.
  function stepDouble(battle, playerActions) {
    if (battle.state !== 'choose') throw new Error('Kampf ist nicht im Zustand choose (' + battle.state + ')');
    const list = Array.isArray(playerActions) ? playerActions : [playerActions];
    const need = liveSlots(battle, 0);
    if (list.length !== need.length) throw new Error('Im Doppelkampf braucht jedes Monster eine Aktion (' + need.length + ')');
    const actions = [];
    const used = {};
    list.forEach((a, i) => {
      const k = a.slot !== undefined ? a.slot : need[i];
      if (need.indexOf(k) < 0 || actions.some((x) => x.k === k)) throw new Error('Ungültiger Platz: ' + k);
      if (!legal(battle, 0, k).some((b) => sameAction(b, a))) throw new Error('Aktion nicht erlaubt: ' + JSON.stringify(a));
      if (a.type === 'switch' && actions.some((x) => x.a.type === 'switch' && x.a.index === a.index)) throw new Error('Dieses Monster wird schon eingewechselt');
      if (a.type === 'art' && actions.some((x) => x.a.type === 'art')) throw new Error('Nur eine Kunst pro Runde');
      if (a.type === 'bond' && actions.some((x) => x.a.type === 'bond')) throw new Error('Die Bindungs-Attacke gibt es nur einmal pro Kampf');
      if (a.type === 'item') {
        used[a.item] = (used[a.item] || 0) + 1;
        if (used[a.item] > (battle.sides[0].items[a.item] || 0)) throw new Error('Nicht genug ' + a.item);
      }
      actions.push({ s: 0, k, a });
    });
    battle._events = eventList(battle);
    battle.turn++;
    battle._events.push({ t: 'turnStart', turn: battle.turn });
    for (const k of liveSlots(battle, 1)) actions.push({ s: 1, k, a: enemyAction(battle, k) });
    const claimed = [];
    for (const x of actions) {
      if (x.s !== 1 || x.a.type !== 'switch') continue;
      if (claimed.indexOf(x.a.index) < 0) { claimed.push(x.a.index); continue; }
      const mv = legal(battle, 1, x.k).find((b) => b.type === 'move');
      if (mv) x.a = Object.assign({}, mv, { foe: liveSlots(battle, 0)[0] });
    }

    for (const x of actions) if (x.a.type === 'switch') { focus(battle, x.s, x.k); switchIn(battle, x.s, x.a.index); }
    for (const x of actions) if (x.a.type === 'item') { focus(battle, x.s, x.k); useItem(battle, x.s, x.a); }
    for (const x of actions) if (x.a.type === 'art') { focus(battle, x.s, x.k); useArt(battle, x.s); }
    const movers = actions.filter((x) => x.a.type === 'move' || x.a.type === 'bond');
    const order = movers.map((x) => {
      focus(battle, x.s, x.k);
      return { x, uid: active(battle, x.s).uid, prio: priorityOf(battle, x.s, x.a), spe: L.damage.statOf(battle, x.s, active(battle, x.s), 'spe'), tie: battle.rng.next() };
    });
    order.sort((a, b) => b.prio - a.prio || b.spe - a.spe || a.tie - b.tie);
    for (const o of order) {
      if (battle.state !== 'choose') break;
      focus(battle, o.x.s, o.x.k);
      if (active(battle, o.x.s).uid !== o.uid || active(battle, o.x.s).hp <= 0) continue;
      const t = targetSlot(battle, o.x.s, o.x.a.foe);
      if (t < 0) break;
      focus(battle, 1 - o.x.s, t);
      useMove(battle, o.x.s, o.x.a);
      if (alive(battle.sides[0].team).length === 0 || alive(battle.sides[1].team).length === 0) break;
    }
    if (alive(battle.sides[0].team).length && alive(battle.sides[1].team).length) {
      for (const s of [0, 1]) for (const k of liveSlots(battle, s)) { focus(battle, s, k); tickMon(battle, s); }
      for (const k of liveSlots(battle, 0)) { focus(battle, 0, k); bondTick(battle); }
      weatherTick(battle);
      exhaustionTick(battle);
    }
    for (const k of liveSlots(battle, 1)) { focus(battle, 1, k); checkPhases(battle); }
    resolveFaintsDouble(battle);
    return battle._events;
  }

  function resolveFaintsDouble(battle) {
    const enemy = battle.sides[1], player = battle.sides[0];
    if (alive(player.team).length === 0) return finish(battle, 'lost');
    if (alive(enemy.team).length === 0) return finish(battle, 'won');
    enemy.slots.forEach((_, k) => {
      if (slotMon(battle, 1, k).hp > 0) return;
      focus(battle, 1, k);
      const next = enemy.team.findIndex((m, i) => m.hp > 0 && !inOtherSlot(enemy, i));
      if (next < 0) return;
      switchIn(battle, 1, next);
      battle._events.push({ t: 'text', text: 'Der Gegner schickt ' + name(active(battle, 1)) + ' in den Kampf!' });
    });
    // Reserve des Spielers: so viele Plätze nachbesetzen, wie noch Monster auf der Bank sind
    let bench = player.team.filter((m, i) => m.hp > 0 && !player.slots.some((sl, k) => (k === player.slot ? player.active : sl.active) === i)).length;
    battle.pendingSlots = [];
    player.slots.forEach((_, k) => { if (slotMon(battle, 0, k).hp <= 0 && bench > 0) { battle.pendingSlots.push(k); bench--; } });
    battle.state = battle.pendingSlots.length ? 'forceSwitch' : 'choose';
  }

  function forceSwitchDouble(battle, index) {
    const k = battle.pendingSlots[0];
    focus(battle, 0, k);
    const side = battle.sides[0];
    const m = side.team[index];
    if (!m || m.hp <= 0 || inOtherSlot(side, index)) throw new Error('Monster kann nicht kämpfen');
    battle._events = eventList(battle);
    battle.pendingSlots.shift();
    switchIn(battle, 0, index);
    battle.state = battle.pendingSlots.length ? 'forceSwitch' : 'choose';
    return battle._events;
  }

  function rewards(battle) {
    const side = battle.sides[0];
    const mult = battle.kind === 'wild' ? 1 : 1.5;
    let total = 0;
    for (const d of battle.defeated) total += Math.floor(Math.floor(R().get('species', d.species).baseExp * d.level / L.config.expDivisor) * mult);
    const exp = {};
    for (const m of side.team) {
      if (m.hp <= 0) continue;
      const share = side.participants.indexOf(m.uid) >= 0 ? 1 : L.config.benchExpShare;
      let amount = Math.floor(total * share);
      amount = Math.floor(L.hooks.run(teamHandlers(side, 'modifyExp'), 'modifyExp', { battle, mon: m }, amount));
      if (amount > 0) exp[m.uid] = amount;
    }
    return { exp };
  }

  // Handler, die nicht am aktiven Monster hängen (Relikte, Segen, Resonanz, Fähigkeiten im ganzen Team).
  function teamHandlers(side, hookName) {
    const out = [];
    const team = side.team || [];
    for (const m of team) {
      const ab = R().get('ability', L.mon.abilityId(m));
      if (ab.teamHooks) wrap('ability', ab.teamHooks, out);
    }
    if (L.resonance) for (const r of L.resonance.active(team)) wrap('resonance', r.teamHooks, out);
    for (const id of side.relics || []) {
      const rel = R().get('relic', id);
      wrap('relic', rel.hooks, out);
    }
    for (const x of L.hooks.extra(side)) wrap(x.source, x.hooks, out);
    if (side.blessing && R().has('blessing', side.blessing)) wrap('blessing', R().get('blessing', side.blessing).hooks, out);
    return out.filter((h) => !hookName || h.name === hookName);
  }

  L.battle = {
    create, start, step, legal, forceSwitch, rewards, handlers, teamHandlers, inflict, active, bondMoveFor, itemTargets, hitChance,
    focus, slotMon, liveSlots, actives,
    STAT_NAMES,
  };
})(globalThis.LUM);
