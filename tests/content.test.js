describe('content act 1', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12);
  const newRun = (seed, starter) => L.run.create({ seed, starter: starter || 'glimmi', blessing: 'goldbeutel', meta: null, now: day });

  it('registry validate returns []', () => {
    assert.eq(L.registry.validate(), []);
  });
  it('every act1 event option has label and effect', () => {
    const evs = L.registry.all('event');
    assert.ok(evs.length >= 8);
    for (const e of evs) {
      assert.ok(e.title && e.text, e.id);
      for (const o of e.options) assert.ok(o.label && typeof o.effect === 'function', e.id);
    }
  });
  it('intro_first on run 1, intro_echo on run 2', () => {
    const meta = { scenesSeen: [], flags: {}, bossesDefeated: [], fragments: [] };
    assert.eq(L.story.next({ number: 1 }, meta, 'runStart'), 'intro_first');
    assert.eq(L.story.next({ number: 2 }, meta, 'runStart'), 'intro_echo');
  });
  it('once scenes are not repeated', () => {
    const meta = { scenesSeen: ['kael_first'], flags: {}, bossesDefeated: [], fragments: [] };
    assert.eq(L.story.next({ number: 2, act: 'act1' }, meta, 'rival'), 'kael_again');
    assert.eq(L.story.next({ number: 2, act: 'act2' }, meta, 'rival'), 'kael_act2_first');
  });
  it('variants both reachable via seeds', () => {
    const seen = {};
    for (let s = 0; s < 30; s++) seen[newRun('v' + s).variant] = true;
    assert.eq(Object.keys(seen).sort(), ['fluesterwald', 'moorlichtung']);
  });
  it('kael counter-picks starter type', () => {
    const pairs = { glimmi: 'plitsch', plitsch: 'knospi', knospi: 'glimmi' };
    for (const st of Object.keys(pairs)) {
      const run = newRun('k', st);
      const setup = L.encounters.rival(run, L.rng.create(1), 6);
      const first = setup.team[0].species;
      assert.ok(first === pairs[st] || first === L.registry.get('species', pairs[st]).evolves[0].to, st + ' → ' + first);
    }
  });
  it('fenna phase triggers at 50%', () => {
    const run = newRun('f');
    const setup = L.encounters.boss(run, L.rng.create(1));
    const b = L.battle.create({ player: { team: [TH.mon('glutaro', 30, { moves: ['kratzer'] })], items: {}, relics: [] }, enemy: { team: setup.team, kind: 'boss', phases: setup.phases, trainer: 'fenna' }, rng: L.rng.create(1), enemyPolicy: () => ({ type: 'move', index: 0 }) });
    L.battle.start(b);
    const qi = setup.team.findIndex((m) => m.species === 'dornkoenigin');
    b.sides[1].active = qi;
    const q = setup.team[qi];
    q.hp = Math.floor(L.mon.maxHp(q) * 0.5) + 2;
    let phase = false;
    for (let i = 0; i < 5 && !phase && b.state === 'choose'; i++) phase = L.battle.step(b, { type: 'move', index: 0 }).some((e) => e.t === 'phase');
    assert.ok(phase);
    assert.ok(q.moves.some((m) => m.id === 'dornenwirbel'));
  });
  it('event can run every option without error', () => {
    for (const e of L.registry.all('event')) {
      e.options.forEach((o, i) => {
        const run = newRun('e' + e.id + i);
        run.gold = 500;
        run.curses = ['ruhelos'];
        run.relics = ['gluecksklee'];
        run.team.push(TH.mon('moosling', 5));
        const ev = Object.values(run.map.nodes).find((n) => n.layer === 3);
        ev.kind = 'event';
        const parent = Object.values(run.map.nodes).find((n) => n.links.indexOf(ev.id) >= 0);
        run.position = parent.id;
        L.run.enter(run, ev.id, day);
        run.pending.event = e.id;
        const res = L.nodes.event(run, e.id, i, day);
        assert.ok(Array.isArray(res.texts) && res.texts.length > 0, e.id + '/' + i);
      });
    }
  });
});
