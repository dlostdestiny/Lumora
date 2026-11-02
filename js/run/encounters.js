// Begegnungen: wilde Monster, Eliten, Rivale, Boss. Liefert BattleSetups mit fertigen Monster-Objekten,
// damit ein neu geladener Lauf exakt denselben Kampf bekommt.
(function (L) {
  const R = () => L.registry;

  function act(run) { return R().get('act', run.act); }
  function variant(run) { return act(run).variants.find((v) => v.id === run.variant); }

  function levelAt(run, layer) {
    const a = act(run);
    const [lo, hi] = a.levelRange;
    return Math.round(lo + (hi - lo) * layer / (a.map.layers - 1)) + (run.sideAct ? run.sideLevelBonus || 0 : 0);
  }

  // Gegner-Level inklusive Echo-Stufe
  function enemyLevel(run, layer) { return levelAt(run, layer) + L.echo.of(run).enemyLevel; }

  function shinyFactor(run) {
    let f = L.echo.of(run).shinyMult;
    if (run.blessing && R().has('blessing', run.blessing)) f *= R().get('blessing', run.blessing).shinyFactor || 1;
    for (const id of run.relics) f *= R().get('relic', id).shinyFactor || 1;
    return f;
  }
  function traitFactor(run) {
    let f = 1;
    for (const id of run.relics) f *= R().get('relic', id).traitFactor || 1;
    return f;
  }

  // Erzeugt ein Monster und entwickelt es automatisch, wenn das Level reicht (für Trainer).
  function makeMon(run, rng, species, level, extra) {
    let sp = species;
    let def = R().get('species', sp);
    while (extra && extra.autoEvolve && def.evolves && def.evolves.length && level >= def.evolves[0].level) {
      sp = def.evolves[0].to;
      def = R().get('species', sp);
    }
    if (def.legend) level += L.config.legendLevelBonus;
    const m = L.mon.create(Object.assign({ species: sp, level: Math.max(1, Math.min(L.config.maxLevel, level)), rng, traitFactor: traitFactor(run), hiddenChance: def.legend || def.rarity === 'boss' ? 0 : L.config.hiddenAbilityChance }, extra && extra.mon));
    if (extra && extra.held) m.held = extra.held;
    return m;
  }

  function wild(run, rng, now, layer, weatherId) {
    if (layer === undefined) layer = 0;
    let species;
    if (rng.chance(L.config.pochiChance)) species = 'pochi';
    else {
      let pool = variant(run).encounters.filter((e) => (e.minLayer || 0) <= layer && L.cond.check(e.condition, { run, now, rng }));
      const w = weatherId ? R().get('weather', weatherId) : null;
      if (w) pool = pool.map((e) => (R().get('species', e.species).types.some((t) => (w.typeMods[t] || 1) > 1) ? Object.assign({}, e, { weight: e.weight * 2 }) : e));
      species = rng.weighted(pool).species;
    }
    const level = Math.max(1, enemyLevel(run, layer) + rng.int(-1, 1));
    const shiny = rng.chance(L.config.shinyChance * shinyFactor(run));
    return { species, level, shiny };
  }

  // Wilder Kampf gegen eine Legende: Affix „Legende“ dazu
  function legendize(setup) {
    if (setup.kind === 'wild' && setup.team.some((m) => R().get('species', m.species).legend)) {
      setup.legend = true;
      if (setup.affixes.indexOf('legende') < 0) setup.affixes.push('legende');
    }
    return setup;
  }

  function wildSetup(run, rng, now, layer, opts) {
    opts = opts || {};
    const w = opts.species ? { species: opts.species, level: enemyLevel(run, layer) + (opts.levelOffset || 0), shiny: rng.chance(L.config.shinyChance * shinyFactor(run) * (opts.shinyFactor || 1)) } : wild(run, rng, now, layer, opts.weather);
    const mon = makeMon(run, rng, w.species, w.level, { mon: { shiny: w.shiny } });
    return legendize({ kind: 'wild', team: [mon], weather: variant(run).weather, rewardSource: opts.rewardSource || 'battle', affixes: [], phases: [], items: {} });
  }

  function trainerSetup(run, rng, trainerId, baseLevel, kind, extra) {
    const t = R().get('trainer', trainerId);
    const team = t.team.map((e) => makeMon(run, rng, e.species, baseLevel + (e.levelOffset || 0), { autoEvolve: true, held: e.held }));
    return Object.assign({
      kind, team, trainer: trainerId, trainerName: t.name, weather: variant(run).weather,
      affixes: [], phases: t.phases || [], items: Object.assign({}, t.items || {}), rewardSource: kind === 'boss' ? 'boss' : 'elite',
    }, extra || {});
  }

  // Geister-Kampf: dein Sieger-Team aus einem früheren Lauf als Gegner
  function ghost(run, rng, layer) {
    const free = (run.ghosts || []).filter((g, i) => (run.ghostsUsed || []).indexOf(i) < 0);
    const g = rng.pick(free);
    const gi = run.ghosts.indexOf(g);
    run.ghostsUsed = (run.ghostsUsed || []).concat([gi]);
    const level = enemyLevel(run, layer) + L.config.eliteLevelBonus;
    const team = g.team.slice(0, 3).filter((m) => R().has('species', m.species)).map((m) => L.mon.create({ species: m.species, level, rng, nature: m.nature, trait: m.trait, shiny: m.shiny, hiddenAbility: m.hiddenAbility,
      moves: m.moves.filter((x) => R().has('move', x.id)).slice(0, 4) }));
    return { kind: 'elite', team, trainer: null, trainerName: 'Echo von ' + g.name, weather: variant(run).weather, affixes: [], phases: [], items: { heiltrank: 1 }, rewardSource: 'elite', ghost: true };
  }

  function elite(run, rng, layer) {
    if ((run.ghosts || []).length > (run.ghostsUsed || []).length && layer >= 4 && rng.chance(L.config.ghostChance)) return ghost(run, rng, layer);
    const a = act(run);
    const id = rng.pick(a.elites);
    const affix = L.affixes.random(rng);
    const affixes = layer >= L.config.eliteAffixFromLayer || L.echo.of(run).eliteAffixAlways ? [affix] : [];
    return trainerSetup(run, rng, id, enemyLevel(run, layer) + L.config.eliteLevelBonus, 'elite', { affixes });
  }

  // Elite-Doppelkampf: zwei Trainer des Akts kämpfen gemeinsam, je zwei Monster gleichzeitig im Feld
  function doubleElite(run, rng, layer) {
    const a = act(run);
    const [id1, id2] = rng.shuffle(a.elites.slice()).slice(0, 2);
    const level = enemyLevel(run, layer) + L.config.eliteLevelBonus;
    const first = trainerSetup(run, rng, id1, level, 'elite');
    const second = trainerSetup(run, rng, id2, level, 'elite');
    const team = [];
    // abwechselnd, damit beide Trainer gleich zu Beginn ein Monster im Feld haben
    for (let i = 0; i < Math.max(first.team.length, second.team.length); i++) {
      if (first.team[i]) team.push(first.team[i]);
      if (second.team[i]) team.push(second.team[i]);
    }
    const affixes = layer >= L.config.eliteAffixFromLayer || L.echo.of(run).eliteAffixAlways ? [L.affixes.random(rng)] : [];
    return Object.assign(first, { team, double: true, partner: id2, trainerName: first.trainerName + ' & ' + second.trainerName, affixes, items: Object.assign({}, first.items, second.items) });
  }

  function rival(run, rng, layer) {
    const a = act(run);
    const t = R().get('trainer', a.rival);
    const level = enemyLevel(run, layer) + L.config.rivalLevelBonus;
    const counter = t.counter[run.starter] || 'plitsch';
    const setup = trainerSetup(run, rng, a.rival, level, 'trainer', { rewardSource: 'elite' });
    setup.team.unshift(makeMon(run, rng, counter, level, { autoEvolve: true }));
    return setup;
  }

  function boss(run, rng) {
    const a = act(run);
    const level = a.levelRange[1] + L.config.bossLevelBonus + L.echo.of(run).enemyLevel + (run.sideAct ? run.sideLevelBonus || 0 : 0);
    const affixes = L.echo.of(run).bossAffix ? [L.affixes.random(rng)] : [];
    const b = a.boss.pool && L.tower ? L.tower.bossFor(run) : a.boss;
    return trainerSetup(run, rng, b.trainer, level, 'boss', { arena: b.arena, affixes });
  }

  // Ereignis-Kämpfe: { team: [{species, levelOffset}], kind, rewardSource, trainerName?, shinyFactor? }
  function fromSpec(run, rng, spec, layer) {
    const base = enemyLevel(run, layer);
    const team = spec.team.map((e) => makeMon(run, rng, e.species, base + (e.levelOffset || 0), {
      autoEvolve: spec.kind !== 'wild',
      mon: { shiny: rng.chance(L.config.shinyChance * shinyFactor(run) * (spec.shinyFactor || 1)) },
    }));
    return legendize({ kind: spec.kind || 'wild', team, trainerName: spec.trainerName || null, trainer: null, weather: variant(run).weather, affixes: [], phases: [], items: {}, rewardSource: spec.rewardSource || 'battle' });
  }

  // Arena-Gegner: Runde 0–2, jede Runde stärker
  const ARENA_NAMES = ['Arena-Neuling', 'Arena-Kämpferin', 'Arena-Champion'];
  function arena(run, rng, layer, round) {
    const pool = variant(run).encounters.filter((e) => !e.condition);
    const team = [0, 1].slice(0, round === 2 ? 2 : 1).map(() => ({ species: rng.weighted(pool).species, levelOffset: round }));
    const setup = fromSpec(run, rng, { team, kind: 'trainer', trainerName: ARENA_NAMES[round], rewardSource: 'elite' }, layer);
    setup.arenaRound = round;
    return setup;
  }

  // Geheimer Endkampf gegen Ardan
  function finale(run, rng) {
    const a = act(run);
    const level = a.levelRange[1] + 2 + L.echo.of(run).enemyLevel;
    return trainerSetup(run, rng, 'ardan', level, 'boss', { arena: 'arena_sola', rewardSource: 'boss' });
  }

  L.encounters = { ghost, arena, finale, legendize, wild, wildSetup, elite, doubleElite, rival, boss, fromSpec, levelAt, enemyLevel, makeMon, shinyFactor, act, variant };
})(globalThis.LUM);
