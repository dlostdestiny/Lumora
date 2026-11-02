// Elite-Affixe: zufällige Zusatzeigenschaften starker Gegner.
(function (L) {
  const A = (def) => L.def.affix(def);
  const name = (m) => L.registry.get('species', m.species).name;

  A({ id: 'gepanzert', name: 'Gepanzert', icon: '🛡️', desc: 'Verteidigung +1 Stufe beim Einwechseln.',
    hooks: { onSwitchIn: (c) => c.api.stage(c.side, 'def', 1) } });
  A({ id: 'rasend', name: 'Rasend', icon: '💢', desc: 'Angriff +1 Stufe am Ende jeder Runde (höchstens +3).',
    hooks: { onTurnEnd: (c) => { if (c.battle.sides[c.side].stages.atk < 3) c.api.stage(c.side, 'atk', 1); } } });
  A({ id: 'regeneriert', name: 'Regeneriert', icon: '💚', desc: 'Heilt jede Runde 1/12 KP.',
    hooks: { onTurnEnd: (c) => { if (c.mon.hp < L.mon.maxHp(c.mon)) c.api.heal(c.side, 1 / 12); } } });
  A({ id: 'spiegelnd', name: 'Spiegelnd', icon: '🪞', desc: 'Wirft 20 % des erlittenen Schadens zurück.',
    hooks: { onHit: (c) => { if (c.attacker.hp > 0 && c.damage > 0) c.api.damage(c.attackerSide, Math.max(1, c.damage * 0.2), 'affix'); } } });
  A({
    id: 'gespalten', name: 'Gespalten', icon: '🪓', desc: 'Teilt sich bei halben KP in zwei Monster.',
    hooks: {
      onHit: (c) => {
        const k = 'split_' + c.side;
        if (c.battle.flags[k] || c.mon.hp <= 0 || c.mon.hp >= L.mon.maxHp(c.mon) / 2) return;
        c.battle.flags[k] = true;
        const clone = L.mon.create({ species: c.mon.species, level: c.mon.level, rng: c.rng, nature: c.mon.nature, trait: c.mon.trait, moves: c.mon.moves.map((m) => Object.assign({}, m)) });
        clone.hp = Math.floor(L.mon.maxHp(clone) * 0.5);
        clone.clone = true;
        c.api.addToTeam(c.side, clone);
        c.api.text(name(c.mon) + ' spaltet sich! Ein zweites ' + name(c.mon) + ' wartet auf seinen Einsatz.');
      },
    },
  });

  // Nur für Legendenkämpfe (einzigartige Monster), nie zufällig.
  A({ id: 'legende', name: 'Legende', icon: '👑', hidden: true, desc: 'Eine Legende: Angriff und Verteidigung +1 Stufe zu Beginn, heilt jede Runde 1/16 KP.',
    hooks: {
      onBattleStart: (c) => { c.api.stage(c.side, 'atk', 1); c.api.stage(c.side, 'def', 1); c.api.text('Eine Legende! ' + name(c.mon) + ' strahlt eine unglaubliche Kraft aus!'); },
      onTurnEnd: (c) => { if (c.mon.hp > 0 && c.mon.hp < L.mon.maxHp(c.mon)) c.api.heal(c.side, 1 / 16); },
    } });
  L.affixes = { random: (rng) => rng.pick(L.registry.all('affix').filter((a) => !a.hidden)).id };

  L.registry.addValidator('affix', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
