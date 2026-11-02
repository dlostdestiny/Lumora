// Erfolge: Seltenheit bestimmt die Belohnung (Kristalle), seltene geben zusätzlich einen Titel.
// value(meta) liefert den aktuellen Stand, goal das Ziel. hidden = bis zum Freischalten als „???“ angezeigt.
(function (L) {
  const stat = (k) => (m) => (m.stats && m.stats[k]) || 0;
  const caughtSpecies = (id) => (m) => (m.dex[id] && m.dex[id].caught ? 1 : 0);
  const A = (def) => L.def.achievement(def);

  // Gewöhnlich
  A({ id: 'erster_sieg', name: 'Erster Sieg', icon: '⚔️', rarity: 'gewoehnlich', desc: 'Gewinne einen Kampf.', goal: 1, value: stat('battlesWon') });
  A({ id: 'erster_fang', name: 'Erster Fang', icon: '⚪', rarity: 'gewoehnlich', desc: 'Fange ein wildes Monster.', goal: 1, value: stat('caught') });
  A({ id: 'erster_lauf', name: 'Das erste Echo', icon: '🔁', rarity: 'gewoehnlich', desc: 'Beende einen Lauf.', goal: 1, value: (m) => m.runs });
  A({ id: 'kaempfer_1', name: 'Kämpfer', icon: '🗡️', rarity: 'gewoehnlich', desc: 'Gewinne 25 Kämpfe.', goal: 25, value: stat('battlesWon') });
  A({ id: 'sammler_1', name: 'Sammler', icon: '🎒', rarity: 'gewoehnlich', desc: 'Fange 10 Monster.', goal: 10, value: stat('caught') });
  A({ id: 'quellgaenger', name: 'Quellgänger', icon: '⛲', rarity: 'gewoehnlich', desc: 'Nutze 5 Quellen.', goal: 5, value: stat('springs') });
  A({ id: 'haendlerfreund', name: 'Lottes Stammkunde', icon: '🛒', rarity: 'gewoehnlich', desc: 'Kaufe 5 Dinge im Laden.', goal: 5, value: stat('purchases') });
  A({ id: 'neugierig', name: 'Neugierig', icon: '❓', rarity: 'gewoehnlich', desc: 'Erlebe 10 Ereignisse.', goal: 10, value: stat('events') });
  A({ id: 'erste_entwicklung', name: 'Was? Es entwickelt sich!', icon: '🌟', rarity: 'gewoehnlich', desc: 'Lass ein Monster sich entwickeln.', goal: 1, value: stat('evolutions') });

  A({ id: 'tagesgast', name: 'Tagesgast', icon: '📅', rarity: 'gewoehnlich', desc: 'Spiele eine Tages-Herausforderung.', goal: 1, value: stat('dailyPlayed') });
  A({ id: 'kristallkunde', name: 'Kristallkunde', icon: '💎', rarity: 'gewoehnlich', desc: 'Kaufe etwas im Kristall-Shop.', goal: 1, value: (m) => Object.keys(m.unlocks || {}).length });

  A({ id: 'rang_5', name: 'Erfahrener Wanderer', icon: '⭐', rarity: 'gewoehnlich', desc: 'Erreiche Bannträger-Rang 5.', goal: 5, value: (m) => (L.rank ? L.rank.level(m) : 1) });

  A({ id: 'erstes_ei', name: 'Frisch geschlüpft', icon: '🐣', rarity: 'gewoehnlich', desc: 'Lass ein Ei schlüpfen.', goal: 1, value: stat('hatched') });

  // Selten
  A({ id: 'brutmeister', name: 'Brutmeister', icon: '🪺', rarity: 'selten', desc: 'Lass 10 Eier schlüpfen.', goal: 10, value: stat('hatched'), title: 'Brutmeister' });
  A({ id: 'rang_15', name: 'Bewährt', icon: '🌟', rarity: 'selten', desc: 'Erreiche Bannträger-Rang 15.', goal: 15, value: (m) => (L.rank ? L.rank.level(m) : 1), title: 'Bewährt' });
  A({ id: 'auftraggeber', name: 'Zuverlässig', icon: '📜', rarity: 'selten', desc: 'Erledige 5 Nebenaufträge.', goal: 5, value: stat('quests'), title: 'Zuverlässig' });
  A({ id: 'setsammler', name: 'Komplett!', icon: '🧩', rarity: 'selten', desc: 'Beende einen Lauf mit einem vollständigen Relikt-Set.', goal: 1, value: stat('sets') });
  A({ id: 'tagesserie', name: 'Treue Seele', icon: '🗓️', rarity: 'selten', desc: 'Spiele 7 Tages-Herausforderungen.', goal: 7, value: stat('dailyPlayed'), title: 'Treue Seele' });
  A({ id: 'waldretter', name: 'Retter des Waldes', icon: '🌳', rarity: 'selten', desc: 'Besiege Wächterin Fenna.', goal: 1, value: (m) => (m.bossesDefeated.indexOf('fenna') >= 0 ? 1 : 0), title: 'Waldretter' });
  A({ id: 'schimmer_gesehen', name: 'Ein Funkeln', icon: '✨', rarity: 'selten', desc: 'Begegne einem Schimmer-Monster.', goal: 1, value: stat('shinySeen'), hidden: true });
  A({ id: 'seelenband', name: 'Seelenband', icon: '💞', rarity: 'selten', desc: 'Setze eine Bindungs-Attacke ein.', goal: 1, value: stat('bondMoves'), title: 'Seelenfreund' });
  A({ id: 'kaempfer_2', name: 'Veteran', icon: '🛡️', rarity: 'selten', desc: 'Gewinne 100 Kämpfe.', goal: 100, value: stat('battlesWon') });
  A({ id: 'sammler_2', name: 'Großer Sammler', icon: '📦', rarity: 'selten', desc: 'Fange 30 Monster.', goal: 30, value: stat('caught') });
  A({ id: 'lexikon_50', name: 'Halbes Lexikon', icon: '📖', rarity: 'selten', desc: 'Fülle das Lexikon zu 50 %.', goal: 50, value: (m) => Math.floor(L.progress.dexCompletion(m) * 100) });
  A({ id: 'volltreffer', name: 'Scharfauge', icon: '🎯', rarity: 'selten', desc: 'Lande 25 Volltreffer.', goal: 25, value: stat('crits'), title: 'Scharfauge' });
  A({ id: 'echo_1', name: 'Das Echo wird lauter', icon: '🌒', rarity: 'selten', desc: 'Gewinne auf Echo I.', goal: 1, value: (m) => (m.echoBest >= 1 ? 1 : 0), title: 'Echo-Läufer' });
  A({ id: 'sieger_3', name: 'Dreifach siegreich', icon: '🏅', rarity: 'selten', desc: 'Gewinne 3 Läufe.', goal: 3, value: stat('victories') });

  A({ id: 'schmiedebefreier', name: 'Das Feuer ist rot', icon: '⚒️', rarity: 'selten', desc: 'Besiege Wächter Brakk.', goal: 1, value: (m) => (m.bossesDefeated.indexOf('brakk') >= 0 ? 1 : 0), title: 'Funkenhüter' });

  A({ id: 'tiefentaucher', name: 'Tiefentaucher', icon: '🌊', rarity: 'selten', desc: 'Befreie die Versunkene Tiefe.', goal: 1, value: (m) => (m.bossesDefeated.indexOf('maris') >= 0 ? 1 : 0), hidden: true, title: 'Tiefentaucher' });

  // Episch
  A({ id: 'sturmbrecher', name: 'Sturmbrecher', icon: '🌩️', rarity: 'episch', desc: 'Besiege Wächterin Sola und gewinne einen ganzen Lauf.', goal: 1, value: (m) => (m.bossesDefeated.indexOf('sola') >= 0 ? 1 : 0), title: 'Sturmbrecher' });
  A({ id: 'mondjaeger', name: 'Im Schatten des Mondes', icon: '🌑', rarity: 'episch', desc: 'Fange Nyxelle.', goal: 1, value: caughtSpecies('nyxelle'), hidden: true, title: 'Mondjäger' });
  A({ id: 'spiegelbild', name: 'Spiegelbild', icon: '🪞', rarity: 'episch', desc: 'Fange Mirrok.', goal: 1, value: caughtSpecies('mirrok'), hidden: true, title: 'Spiegelseele' });
  A({ id: 'sonnenkind', name: 'Sonnenkind', icon: '☀️', rarity: 'episch', desc: 'Fange Sunnyfex.', goal: 1, value: caughtSpecies('sunnyfex'), hidden: true, title: 'Sonnenkind' });
  A({ id: 'glanzjaeger', name: 'Glanzjäger', icon: '💫', rarity: 'episch', desc: 'Fange ein Schimmer-Monster.', goal: 1, value: stat('shinyCaught'), hidden: true, title: 'Glanzjäger' });
  A({ id: 'schattenbrecher', name: 'Schattenbrecher', icon: '🌔', rarity: 'episch', desc: 'Gewinne auf Echo III.', goal: 1, value: (m) => (m.echoBest >= 3 ? 1 : 0), title: 'Schattenbrecher' });
  A({ id: 'lexikon_100', name: 'Lexikon-Meister', icon: '📚', rarity: 'episch', desc: 'Fülle das Lexikon komplett.', goal: 100, value: (m) => Math.floor(L.progress.dexCompletion(m) * 100), title: 'Lexikon-Meister' });
  A({ id: 'irrlicht', name: 'Dem Licht gefolgt', icon: '🕯️', rarity: 'episch', desc: 'Fange Wispelin.', goal: 1, value: caughtSpecies('wispelin'), hidden: true, title: 'Irrlicht-Freund' });
  A({ id: 'gluecksfund', name: 'Glückspilz', icon: '🍀', rarity: 'episch', desc: 'Fange Pochi.', goal: 1, value: caughtSpecies('pochi'), hidden: true, title: 'Glückspilz' });
  A({ id: 'seelen_meister', name: 'Seelenmeister', icon: '💖', rarity: 'episch', desc: 'Setze 25 Bindungs-Attacken ein.', goal: 25, value: stat('bondMoves'), title: 'Seelenmeister' });
  A({ id: 'sieger_10', name: 'Legende des Waldes', icon: '🏆', rarity: 'episch', desc: 'Gewinne 10 Läufe.', goal: 10, value: stat('victories'), title: 'Legende' });

  A({ id: 'tagesheld', name: 'Held des Tages', icon: '🌅', rarity: 'episch', desc: 'Gewinne eine Tages-Herausforderung.', goal: 1, value: stat('dailyWon'), title: 'Tagesheld' });
  A({ id: 'fluchtraeger_sieg', name: 'Verflucht und siegreich', icon: '🕯️', rarity: 'episch', desc: 'Gewinne einen Lauf mit mindestens 2 Flüchen.', goal: 1, value: stat('cursedVictory'), hidden: true, title: 'Fluchträger' });

  A({ id: 'rang_30', name: 'Meister-Bannträger', icon: '💫', rarity: 'episch', desc: 'Erreiche Bannträger-Rang 30.', goal: 30, value: (m) => (L.rank ? L.rank.level(m) : 1), title: 'Meister-Bannträger' });

  A({ id: 'fragmente_9', name: 'Neun Lichter', icon: '🌠', rarity: 'episch', desc: 'Sammle alle 9 Sternenfragmente.', goal: 9, value: (m) => (m.fragments || []).length, title: 'Splitterhüter' });

  A({ id: 'modus_solo', name: 'Ganz allein', icon: '🦸', rarity: 'legendaer', desc: 'Gewinne einen Lauf im Modus „Allein“.', goal: 1, value: stat('modeWin_solo'), title: 'Einzelkämpfer' });
  A({ id: 'modus_monotyp', name: 'Treu bis zum Ende', icon: '🎨', rarity: 'episch', desc: 'Gewinne einen Lauf im Modus „Ein Typ“.', goal: 1, value: stat('modeWin_monotyp'), title: 'Typ-Meister' });
  A({ id: 'modus_ohneheilung', name: 'Eiserner Wille', icon: '🩸', rarity: 'episch', desc: 'Gewinne einen Lauf im Modus „Ohne Heilung“.', goal: 1, value: stat('modeWin_ohneheilung'), title: 'Eisern' });

  A({ id: 'meisterschaft_gold', name: 'Seelenverwandt', icon: '🥇', rarity: 'episch', desc: 'Erreiche Gold-Meisterschaft mit einem Monster.', goal: 1, value: (m) => (Object.keys(m.mastery || {}).some((sp) => L.mastery.of(m, sp) >= 3) ? 1 : 0), title: 'Vertrauter' });

  A({ id: 'schimmer_ei', name: 'Glanz aus dem Ei', icon: '✨', rarity: 'episch', desc: 'Lass ein Schimmer-Monster schlüpfen.', goal: 1, value: stat('shinyHatched'), hidden: true, title: 'Glanzhüter' });

  A({ id: 'alle_wege', name: 'Alle Wege führen …', icon: '🧭', rarity: 'episch', desc: 'Gewinne einen Lauf mit jedem Bannträger-Weg.', goal: 4, value: (m) => ['kaempfer', 'hueter', 'faenger', 'mystiker'].filter((p) => (m.stats['pathWin_' + p] || 0) > 0).length, title: 'Wegbereiter' });

  A({ id: 'turm_10', name: 'Turmläufer', icon: '🗼', rarity: 'selten', desc: 'Erreiche Stockwerk 10 im Echo-Turm.', goal: 10, value: stat('towerBest') });
  A({ id: 'turm_30', name: 'Himmelsstürmer', icon: '🏯', rarity: 'episch', desc: 'Erreiche Stockwerk 30 im Echo-Turm.', goal: 30, value: stat('towerBest'), title: 'Himmelsstürmer' });

  A({ id: 'geisterjaeger', name: 'Über dich hinaus', icon: '👻', rarity: 'episch', desc: 'Besiege 3 Echos deiner früheren Sieger-Teams.', goal: 3, value: stat('ghostsBeaten'), hidden: true, title: 'Echo-Bezwinger' });

  // Legendär
  A({ id: 'turm_60', name: 'Herr des Turms', icon: '👑', rarity: 'legendaer', desc: 'Erreiche Stockwerk 60 im Echo-Turm.', goal: 60, value: stat('towerBest'), title: 'Turmherr' });
  A({ id: 'wahres_ende', name: 'Die Schleife ist gebrochen', icon: '✨', rarity: 'legendaer', desc: 'Erlebe das wahre Ende.', goal: 1, value: (m) => (m.flags && m.flags.trueEnd ? 1 : 0), hidden: true, title: 'Echo-Brecher' });
  A({ id: 'jenseits', name: 'Jenseits des Schleiers', icon: '🌌', rarity: 'legendaer', desc: 'Finde heraus, woher der Schleier kommt, und besiege Vael.', goal: 1, value: (m) => (m.flags && m.flags.jenseits ? 1 : 0), hidden: true, title: 'Schleierlöser' });
  A({ id: 'shop_komplett', name: 'Sammler der Sterne', icon: '🌟', rarity: 'legendaer', desc: 'Kaufe alles im Kristall-Shop.', goal: 1, title: 'Sternensammler',
    value: (m) => (L.registry.all('unlock').every((u) => m.unlocks && m.unlocks[u.id]) ? 1 : 0) });
  A({ id: 'albtraum', name: 'Albtraum-Bezwinger', icon: '🌑', rarity: 'legendaer', desc: 'Gewinne auf der Stufe Albtraum.', goal: 1, value: (m) => (m.echoBest >= 5 ? 1 : 0), title: 'Albtraum-Bezwinger' });
  A({ id: 'mythensammler', name: 'Mythensammler', icon: '🐉', rarity: 'legendaer', desc: 'Fange alle einzigartigen Monster.', hidden: true, title: 'Mythensammler',
    goal: 1, value: (m) => {
      const uniques = L.registry.all('species').filter((s) => s.rarity === 'unique');
      return uniques.length && uniques.every((s) => m.dex[s.id] && m.dex[s.id].caught) ? 1 : 0;
    } });
  A({ id: 'sternenglanz', name: 'Sternenglanz', icon: '🌠', rarity: 'legendaer', desc: 'Fange 5 Schimmer-Monster.', goal: 5, value: stat('shinyCaught'), hidden: true, title: 'Sternenglanz' });
  A({ id: 'unermuedlich', name: 'Unermüdlich', icon: '🔥', rarity: 'legendaer', desc: 'Gewinne 500 Kämpfe.', goal: 500, value: stat('battlesWon'), title: 'Unermüdlich' });

  const RARITY = {
    gewoehnlich: { name: 'Gewöhnlich', crystals: 10, color: '#a8d5a2', order: 0 },
    selten: { name: 'Selten', crystals: 30, color: '#5fb4ff', order: 1 },
    episch: { name: 'Episch', crystals: 75, color: '#c084fc', order: 2 },
    legendaer: { name: 'Legendär', crystals: 200, color: '#ffd23f', order: 3 },
  };

  L.achievements = {
    RARITY,
    list() { return L.registry.all('achievement').slice().sort((a, b) => RARITY[a.rarity].order - RARITY[b.rarity].order); },
    value(meta, a) { return Math.max(0, Number(a.value(meta)) || 0); },
    progress(meta, a) { return Math.min(1, L.achievements.value(meta, a) / a.goal); },
    unlocked(meta, id) { return !!(meta.achievements && meta.achievements[id]); },
    completion(meta) {
      const all = L.registry.all('achievement');
      return all.filter((a) => L.achievements.unlocked(meta, a.id)).length / all.length;
    },
    // Prüft alle Erfolge, schaltet neue frei und vergibt die Belohnung. Gibt die neuen Erfolge zurück.
    check(meta) {
      const fresh = [];
      for (const a of L.registry.all('achievement')) {
        if (L.achievements.unlocked(meta, a.id)) continue;
        if (L.achievements.value(meta, a) < a.goal) continue;
        meta.achievements[a.id] = Date.now();
        const reward = RARITY[a.rarity].crystals;
        meta.crystals += reward;
        meta.totalCrystals += reward;
        if (a.title && meta.titles.indexOf(a.title) < 0) meta.titles.push(a.title);
        fresh.push(a);
      }
      return fresh;
    },
  };

  L.registry.addValidator('achievement', (def) => {
    const errs = [];
    if (!RARITY[def.rarity]) errs.push('unbekannte Seltenheit ' + def.rarity);
    if (!(def.goal > 0)) errs.push('Ziel fehlt');
    if (typeof def.value !== 'function') errs.push('value fehlt');
    return errs;
  });
})(globalThis.LUM);
