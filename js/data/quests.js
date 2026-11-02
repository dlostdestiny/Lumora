// Nebenaufträge: Zu Beginn jedes Akts wählst du einen von drei Aufträgen.
// value(run) = laufender Zähler im Lauf; der Fortschritt zählt ab der Annahme (q.base).
// rewards(run, rng) = Liste von Belohnungen wie in js/run/rewards.js, dazu { kind: 'crystals', amount }.
(function (L) {
  const Q = (def) => L.def.quest(def);
  const rare = (run, rng) => {
    const pool = L.relics.available(run).filter((r) => r.rarity === 'rare');
    const any = pool.length ? pool : L.relics.available(run);
    return any.length ? { kind: 'relic', relic: rng.pick(any).id } : { kind: 'gold', amount: 80 };
  };
  const relic = (run, rng) => {
    const pool = L.relics.available(run);
    return pool.length ? { kind: 'relic', relic: rng.pick(pool).id } : { kind: 'gold', amount: 60 };
  };
  const caughtOfType = (type) => (run) => run.stats.caught.filter((s) => L.registry.get('species', s).types.indexOf(type) >= 0).length;

  Q({ id: 'jagdfieber', name: 'Jagdfieber', icon: '⚪', desc: 'Fange 3 Monster.', goal: 3, value: (run) => run.stats.caught.length,
    rewardText: '2 Superkugeln, 40 Gold', rewards: () => [{ kind: 'item', item: 'superkugel', count: 2 }, { kind: 'gold', amount: 40 }] });
  Q({ id: 'schattenfang', name: 'Licht im Schatten', icon: '🌑', desc: 'Fange ein Schatten-Monster.', goal: 1, value: caughtOfType('schatten'),
    rewardText: 'Seltenes Relikt', rewards: (run, rng) => [rare(run, rng)] });
  Q({ id: 'funkenfang', name: 'Funkenfänger', icon: '⚡', desc: 'Fange ein Funke-Monster.', goal: 1, value: caughtOfType('funke'),
    rewardText: 'Relikt, 20 Kristalle', rewards: (run, rng) => [relic(run, rng), { kind: 'crystals', amount: 20 }] });
  Q({ id: 'elitejagd', name: 'Elite-Jagd', icon: '💀', desc: 'Besiege 2 Elite-Trainer.', goal: 2, value: (run) => run.stats.elites || 0,
    rewardText: 'Seltenes Relikt', rewards: (run, rng) => [rare(run, rng)] });
  Q({ id: 'kampfgeist', name: 'Kampfgeist', icon: '⚔️', desc: 'Gewinne 6 Kämpfe.', goal: 6, value: (run) => run.stats.battlesWon,
    rewardText: 'Beleber, 60 Gold', rewards: () => [{ kind: 'item', item: 'beleber', count: 1 }, { kind: 'gold', amount: 60 }] });
  Q({ id: 'makellos', name: 'Makellos', icon: '🛡️', desc: 'Gewinne 3 Kämpfe, ohne dass ein Monster fällt.', goal: 3, value: (run) => run.stats.flawless || 0,
    rewardText: '2 Superheiltränke, 25 Kristalle', rewards: () => [{ kind: 'item', item: 'superheiltrank', count: 2 }, { kind: 'crystals', amount: 25 }] });
  Q({ id: 'neugierde', name: 'Neugierde', icon: '❓', desc: 'Erlebe 3 Ereignisse.', goal: 3, value: (run) => run.stats.events || 0,
    rewardText: 'Relikt', rewards: (run, rng) => [relic(run, rng)] });
  Q({ id: 'goldgraeber', name: 'Goldgräber', icon: '🪙', desc: 'Verdiene 150 Gold in Kämpfen.', goal: 150, value: (run) => run.stats.goldEarned || 0,
    rewardText: 'Seltenes Relikt', rewards: (run, rng) => [rare(run, rng)] });
  Q({ id: 'fluchtraeger', name: 'Fluchträger', icon: '🕯️', desc: 'Gewinne 4 Kämpfe, während ein Fluch auf dir liegt.', goal: 4, value: (run) => run.stats.cursedWins || 0,
    rewardText: '40 Kristalle, Fluch wird gereinigt', rewards: () => [{ kind: 'crystals', amount: 40 }, { kind: 'purge' }] });

  L.quests = {
    OFFER: 3,
    progress(run, q) {
      const def = L.registry.get('quest', q.id);
      return Math.max(0, Math.min(def.goal, def.value(run) - q.base));
    },
    // Neue Auswahl zu Beginn eines Akts (ohne schon angenommene Aufträge)
    offer(run, rng) {
      const taken = (run.quests || []).map((q) => q.id);
      return rng.shuffle(L.registry.all('quest').filter((q) => taken.indexOf(q.id) < 0)).slice(0, L.quests.OFFER).map((q) => q.id);
    },
    accept(run, id) {
      if (!run.questOffer || run.questOffer.indexOf(id) < 0) throw new Error('Auftrag nicht im Angebot');
      run.quests.push({ id, act: run.act, base: L.registry.get('quest', id).value(run), done: false });
      run.questOffer = null;
    },
    decline(run) { run.questOffer = null; },
    // Erledigte Aufträge abschließen und Belohnungen geben. Rückgabe: [{ quest, rewards }]
    check(run) {
      const out = [];
      for (const q of run.quests || []) {
        if (q.done || L.quests.progress(run, q) < L.registry.get('quest', q.id).goal) continue;
        q.done = true;
        const def = L.registry.get('quest', q.id);
        const rewards = def.rewards(run, L.run.rng(run));
        for (const r of rewards) {
          if (r.kind === 'crystals') run.crystals += r.amount;
          else if (r.kind === 'purge') { if ((run.curses || []).length) L.curses.remove(run, run.curses[0]); }
          else L.rewards.apply(run, r);
        }
        out.push({ quest: def, rewards });
      }
      return out;
    },
  };

  L.registry.addValidator('quest', (def) => {
    const errs = [];
    if (!(def.goal > 0)) errs.push('Ziel fehlt');
    if (typeof def.value !== 'function' || typeof def.rewards !== 'function') errs.push('value/rewards fehlt');
    return errs;
  });
})(globalThis.LUM);
