describe('hooks: abilities, relics, affixes, resonance', () => {
  const L = LUM;
  const move0 = { type: 'move', index: 0 };
  const calm = (sp, lv, extra) => TH.mon(sp, lv || 10, Object.assign({ moves: ['haerten'] }, extra || {}));
  const dmg = (b, extra) => L.damage.calc(Object.assign({ attacker: L.battle.active(b, 0), defender: L.battle.active(b, 1), battle: b, rng: b.rng, atkSide: 0, defSide: 1, forceRoll: 1, forceCrit: false }, extra));

  it('glutherz boosts below third hp', () => {
    const p = TH.mon('glimmi', 20, { moves: ['glutbiss'] });
    const b = TH.battle([p], [calm('summsel', 20)]);
    const move = L.moves.resolve({ id: 'glutbiss' });
    const full = dmg(b, { move }).amount;
    p.hp = Math.floor(L.mon.maxHp(p) / 4);
    const low = dmg(b, { move }).amount;
    assert.near(low / full, 1.5, 0.1);
  });
  it('panzerschale blocks crit', () => {
    const b = TH.battle([TH.mon('glimmi', 20)], [calm('kieselkrabb', 20)]);
    const stage = L.damage.critStage({ battle: b, attacker: L.battle.active(b, 0), move: L.moves.resolve({ id: 'kratzer' }), atkSide: 0, defSide: 1 });
    assert.ok(stage < -50);
  });
  it('felsenfest survives at full hp', () => {
    const e = calm('brummfels', 5);
    const b = TH.battle([TH.mon('glutaro', 50, { moves: ['flammenwirbel'] })], [e], { seed: 2 });
    b.sides[0].team[0].moves = [{ id: 'urflamme', upgrade: 'b' }];
    L.battle.step(b, move0);
    assert.eq(e.hp, 1);
  });
  it('irrlicht reflects status', () => {
    const p = TH.mon('summsel', 15, { moves: [{ id: 'gifthauch', upgrade: 'a' }] });
    const e = calm('wispelin', 15);
    const b = TH.battle([p], [e]);
    L.battle.step(b, move0);
    assert.eq(e.status, null);
    assert.eq(p.status, 'gift');
  });
  it('dornenkrone hurts contact attackers', () => {
    const p = TH.mon('summsel', 20, { moves: ['rempler'] });
    const b = TH.battle([p], [calm('dornkoenigin', 20)]);
    const ev = L.battle.step(b, move0);
    assert.ok(ev.some((x) => x.t === 'damage' && x.side === 0 && x.reason === 'ability'));
  });
  it('schleimhaut heals each turn', () => {
    const p = calm('tropfling', 20);
    p.hp = 10;
    const b = TH.battle([p], [calm('kieselkrabb')]);
    L.battle.step(b, move0);
    assert.ok(p.hp > 10);
  });
  it('relic lehrbuch adds 25% exp', () => {
    const p = TH.mon('glutaro', 30, { moves: ['flammenwirbel'] });
    const e = TH.mon('summsel', 10);
    e.hp = 1;
    const b = TH.battle([p], [e], { player: { relics: ['lehrbuch'] } });
    L.battle.step(b, move0);
    const full = Math.floor(L.registry.get('species', 'summsel').baseExp * 10 / LUM.config.expDivisor);
    assert.eq(L.battle.rewards(b).exp[p.uid], Math.floor(full * 1.25));
  });
  it('relic schutzamulett halves first hit only', () => {
    const p = calm('kieselkrabb', 20);
    const b = TH.battle([p], [TH.mon('glutaro', 20, { moves: ['kratzer'] })], { player: { relics: ['schutzamulett'] } });
    const move = L.moves.resolve({ id: 'kratzer' });
    const calc = () => L.damage.calc({ attacker: L.battle.active(b, 1), defender: p, move, battle: b, rng: b.rng, atkSide: 1, defSide: 0, forceRoll: 1, forceCrit: false }).amount;
    const first = calc(), second = calc();
    assert.near(first / second, 0.5, 0.1);
  });
  it('affix gespalten adds clone once', () => {
    const e = calm('moosling', 20);
    const b = TH.battle([TH.mon('glutaro', 20, { moves: ['glutbiss'] })], [e], { enemy: { affixes: ['gespalten'] } });
    e.hp = Math.floor(L.mon.maxHp(e) * 0.6);
    for (let i = 0; i < 3 && b.state === 'choose'; i++) L.battle.step(b, move0);
    assert.eq(b.sides[1].team.length, 2);
  });
  it('affix gepanzert raises def on switch in', () => {
    const b = TH.battle([calm('summsel')], [calm('moosling')], { enemy: { affixes: ['gepanzert'] } });
    assert.eq(b.sides[1].stages.def, 1);
  });
  it('resonance duo vs trio exclusive', () => {
    const team = [TH.mon('glimmi', 5), TH.mon('glutaro', 15), TH.mon('lumini', 10)];
    const ids = L.resonance.active(team).map((r) => r.id);
    assert.ok(ids.indexOf('trio_glut') >= 0);
    assert.ok(ids.indexOf('duo_glut') < 0);
    team[2].hp = 0;
    const ids2 = L.resonance.active(team).map((r) => r.id);
    assert.ok(ids2.indexOf('duo_glut') >= 0 && ids2.indexOf('trio_glut') < 0);
  });
  it('harmonie needs 4 distinct types', () => {
    const t3 = [TH.mon('glimmi', 5), TH.mon('plitsch', 5), TH.mon('knospi', 5)];
    assert.ok(!L.resonance.active(t3).some((r) => r.id === 'harmonie'));
    t3.push(TH.mon('summsel', 5));
    assert.ok(L.resonance.active(t3).some((r) => r.id === 'harmonie'));
  });
  it('gewitter makes funke always hit', () => {
    const b = TH.battle([TH.mon('summsel', 20, { moves: ['blitzschlag'] }), TH.mon('plitsch', 10)], [calm('kieselkrabb', 20)]);
    b.sides[1].stages.eva = 3;
    assert.eq(L.battle.hitChance(b, 0, L.moves.resolve({ id: 'blitzschlag' })), 1);
  });
  it('blessings have apply or hooks', () => {
    assert.eq(L.registry.all('blessing').filter((b) => !b.unlock).length, 8);
    assert.eq(L.registry.all('relic').length >= 12, true);
    assert.eq(L.registry.all('affix').filter((a) => !a.hidden).length, 5);
  });
  it('validate: all hook names known', () => {
    assert.eq(L.hooks.check({ fooBar: () => 1 }), ['unbekannter Hook fooBar']);
    assert.eq(L.registry.validate(), []);
  });
});
