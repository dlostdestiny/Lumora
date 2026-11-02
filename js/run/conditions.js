// Bedingungen für Story-Szenen, Geheimnisse, Ereignisse und Begegnungen (Spezifikation 9.5).
(function (L) {
  const typesOf = (m) => L.registry.get('species', m.species).types;

  const checks = {
    all: (v, c) => v.every((x) => check(x, c)),
    any: (v, c) => v.some((x) => check(x, c)),
    not: (v, c) => !check(v, c),
    chance: (v, c) => c.rng.chance(v),
    realTime: (v, c) => (v === 'night') === L.clock.isNight(c.now || L.clock.now()),
    runNumber: (v, c) => (c.run ? c.run.number : 1) >= (v.min || 0) && (v.max === undefined || (c.run ? c.run.number : 1) <= v.max),
    metaFlag: (v, c) => !!(c.meta && c.meta.flags && c.meta.flags[v]),
    teamAtLeast: (v, c) => !!c.run && c.run.team.length >= v,
    relicsAtLeast: (v, c) => !!c.run && c.run.relics.length >= v,
    runFlag: (v, c) => !!(c.run && c.run.flags && c.run.flags[v]),
    bossDefeated: (v, c) => !!(c.meta && (c.meta.bossesDefeated || []).indexOf(v) >= 0),
    fragments: (v, c) => !!c.meta && (c.meta.fragments || []).length >= v,
    act: (v, c) => !!c.run && c.run.act === v,
    variant: (v, c) => !!c.run && c.run.variant === v,
    teamTypeCount: (v, c) => !!c.run && c.run.team.filter((m) => m.hp > 0 && typesOf(m).indexOf(v.type) >= 0).length >= v.min,
    noHealInAct: (v, c) => !!c.run && !(c.run.healedInAct || {})[v],
    hasRelic: (v, c) => !!c.run && c.run.relics.indexOf(v) >= 0,
    hasItem: (v, c) => !!c.run && (c.run.items[v] || 0) > 0,
    sceneSeen: (v, c) => !!(c.meta && (c.meta.scenesSeen || []).indexOf(v) >= 0),
    goldAtLeast: (v, c) => !!c.run && c.run.gold >= v,
    runFlag: (v, c) => !!c.run && !!(c.run.flags || {})[v],
    noRunFlag: (v, c) => !c.run || !(c.run.flags || {})[v],
    noTeamHasStellio: (v, c) => !c.run || !(c.run.team || []).some((m) => m.species === 'stellio'),
    teamHas: (v, c) => !!c.run && (c.run.team || []).some((m) => m.species === v),
    fragmentsAtLeast: (v, c) => !!c.run && !!L.fragments && L.fragments.known(c.run).length >= v,
    fragmentMissingHere: (v, c) => !!c.run && !!L.fragments && !L.fragments.has(c.run, v + c.run.act),
    rankAtLeast: (v, c) => !!c.run && (c.run.rank || 1) >= v,
    echoAtLeast: (v, c) => !!c.run && (c.run.echo || 0) >= v,
    // Herausforderungs-Modus des Laufs (z. B. 'jenseits'); notMode = nicht in diesem Modus
    mode: (v, c) => !!c.run && (c.run.mode || null) === v,
    notMode: (v, c) => !c.run || (c.run.mode || null) !== v,
    cursed: (v, c) => !!c.run && ((c.run.curses || []).length > 0) === !!v,
  };

  function check(cond, ctx) {
    if (!cond) return true;
    ctx = ctx || {};
    for (const key of Object.keys(cond)) {
      const fn = checks[key];
      if (!fn) throw new Error('Unbekannte Bedingung: ' + key);
      if (!fn(cond[key], ctx)) return false;
    }
    return true;
  }

  // Fehler in einer Bedingung (unbekannte Art, unbekannter Modus) – für Validatoren
  function problems(cond, reg) {
    if (!cond || typeof cond !== 'object') return [];
    const out = [];
    for (const key of Object.keys(cond)) {
      if (!checks[key]) { out.push('unbekannte Bedingung ' + key); continue; }
      const v = cond[key];
      if (key === 'all' || key === 'any') for (const x of v) out.push(...problems(x, reg));
      if (key === 'not') out.push(...problems(v, reg));
      if ((key === 'mode' || key === 'notMode') && reg && !reg.has('mode', v)) out.push('unbekannter Modus ' + v);
    }
    return out;
  }

  L.cond = { check, problems, KINDS: Object.keys(checks) };
  L.registry.addValidator('scene', (def, reg) => problems(def.condition, reg));
})(globalThis.LUM);
