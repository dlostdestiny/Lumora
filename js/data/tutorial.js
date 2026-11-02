// Tutorial: Miras Tipps. Jeder Tipp erscheint einmal, wenn sein Auslöser zum ersten Mal passiert.
// trigger = Bildschirm oder Situation, target = CSS-Auswahl für das hervorgehobene Element (optional),
// when(ctx) = Zusatzbedingung (optional). Alle Tipps stehen auch in der Anleitung im Schrein.
(function (L) {
  const TRIGGERS = ['hub', 'echo', 'starter', 'blessing', 'map', 'battle', 'battleWild', 'battleTrainer', 'bondReady', 'lowHp', 'faint',
    'spring', 'shop', 'event', 'rewards', 'evolve', 'teamFull', 'boss', 'summary', 'questOffer', 'curse', 'weather', 'crystalshop', 'daily', 'chronicle', 'sets', 'talents', 'legend', 'fragment', 'double', 'egg', 'brutnest', 'companion'];
  const T = (def) => L.def.tip(def);

  // Grundlagen
  T({ id: 'willkommen', trigger: 'hub', order: 1, topic: 'Grundlagen', title: 'Willkommen am Schrein!',
    text: 'Hier beginnt jeder Lauf. Mit „Neuer Lauf“ ziehst du in den Wald. Wenn du verlierst, bringt dich der Echo-Stein hierher zurück: Kristalle, Lexikon und Erfolge bleiben dir.', target: '.hub-menu' });
  T({ id: 'spielerkarte', trigger: 'hub', order: 2, topic: 'Grundlagen', title: 'Deine Karte',
    text: 'Oben links siehst du deinen Namen, deinen Titel und wie viele Erfolge du hast. Klick drauf, um alle Erfolge zu sehen.', target: '.hub-player' });
  T({ id: 'echo_stufe', trigger: 'echo', order: 3, topic: 'Grundlagen', title: 'Echo-Stufen',
    text: 'Gewinnst du einen Lauf, schaltest du die nächste Echo-Stufe frei. Sie ist härter, gibt aber mehr Kristalle. Fang ruhig bei Stufe 0 an.' });
  T({ id: 'starter', trigger: 'starter', order: 4, topic: 'Grundlagen', title: 'Dein erster Gefährte',
    text: 'Jeder Starter hat einen Typ. Feuer schlägt Pflanze, Pflanze schlägt Wasser, Wasser schlägt Feuer … aber es gibt viel mehr Typen. Den Knopf „📊 Typen“ findest du im Kampf und im Schrein.' });
  T({ id: 'segen', trigger: 'blessing', order: 5, topic: 'Grundlagen', title: 'Ein Segen',
    text: 'Ein Segen hilft dir den ganzen Lauf über. Überleg dir, was zu deinem Starter passt.' });

  // Karte
  T({ id: 'karte', trigger: 'map', order: 10, topic: 'Die Karte', title: 'Die Karte',
    text: 'Du gehst Schritt für Schritt nach oben bis zum Wächter 👑. Du kannst nur zu Feldern, die mit deinem Feld verbunden sind. Die leuchtenden Felder kannst du jetzt betreten. Fahr mit der Maus darüber, um zu sehen, was dort wartet.', target: '.node.open' });
  T({ id: 'karte_felder', trigger: 'map', order: 11, topic: 'Die Karte', title: 'Was die Felder bedeuten',
    text: '⚔️ wildes Monster (fangbar) · 💀 Elite-Trainer (stark, gute Beute) · ⛲ Quelle · 🛒 Laden · ❓ Ereignis · 🗡️ Rivale. Plane deinen Weg: Zu viele Kämpfe ohne Quelle sind gefährlich, zu wenige machen dich zu schwach für den Wächter.' });
  T({ id: 'karte_team', trigger: 'map', order: 12, topic: 'Die Karte', title: 'Team und Tasche',
    text: 'Rechts siehst du dein Team, deine Tasche und deine Relikte. Unter „Team verwalten“ kannst du die Reihenfolge ändern und Items geben. Das erste Monster kämpft zuerst!', target: '.side' });
  T({ id: 'waechter', trigger: 'boss', order: 13, topic: 'Die Karte', title: 'Der Wächter',
    text: 'Wächter sind deutlich stärker als alles davor. Sie haben eigene Tricks. Ein gut gemischtes Team mit verschiedenen Typen hilft hier am meisten.' });

  // Kampf
  T({ id: 'kampf', trigger: 'battle', order: 20, topic: 'Kämpfen', title: 'Dein erster Kampf',
    text: 'Wähle eine Attacke (oder drück 1–4). Die Farbe zeigt den Typ. „⬆ sehr effektiv“ macht doppelten Schaden, „⬇ schwach“ nur halben. Wer schneller ist, greift zuerst an.', target: '.menu' });
  T({ id: 'kampf_info', trigger: 'battle', order: 21, topic: 'Kämpfen', title: 'Lebensbalken und Bindung',
    text: 'Grün sind die Kraftpunkte (KP). Der rosa Balken ist die Bindung: Sie wächst im Kampf. Bei 100 kannst du einmal pro Kampf eine starke Bindungs-Attacke einsetzen.', target: '.info.player' });
  T({ id: 'fangen', trigger: 'battleWild', order: 22, topic: 'Kämpfen', title: 'Monster fangen',
    text: 'Wilde Monster kannst du mit einer Kugel aus der 🎒 Tasche fangen. Je weniger KP und wenn es schläft oder gelähmt ist, desto besser die Chance. Aber Vorsicht: Kugeln sind knapp!', target: '[data-a="bag"]' });
  T({ id: 'trainer', trigger: 'battleTrainer', order: 23, topic: 'Kämpfen', title: 'Trainer-Kämpfe',
    text: 'Monster von Trainern kannst du nicht fangen. Manche Gegner haben besondere Eigenschaften (rote Abzeichen). Fahr mit der Maus darüber, um zu lesen, was sie tun.', target: '.info.enemy' });
  T({ id: 'doppelkampf', trigger: 'double', order: 28, topic: 'Kämpfen', title: 'Doppelkampf!',
    text: 'Zwei Trainer, zwei gegen zwei! Du wählst für jedes deiner beiden Monster eine Aktion (das leuchtende ist dran) und bei Angriffen das Ziel. Konzentriere dich auf einen Gegner, dann fällt er schneller. Mit ↩ Zurück änderst du die erste Wahl.', target: '.menu' });
  T({ id: 'bindung_bereit', trigger: 'bondReady', order: 24, topic: 'Kämpfen', title: 'Bindung bereit!',
    text: 'Dein Monster vertraut dir ganz. Die Bindungs-Attacke ist sehr stark, aber nur einmal pro Kampf. Heb sie dir für den richtigen Moment auf.', target: '[data-a="bond"]' });
  T({ id: 'wenig_kp', trigger: 'lowHp', order: 25, topic: 'Kämpfen', title: 'Es wird knapp!',
    text: 'Wenn ein Monster fällt, bleibt es bis zur nächsten Quelle besiegt. Manchmal ist es klüger, zu wechseln (🔄) oder einen Trank zu nehmen, als weiterzukämpfen.', target: '.menu-row' });
  T({ id: 'besiegt', trigger: 'faint', order: 26, topic: 'Kämpfen', title: 'Ein Monster ist gefallen',
    text: 'Besiegte Monster bekommen keine Erfahrung und helfen nicht mehr, bis sie geheilt werden. Fällt dein ganzes Team, endet der Lauf.' });

  // Unterwegs
  T({ id: 'quelle', trigger: 'spring', order: 30, topic: 'Unterwegs', title: 'Die Quelle',
    text: 'Hier musst du dich entscheiden: Heilen, Trainieren oder eine Attacke verbessern. Nur eins! Heilen ist sicher, aber wer immer nur heilt, wird zu schwach. Das ist die wichtigste Entscheidung im Spiel.' });
  T({ id: 'laden', trigger: 'shop', order: 31, topic: 'Unterwegs', title: 'Lottes Laden',
    text: 'Gold gibt es nur im Lauf, also gib es ruhig aus. Kugeln, Tränke und Relikte sind alle nützlich. Überleg, was dir gerade fehlt.' });
  T({ id: 'ereignis', trigger: 'event', order: 32, topic: 'Unterwegs', title: 'Ereignisse',
    text: 'Bei Ereignissen entscheidest du selbst. Manche Wahl ist ein Risiko, manche eine Chance. Und manche führen zu Geheimnissen …' });
  T({ id: 'belohnung', trigger: 'rewards', order: 33, topic: 'Unterwegs', title: 'Beute wählen',
    text: 'Nach einem Kampf darfst du oft eine von mehreren Belohnungen wählen. Relikte wirken den ganzen Lauf, Schriftrollen bringen neue Attacken.' });
  T({ id: 'team_voll', trigger: 'teamFull', order: 34, topic: 'Unterwegs', title: 'Team voll',
    text: 'Du kannst nur wenige Monster gleichzeitig mitnehmen. Wen nimmst du mit? Achte auf verschiedene Typen statt nur auf das höchste Level.' });
  T({ id: 'entwicklung', trigger: 'evolve', order: 35, topic: 'Unterwegs', title: 'Entwicklung',
    text: 'Dein Monster will sich entwickeln! Es wird stärker und lernt oft neue Attacken. Du kannst auch ablehnen; dann fragt es später noch einmal.' });

  T({ id: 'auftraege', trigger: 'questOffer', order: 36, topic: 'Unterwegs', title: 'Nebenaufträge',
    text: 'Zu Beginn jedes Akts darfst du einen Auftrag annehmen. Schaffst du ihn, gibt es eine Belohnung. Wähle einen, der zu deinem Weg passt! Deinen Fortschritt siehst du rechts.' });
  T({ id: 'fluch', trigger: 'curse', order: 37, topic: 'Unterwegs', title: 'Verfluchte Truhen',
    text: 'Verfluchte Truhen geben starke Relikte, aber ein Fluch schwächt dich, bis du ihn loswirst. Reinigen kannst du ihn an einer Quelle (statt zu heilen!) oder bei Lotte für Gold.' });
  T({ id: 'wetter', trigger: 'weather', order: 14, topic: 'Die Karte', title: 'Wetterzonen',
    text: 'Farbige Bänder auf der Karte sind Wetterzonen. Kämpfe dort beginnen mit diesem Wetter, und passende Monster tauchen öfter auf. Bei Strömung ist ein Flut-Monster stark, bei Glutregen ein Glut-Monster.', target: '.wzone' });
  T({ id: 'sets', trigger: 'sets', order: 15, topic: 'Die Karte', title: 'Relikt-Sets', target: '.sets',
    text: 'Manche Relikte gehören zu einem Set. Hast du alle drei Teile, bekommst du einen starken Bonus. Relikte mit goldenem Rand gehören zu einem Set.' });

  // Schrein
  T({ id: 'kristallshop', trigger: 'crystalshop', order: 41, topic: 'Nach dem Lauf', title: 'Der Kristall-Shop',
    text: 'Hier tauschst du Kristalle gegen dauerhafte Dinge: neue Starter, neue Segen, Relikt-Sets und kleine Vorteile. Die Vorteile sind bewusst klein, das Spiel bleibt fordernd!' });
  T({ id: 'tages', trigger: 'daily', order: 42, topic: 'Nach dem Lauf', title: 'Tages-Herausforderung',
    text: 'Jeden Tag gibt es einen neuen festen Lauf mit besonderer Regel. Nur der erste Versuch zählt. Spiel jeden Tag für eine lange Serie!' });
  T({ id: 'chronik', trigger: 'chronicle', order: 43, topic: 'Nach dem Lauf', title: 'Die Chronik',
    text: 'Hier stehen deine letzten Läufe: welches Team, wie weit, und woran du gescheitert bist. Dein „Erzfeind“ zeigt, wer dich am öftesten besiegt hat.' });

  T({ id: 'talente', trigger: 'talents', order: 44, topic: 'Nach dem Lauf', title: 'Rang und Talente',
    text: 'Nach jedem Lauf wächst dein Bannträger-Rang. Jeder Rang gibt einen Talentpunkt für Kämpfer, Hüter oder Sammler. So wirst du Lauf für Lauf stärker. Ab Rang 3, 6 und 10 warten neue Starter!' });

  T({ id: 'legende', trigger: 'legend', order: 27, topic: 'Kämpfen', title: 'Eine Legende!',
    text: 'Einzigartige Monster kämpfen als Legende: höheres Level, stärkere Werte, sie heilen sich jede Runde und sind sehr schwer zu fangen. Schwäche sie, lähme oder schläfere sie ein und nimm deine besten Kugeln!' });

  T({ id: 'fragment', trigger: 'fragment', order: 38, topic: 'Unterwegs', title: 'Sternenfragmente',
    text: 'Du hast ein Sternenfragment gefunden! Fragmente bleiben für immer bei dir. In jedem Akt gibt es drei: beim Wächter, auf dem versteckten Pfad 🔮 und in einem seltenen Sternensplitter. Mit allen neun passiert etwas Besonderes …' });

  T({ id: 'ei', trigger: 'egg', order: 39, topic: 'Unterwegs', title: 'Ein Ei!',
    text: 'Eier kommen nach dem Lauf in dein Brutnest im Schrein. Deine Läufe wärmen sie: je weiter du kommst, desto schneller schlüpfen sie.' });
  T({ id: 'brutnest', trigger: 'brutnest', order: 45, topic: 'Nach dem Lauf', title: 'Das Brutnest',
    text: 'Wähle für jedes Ei eine Pflege: Wärmen, Vorsingen, Kristall oder Mondlicht. Geschlüpfte Monster leben im Hort und können als Begleiter mit in einen Lauf. Am Laufende kannst du außerdem Monster mit Bronze-Meisterschaft in der Pflegestation lassen, dann legen sie ein Zuchtei.' });

  T({ id: 'begleiter', trigger: 'companion', order: 6, topic: 'Grundlagen', title: 'Begleiter',
    text: 'Du kannst einen Begleiter mitnehmen: einen Schlüpfling aus deinem Hort oder dein Echo. Das Echo ist dein stärkstes Monster aus dem letzten Lauf. Es kommt schwächer zurück, kennt aber seine alten Attacken, und verblasst danach.' });

  // Nach dem Lauf
  T({ id: 'zusammenfassung', trigger: 'summary', order: 40, topic: 'Nach dem Lauf', title: 'Das Echo',
    text: 'Egal ob Sieg oder Niederlage: Du bekommst Kristalle, und alles, was du gesehen hast, bleibt im Lexikon. Jeder Lauf macht dich klüger. Nur Mut!' });

  L.tutorial = {
    TRIGGERS,
    TOPICS: ['Grundlagen', 'Die Karte', 'Kämpfen', 'Unterwegs', 'Nach dem Lauf'],
    list() { return L.registry.all('tip').slice().sort((a, b) => a.order - b.order); },
    seen(meta, id) { return !!(meta.tipsSeen && meta.tipsSeen[id]); },
    // Ungesehene Tipps für einen Auslöser, in Reihenfolge.
    pending(meta, trigger, ctx) {
      return L.tutorial.list().filter((t) => t.trigger === trigger && !L.tutorial.seen(meta, t.id) && (!t.when || t.when(ctx || {})));
    },
    markSeen(meta, id) { meta.tipsSeen[id] = true; },
    reset(meta) { meta.tipsSeen = {}; },
  };

  L.registry.addValidator('tip', (def) => {
    const errs = [];
    if (TRIGGERS.indexOf(def.trigger) < 0) errs.push('unbekannter Auslöser ' + def.trigger);
    if (!def.title || !def.text) errs.push('Titel oder Text fehlt');
    if (typeof def.order !== 'number') errs.push('order fehlt');
    return errs;
  });
})(globalThis.LUM);
