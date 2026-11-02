// Balance-Simulation: spielt komplette Läufe automatisch. node tests/sim.js [läufe=200]
// MODE=jenseits: nach Sola weiter in Akt 4 (Jenseits des Schleiers).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const load = (rel) => vm.runInThisContext(fs.readFileSync(path.join(root, rel), 'utf8'), { filename: rel });
load('js/files.js');
for (const f of globalThis.LUM_FILES.logic) load(f);
const L = globalThis.LUM;

const RUNS = Number(process.argv[2]) || 200;
const ECHO = Number(process.argv[3]) || 0;
const now = new Date(2026, 10, 1, 14);
const PRIO = { relic: 4, monster: 3, move: 2, item: 1, gold: 0 };

function resolveOffers(run, offers) {
  const evolved = {};
  for (const o of offers || []) {
    const mon = run.team.find((m) => m.uid === o.mon);
    if (!mon) continue;
    if (o.kind === 'evolve' && !evolved[mon.uid] && mon.species !== o.to) { evolved[mon.uid] = true; L.mon.evolve(mon, o.to); }
    if (o.kind === 'learn') {
      const powers = mon.moves.map((r) => L.moves.resolve(r).power || 0);
      const weakest = powers.indexOf(Math.min(...powers));
      if ((L.registry.get('move', o.move).power || 0) >= powers[weakest]) L.mon.learn(mon, o.move, weakest);
    }
  }
}

// Stärke eines Monsters grob: Basiswerte × Level (für Tausch-Entscheidungen des Bots)
function power(m) { const b = L.registry.get('species', m.species).base; return (b.hp + b.atk + b.def + b.spe) * m.level; }
function weakest(run) { let w = 1; for (let i = 1; i < run.team.length; i++) if (power(run.team[i]) < power(run.team[w])) w = i; return w; }

function fight(run, stats) {
  const battle = L.run.makeBattle(run, now);
  L.battle.start(battle);
  let turns = 0;
  while (battle.state !== 'won' && battle.state !== 'lost' && battle.state !== 'captured' && turns < 200) {
    turns++;
    if (battle.state === 'forceSwitch') {
      L.battle.forceSwitch(battle, L.battle.legal(battle, 0)[0].index);
      continue;
    }
    if (battle.doubles) {
      // Doppelkampf: jedes eigene Monster wählt wie ein Elite-Trainer (mit Ziel)
      let bondUsed = false;
      const acts = L.battle.liveSlots(battle, 0).map((k) => {
        const legal = L.battle.legal(battle, 0, k);
        if (!bondUsed && legal.some((a) => a.type === 'bond')) { bondUsed = true; return { type: 'bond', slot: k, foe: 0 }; }
        const a = Object.assign({ slot: k }, L.ai.choose(battle, 0, battle.rng, 'elite', k));
        return a.type === 'switch' || a.type === 'bond' ? { type: 'move', index: 0, slot: k } : a;
      });
      L.battle.step(battle, acts);
      continue;
    }
    const legal = L.battle.legal(battle, 0);
    const me = L.battle.active(battle, 0);
    let action;
    const foe = L.battle.active(battle, 1);
    const ball = legal.find((a) => a.type === 'capture');
    const worth = run.team.length < run.teamSize || (run.team.length > 1 && power(foe) > power(run.team[weakest(run)]) * 1.15);
    if (ball && worth && foe.hp < L.mon.maxHp(foe) * 0.5) action = ball;
    else if (legal.some((a) => a.type === 'bond')) action = { type: 'bond' };
    else if (me.hp < L.mon.maxHp(me) * 0.3 && legal.some((a) => a.type === 'item' && a.item === 'heiltrank' && a.target === battle.sides[0].active)) action = { type: 'item', item: 'heiltrank', target: battle.sides[0].active };
    else action = L.ai.choose(battle, 0, battle.rng, 'elite');
    if (action.type === 'switch' && !legal.some((a) => a.type === 'switch' && a.index === action.index)) action = { type: 'move', index: 0 };
    L.battle.step(battle, action);
  }
  if (battle.state === 'lost' && process.env.DBG2 && run.pending.kind === 'boss' && run.act === 'act2') console.log('BOSS-REST', battle.sides[1].team.map((m) => m.species + ' ' + m.hp + '/' + L.mon.maxHp(m)).join(', '), '| Runden', turns, '| Team', battle.sides[0].team.map((m) => m.species + ' L' + m.level + ' [' + m.moves.map((x) => x.id).join(' ') + ']').join('; '));
  const sum = L.run.resolveBattle(run, battle, null);
  resolveOffers(run, sum.offers);
  if (run.pending.release) { const w = weakest(run); L.run.release(run, power(run.pending.release) > power(run.team[w]) ? w : null); }
  return battle.result;
}

