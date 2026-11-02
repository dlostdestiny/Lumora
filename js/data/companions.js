// Begleiter: Ein zusätzliches Monster am Laufstart. Entweder ein Schlüpfling aus dem Hort
// oder der Echo-Begleiter (das stärkste Monster des letzten Laufs, schwächer, aber mit seinen alten Attacken).
(function (L) {
  const R = () => L.registry;
  L.companions = {
    // Schnappschuss des stärksten Monsters am Laufende (ohne Stellio und Bosse)
    snapshot(run) {
      const pool = run.team.filter((m) => !m.echo && m.species !== 'stellio' && R().get('species', m.species).rarity !== 'boss');
      if (!pool.length) return null;
      const m = pool.slice().sort((a, b) => b.level - a.level)[0];
      return { species: m.species, level: m.level, moves: m.moves.map((x) => ({ id: x.id, upgrade: x.upgrade || null })), nature: m.nature, trait: m.trait, shiny: !!m.shiny, hiddenAbility: !!m.hiddenAbility };
    },
    echoLevel(meta, echo) {
      const div = L.unlocks && L.unlocks.owned(meta, 'glocke') ? 2 : 3;
      return Math.max(5, Math.min(18, Math.floor(echo.level / div)));
    },
    // Was der neue Lauf mitbekommt: { kind: 'hort'|'echo', mon } oder null
    forRun(meta, rng) {
      const c = meta && meta.companion;
      if (!c) return null;
      if (c.type === 'hort') {
        const h = (meta.hort || []).find((x) => x.uid === c.uid);
        return h ? { kind: 'hort', mon: L.eggs.toMon(h, 5, rng) } : null;
      }
      if (c.type === 'echo' && meta.echoCompanion) {
        const e = meta.echoCompanion;
        const mon = L.mon.create({ species: e.species, level: L.companions.echoLevel(meta, e), rng, nature: e.nature, trait: e.trait, shiny: e.shiny, hiddenAbility: e.hiddenAbility, moves: e.moves });
        mon.echo = true;
        mon.bond = 30;
        return { kind: 'echo', mon };
      }
      return null;
    },
    // Der Echo-Begleiter verblasst nach einem Lauf
    consume(meta, run) {
      if (run.companionKind === 'echo') { meta.echoCompanion = null; meta.companion = null; }
    },
  };
})(globalThis.LUM);
