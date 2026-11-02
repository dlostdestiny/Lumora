// Kartenerzeugung: verzweigte Wege von unten nach oben bis zum Boss (Spezifikation 5).
(function (L) {
  const COLS = 5;
  const PATHS = 4;
  const id = (layer, col) => 'L' + layer + 'C' + col;

  function crosses(edges, layer, a, b) {
    return edges.some((e) => e[0] === layer && ((a < e[1] && b > e[2]) || (a > e[1] && b < e[2])));
  }

  function generate(act, variant, rng) {
    const layers = act.map.layers;
    const bossLayer = layers - 1;
    const springLayer = layers - 2;
    const nodes = {};
    const edges = [];
    const ensure = (layer, col) => nodes[id(layer, col)] || (nodes[id(layer, col)] = { id: id(layer, col), layer, col, kind: null, links: [], data: {} });

    // 1. Pfade laufen
    const starts = [];
    for (let p = 0; p < PATHS; p++) {
      let col = rng.int(0, COLS - 1);
      if (p === 1) while (col === starts[0]) col = rng.int(0, COLS - 1);
      starts.push(col);
      ensure(0, col);
      for (let layer = 0; layer < springLayer; layer++) {
        let next = Math.max(0, Math.min(COLS - 1, col + rng.int(-1, 1)));
        if (crosses(edges, layer, col, next)) next = col;
        const from = ensure(layer, col), to = ensure(layer + 1, next);
        if (from.links.indexOf(to.id) < 0) {
          from.links.push(to.id);
          edges.push([layer, col, next]);
        }
        col = next;
      }
    }
    const boss = { id: 'BOSS', layer: bossLayer, col: 2, kind: 'boss', links: [], data: {} };
    nodes[boss.id] = boss;
    for (const n of Object.values(nodes)) if (n.layer === springLayer) n.links.push(boss.id);

    const all = Object.values(nodes).sort((a, b) => a.layer - b.layer || a.col - b.col);
    const parents = {};
    for (const n of all) for (const t of n.links) (parents[t] || (parents[t] = [])).push(n.id);
    const neighbors = (n) => (parents[n.id] || []).concat(n.links).map((x) => nodes[x]);

    // 2. Arten verteilen
    const weights = (variant && variant.nodeWeights) || act.map.nodeWeights;
    for (const n of all) {
      if (n.kind === 'boss') continue;
      if (n.layer === 0) { n.kind = 'battle'; continue; }
      if (n.layer === springLayer) { n.kind = 'spring'; continue; }
      const options = Object.keys(weights).filter((k) => {
        if (k === 'elite' && n.layer < 4) return false;
        if ((k === 'spring' || k === 'shop') && n.layer < 3) return false;
        if ((k === 'spring' || k === 'shop') && (parents[n.id] || []).some((p) => nodes[p].kind === k)) return false;
        if ((k === 'spring' || k === 'shop') && n.layer === springLayer - 1 && k === 'spring') return false;
        return true;
      }).map((k) => ({ k, weight: weights[k] }));
      n.kind = rng.weighted(options).k;
    }

    // 3. Mindestanzahl Shops und Ereignisse
    const convert = (kind, minLayer, count) => {
      let have = all.filter((n) => n.kind === kind).length;
      const cands = rng.shuffle(all.filter((n) => n.kind === 'battle' && n.layer >= minLayer && n.layer < springLayer));
      for (const n of cands) {
        if (have >= count) break;
        if ((kind === 'shop' || kind === 'spring') && neighbors(n).some((x) => x.kind === kind && x.layer < springLayer)) continue;
        n.kind = kind;
        have++;
      }
    };
    convert('shop', 3, 1);
    convert('event', 1, 2);
    // Arena: drei Kämpfe hintereinander ohne Heilung, große Belohnung
    if (rng.chance(L.config.arenaChance)) {
      const cands = all.filter((n) => n.kind === 'battle' && n.layer >= 5 && n.layer < springLayer - 1);
      if (cands.length) rng.pick(cands).kind = 'arena';
    }

    // 4. Rivale und versteckter Pfad
    if (act.rival) {
      const cands = all.filter((n) => n.layer >= 5 && n.layer <= 8 && (n.kind === 'battle' || n.kind === 'elite'));
      const pool = cands.length ? cands : all.filter((n) => n.layer >= 5 && n.layer <= 8);
      rng.pick(pool).kind = 'rival';
    }
    if (rng.chance(act.map.hiddenChance || 0)) {
      const events = all.filter((n) => n.kind === 'event').length;
      const cands = all.filter((n) => n.layer >= 3 && n.layer < springLayer && (n.kind === 'battle' || (n.kind === 'event' && events > 2)));
      if (cands.length) rng.pick(cands).kind = 'hidden';
    }

    // 5. Selten: ein Elite-Knoten wird zum Doppelkampf zweier Trainer (2 gegen 2)
    if ((act.elites || []).length >= 2) {
      const cands = all.filter((n) => n.kind === 'elite');
      if (cands.length && rng.chance(L.config.doubleEliteChance)) rng.pick(cands).data.double = true;
    }

    return { layers, nodes, start: all.filter((n) => n.layer === 0).map((n) => n.id), boss: boss.id };
  }

  function reachable(map, from) {
    const seen = new Set([from]);
    const stack = [from];
    while (stack.length) {
      const n = map.nodes[stack.pop()];
      for (const t of n.links) if (!seen.has(t)) { seen.add(t); stack.push(t); }
    }
    return seen;
  }

  L.mapgen = { generate, reachable, COLS };
})(globalThis.LUM);
