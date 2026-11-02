describe('engine effects', () => {
  const L = LUM;
  const move0 = { type: 'move', index: 0 };
  const calm = (sp, lv, extra) => TH.mon(sp, lv || 10, Object.assign({ moves: ['haerten'] }, extra || {}));

  it('burn ticks 1/16', () => {
    const p = calm('kieselkrabb');
    p.status = 'brand';
    const b = TH.battle([p], [calm('kieselkrabb')]);
    const ev = L.battle.step(b, move0);
    const tick = TH.ofType(ev, 'statusTick')[0];
    assert.eq(tick.amount, Math.floor(L.mon.maxHp(p) / 16));
  });
  it('poison escalates', () => {
    const p = calm('kieselkrabb', 30);
    p.status = 'gift';
    const b = TH.battle([p], [calm('kieselkrabb')]);
    const t1 = TH.ofType(L.battle.step(b, move0), 'statusTick')[0].amount;
    const t2 = TH.ofType(L.battle.step(b, move0), 'statusTick')[0].amount;
    const max = L.mon.maxHp(p);
    assert.eq(t1, Math.floor(max / 16));
    assert.eq(t2, Math.floor(max * 2 / 16));
  });
  it('paralysis halves speed', () => {
    const p = calm('summsel');
    const b = TH.battle([p], [calm('kieselkrabb')]);
    const before = L.damage.statOf(b, 0, p, 'spe');
    p.status = 'laehmung';
    assert.near(L.damage.statOf(b, 0, p, 'spe'), before / 2, 1e-9);
  });
  it('sleep blocks turns then wakes', () => {
    const p = calm('kieselkrabb');
    p.status = 'schlaf';
    p.statusTurns = 2;
    const b = TH.battle([p], [calm('kieselkrabb')]);
    assert.ok(TH.ofType(L.battle.step(b, move0), 'cantMove').some((e) => e.side === 0));
    assert.ok(TH.ofType(L.battle.step(b, move0), 'cantMove').some((e) => e.side === 0));
    const ev3 = L.battle.step(b, move0);
    assert.ok(ev3.some((e) => e.t === 'statusEnd' && e.side === 0));
    assert.ok(ev3.some((e) => e.t === 'move' && e.side === 0));
  });
  it('glut immune to brand', () => {
    const b = TH.battle([calm('glimmi')], [calm('kieselkrabb')]);
    assert.eq(L.battle.inflict(b, 0, 'brand', []), false);
    assert.eq(L.battle.inflict(b, 1, 'brand', []), true);
    assert.eq(L.battle.inflict(b, 1, 'gift', []), false, 'nur ein Status');
  });
  it('stage capped at +3', () => {
    const b = TH.battle([calm('kieselkrabb')], [calm('kieselkrabb')]);
    for (let i = 0; i < 5; i++) L.battle.step(b, move0);
    assert.eq(b.sides[0].stages.def, 3);
  });
  it('weather expires after 5 turns', () => {
    const b = TH.battle([calm('kieselkrabb')], [calm('kieselkrabb')], { weather: 'nebel' });
    let ended = -1;
    for (let i = 1; i <= 6; i++) {
      const ev = L.battle.step(b, move0);
      if (ev.some((e) => e.t === 'weatherEnd')) { ended = i; break; }
    }
    assert.eq(ended, 5);
    assert.eq(b.weather, null);
  });
  it('sturm makes funke always hit', () => {
    const p = TH.mon('summsel', 20, { moves: ['blitzschlag'] });
    const e = TH.mon('brummfels', 50, { moves: ['haerten'] });
    const b = TH.battle([p], [e], { weather: 'sturm' });
    b.weather.turnsLeft = 99;
    b.sides[1].stages.eva = 3;
    for (let i = 0; i < 20; i++) {
      e.hp = L.mon.maxHp(e);
      const ev = L.battle.step(b, move0);
      assert.ok(!ev.some((x) => x.t === 'miss' && x.side === 0));
    }
  });
  it('drain heals attacker', () => {
    const p = TH.mon('knospi', 20, { moves: ['saugwurzel'] });
    p.hp = 10;
    const b = TH.battle([p], [calm('tropfling', 20)]);
    const ev = L.battle.step(b, move0);
    assert.ok(ev.some((e) => e.t === 'heal' && e.side === 0));
    assert.ok(p.hp > 10);
  });
  it('status move inflicts status', () => {
    const b = TH.battle([TH.mon('nachtschu', 15, { moves: [{ id: 'gifthauch', upgrade: 'a' }] })], [calm('kieselkrabb')]);
    L.battle.step(b, move0);
    assert.eq(b.sides[1].team[0].status, 'gift');
  });
  it('last mon fainting from poison ends battle lost', () => {
    const p = calm('kieselkrabb', 30);
    p.status = 'gift';
    p.hp = 1;
    const b = TH.battle([p], [calm('kieselkrabb')]);
    const ev = L.battle.step(b, move0);
    assert.eq(b.state, 'lost');
    assert.eq(ev[ev.length - 1], { t: 'end', result: 'lost' });
  });
  it('confusion can make mon hit itself', () => {
    const p = TH.mon('summsel', 10, { moves: ['rempler'] });
    const b = TH.battle([p], [calm('kieselkrabb')], { seed: 5 });
    let selfHit = false;
    for (let i = 0; i < 30 && !selfHit; i++) {
      b.sides[0].volatile.verwirrt = 3;
      p.hp = L.mon.maxHp(p);
      const ev = L.battle.step(b, { type: 'move', index: 0 });
      selfHit = ev.some((e) => e.t === 'damage' && e.side === 0 && e.self);
    }
    assert.ok(selfHit);
  });
  it('multiHit hits several times', () => {
    const b = TH.battle([TH.mon('kieselkrabb', 20, { moves: ['kieselhagel'] })], [calm('summsel', 30)], { seed: 8 });
    let maxHits = 0;
    for (let i = 0; i < 5; i++) {
      const ev = L.battle.step(b, move0);
      maxHits = Math.max(maxHits, TH.ofType(ev, 'damage').filter((e) => e.side === 1).length);
      b.sides[1].team[0].hp = L.mon.maxHp(b.sides[1].team[0]);
    }
    assert.ok(maxHits >= 2);
  });
});
