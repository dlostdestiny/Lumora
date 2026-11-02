// Monster-Instanzen: Erzeugen, EP, Lernen, Entwickeln. Reines JSON, damit Speichern einfach bleibt.
(function (L) {
  const TRAIT_WEIGHTS = { common: 10, rare: 3, veryRare: 1 };

  function rollTrait(rng, factor) {
    if (!rng.chance(Math.min(1, L.config.traitChance * (factor || 1)))) return null;
    const t = rng.weighted(L.registry.all('trait'), (x) => TRAIT_WEIGHTS[x.rarity]);
    return t ? t.id : null;
  }

  function defaultMoves(species, level) {
    const ids = [];
    for (const e of species.learnset) {
      if (e.level > level) continue;
      const i = ids.indexOf(e.move);
      if (i >= 0) ids.splice(i, 1);
      ids.push(e.move);
    }
    return ids.slice(-4).map((id) => ({ id, upgrade: null }));
  }

  const mon = {
    create(opts) {
      const rng = opts.rng;
      const species = L.registry.get('species', opts.species);
      const natures = L.registry.all('nature').filter((n) => !n.test);
      const m = {
        uid: 'm' + rng.int(100000, 999999) + rng.int(100, 999),
        species: species.id,
        level: opts.level,
        exp: mon.expForLevel(opts.level),
        nature: opts.nature || rng.pick(natures).id,
        trait: opts.trait !== undefined ? opts.trait : rollTrait(rng, opts.traitFactor),
        shiny: !!opts.shiny,
        hp: 0,
        moves: opts.moves ? opts.moves.map((x) => (typeof x === 'string' ? { id: x, upgrade: null } : x)) : defaultMoves(species, opts.level),
        status: null,
        statusTurns: 0,
        bond: 0,
        held: null,
      };
      if (opts.hiddenChance && species.hiddenAbility && rng.chance(opts.hiddenChance)) m.hiddenAbility = true;
      if (opts.hiddenAbility) m.hiddenAbility = true;
      if (m.trait === 'uralt' && species.ancientMove && !m.moves.some((x) => x.id === species.ancientMove)) {
        if (m.moves.length >= 4) m.moves.shift();
        m.moves.push({ id: species.ancientMove, upgrade: null });
      }
      m.hp = mon.stats(m).hp;
      return m;
    },
    species(m) { return L.registry.get('species', m.species); },
    stats(m) { return L.stats.calc(L.registry.get('species', m.species), m.level, m.nature, m.trait); },
    maxHp(m) { return mon.stats(m).hp; },
    expForLevel(level) { return Math.floor(0.8 * Math.pow(level, 3)); },
    isFainted(m) { return m.hp <= 0; },
    heal(m, fraction) {
      const max = mon.maxHp(m);
      m.hp = Math.min(max, m.hp + Math.floor(max * fraction));
    },
    learn(m, moveId, replaceIndex) {
      const entry = { id: moveId, upgrade: null };
      if (replaceIndex === null || replaceIndex === undefined) {
        if (m.moves.length >= 4) throw new Error('Monster kennt schon 4 Attacken');
        m.moves.push(entry);
      } else {
        m.moves[replaceIndex] = entry;
      }
    },
    // Entwickelt das Monster. Gibt Angebote für Attacken der neuen Art zurück, die es bis zum aktuellen Level verpasst hat.
    evolve(m, toId) {
      const from = mon.species(m);
      const evo = (from.evolves || []).find((e) => e.to === toId);
      const ratio = m.hp / mon.maxHp(m);
      m.species = toId;
      m.hp = Math.max(m.hp > 0 ? 1 : 0, Math.round(mon.maxHp(m) * ratio));
      const offers = [];
      const minLevel = evo ? evo.level : m.level;
      for (const e of mon.species(m).learnset) {
        if (e.level < minLevel || e.level > m.level || m.moves.some((x) => x.id === e.move)) continue;
        if (from.learnset.some((x) => x.move === e.move && x.level <= m.level)) continue;
        if (m.moves.length < 4) { mon.learn(m, e.move, null); offers.push({ kind: 'learned', mon: m.uid, move: e.move }); }
        else offers.push({ kind: 'learn', mon: m.uid, move: e.move });
      }
      return offers;
    },
    // Gibt Angebote zurück: gelernte Attacken, Lern-Angebote (bei 4 Attacken) und Entwicklungen.
    gainExp(m, amount) {
      const offers = [];
      if (m.level >= L.config.maxLevel) return offers;
      m.exp += Math.max(0, Math.floor(amount));
      while (m.level < L.config.maxLevel && m.exp >= mon.expForLevel(m.level + 1)) {
        const before = mon.maxHp(m);
        m.level++;
        const after = mon.maxHp(m);
        if (m.hp > 0) m.hp = Math.min(after, m.hp + (after - before));
        offers.push({ kind: 'levelUp', mon: m.uid, level: m.level });
        const sp = mon.species(m);
        for (const e of sp.learnset) {
          if (e.level !== m.level || m.moves.some((x) => x.id === e.move)) continue;
          if (m.moves.length < 4) {
            mon.learn(m, e.move, null);
            offers.push({ kind: 'learned', mon: m.uid, move: e.move });
          } else {
            offers.push({ kind: 'learn', mon: m.uid, move: e.move });
          }
        }
      }
      if (offers.some((o) => o.kind === 'levelUp')) {
        for (const ev of mon.species(m).evolves || []) {
          if (m.level >= ev.level) offers.push({ kind: 'evolve', mon: m.uid, to: ev.to });
        }
      }
      if (m.level >= L.config.maxLevel) m.exp = mon.expForLevel(L.config.maxLevel);
      return offers;
    },
    rollTrait,
    // Aktuelle Typen (im Kampf kann eine Fähigkeit sie überschreiben)
    types(m) { return m._types || L.registry.get('species', m.species).types; },
    // Aktuelle Fähigkeit (versteckt, wenn das Monster sie hat und die Art eine besitzt)
    abilityId(m) { const sp = L.registry.get('species', m.species); return m.hiddenAbility && sp.hiddenAbility ? sp.hiddenAbility : sp.ability; },
  };

  L.mon = mon;
})(globalThis.LUM);
