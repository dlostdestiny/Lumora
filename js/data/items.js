// Items: Verbrauchs-Items, Fangkugeln und getragene Items.
(function (L) {
  L.def.item({ id: 'heiltrank', name: 'Heiltrank', icon: '🧪', kind: 'heal', value: 0.5, price: 30, desc: 'Heilt 50 % der KP.' });
  L.def.item({ id: 'superheiltrank', name: 'Super-Heiltrank', icon: '⚗️', kind: 'heal', value: 1, price: 60, desc: 'Heilt alle KP.' });
  L.def.item({ id: 'allheiler', name: 'Allheiler', icon: '🌼', kind: 'cure', price: 35, desc: 'Heilt jeden Status.' });
  L.def.item({ id: 'beleber', name: 'Beleber', icon: '💫', kind: 'revive', value: 0.5, price: 70, desc: 'Belebt ein besiegtes Monster mit 50 % KP.' });
  L.def.item({ id: 'fangkugel', name: 'Fangkugel', icon: '⚪', kind: 'ball', ballMod: 1, price: 20, desc: 'Fängt wilde Monster.' });
  L.def.item({ id: 'superkugel', name: 'Superkugel', icon: '🔵', kind: 'ball', ballMod: 1.5, price: 45, desc: 'Fängt besser als eine Fangkugel.' });
  L.def.item({ id: 'mondkugel', name: 'Mondkugel', icon: '🌙', kind: 'ball', ballMod: 0.5, nightBallMod: 3, price: 60, secret: true, desc: 'Nachts sehr stark, tagsüber schwach.' });

  const typeBoost = (type, factor) => ({
    modifyDamage: (v, c) => (c.move && c.move.type === type ? v * factor : v),
  });
  L.def.item({ id: 'glutfeder', name: 'Glutfeder', icon: '🪶', kind: 'held', price: 50, desc: 'Glut-Attacken +20 %.', hooks: typeBoost('glut', 1.2) });
  L.def.item({ id: 'tropfenperle', name: 'Tropfenperle', icon: '🫧', kind: 'held', price: 50, desc: 'Flut-Attacken +20 %.', hooks: typeBoost('flut', 1.2) });
  L.def.item({ id: 'blattbrosche', name: 'Blattbrosche', icon: '🍃', kind: 'held', price: 50, desc: 'Spross-Attacken +20 %.', hooks: typeBoost('spross', 1.2) });
  L.def.item({ id: 'funkenring', name: 'Funkenring', icon: '💍', kind: 'held', price: 50, desc: 'Funke-Attacken +20 %.', hooks: typeBoost('funke', 1.2) });
  L.def.item({ id: 'kieselschale', name: 'Kieselschale', icon: '🐚', kind: 'held', price: 50, desc: 'Stein-Attacken +20 %.', hooks: typeBoost('stein', 1.2) });
  L.def.item({ id: 'schattenschleier', name: 'Schattenschleier', icon: '🕸️', kind: 'held', price: 50, desc: 'Schatten-Attacken +20 %.', hooks: typeBoost('schatten', 1.2) });
  L.def.item({
    id: 'beerenbeutel', name: 'Beerenbeutel', icon: '🫐', kind: 'held', price: 55, desc: 'Heilt einmal pro Kampf 25 % KP, wenn die KP unter 50 % fallen.',
    hooks: {
      onHit: (c) => {
        const flag = 'beere_' + c.mon.uid;
        if (c.battle.flags[flag] || c.mon.hp <= 0) return;
        if (c.mon.hp < L.mon.maxHp(c.mon) / 2) {
          c.battle.flags[flag] = true;
          c.api.text(L.registry.get('species', c.mon.species).name + ' isst eine Beere aus dem Beutel.');
          c.api.heal(c.side, 0.25);
        }
      },
    },
  });

  L.def.item({ id: 'frostkristall', name: 'Frostkristall', icon: '❄️', kind: 'held', price: 50, desc: 'Frost-Attacken +20 %.', hooks: typeBoost('frost', 1.2) });
  L.def.item({ id: 'windfeder', name: 'Windfeder', icon: '🪶', kind: 'held', price: 50, desc: 'Wind-Attacken +20 %.', hooks: typeBoost('wind', 1.2) });
  L.def.item({ id: 'magnetkern', name: 'Magnetkern', icon: '🧲', kind: 'held', price: 50, desc: 'Metall-Attacken +20 %.', hooks: typeBoost('metall', 1.2) });
  L.def.item({ id: 'fokusband', name: 'Fokusband', icon: '🎗️', kind: 'held', price: 70, desc: 'Übersteht einmal pro Kampf einen K.-o.-Treffer bei vollen KP.',
    hooks: { modifySurvive: (v, c) => { const k = 'fokus_' + c.mon.uid; if (v || c.battle.flags[k] || c.hpBefore !== c.maxHp) return v; c.battle.flags[k] = true; return true; } } });
  L.def.item({ id: 'kraftband', name: 'Kraftband', icon: '💪', kind: 'held', price: 60, desc: 'Alle Attacken +10 %.', hooks: { modifyDamage: (v) => v * 1.1 } });
  L.def.item({ id: 'schutzweste', name: 'Schutzweste', icon: '🦺', kind: 'held', price: 60, desc: 'Erlittener Schaden −10 %.', hooks: { modifyIncomingDamage: (v) => v * 0.9 } });
  L.def.item({ id: 'flinkschuh', name: 'Flinkschuh', icon: '👟', kind: 'held', price: 55, desc: 'Tempo +15 %.', hooks: { modifyStat: (v, c) => (c.stat === 'spe' ? v * 1.15 : v) } });
  L.def.item({ id: 'scharfklaue', name: 'Scharfklaue', icon: '🦅', kind: 'held', price: 60, desc: 'Volltreffer-Stufe +1.', hooks: { modifyCritStage: (v, c) => (c.defending ? v : v + 1) } });
  L.def.item({ id: 'lebensorb', name: 'Lebensorb', icon: '🔮', kind: 'held', price: 80, desc: 'Attacken +25 %, aber nach jedem Treffer verliert der Träger 1/10 seiner KP.',
    hooks: { modifyDamage: (v) => v * 1.25, onDealDamage: (c) => { if (c.damage > 0 && c.mon.hp > 0) c.api.damage(c.side, L.mon.maxHp(c.mon) / 10, 'recoil'); } } });
  L.def.item({ id: 'eisbonbon', name: 'Eisbonbon', icon: '🍬', kind: 'cure', price: 25, desc: 'Taut ein eingefrorenes Monster auf und heilt jeden Status.' });

  L.registry.addValidator('item', (def) => L.hooks.check(def.hooks));
})(globalThis.LUM);