const out = { teamSizes: [], wins: 0, deathsBy: {}, bossLevels: [], deathLayer: {}, act1: 0, act2: 0 };
for (let i = 0; i < RUNS; i++) {
  const START = (process.env.STARTERS || 'glimmi,plitsch,knospi').split(',');
  const starter = START[i % START.length];
  const blessing = L.registry.all('blessing').filter((b) => !b.unlock)[i % 8].id;
  // TAL=1: alle Talente auf voll (Spieler mit hohem Rang)
  const talents = process.env.TAL ? L.registry.all('talent').map((t) => ({ id: t.id, level: t.max })) : [];
  const run = L.run.create({ seed: 'sim' + i, starter, blessing, meta: null, now, echo: ECHO, talents, mode: process.env.MODE || null });
  const r = L.run.rng(run);
  while (!run.finished) {
    const choices = L.run.choices(run);
    const id = r.pick(choices);
    const p = L.run.enter(run, id, now);
    const tag = run.act + ':';
    if (p.kind === 'boss') (out.teamSizes[run.act] = out.teamSizes[run.act] || []).push(run.team.length);
    if (p.kind === 'boss') (out.bossLevels[run.act] = out.bossLevels[run.act] || []).push(Math.max(...run.team.map((m) => m.level)));
    if (p.kind === 'spring') {
      const hpRatio = run.team.reduce((a, m) => a + m.hp / L.mon.maxHp(m), 0) / run.team.length;
      if (hpRatio < 0.6 || p.layer === run.map.layers - 2) L.nodes.spring(run, 'heal', {});
      else resolveOffers(run, L.nodes.spring(run, 'train', { mon: 0 }).offers);
    }
    if (p.kind === 'event') {
      const ev = L.registry.get('event', p.event);
      const ok = ev.options.map((_, k) => k).filter((k) => L.nodes.optionAvailable(run, ev.id, k, now));
      L.nodes.event(run, ev.id, r.pick(ok), now);
      if (run.pending.release) L.run.release(run, null);
    }
    if (p.kind === 'shop') {
      for (let k = 0; k < p.shop.length; k++) { const e = p.shop[k]; if (e.kind === 'item' && ['heiltrank', 'superheiltrank', 'beleber'].includes(e.id) && run.gold >= e.price) L.nodes.buy(run, k, {}); }
    }
    // Wie ein echter Spieler: zwischen Kämpfen Heiltränke benutzen
    for (const m of run.team) {
      const max = L.mon.maxHp(m);
      if (m.hp > 0 && m.hp < max * 0.5 && run.items.heiltrank > 0) { m.hp = Math.min(max, m.hp + Math.floor(max * 0.5)); run.items.heiltrank--; }
      if (m.hp <= 0 && run.items.beleber > 0) { m.hp = Math.floor(max * 0.5); run.items.beleber--; }
    }
    if (run.pending.battle && !run.pending.battleDone) {
      const before = run.team.map((m) => m.species + ' L' + m.level + ' ' + m.hp + '/' + L.mon.maxHp(m)).join(', ');
      const foes = run.pending.battle.team.map((m) => m.species + ' L' + m.level).join(', ');
      const res = fight(run, out);
      if (res === 'lost' && process.env.DBG && p.layer >= 4) console.log('VERLOREN Ebene ' + p.layer + ' ' + p.kind + ': [' + before + '] gegen [' + foes + ']');
      if (res === 'lost') {
        out.deathsBy[tag + p.kind] = (out.deathsBy[tag + p.kind] || 0) + 1;
        if (run.act !== 'act1') { const k = run.act + ':' + starter + ':' + p.kind; out.act2Deaths = out.act2Deaths || {}; out.act2Deaths[k] = (out.act2Deaths[k] || 0) + 1; }
        out.deathLayer[tag + p.layer] = (out.deathLayer[tag + p.layer] || 0) + 1;
        break;
      }
    }
    if (run.pending.rewards && !run.pending.rewardsDone) {
      const prio = (k) => (k === 'monster' && run.team.length < 3 ? 5 : PRIO[k]);
      const best = run.pending.rewards.slice().sort((a, b) => prio(b.kind) - prio(a.kind))[0];
      if (best.kind === 'move') {
        const m = run.team[0];
        if (!m.moves.some((x) => x.id === best.move)) {
          const powers = m.moves.map((x) => L.moves.resolve(x).power || 0);
          L.rewards.apply(run, best, { mon: 0, replaceIndex: powers.indexOf(Math.min(...powers)) });
        }
      } else {
        const res = L.rewards.apply(run, best, {});
        void res;
      }
    }
    const wasAct = run.act;
    L.run.complete(run);
    if (wasAct === 'act1' && run.act !== 'act1') out.act1++;
    if (wasAct === 'act2' && run.act !== 'act2') out.act2++;
    if (wasAct !== 'act4' && run.act === 'act4') out.act4 = (out.act4 || 0) + 1;
    if (run.questOffer) run.questOffer = null;
  }
  if (run.finished === 'victory') out.wins++;
  out.byStarter = out.byStarter || {};
  const bs = out.byStarter[starter] || (out.byStarter[starter] = { runs: 0, wins: 0 });
  bs.runs++; if (run.finished === 'victory') bs.wins++;
}

const avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-');
console.log('Läufe:', RUNS, '· Echo-Stufe', ECHO);
console.log('Akt 1 geschafft (Fenna):', (out.act1 / RUNS * 100).toFixed(1) + ' %');
console.log('Akt 2 geschafft (Brakk):', (out.act2 / RUNS * 100).toFixed(1) + ' %');
if (process.env.MODE === 'jenseits') console.log('Akt 4 erreicht (MODE=jenseits):', out.act4 || 0, '× – davon Vael besiegt:', out.wins);
console.log('Ganzer Lauf gewonnen:', (out.wins / RUNS * 100).toFixed(1) + ' %');
for (const a of Object.keys(out.bossLevels)) console.log(a + ': Ø höchstes Level am Boss', avg(out.bossLevels[a]), '(erreicht ' + out.bossLevels[a].length + '×), Ø Team', avg(out.teamSizes[a]));
console.log('Niederlagen nach Knotenart:', JSON.stringify(out.deathsBy));
console.log('Niederlagen ab Akt 2 je Starter:', JSON.stringify(out.act2Deaths));
console.log('Nach Starter:', JSON.stringify(out.byStarter));
console.log('Niederlagen nach Ebene:', JSON.stringify(out.deathLayer));
