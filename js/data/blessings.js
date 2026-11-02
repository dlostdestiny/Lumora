// Segen: einer von drei wird zu Beginn eines Laufs gewählt. apply(run, rng) verändert den neuen Lauf.
(function (L) {
  const B = (def) => L.def.blessing(Object.assign({ hooks: {} }, def));
  const addItem = (run, id, n) => { run.items[id] = (run.items[id] || 0) + n; };

  B({ id: 'kugelregen', name: 'Kugelregen', icon: '⚪', desc: '+3 Fangkugeln.', apply: (run) => addItem(run, 'fangkugel', 3) });
  B({ id: 'fruehstart', name: 'Frühstart', icon: '⏩', desc: 'Dein Starter beginnt 3 Level höher.', starterLevelBonus: 3 });
  B({ id: 'weitblick', name: 'Weitblick', icon: '🔭', desc: 'Nach Kämpfen 4 statt 3 Belohnungen zur Auswahl.', rewardChoices: 4 });
  B({ id: 'goldbeutel', name: 'Goldbeutel', icon: '💰', desc: '+100 Gold.', apply: (run) => { run.gold += 100; } });
  B({ id: 'kraeuterkorb', name: 'Kräuterkorb', icon: '🧺', desc: '+3 Heiltränke.', apply: (run) => addItem(run, 'heiltrank', 3) });
  B({
    id: 'altes_erbe', name: 'Altes Erbe', icon: '🏺', desc: 'Du beginnst mit einem zufälligen seltenen Relikt.',
    apply: (run, rng) => {
      const pool = L.relics.available(run).filter((r) => r.rarity === 'rare');
      if (pool.length) run.relics.push(rng.pick(pool).id);
    },
  });
  B({ id: 'seelenband', name: 'Seelenband', icon: '💞', desc: 'Dein Starter beginnt mit Bindung 50.', apply: (run) => { run.team[0].bond = 50; } });
  B({ id: 'schimmerglanz', name: 'Schimmerglanz', icon: '🌟', desc: 'Schimmer-Monster erscheinen dreimal so oft.', shinyFactor: 3 });

  // Erst im Kristall-Shop freizuschalten (unlock = id im Shop)
  B({ id: 'zweiter_gefaehrte', unlock: 'segen_zweiter_gefaehrte', name: 'Zweiter Gefährte', icon: '🐾', desc: 'Ein zufälliges Monster (Lv 4) begleitet dich von Anfang an.',
    apply: (run, rng) => {
      const v = L.registry.get('act', L.run.acts()[0].id).variants[0];
      const e = rng.weighted(v.encounters.filter((x) => !x.condition && L.registry.get('species', x.species).rarity === 'common'));
      run.team.push(L.mon.create({ species: e.species, level: 4, rng }));
    } });
  B({ id: 'reliktfund', unlock: 'segen_reliktfund', name: 'Reliktfund', icon: '🎁', desc: 'Du beginnst mit zwei gewöhnlichen Relikten.',
    apply: (run, rng) => {
      for (let i = 0; i < 2; i++) {
        const pool = L.relics.available(run).filter((r) => r.rarity === 'common');
        if (pool.length) run.relics.push(rng.pick(pool).id);
      }
    } });
  B({ id: 'fluchbrecher', unlock: 'segen_fluchbrecher', name: 'Fluchbrecher', icon: '🔆', desc: 'Flüche können dir nichts anhaben.', curseImmune: true });

  L.registry.addValidator('blessing', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
