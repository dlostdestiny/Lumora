describe('engine core', () => {
  const L = LUM;
  const move0 = { type: 'move', index: 0 };

  it('faster mon moves first', () => {
    const b = TH.battle([TH.mon('summsel', 10, { moves: ['rempler'] })], [TH.mon('kieselkrabb', 10, { moves: ['rempler'] })]);
    const ev = L.battle.step(b, move0);
    assert.eq(TH.ofType(ev, 'move')[0].side, 0);
  });
  it('priority beats speed', () => {
    const p = TH.mon('kieselkrabb', 10, { moves: [{ id: 'wasserschuss', upgrade: 'b' }] });
    const b = TH.battle([p], [TH.mon('summsel', 10, { moves: ['rempler'] })]);
    const ev = L.battle.step(b, move0);
    assert.eq(TH.ofType(ev, 'move')[0].side, 0);
  });
  it('fainted enemy mon replaced by next', () => {
    const e1 = TH.mon('summsel', 5, { moves: ['rempler'] });
    e1.hp = 1;
    const b = TH.battle([TH.mon('glutaro', 20, { moves: ['glutbiss'] })], [e1, TH.mon('moosling', 5, { moves: ['rempler'] })]);
    const ev = L.battle.step(b, move0);
    assert.ok(TH.ofType(ev, 'faint').length === 1);
    assert.ok(ev.some((e) => e.t === 'switch' && e.side === 1));
    assert.eq(b.sides[1].active, 1);
    assert.eq(b.state, 'choose');
  });
  it('last enemy faint → state won, end event', () => {
    const e1 = TH.mon('summsel', 5, { moves: ['rempler'] });
    e1.hp = 1;
    const b = TH.battle([TH.mon('glutaro', 20, { moves: ['glutbiss'] })], [e1]);
    const ev = L.battle.step(b, move0);
    assert.eq(b.state, 'won');
    assert.eq(ev[ev.length - 1], { t: 'end', result: 'won' });
  });
  it('fainted mon does not attack', () => {
    const p = TH.mon('kieselkrabb', 5, { moves: ['rempler'] });
    p.hp = 1;
    const b = TH.battle([p, TH.mon('moosling', 5)], [TH.mon('glutaro', 30, { moves: ['flammenwirbel'] })]);
    const ev = L.battle.step(b, move0);
    assert.eq(TH.ofType(ev, 'move').filter((e) => e.side === 0).length, 0);
  });
  it('player faint with bench → forceSwitch', () => {
    const p = TH.mon('kieselkrabb', 5, { moves: ['rempler'] });
    p.hp = 1;
    const b = TH.battle([p, TH.mon('moosling', 5)], [TH.mon('glutaro', 30, { moves: ['flammenwirbel'] })]);
    L.battle.step(b, move0);
    assert.eq(b.state, 'forceSwitch');
    const ev = L.battle.forceSwitch(b, 1);
    assert.eq(b.state, 'choose');
    assert.eq(b.sides[0].active, 1);
    assert.ok(ev.some((e) => e.t === 'switch'));
  });
  it('player loses when last mon faints', () => {
    const p = TH.mon('kieselkrabb', 5, { moves: ['rempler'] });
    p.hp = 1;
    const b = TH.battle([p], [TH.mon('glutaro', 30, { moves: ['flammenwirbel'] })]);
    L.battle.step(b, move0);
    assert.eq(b.state, 'lost');
  });
  it('switch happens before enemy attack and takes the hit', () => {
    const p2 = TH.mon('moosling', 10);
    const b = TH.battle([TH.mon('kieselkrabb', 10), p2], [TH.mon('summsel', 10, { moves: ['funkenstoss'] })]);
    const ev = L.battle.step(b, { type: 'switch', index: 1 });
    assert.eq(ev.findIndex((e) => e.t === 'switch') < ev.findIndex((e) => e.t === 'damage'), true);
    assert.ok(p2.hp < L.mon.maxHp(p2));
    assert.eq(b.sides[0].stages.atk, 0);
  });
  it('switch resets stages', () => {
    const b = TH.battle([TH.mon('kieselkrabb', 10, { moves: ['haerten'] }), TH.mon('tropfling', 10)], [TH.mon('summsel', 10, { moves: ['surren'] })]);
    L.battle.step(b, move0);
    assert.eq(b.sides[0].stages.def, 1);
    L.battle.step(b, { type: 'switch', index: 1 });
    assert.eq(b.sides[0].stages.def, 0);
  });
  it('legal excludes capture in trainer battles', () => {
    const items = { fangkugel: 2 };
    const wild = TH.battle([TH.mon('summsel', 5)], [TH.mon('moosling', 5)], { player: { items } });
    assert.ok(L.battle.legal(wild, 0).some((a) => a.type === 'capture'));
    const tr = TH.battle([TH.mon('summsel', 5)], [TH.mon('moosling', 5)], { player: { items }, enemy: { kind: 'trainer' } });
    assert.ok(!L.battle.legal(tr, 0).some((a) => a.type === 'capture'));
  });
  it('step throws when battle over', () => {
    const e1 = TH.mon('summsel', 5);
    e1.hp = 1;
    const b = TH.battle([TH.mon('glutaro', 20, { moves: ['glutbiss'] })], [e1]);
    L.battle.step(b, move0);
    assert.throws(() => L.battle.step(b, move0), /Zustand/);
  });
  it('exhaustion: from config.exhaustionTurn both sides lose growing HP, so no battle lasts forever', () => {
    const L = LUM;
    assert.ok(L.config.exhaustionTurn > 0 && L.config.exhaustionStep > 0);
    // Zwei Monster, die sich nur heilen: ohne Sicherung würde der Kampf ewig dauern
    const run = (seed) => {
      const bt = TH.battle([TH.mon('plitsch', 20, { moves: ['quellwasser'] })], [TH.mon('plitsch', 20, { moves: ['quellwasser'] })], { seed });
      const all = [];
      let n = 0;
      while (bt.state === 'choose' && n++ < 400) all.push(...L.battle.step(bt, { type: 'move', index: 0 }));
      return { bt, all };
    };
    const r1 = run(5), r2 = run(5);
    assert.ok(r1.bt.state === 'won' || r1.bt.state === 'lost');
    assert.ok(r1.bt.turn >= L.config.exhaustionTurn && r1.bt.turn < L.config.exhaustionTurn + 40);
    assert.ok(r1.all.some((e) => e.t === 'damage' && e.reason === 'exhaustion'));
    assert.ok(r1.all.some((e) => e.t === 'text' && /Erschöpfung/.test(e.text)));
    assert.eq(r1.bt.turn, r2.bt.turn);
    assert.eq(r1.bt.state, r2.bt.state);
  });
  it('no exhaustion damage before config.exhaustionTurn', () => {
    const L = LUM;
    const bt = TH.battle([TH.mon('plitsch', 20, { moves: ['quellwasser'] })], [TH.mon('plitsch', 20, { moves: ['quellwasser'] })]);
    const all = [];
    for (let i = 1; i < L.config.exhaustionTurn; i++) all.push(...L.battle.step(bt, { type: 'move', index: 0 }));
    assert.ok(!all.some((e) => e.reason === 'exhaustion'));
  });
});
