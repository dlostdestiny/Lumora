// Monster-Eier: In Läufen finden, im Brutnest des Schreins durch Läufe wärmen, pflegen, schlüpfen lassen.
// Geschlüpfte Monster leben im Hort und können als Begleiter in einen Lauf mitkommen.
// Zucht: Ein Monster mit Bronze-Meisterschaft kann am Laufende in der Pflegestation bleiben und legt ein Ei seiner Art.
(function (L) {
  const R = () => L.registry;

  // Ei-Arten: pool = Akte, aus deren Begegnungen die Art kommt; need = nötige Wärme
  const KINDS = {
    wald: { name: 'Waldei', icon: '🥚', color: '#8fd16a', spot: '#f9a8d4', need: 45, acts: ['act1'], moves: ['saugwurzel', 'windstoss', 'eisenkralle', 'frosthauch', 'wirbeltanz'] },
    glut: { name: 'Glutei', icon: '🥚', color: '#ff8a3d', spot: '#3b1f12', need: 60, acts: ['act2'], moves: ['erdstoss', 'kristallsplitter', 'schattenfunke', 'geysir', 'stahlschlag'] },
    sturm: { name: 'Sturmei', icon: '🥚', color: '#7dd3fc', spot: '#facc15', need: 75, acts: ['act3'], moves: ['boe', 'eissplitter', 'mondsichel', 'sturmklaue', 'rueckenwind'] },
    tiefe: { name: 'Tiefseeei', icon: '🥚', color: '#22d3ee', spot: '#1e3a8a', need: 60, acts: ['tiefe'], moves: ['geysir', 'wolkenbruch', 'nachtbiss', 'schockwelle'] },
    raetsel: { name: 'Rätselei', icon: '🥚', color: '#c084fc', spot: '#fde68a', need: 70, acts: ['act1', 'act2', 'act3', 'tiefe'], moves: ['wirbeltanz', 'eiskaefig', 'magnetfeld', 'schreckblick', 'quellwasser'] },
    schimmer: { name: 'Schimmerei', icon: '🥚', color: '#fde68a', spot: '#ffffff', need: 110, acts: ['act1', 'act2', 'act3'], shiny: true, moves: ['konzentration', 'aufheizen', 'eispanzer', 'rueckenwind'] },
    zucht: { name: 'Zuchtei', icon: '🥚', color: '#f5d0fe', spot: '#a78bfa', need: 55, acts: [], moves: [] },
  };
  // Pflege: eine pro Ei, jederzeit änderbar bis zum Schlüpfen
  const CARE = {
    waermen: { name: 'Wärmen', icon: '🔥', desc: 'Bekommt 50 % mehr Wärme und schlüpft schneller.' },
    singen: { name: 'Vorsingen', icon: '🎵', desc: 'Schlüpft mit Bindung 40 und wird oft „sanft“.' },
    kristall: { name: 'Kristall', icon: '💎', desc: '50 % Chance auf die versteckte Fähigkeit.' },
    mondlicht: { name: 'Mondlicht', icon: '🌙', desc: 'Schimmer-Chance ×10.' },
  };

  // Grundformen (Arten, die nicht aus einer Entwicklung entstehen), ohne Einzigartige und Bosse
  function baseForms() {
    const targets = new Set();
    for (const s of R().all('species')) for (const e of s.evolves || []) targets.add(e.to);
    return R().all('species').filter((s) => !targets.has(s.id) && ['common', 'rare', 'veryRare'].indexOf(s.rarity) >= 0);
  }
  // Grundform einer Art (rückwärts durch die Entwicklungen)
  function baseOf(sp) {
    for (let i = 0; i < 4; i++) {
      const pre = R().all('species').find((s) => (s.evolves || []).some((e) => e.to === sp));
      if (!pre) break;
      sp = pre.id;
    }
    return sp;
  }
  function poolFor(kind) {
    const k = KINDS[kind];
    const inActs = new Set();
    for (const id of k.acts) {
      if (!R().has('act', id)) continue;
      for (const v of R().get('act', id).variants) for (const e of v.encounters) inActs.add(baseOf(e.species));
    }
    const bases = baseForms().filter((s) => inActs.has(s.id));
    // Rätselei: auch seltene Arten häufiger
    return bases.map((s) => ({ species: s.id, weight: kind === 'raetsel' ? (s.rarity === 'common' ? 2 : 4) : (s.rarity === 'common' ? 6 : s.rarity === 'rare' ? 2 : 1) }));
  }

  const eggs = {
    KINDS, CARE,
    baseOf, poolFor,
    // Neues Ei (noch ohne Art – die entscheidet sich erst beim Schlüpfen, außer bei Zucht)
    create(kind, rng, extra) {
      return Object.assign({ id: 'e' + rng.int(100000, 999999), kind, warmth: 0, need: KINDS[kind].need, care: null }, extra || {});
    },
    // Ein Ei in einem Lauf finden. Art je nach Akt (selten Rätsel- oder Schimmerei).
    roll(run, rng) {
      let kind = run.act === 'act2' ? 'glut' : run.act === 'act3' ? 'sturm' : run.act === 'tiefe' ? 'tiefe' : 'wald';
      if (rng.chance(0.15)) kind = 'raetsel';
      if (rng.chance(0.04)) kind = 'schimmer';
      return eggs.create(kind, rng);
    },
    // Zucht: Ei mit fester Art und Erbe vom Elternteil
    fromParent(parent, rng) {
      const moves = parent.moves.map((m) => m.id).filter((id) => R().has('move', id) && !R().get('move', id).signature);
      return eggs.create('zucht', rng, {
        species: baseOf(parent.species), parentName: R().get('species', parent.species).name,
        eggMove: moves.length ? rng.pick(moves) : null, nature: rng.chance(0.5) ? parent.nature : null, parentShiny: !!parent.shiny,
      });
    },
    canBreed(meta, mon) { return L.mastery && L.mastery.of(meta, mon.species) >= 1 && R().get('species', mon.species).rarity !== 'unique' && R().get('species', mon.species).rarity !== 'boss'; },
    slots(meta) { return 1 + ['nest_2', 'nest_3', 'nest_4'].filter((id) => L.unlocks && L.unlocks.owned(meta, id)).length; },
    hortSize(meta) { return L.unlocks && L.unlocks.owned(meta, 'hort_gross') ? 12 : 8; },
    // Wärme für die Eier im Nest nach einem Lauf: je weiter, desto mehr
    warmthFor(run) {
      const layer = run.position && run.map && run.map.nodes[run.position] ? run.map.nodes[run.position].layer + 1 : 0;
      return 10 + run.actIndex * 13 * 2 + layer * 2 + (run.finished === 'victory' ? 30 : 0);
    },
    // Laufende: gefundene Eier ins Nest (Überzählige werden zu Kristallen), dann alle wärmen
    afterRun(meta, run) {
      meta.eggs = meta.eggs || [];
      let converted = 0;
      for (const e of run.eggs || []) {
        eggs.uniqueId(meta, e);
        if (meta.eggs.length < eggs.slots(meta)) meta.eggs.push(e);
        else converted++;
      }
      const base = eggs.warmthFor(run);
      const garden = L.unlocks && L.unlocks.owned(meta, 'garten') ? 1.25 : 1;
      for (const e of meta.eggs) e.warmth = Math.min(e.need, e.warmth + Math.round(base * garden * (e.care === 'waermen' ? 1.5 : 1)));
      return { added: (run.eggs || []).length - converted, converted, warmth: base };
    },
    // Gleiche ids (z. B. bei gleichem Seed) eindeutig machen
    uniqueId(meta, egg) {
      let n = 1;
      const base = egg.id;
      while ((meta.eggs || []).some((x) => x !== egg && x.id === egg.id)) egg.id = base + '-' + (n++);
      return egg;
    },
    ready(egg) { return egg.warmth >= egg.need; },
    // Schlüpfen: erzeugt einen Hort-Eintrag (kein Lauf-Monster)
    hatch(meta, eggId, rng) {
      const i = (meta.eggs || []).findIndex((e) => e.id === eggId);
      if (i < 0) throw new Error('Ei nicht gefunden');
      const egg = meta.eggs[i];
      if (!eggs.ready(egg)) throw new Error('Das Ei ist noch nicht warm genug');
      meta.hort = meta.hort || [];
      if (meta.hort.length >= eggs.hortSize(meta)) throw new Error('Der Hort ist voll');
      const k = KINDS[egg.kind];
      const species = egg.species || rng.weighted(poolFor(egg.kind)).species;
      const sp = R().get('species', species);
      let shinyChance = L.config.shinyChance * (egg.care === 'mondlicht' ? 10 : 1) * (egg.parentShiny ? 3 : 1);
      const natures = R().all('nature').filter((n) => !n.test);
      const learnset = new Set(sp.learnset.map((x) => x.move));
      const movePool = (k.moves.length ? k.moves : KINDS.raetsel.moves).filter((m) => R().has('move', m) && !learnset.has(m));
      const baby = {
        uid: 'h' + rng.int(100000, 999999),
        species,
        nature: egg.nature || rng.pick(natures).id,
        trait: egg.care === 'singen' && rng.chance(0.6) ? 'sanft' : L.mon.rollTrait(rng, 1.5),
        shiny: !!k.shiny || rng.chance(shinyChance),
        hiddenAbility: !!sp.hiddenAbility && rng.chance(egg.care === 'kristall' ? 0.5 : 0.1),
        eggMove: egg.eggMove || (movePool.length ? rng.pick(movePool) : null),
        bond: egg.care === 'singen' ? 40 : 15,
        from: egg.kind, hatchedAt: Date.now(),
      };
      meta.eggs.splice(i, 1);
      meta.hort.push(baby);
      meta.stats.hatched = (meta.stats.hatched || 0) + 1;
      if (baby.shiny) meta.stats.shinyHatched = (meta.stats.shinyHatched || 0) + 1;
      if (L.progress) L.progress.seen(meta, { species, shiny: baby.shiny, trait: baby.trait, hiddenAbility: baby.hiddenAbility });
      if (meta.dex[species]) { meta.dex[species].caught = true; if (baby.shiny) meta.dex[species].shinyCaught = true; }
      return baby;
    },
    release(meta, uid) {
      const i = (meta.hort || []).findIndex((h) => h.uid === uid);
      if (i < 0) return 0;
      meta.hort.splice(i, 1);
      meta.crystals += 15;
      meta.totalCrystals += 15;
      return 15;
    },
    // Hort-Eintrag als Lauf-Monster erzeugen (Begleiter)
    toMon(h, level, rng) {
      const m = L.mon.create({ species: h.species, level, rng, nature: h.nature, trait: h.trait, shiny: h.shiny, hiddenAbility: h.hiddenAbility });
      if (h.eggMove && !m.moves.some((x) => x.id === h.eggMove)) {
        if (m.moves.length >= 4) m.moves.shift();
        m.moves.push({ id: h.eggMove, upgrade: null });
      }
      m.bond = h.bond || 0;
      m.hatchling = h.uid;
      return m;
    },
  };
  L.eggs = eggs;
  // Bibliothek im Schrein: +5 % Erfahrung (der Lauf merkt sich die Freischaltung)
  L.hooks.sources.push((side) => (side.talents && side.unlocks && side.unlocks.indexOf('bibliothek') >= 0 ? [{ source: 'shrine', hooks: { modifyExp: (v) => v * 1.05 } }] : []));

  // Ereignis: Verlassenes Nest
  L.def.event({ id: 'verlassenes_nest', title: 'Ein verlassenes Nest', icon: '🪺',
    text: 'Unter einem Busch liegt ein Nest. Darin ein einzelnes Ei, noch ganz warm. Weit und breit keine Eltern zu sehen.',
    options: [
      { label: 'Mitnehmen', preview: 'Ein Ei für dein Brutnest im Schrein.', effect: (api) => { const e = api.egg(); api.text('Du wickelst das ' + KINDS[e.kind].name + ' vorsichtig in deinen Schal. Es fühlt sich lebendig an.'); } },
      { label: 'Warm halten und warten', preview: 'Team heilt 20 %, vielleicht kommen die Eltern.', effect: (api) => { api.heal(0.2); if (api.rng.chance(0.4)) { api.text('Die Eltern kommen zurück und lassen dich zum Dank etwas Gold finden.'); api.gold(30); } else api.text('Niemand kommt. Du lässt das Nest, wie es ist.'); } },
      { label: 'Weitergehen', effect: (api) => api.text('Das Nest bleibt zurück.') },
    ] });
})(globalThis.LUM);
