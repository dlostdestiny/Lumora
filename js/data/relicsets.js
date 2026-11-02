// Relikt-Sets: Wer alle Teile eines Sets besitzt, bekommt einen starken Zusatz-Bonus.
// pieces = Relikt-ids, hooks wie bei Relikten. unlock = Set erst nach Kauf im Kristall-Shop im Spiel.
(function (L) {
  const S = (def) => L.def.relicSet(def);

  S({ id: 'waldhueter', name: 'Waldhüter', icon: '🌳', pieces: ['heilmoos', 'ersthelfer', 'rindenschild'],
    desc: 'Am Ende jeder Runde heilt dein aktives Monster 1/12 seiner KP.',
    hooks: { onTurnEnd: (c) => { if (c.side === 0 && c.mon.hp > 0 && c.mon.hp < L.mon.maxHp(c.mon)) c.api.heal(c.side, 1 / 12); } } });
  S({ id: 'jaeger', name: 'Jäger', icon: '🏹', unlock: 'set_jaeger', pieces: ['schaerfstein', 'typprisma', 'jagdhorn'],
    desc: 'Volltreffer machen 30 % mehr Schaden.',
    hooks: { modifyDamage: (v, c) => (c.crit ? v * 1.3 : v) } });
  S({ id: 'sternenwanderer', name: 'Sternenwanderer', icon: '🌠', unlock: 'set_sterne', pieces: ['sternenstaub', 'wanderkompass', 'sternkarte'],
    desc: 'Kristalle aus Kämpfen ×1,5.',
    hooks: { modifyCrystals: (v) => v * 1.5 } });
  S({ id: 'faenger', name: 'Fänger', icon: '🥅', unlock: 'set_faenger', pieces: ['fangnetz', 'gluecksklee', 'koederbeutel'],
    desc: 'Fangchance +35 % und Gold +15 %.',
    hooks: { modifyCatchRate: (v) => v * 1.35, modifyGold: (v) => v * 1.15 } });
  S({ id: 'mondwacht', name: 'Mondwacht', icon: '🌙', unlock: 'set_mond', pieces: ['mondsichel', 'nachtauge', 'schutzamulett'],
    desc: 'Dein aktives Monster weicht 10 % aller Angriffe aus.',
    hooks: { modifyEvasion: (v) => v * 0.9 } });

  L.relicSets = {
    // Sets mit Stand: [{ set, have, total, complete }]
    status(relics) {
      return L.registry.all('relicSet').map((s) => {
        const have = s.pieces.filter((p) => relics.indexOf(p) >= 0).length;
        return { set: s, have, total: s.pieces.length, complete: have === s.pieces.length };
      });
    },
    active(relics) { return L.relicSets.status(relics || []).filter((x) => x.complete).map((x) => x.set); },
    // Set, zu dem ein Relikt gehört (oder null)
    of(relicId) { return L.registry.all('relicSet').find((s) => s.pieces.indexOf(relicId) >= 0) || null; },
  };

  // Vollständige Sets wirken im Kampf wie Relikte.
  L.hooks.sources.push((side) => L.relicSets.active(side.relics).map((s) => ({ source: 'set', hooks: s.hooks })));

  L.registry.addValidator('relicSet', (def, reg) => {
    const errs = L.hooks.check(def.hooks);
    for (const p of def.pieces) if (!reg.has('relic', p)) errs.push('unbekanntes Relikt ' + p);
    return errs;
  });
})(globalThis.LUM);
