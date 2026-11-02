// Fortschritt zwischen den Läufen: Lexikon, Kristalle, Statistik.
(function (L) {
  const R = () => L.registry;

  function entry(meta, speciesId) {
    return meta.dex[speciesId] || (meta.dex[speciesId] = { seen: false, caught: false, shinySeen: false, shinyCaught: false, traits: [] });
  }

  const progress = {
    // Zähler für Erfolge erhöhen (meta.stats.<key>)
    track(meta, key, n) {
      if (!meta) return;
      meta.stats = meta.stats || {};
      meta.stats[key] = (meta.stats[key] || 0) + (n === undefined ? 1 : n);
    },
    seen(meta, mon) {
      const e = entry(meta, mon.species);
      e.seen = true;
      if (mon.shiny && !e.shinySeen) progress.track(meta, 'shinySeen');
      if (mon.shiny) e.shinySeen = true;
      if (mon.trait && e.traits.indexOf(mon.trait) < 0) e.traits.push(mon.trait);
      if (mon.hiddenAbility) e.hiddenSeen = true;
    },
    caught(meta, mon) {
      const e = entry(meta, mon.species);
      const firstCatch = !e.caught;
      const firstShiny = !!mon.shiny && !e.shinyCaught;
      progress.seen(meta, mon);
      e.caught = true;
      if (mon.shiny) e.shinyCaught = true;
      return { firstCatch, firstShiny };
    },
    // Alle Arten fürs Lexikon. counts = zählt für den Fortschritt (Einzigartige erst, wenn gesehen).
    dexList(meta) {
      return R().all('species').filter((s) => s.rarity !== 'boss').map((s, i) => {
        const e = meta.dex[s.id] || null;
        const unique = s.rarity === 'unique';
        return { no: i + 1, species: s, entry: e, unique, secret: unique && !(e && e.seen), counts: !unique || !!(e && e.seen) };
      });
    },
    dexCompletion(meta) {
      const list = progress.dexList(meta).filter((x) => x.counts);
      if (!list.length) return 0;
      return list.filter((x) => x.entry && x.entry.caught).length / list.length;
    },
    // Lauf beenden: Kristalle gutschreiben, Statistik pflegen.
    finishRun(meta, run) {
      if (run.result) return run.result;
      const acts = L.run.acts().length;
      const reached = Math.min(acts, run.actIndex + 1);
      let unlocked = null;
      let dailyBonus = L.daily ? L.daily.record(meta, run) : 0;
      if (run.mode === 'turm' && L.tower) { const f = L.tower.floors(run); meta.stats.towerBest = Math.max(meta.stats.towerBest || 0, f); dailyBonus += f * 2; run.towerFloors = f; }
      if (L.fragments) L.fragments.merge(meta, run);
      const mastery = L.mastery ? L.mastery.award(meta, run) : {};
      const eggResult = L.eggs ? L.eggs.afterRun(meta, run) : null;
      if (L.companions) { L.companions.consume(meta, run); if (!run.daily) meta.echoCompanion = L.companions.snapshot(run); }
      if (eggResult && eggResult.converted) { meta.crystals += eggResult.converted * 10; meta.totalCrystals += eggResult.converted * 10; }
      if (run.flags && run.flags.trueEnd) { meta.flags.trueEnd = true; progress.track(meta, 'trueEnds'); }
      if (run.flags && run.flags.jenseits) { meta.flags.jenseits = true; progress.track(meta, 'jenseitsWins'); }
      const crystals = Math.round((run.crystals + 5 * reached) * L.echo.of(run).crystalMult * (L.modes ? L.modes.crystalMult(run) : 1)) + dailyBonus;
      if (run.finished === 'victory' && run.mode) progress.track(meta, 'modeWin_' + run.mode);
      if (run.finished === 'victory' && run.path) progress.track(meta, 'pathWin_' + run.path);
      progress.track(meta, 'ghostsBeaten', run.stats.ghosts || 0);
      if ((run.finished === 'victory' || (run.mode === 'turm' && (run.towerFloors || 0) >= 16)) && !run.daily) {
        meta.ghosts = (meta.ghosts || []).concat([{ name: L.player ? L.player.name(meta) : 'Bannträger', at: run.stats.startedAt || 0,
          team: run.team.filter((m) => !m.echo).slice(0, 4).map((m) => ({ species: m.species, moves: m.moves.map((x) => ({ id: x.id, upgrade: x.upgrade || null })), nature: m.nature, trait: m.trait, shiny: !!m.shiny, hiddenAbility: !!m.hiddenAbility })) }]).slice(-6);
      }
      meta.runs++;
      meta.crystals += crystals;
      meta.totalCrystals += crystals;
      if (run.finished === 'victory') {
        meta.stats.victories++;
        const lvl = run.echo || 0;
        meta.echoBest = Math.max(meta.echoBest, lvl);
        const before = meta.echoUnlocked;
        meta.echoUnlocked = Math.max(meta.echoUnlocked, Math.min(L.echo.max(), lvl + 1));
        if (meta.echoUnlocked > before) unlocked = meta.echoUnlocked;
      }
      meta.stats.bestAct = Math.max(meta.stats.bestAct, reached);
      progress.track(meta, 'quests', (run.quests || []).filter((q) => q.done).length);
      if (L.relicSets && L.relicSets.active(run.relics).length) progress.track(meta, 'sets');
      if (run.finished === 'victory' && (run.curses || []).length >= 2) progress.track(meta, 'cursedVictory');
      // Besiegte Wächter: aus der Liste des Laufs (ältere Spielstände: über die Akt-Flags)
      const bossList = run.stats.bossTrainers || Object.keys(run.flags).filter((k) => k.indexOf('boss_') === 0 && R().has('act', k.slice(5))).map((k) => R().get('act', k.slice(5)).boss.trainer);
      for (const t of bossList) if (meta.bossesDefeated.indexOf(t) < 0) meta.bossesDefeated.push(t);
      // Chronik: die letzten Läufe mit Team und Ausgang
      meta.chronicle = meta.chronicle || [];
      meta.chronicle.unshift(progress.chronicleEntry(run, crystals, reached));
      if (meta.chronicle.length > progress.CHRONICLE_MAX) meta.chronicle.length = progress.CHRONICLE_MAX;
      const rankBefore = L.rank ? L.rank.level(meta) : 1;
      const rankXp = L.rank ? L.rank.runXp(run) : 0;
      meta.rankXp = (meta.rankXp || 0) + rankXp;
      const rankAfter = L.rank ? L.rank.level(meta) : 1;
      run.result = { crystals, reached, unlocked, rankXp, rankBefore, rankAfter, mastery, eggs: eggResult };
      return run.result;
    },
    CHRONICLE_MAX: 30,
    chronicleEntry(run, crystals, reached) {
      return {
        number: run.number, date: run.stats.startedAt || 0, result: run.finished, echo: run.echo || 0, daily: run.daily || null, mode: run.mode || null,
        starter: run.starter, blessing: run.blessing, act: run.act, reached, crystals,
        team: run.team.map((m) => ({ species: m.species, level: m.level, shiny: !!m.shiny })),
        relics: run.relics.slice(), curses: (run.curses || []).slice(), quests: (run.quests || []).filter((q) => q.done).length,
        battlesWon: run.stats.battlesWon, caught: run.stats.caught.length, lostTo: run.stats.lostTo || null,
        layer: run.position && run.map && run.map.nodes[run.position] ? run.map.nodes[run.position].layer : 0, seed: run.seed,
      };
    },
    sceneSeen(meta, id) {
      if (meta.scenesSeen.indexOf(id) < 0) meta.scenesSeen.push(id);
    },
  };

  L.progress = progress;
})(globalThis.LUM);
