// Tests zu den Befunden der Abschluss-Prüfung von Etappe 1.
describe('review fixes', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 12);

  it('double wipe in one turn counts as lost', () => {
    const p = TH.mon('kieselkrabb', 20, { moves: ['haerten'] });
    const e = TH.mon('kieselkrabb', 20, { moves: ['haerten'] });
    p.hp = 1; e.hp = 1; p.status = 'gift'; e.status = 'gift';
    const b = TH.battle([p], [e]);
    L.battle.step(b, { type: 'move', index: 0 });
    assert.eq(b.state, 'lost');
  });

  it('finishRun is idempotent and records result on the run', () => {
    const meta = L.save.freshMeta();
    const run = L.run.create({ seed: 'fr', starter: 'glimmi', blessing: 'goldbeutel', meta, now: day });
    run.crystals = 3;
    run.finished = 'defeat';
    const a = L.progress.finishRun(meta, run);
    const b = L.progress.finishRun(meta, run);
    assert.eq(a, b);
    assert.eq(meta.runs, 1);
    assert.eq(meta.crystals, 3 + 5);
  });

  it('declined evolution is offered again on the next level-up', () => {
    const m = TH.mon('glimmi', 14);
    const offers = L.mon.gainExp(m, L.mon.expForLevel(15) - m.exp);
    assert.ok(offers.some((o) => o.kind === 'evolve' && o.to === 'glutaro'));
  });

  it('evolution offered once per gainExp even over several levels', () => {
    const m = TH.mon('glimmi', 12);
    const offers = L.mon.gainExp(m, L.mon.expForLevel(17) - m.exp);
    assert.eq(offers.filter((o) => o.kind === 'evolve').length, 1);
  });

  it('evolving teaches moves of the new species up to the current level', () => {
    const m = TH.mon('glimmi', 15, { moves: ['kratzer', 'glutbiss', 'aufheizen'] });
    const offers = L.mon.evolve(m, 'glutaro');
    assert.ok(m.moves.some((x) => x.id === 'nachtbiss') || offers.some((o) => o.move === 'nachtbiss'));
    assert.ok(m.moves.length <= 4);
  });

  it('releasing a monster returns its held item', () => {
    const run = L.run.create({ seed: 'rel', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    run.team[0].held = 'glutfeder';
    run.pending = { release: TH.mon('summsel', 5) };
    L.run.release(run, 0);
    assert.eq(run.team[0].species, 'summsel');
    assert.eq(run.items.glutfeder, 1);
  });

  it('removeFromTeam returns held item', () => {
    const run = L.run.create({ seed: 'rel2', starter: 'glimmi', blessing: 'goldbeutel', meta: null, now: day });
    run.team.push(TH.mon('summsel', 5));
    run.team[1].held = 'funkenring';
    L.run.removeFromTeam(run, 1);
    assert.eq(run.team.length, 1);
    assert.eq(run.items.funkenring, 1);
  });

  it('battle speed setting defaults to 1 and only allows 1, 2, 4', () => {
    const meta = L.save.freshMeta();
    assert.eq(meta.settings.speed, 1);
    assert.eq(L.config.speeds, [1, 2, 4]);
    assert.eq(L.config.nextSpeed(1), 2);
    assert.eq(L.config.nextSpeed(2), 4);
    assert.eq(L.config.nextSpeed(4), 1);
    assert.eq(L.config.nextSpeed(3), 1);
  });

  it('wrong-shaped saves are backed up instead of crashing', () => {
    for (const raw of ['{"version":-1}', '{"version":1,"dex":null}', '[]', '42']) {
      const data = {};
      L.save.setStorage({ getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; } });
      data.lumora_meta = raw;
      const meta = L.save.loadMeta();
      assert.ok(meta.notices.indexOf('save_corrupt') >= 0, raw);
      assert.eq(typeof meta.dex, 'object');
      assert.ok(meta.dex !== null);
    }
  });
});
