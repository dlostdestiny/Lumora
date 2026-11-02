describe('monster eggs', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  const fresh = () => L.save.freshMeta();
  const rng = (s) => L.rng.create(s || 'egg');

  it('egg pools contain only base forms of the right act', () => {
    const pool = L.eggs.poolFor('wald').map((x) => x.species);
    assert.ok(pool.indexOf('moosling') >= 0);
    assert.ok(pool.indexOf('glutaro') < 0 && pool.indexOf('wispelin') < 0);
    assert.ok(L.eggs.poolFor('glut').every((x) => x.species !== 'lavarisk'));
  });
  it('eggs found in a run go to the nest and get warmth', () => {
    const m = fresh();
    const run = L.run.create({ seed: 'eg1', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    run.eggs.push(L.eggs.roll(run, rng()), L.eggs.roll(run, rng('b')));
    run.finished = 'defeat';
    const before = m.crystals;
    L.progress.finishRun(m, run);
    assert.eq(m.eggs.length, 1);
    assert.ok(m.eggs[0].warmth > 0);
    assert.ok(m.crystals >= before + 10);
  });
  it('a warm egg hatches into the hort with an egg move, care changes the result', () => {
    const m = fresh();
    m.eggs = [L.eggs.create('wald', rng(), { care: 'singen' })];
    m.eggs[0].warmth = m.eggs[0].need;
    const baby = L.eggs.hatch(m, m.eggs[0].id, rng('h'));
    assert.eq(m.hort.length, 1);
    assert.eq(baby.bond, 40);
    assert.ok(baby.eggMove);
    assert.ok(!L.registry.get('species', baby.species).learnset.some((x) => x.move === baby.eggMove));
    assert.ok(m.dex[baby.species].caught);
  });
  it('cold eggs cannot hatch', () => {
    const m = fresh();
    m.eggs = [L.eggs.create('glut', rng())];
    assert.throws(() => L.eggs.hatch(m, m.eggs[0].id, rng()));
  });
  it('breeding needs bronze mastery and inherits species and a move', () => {
    const m = fresh();
    const parent = TH.mon('glutaro', 20, { moves: ['glutbiss', 'nachtbiss'] });
    assert.ok(!L.eggs.canBreed(m, parent));
    m.mastery = { glutaro: 3 };
    assert.ok(L.eggs.canBreed(m, parent));
    const egg = L.eggs.fromParent(parent, rng());
    assert.eq(egg.species, 'glimmi');
    assert.ok(['glutbiss', 'nachtbiss'].indexOf(egg.eggMove) >= 0);
  });
  it('a hatchling becomes a run monster with its egg move', () => {
    const h = { uid: 'h1', species: 'moosling', nature: null, trait: null, shiny: false, hiddenAbility: true, eggMove: 'frosthauch', bond: 40 };
    const mon = L.eggs.toMon(Object.assign(h, { nature: L.registry.all('nature').find((n) => !n.test).id }), 6, rng());
    assert.ok(mon.moves.some((x) => x.id === 'frosthauch'));
    assert.eq(mon.bond, 40);
    assert.ok(mon.hiddenAbility);
  });
  it('more nest slots with shrine upgrades', () => {
    const m = fresh();
    assert.eq(L.eggs.slots(m), 1);
    m.unlocks = { nest_2: 1, nest_3: 1 };
    assert.eq(L.eggs.slots(m), 3);
  });
});

describe('companions', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('a hatchling companion joins the run at level 5', () => {
    const m = L.save.freshMeta();
    m.hort = [{ uid: 'h9', species: 'moosling', nature: L.registry.all('nature').find((n) => !n.test).id, trait: null, shiny: false, hiddenAbility: false, eggMove: 'frosthauch', bond: 15 }];
    m.companion = { type: 'hort', uid: 'h9' };
    const run = L.run.create({ seed: 'c1', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    assert.eq(run.team.length, 2);
    assert.eq(run.team[1].species, 'moosling');
    assert.ok(run.team[1].moves.some((x) => x.id === 'frosthauch'));
  });
  it('the echo companion comes from the last run, is weaker and fades after one run', () => {
    const m = L.save.freshMeta();
    const r1 = L.run.create({ seed: 'c2', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    r1.team[0].level = 30;
    r1.finished = 'defeat';
    L.progress.finishRun(m, r1);
    assert.eq(m.echoCompanion.species, 'glimmi');
    m.companion = { type: 'echo' };
    const r2 = L.run.create({ seed: 'c3', starter: 'knospi', blessing: 'goldbeutel', meta: m, now: day });
    assert.eq(r2.team[1].level, 10);
    assert.ok(r2.team[1].echo);
    r2.finished = 'defeat';
    L.progress.finishRun(m, r2);
    assert.ok(!m.companion);
    assert.eq(m.echoCompanion.species, 'knospi');
  });
  it('no companion in the daily challenge or solo mode', () => {
    const m = L.save.freshMeta();
    m.echoCompanion = { species: 'glimmi', level: 20, moves: [{ id: 'glutbiss', upgrade: null }], nature: null, trait: null, shiny: false, hiddenAbility: false };
    m.companion = { type: 'echo' };
    assert.eq(L.daily.createRun('2026-11-02', m, day).team.length, 1);
    assert.eq(L.run.create({ seed: 'c4', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day, mode: 'solo' }).team.length, 1);
  });
});

describe('review fixes', () => {
  const L = LUM;
  const day = new Date(2026, 10, 1, 14);
  it('eggs with the same id get unique ids in the nest', () => {
    const m = L.save.freshMeta();
    m.unlocks = { nest_2: 1 };
    m.eggs = [L.eggs.create('wald', L.rng.create('x'))];
    const run = L.run.create({ seed: 'dup', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day });
    run.eggs = [L.eggs.create('wald', L.rng.create('x'))];
    run.finished = 'defeat';
    L.progress.finishRun(m, run);
    assert.eq(m.eggs.length, 2);
    assert.ok(m.eggs[0].id !== m.eggs[1].id);
  });
  it('tower bosses are recorded by their trainer', () => {
    const m = L.save.freshMeta();
    const run = L.run.create({ seed: 'tb', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day, mode: 'turm' });
    run.stats.bossTrainers = ['fenna', 'maris'];
    run.finished = 'defeat';
    L.progress.finishRun(m, run);
    assert.ok(m.bossesDefeated.indexOf('maris') >= 0);
  });
  it('in one-type mode a companion of another type stays home', () => {
    const m = L.save.freshMeta();
    m.hort = [{ uid: 'h1', species: 'tropfling', nature: L.registry.all('nature').find((n) => !n.test).id, trait: null, shiny: false, hiddenAbility: false, eggMove: null, bond: 0 }];
    m.companion = { type: 'hort', uid: 'h1' };
    assert.eq(L.run.create({ seed: 'mt', starter: 'glimmi', blessing: 'goldbeutel', meta: m, now: day, mode: 'monotyp' }).team.length, 1);
  });
  it('lockruf only helps the next catch attempt', () => {
    const b = TH.battle([TH.mon('glimmi', 10)], [TH.mon('moosling', 10)]);
    b.kind = 'wild';
    b.flags.lockruf = true;
    b.sides[0].items.fangkugel = 2;
    L.capture.attempt(b, 'fangkugel');
    assert.ok(!b.flags.lockruf);
  });
});
