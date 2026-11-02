// Attacken. power 0 = Status-Attacke, accuracy 0 = trifft immer.
// Jede Attacke hat zwei Verbesserungen (a/b), zwischen denen man an Quellen wählt.
(function (L) {
  const st = (status, chance, target) => ({ kind: 'status', status, chance, target: target || 'foe' });
  const stage = (stat, delta, chance, target) => ({ kind: 'stage', stat, delta, chance: chance == null ? 1 : chance, target: target || 'foe' });
  const self = (stat, delta) => stage(stat, delta, 1, 'self');

  function move(id, name, type, power, accuracy, effects, upgrades, extra) {
    L.def.move(Object.assign({ id, name, type, power, accuracy, priority: 0, effects: effects || [], contact: power > 0, upgrades }, extra || {}));
  }
  // Standard-Verbesserungen: a = stärker, b = Zusatzeffekt.
  const strong = (name, power, acc) => Object.assign({ name: name + '+' }, power ? { power } : {}, acc ? { accuracy: acc } : {});
  const extra = (name, suffix, fields) => Object.assign({ name: name + ' ' + suffix }, fields);

  // --- Typlos ---
  move('rempler', 'Rempler', null, 40, 100, [], { a: strong('Rempler', 55), b: extra('Rempler', '(Flink)', { priority: 1 }) }, { desc: 'Ein einfacher Körperstoß.' });
  move('kratzer', 'Kratzer', null, 40, 100, [], { a: strong('Kratzer', 55), b: extra('Kratzer', '(Scharf)', { effects: [{ kind: 'critUp' }] }) }, { desc: 'Kratzt mit scharfen Krallen.' });
  move('brueller', 'Brüller', null, 0, 100, [stage('atk', -1)], { a: extra('Brüller', '(Laut)', { effects: [stage('atk', -2)] }), b: extra('Brüller', '(Schrill)', { effects: [stage('atk', -1), stage('def', -1)] }) }, { desc: 'Senkt den Angriff des Gegners.' });
  move('konzentration', 'Konzentration', null, 0, 0, [{ kind: 'critUp' }], { a: extra('Konzentration', '(Tief)', { effects: [{ kind: 'critUp' }, self('acc', 1)] }), b: extra('Konzentration', '(Ruhig)', { effects: [{ kind: 'critUp' }, { kind: 'heal', fraction: 0.15, target: 'self' }] }) }, { desc: 'Erhöht die Volltreffer-Chance.' });
  move('verzweiflung', 'Verzweiflung', null, 40, 0, [{ kind: 'recoil', fraction: 0.25 }], { a: strong('Verzweiflung', 50), b: strong('Verzweiflung', 50) }, { hidden: true, desc: 'Letzter Ausweg.' });

  // --- Glut ---
  move('glutbiss', 'Glutbiss', 'glut', 50, 100, [st('brand', 0.1)], { a: strong('Glutbiss', 65), b: extra('Glutbiss', '(Sengend)', { effects: [st('brand', 0.3)] }) }, { desc: 'Ein glühender Biss. Kann verbrennen.' });
  move('funkenregen', 'Funkenregen', 'glut', 70, 90, [st('brand', 0.2)], { a: strong('Funkenregen', 85), b: extra('Funkenregen', '(Präzise)', { accuracy: 100 }) }, { contact: false, desc: 'Ein Regen aus Glutfunken.' });
  move('flammenwirbel', 'Flammenwirbel', 'glut', 90, 85, [st('brand', 0.1)], { a: strong('Flammenwirbel', 105), b: extra('Flammenwirbel', '(Ruhig)', { accuracy: 95 }) }, { contact: false, desc: 'Ein mächtiger Feuerstrudel.' });
  move('aufheizen', 'Aufheizen', 'glut', 0, 0, [self('atk', 1)], { a: extra('Aufheizen', '(Lodernd)', { effects: [self('atk', 2)] }), b: extra('Aufheizen', '(Glimmend)', { effects: [self('atk', 1), self('spe', 1)] }) }, { desc: 'Erhöht den eigenen Angriff.' });
  move('glutatem', 'Glutatem', 'glut', 0, 0, [{ kind: 'weather', weather: 'glutregen' }], { a: extra('Glutatem', '(Heiß)', { effects: [{ kind: 'weather', weather: 'glutregen' }, self('atk', 1)] }), b: extra('Glutatem', '(Schnell)', { priority: 1 }) }, { desc: 'Ruft Glutregen herbei.' });

  // --- Flut ---
  move('wasserschuss', 'Wasserschuss', 'flut', 45, 100, [], { a: strong('Wasserschuss', 60), b: extra('Wasserschuss', '(Flink)', { priority: 1 }) }, { contact: false, desc: 'Ein schneller Wasserstrahl.' });
  move('blubberstrahl', 'Blubberstrahl', 'flut', 60, 100, [stage('spe', -1, 0.3)], { a: strong('Blubberstrahl', 75), b: extra('Blubberstrahl', '(Zäh)', { effects: [stage('spe', -1, 1)] }) }, { contact: false, desc: 'Blasen, die den Gegner verlangsamen können.' });
  move('flutwelle', 'Flutwelle', 'flut', 90, 85, [], { a: strong('Flutwelle', 105), b: extra('Flutwelle', '(Ruhig)', { accuracy: 95 }) }, { contact: false, desc: 'Eine gewaltige Welle.' });
  move('quellwasser', 'Quellwasser', 'flut', 0, 0, [{ kind: 'heal', fraction: 0.5, target: 'self' }], { a: extra('Quellwasser', '(Rein)', { effects: [{ kind: 'heal', fraction: 0.5, target: 'self' }, { kind: 'cleanse', target: 'self' }] }), b: extra('Quellwasser', '(Sprudelnd)', { effects: [{ kind: 'heal', fraction: 0.65, target: 'self' }] }) }, { desc: 'Heilt die Hälfte der KP.' });
  move('regentanz', 'Regentanz', 'flut', 0, 0, [{ kind: 'weather', weather: 'stroemung' }], { a: extra('Regentanz', '(Wild)', { effects: [{ kind: 'weather', weather: 'stroemung' }, self('spe', 1)] }), b: extra('Regentanz', '(Schnell)', { priority: 1 }) }, { desc: 'Ruft Strömung herbei.' });

  // --- Spross ---
  move('rankenhieb', 'Rankenhieb', 'spross', 45, 100, [], { a: strong('Rankenhieb', 60), b: extra('Rankenhieb', '(Scharf)', { effects: [{ kind: 'critUp' }] }) }, { desc: 'Peitscht mit Ranken.' });
  move('saugwurzel', 'Saugwurzel', 'spross', 55, 100, [{ kind: 'drain', fraction: 0.5 }], { a: strong('Saugwurzel', 70), b: extra('Saugwurzel', '(Gierig)', { effects: [{ kind: 'drain', fraction: 0.75 }] }) }, { desc: 'Saugt Kraft ab und heilt sich.' });
  move('blattwirbel', 'Blattwirbel', 'spross', 80, 90, [], { a: strong('Blattwirbel', 95), b: extra('Blattwirbel', '(Scharf)', { effects: [{ kind: 'critUp' }] }) }, { contact: false, desc: 'Ein Sturm aus scharfen Blättern.' });
  move('sporen', 'Sporen', 'spross', 0, 75, [st('schlaf', 1)], { a: extra('Sporen', '(Dicht)', { accuracy: 90 }), b: extra('Sporen', '(Giftig)', { effects: [st('schlaf', 1), st('gift', 0.3)] }) }, { desc: 'Schläfert den Gegner ein.' });
  move('wachstum', 'Wachstum', 'spross', 0, 0, [self('atk', 1), self('def', 1)], { a: extra('Wachstum', '(Üppig)', { effects: [self('atk', 2), self('def', 1)] }), b: extra('Wachstum', '(Heilend)', { effects: [self('atk', 1), self('def', 1), { kind: 'heal', fraction: 0.2, target: 'self' }] }) }, { desc: 'Erhöht Angriff und Verteidigung.' });
  move('dornenwirbel', 'Dornenwirbel', 'spross', 85, 90, [st('gift', 0.2)], { a: strong('Dornenwirbel', 100), b: extra('Dornenwirbel', '(Giftig)', { effects: [st('gift', 0.5)] }) }, { contact: false, desc: 'Ein Wirbel aus giftigen Dornen.' });

  // --- Funke ---
  move('funkenstoss', 'Funkenstoß', 'funke', 45, 100, [st('laehmung', 0.1)], { a: strong('Funkenstoß', 60), b: extra('Funkenstoß', '(Knisternd)', { effects: [st('laehmung', 0.3)] }) }, { desc: 'Ein elektrischer Stoß. Kann lähmen.' });
  move('blitzschlag', 'Blitzschlag', 'funke', 85, 85, [st('laehmung', 0.2)], { a: strong('Blitzschlag', 100), b: extra('Blitzschlag', '(Gezielt)', { accuracy: 95 }) }, { contact: false, desc: 'Ein krachender Blitz.' });
  move('schockwelle', 'Schockwelle', 'funke', 0, 90, [st('laehmung', 1)], { a: extra('Schockwelle', '(Stark)', { accuracy: 100 }), b: extra('Schockwelle', '(Weit)', { effects: [st('laehmung', 1), stage('spe', -1, 1)] }) }, { desc: 'Lähmt den Gegner.' });
  move('surren', 'Surren', 'funke', 0, 0, [self('spe', 2)], { a: extra('Surren', '(Laut)', { effects: [self('spe', 2), self('atk', 1)] }), b: extra('Surren', '(Leise)', { effects: [self('spe', 1), self('eva', 1)] }) }, { desc: 'Erhöht das Tempo stark.' });
  move('sturmruf', 'Sturmruf', 'funke', 0, 0, [{ kind: 'weather', weather: 'sturm' }], { a: extra('Sturmruf', '(Tosend)', { effects: [{ kind: 'weather', weather: 'sturm' }, self('spe', 1)] }), b: extra('Sturmruf', '(Schnell)', { priority: 1 }) }, { desc: 'Ruft einen Sturm herbei.' });
  move('funkenschweif', 'Funkenschweif', 'funke', 65, 95, [], { a: strong('Funkenschweif', 80), b: extra('Funkenschweif', '(Flink)', { priority: 1 }) }, { desc: 'Ein Schlag mit geladenem Schweif.' });

  // --- Stein ---
  move('steinwurf', 'Steinwurf', 'stein', 50, 95, [], { a: strong('Steinwurf', 65), b: extra('Steinwurf', '(Genau)', { accuracy: 100 }) }, { contact: false, desc: 'Wirft einen Stein.' });
  move('kieselhagel', 'Kieselhagel', 'stein', 20, 90, [{ kind: 'multiHit', min: 2, max: 4 }], { a: strong('Kieselhagel', 25), b: extra('Kieselhagel', '(Dicht)', { effects: [{ kind: 'multiHit', min: 3, max: 5 }] }) }, { contact: false, desc: 'Trifft 2–4 Mal.' });
  move('felsbrocken', 'Felsbrocken', 'stein', 85, 85, [], { a: strong('Felsbrocken', 100), b: extra('Felsbrocken', '(Schwer)', { effects: [stage('spe', -1, 0.5)] }) }, { contact: false, desc: 'Schleudert einen riesigen Fels.' });
  move('haerten', 'Härten', 'stein', 0, 0, [self('def', 1)], { a: extra('Härten', '(Diamant)', { effects: [self('def', 2)] }), b: extra('Härten', '(Stachel)', { effects: [self('def', 1), self('atk', 1)] }) }, { desc: 'Erhöht die Verteidigung.' });
  move('erdstoss', 'Erdstoß', 'stein', 65, 100, [], { a: strong('Erdstoß', 80), b: extra('Erdstoß', '(Bebend)', { effects: [stage('def', -1, 0.3)] }) }, { desc: 'Ein Stoß mit voller Wucht.' });

  // --- Schatten ---
  move('schattenklaue', 'Schattenklaue', 'schatten', 50, 100, [{ kind: 'critUp' }], { a: strong('Schattenklaue', 65), b: extra('Schattenklaue', '(Tückisch)', { effects: [{ kind: 'critUp' }, stage('def', -1, 0.2)] }) }, { desc: 'Krallen aus Schatten. Hohe Volltreffer-Chance.' });
  move('nachtbiss', 'Nachtbiss', 'schatten', 65, 100, [stage('def', -1, 0.2)], { a: strong('Nachtbiss', 80), b: extra('Nachtbiss', '(Furchtbar)', { effects: [stage('def', -1, 0.5)] }) }, { desc: 'Ein dunkler Biss.' });
  move('schreckblick', 'Schreckblick', 'schatten', 0, 100, [stage('atk', -1), stage('spe', -1)], { a: extra('Schreckblick', '(Starr)', { effects: [stage('atk', -2), stage('spe', -1)] }), b: extra('Schreckblick', '(Wirr)', { effects: [stage('atk', -1), { kind: 'confuse', chance: 0.5 }] }) }, { desc: 'Senkt Angriff und Tempo.' });
  move('gifthauch', 'Gifthauch', 'schatten', 0, 90, [st('gift', 1)], { a: extra('Gifthauch', '(Dicht)', { accuracy: 100 }), b: extra('Gifthauch', '(Lähmend)', { effects: [st('gift', 1), stage('spe', -1, 1)] }) }, { desc: 'Vergiftet den Gegner.' });
  move('finsterstoss', 'Finsterstoß', 'schatten', 85, 90, [], { a: strong('Finsterstoß', 100), b: extra('Finsterstoß', '(Ruhig)', { accuracy: 100 }) }, { desc: 'Ein Angriff aus der Dunkelheit.' });
  move('irrlichtschein', 'Irrlichtschein', 'schatten', 60, 100, [{ kind: 'confuse', chance: 0.3 }], { a: strong('Irrlichtschein', 75), b: extra('Irrlichtschein', '(Verwirrend)', { effects: [{ kind: 'confuse', chance: 0.6 }] }) }, { contact: false, desc: 'Ein flackerndes Licht. Kann verwirren.' });

  // --- Akt 2: Vulkan und Grotten ---
  move('lavaguss', 'Lavaguss', 'glut', 100, 85, [st('brand', 0.2)], { a: strong('Lavaguss', 115), b: extra('Lavaguss', '(Zäh)', { accuracy: 95 }) }, { contact: false, desc: 'Ein Schwall glühender Lava.' });
  move('schmiedehammer', 'Schmiedehammer', 'glut', 80, 95, [], { a: strong('Schmiedehammer', 95), b: extra('Schmiedehammer', '(Glühend)', { effects: [st('brand', 0.3)] }) }, { desc: 'Ein Schlag wie auf dem Amboss.' });
  move('felssturz', 'Felssturz', 'stein', 75, 90, [stage('spe', -1, 0.5)], { a: strong('Felssturz', 90), b: extra('Felssturz', '(Lawine)', { effects: [stage('spe', -1, 1)] }) }, { contact: false, desc: 'Felsen prasseln herab. Kann das Tempo senken.' });
  move('kristallsplitter', 'Kristallsplitter', 'stein', 60, 100, [{ kind: 'critUp' }], { a: strong('Kristallsplitter', 75), b: extra('Kristallsplitter', '(Funkelnd)', { priority: 1 }) }, { contact: false, desc: 'Scharfe Kristalle. Trifft oft kritisch.' });
  move('geysir', 'Geysir', 'flut', 80, 90, [], { a: strong('Geysir', 95), b: extra('Geysir', '(Heiß)', { effects: [st('brand', 0.2)] }) }, { contact: false, desc: 'Eine kochend heiße Wasserfontäne.' });
  move('russwolke', 'Rußwolke', 'schatten', 0, 90, [stage('acc', -1)], { a: extra('Rußwolke', '(Dicht)', { effects: [stage('acc', -2)] }), b: extra('Rußwolke', '(Beißend)', { effects: [stage('acc', -1), stage('def', -1)] }) }, { desc: 'Dichter Ruß senkt die Genauigkeit.' });
  move('schattenfunke', 'Schattenfunke', 'schatten', 70, 95, [st('brand', 0.1)], { a: strong('Schattenfunke', 85), b: extra('Schattenfunke', '(Lodernd)', { effects: [st('brand', 0.3)] }) }, { contact: false, desc: 'Ein dunkles Feuer, das nicht wärmt.' });
  move('zischflug', 'Zischflug', 'funke', 70, 95, [], { a: strong('Zischflug', 85), b: extra('Zischflug', '(Flink)', { priority: 1 }) }, { desc: 'Ein blitzschneller Sturzflug.' });
  move('sternsplitter', 'Sternsplitter', 'stern', 55, 100, [], { a: strong('Sternsplitter', 70), b: extra('Sternsplitter', '(Hell)', { effects: [{ kind: 'critUp' }] }) }, { contact: false, signature: true, desc: 'Ein Splitter aus Sternenlicht. Fast alles ist dagegen schwach.' });
  move('schmiedeglut', 'Schmiedeglut', 'glut', 95, 90, [st('brand', 0.3)], { a: strong('Schmiedeglut', 110), b: extra('Schmiedeglut', '(Rein)', { accuracy: 100 }) }, { contact: false, signature: true, desc: 'Das Feuer der Großen Schmiede.' });

  // --- Akt 3: Sturmgipfel ---
  move('donnerkeil', 'Donnerkeil', 'funke', 95, 85, [st('laehmung', 0.2)], { a: strong('Donnerkeil', 110), b: extra('Donnerkeil', '(Gezielt)', { accuracy: 95 }) }, { contact: false, desc: 'Ein gewaltiger Blitz vom Himmel.' });
  move('sturmklaue', 'Sturmklaue', 'funke', 75, 100, [{ kind: 'critUp' }], { a: strong('Sturmklaue', 90), b: extra('Sturmklaue', '(Flink)', { priority: 1 }) }, { desc: 'Klauen schnell wie der Wind. Trifft oft kritisch.' });
  move('mondsichel', 'Mondsichelhieb', 'schatten', 80, 95, [{ kind: 'critUp' }], { a: strong('Mondsichelhieb', 95), b: extra('Mondsichelhieb', '(Kalt)', { effects: [{ kind: 'critUp' }, stage('def', -1, 0.3)] }) }, { desc: 'Ein Hieb wie die Sichel des Mondes.' });
  move('wolkenbruch', 'Wolkenbruch', 'flut', 85, 90, [], { a: strong('Wolkenbruch', 100), b: extra('Wolkenbruch', '(Kalt)', { effects: [stage('spe', -1, 0.5)] }) }, { contact: false, desc: 'Ein plötzlicher Sturzregen.' });
  move('lawine', 'Lawine', 'stein', 90, 85, [stage('spe', -1, 0.3)], { a: strong('Lawine', 105), b: extra('Lawine', '(Schwer)', { effects: [stage('spe', -1, 1)] }) }, { contact: false, desc: 'Schnee und Felsen donnern den Hang hinab.' });
  move('alpenhauch', 'Alpenhauch', 'spross', 70, 100, [{ kind: 'drain', fraction: 0.3 }], { a: strong('Alpenhauch', 85), b: extra('Alpenhauch', '(Heilsam)', { effects: [{ kind: 'drain', fraction: 0.5 }] }) }, { contact: false, desc: 'Frische Bergluft, die Kraft schenkt.' });
  move('sternenregen', 'Sternenregen', 'stern', 70, 95, [], { a: strong('Sternenregen', 85), b: extra('Sternenregen', '(Hell)', { accuracy: 100 }) }, { contact: false, signature: true, desc: 'Sternschnuppen prasseln herab.' });
  move('himmelszorn', 'Himmelszorn', 'funke', 100, 90, [st('laehmung', 0.3)], { a: strong('Himmelszorn', 115), b: extra('Himmelszorn', '(Rein)', { accuracy: 100 }) }, { contact: false, signature: true, desc: 'Der Zorn des ganzen Himmels.' });
  move('schleiergesang', 'Schleiergesang', 'frost', 110, 90, [st('frost', 0.2)], { a: strong('Schleiergesang', 125), b: extra('Schleiergesang', '(Rein)', { accuracy: 100 }) }, { contact: false, signature: true, desc: 'Ein Lied aus Eis und Erinnerung, das alles erstarren lässt.' });

  // --- Frost ---
  move('frosthauch', 'Frosthauch', 'frost', 45, 100, [stage('spe', -1, 0.2), st('frost', 0.1)], { a: strong('Frosthauch', 60), b: extra('Frosthauch', '(Klirrend)', { effects: [stage('spe', -1, 0.5)] }) }, { contact: false, desc: 'Ein eisiger Hauch. Kann verlangsamen.' });
  move('eissplitter', 'Eissplitter', 'frost', 60, 100, [{ kind: 'critUp' }], { a: strong('Eissplitter', 75), b: extra('Eissplitter', '(Flink)', { priority: 1 }) }, { contact: false, desc: 'Scharfe Eissplitter. Trifft oft kritisch.' });
  move('frostbiss', 'Frostbiss', 'frost', 75, 95, [stage('spe', -1, 0.3), st('frost', 0.1)], { a: strong('Frostbiss', 90), b: extra('Frostbiss', '(Eisig)', { effects: [stage('spe', -1, 0.6)] }) }, { desc: 'Ein Biss mit eiskalten Zähnen.' });
  move('blizzard', 'Blizzard', 'frost', 95, 80, [st('frost', 0.15)], { a: strong('Blizzard', 110), b: extra('Blizzard', '(Ruhig)', { accuracy: 90 }) }, { contact: false, desc: 'Ein tobender Schneesturm.' });
  move('eispanzer', 'Eispanzer', 'frost', 0, 0, [self('def', 2)], { a: extra('Eispanzer', '(Dick)', { effects: [self('def', 3)] }), b: extra('Eispanzer', '(Glatt)', { effects: [self('def', 1), self('eva', 1)] }) }, { desc: 'Hüllt sich in Eis. Verteidigung +2.' });
  move('schneeruf', 'Schneeruf', 'frost', 0, 0, [{ kind: 'weather', weather: 'schneesturm' }], { a: extra('Schneeruf', '(Kalt)', { effects: [{ kind: 'weather', weather: 'schneesturm' }, self('def', 1)] }), b: extra('Schneeruf', '(Schnell)', { priority: 1 }) }, { desc: 'Ruft einen Schneesturm herbei.' });
  // --- Wind ---
  move('windstoss', 'Windstoß', 'wind', 45, 100, [], { a: strong('Windstoß', 60), b: extra('Windstoß', '(Flink)', { priority: 1 }) }, { contact: false, desc: 'Ein kräftiger Windstoß.' });
  move('boe', 'Böe', 'wind', 65, 100, [], { a: strong('Böe', 80), b: extra('Böe', '(Wirbelnd)', { effects: [stage('acc', -1, 0.3)] }) }, { contact: false, desc: 'Eine plötzliche, harte Böe.' });
  move('wirbelsturm', 'Wirbelsturm', 'wind', 90, 85, [], { a: strong('Wirbelsturm', 105), b: extra('Wirbelsturm', '(Ruhig)', { accuracy: 95 }) }, { contact: false, desc: 'Ein reißender Wirbelsturm.' });
  move('rueckenwind', 'Rückenwind', 'wind', 0, 0, [self('spe', 2)], { a: extra('Rückenwind', '(Stark)', { effects: [self('spe', 2), self('atk', 1)] }), b: extra('Rückenwind', '(Sanft)', { effects: [self('spe', 1), { kind: 'heal', fraction: 0.2, target: 'self' }] }) }, { desc: 'Der Wind im Rücken. Tempo +2.' });
  move('wirbeltanz', 'Wirbeltanz', 'wind', 0, 90, [{ kind: 'confuse', chance: 1 }], { a: extra('Wirbeltanz', '(Wild)', { effects: [{ kind: 'confuse', chance: 1 }, self('spe', 1)] }), b: extra('Wirbeltanz', '(Sicher)', { accuracy: 100 }) }, { desc: 'Wirbelt den Gegner herum. Verwirrt ihn.' });
  move('eiskaefig', 'Eiskäfig', 'frost', 0, 80, [st('frost', 1)], { a: extra('Eiskäfig', '(Dicht)', { accuracy: 90 }), b: extra('Eiskäfig', '(Kalt)', { effects: [st('frost', 1), stage('spe', -1, 1)] }) }, { desc: 'Schließt den Gegner in Eis ein.' });
  // --- Metall ---
  move('eisenkralle', 'Eisenkralle', 'metall', 50, 100, [], { a: strong('Eisenkralle', 65), b: extra('Eisenkralle', '(Scharf)', { effects: [{ kind: 'critUp' }] }) }, { desc: 'Krallen hart wie Eisen.' });
  move('stahlschlag', 'Stahlschlag', 'metall', 75, 95, [stage('def', -1, 0.2)], { a: strong('Stahlschlag', 90), b: extra('Stahlschlag', '(Brechend)', { effects: [stage('def', -1, 0.5)] }) }, { desc: 'Ein Schlag wie ein Schmiedehammer aus Stahl.' });
  move('metallsturm', 'Metallsturm', 'metall', 90, 85, [], { a: strong('Metallsturm', 105), b: extra('Metallsturm', '(Präzise)', { accuracy: 95 }) }, { contact: false, desc: 'Ein Hagel aus glänzenden Metallsplittern.' });
  move('magnetfeld', 'Magnetfeld', 'metall', 0, 0, [self('def', 1), self('atk', 1)], { a: extra('Magnetfeld', '(Stark)', { effects: [self('def', 2), self('atk', 1)] }), b: extra('Magnetfeld', '(Flink)', { effects: [self('def', 1), self('spe', 1)] }) }, { desc: 'Ein Magnetfeld stärkt Angriff und Verteidigung.' });

  // --- Uralte Attacken (nur über das Merkmal „Uralt“) ---
  move('urflamme', 'Urflamme', 'glut', 95, 95, [st('brand', 0.2)], { a: strong('Urflamme', 110), b: extra('Urflamme', '(Ewig)', { accuracy: 100 }) }, { ancient: true, contact: false, desc: 'Ein Feuer aus alter Zeit.' });
  move('urflut', 'Urflut', 'flut', 95, 95, [{ kind: 'heal', fraction: 0.1, target: 'self' }], { a: strong('Urflut', 110), b: extra('Urflut', '(Ewig)', { accuracy: 100 }) }, { ancient: true, contact: false, desc: 'Wasser aus der ersten Quelle.' });
  move('urwurzel', 'Urwurzel', 'spross', 95, 95, [{ kind: 'drain', fraction: 0.3 }], { a: strong('Urwurzel', 110), b: extra('Urwurzel', '(Ewig)', { accuracy: 100 }) }, { ancient: true, desc: 'Wurzeln, älter als der Wald.' });
  move('urblitz', 'Urblitz', 'funke', 95, 95, [st('laehmung', 0.2)], { a: strong('Urblitz', 110), b: extra('Urblitz', '(Ewig)', { accuracy: 100 }) }, { ancient: true, contact: false, desc: 'Der allererste Blitz.' });
  move('urfels', 'Urfels', 'stein', 95, 95, [self('def', 1)], { a: strong('Urfels', 110), b: extra('Urfels', '(Ewig)', { accuracy: 100 }) }, { ancient: true, contact: false, desc: 'Ein Brocken aus dem Kern der Welt.' });
  move('urschatten', 'Urschatten', 'schatten', 95, 95, [{ kind: 'critUp' }], { a: strong('Urschatten', 110), b: extra('Urschatten', '(Ewig)', { accuracy: 100 }) }, { ancient: true, desc: 'Ein Schatten von vor dem Schleier.' });

  L.moves = {
    resolve(ref) {
      const base = L.registry.get('move', ref.id);
      if (!ref.upgrade) return base;
      const up = base.upgrades[ref.upgrade];
      return Object.assign({}, base, up, { id: base.id, upgraded: ref.upgrade, baseName: base.name });
    },
  };

  const EFFECT_KINDS = ['status', 'stage', 'heal', 'drain', 'recoil', 'weather', 'confuse', 'critUp', 'multiHit', 'cleanse'];
  const STATS = ['atk', 'def', 'spe', 'acc', 'eva'];
  function checkEffects(effects, reg) {
    const errs = [];
    for (const e of effects || []) {
      if (EFFECT_KINDS.indexOf(e.kind) < 0) errs.push('unbekannter Effekt ' + e.kind);
      if (e.kind === 'status' && !reg.has('status', e.status)) errs.push('unbekannter Status ' + e.status);
      if (e.kind === 'weather' && !reg.has('weather', e.weather)) errs.push('unbekanntes Wetter ' + e.weather);
      if (e.kind === 'stage' && STATS.indexOf(e.stat) < 0) errs.push('unbekannter Wert ' + e.stat);
    }
    return errs;
  }
  L.registry.addValidator('move', (def, reg) => {
    const errs = [];
    if (def.type && !reg.has('type', def.type)) errs.push('unbekannter Typ ' + def.type);
    if (!def.upgrades || !def.upgrades.a || !def.upgrades.b) errs.push('Upgrades a/b fehlen');
    errs.push(...checkEffects(def.effects, reg));
    if (def.upgrades) for (const k of ['a', 'b']) if (def.upgrades[k]) errs.push(...checkEffects(def.upgrades[k].effects, reg));
    return errs;
  });
})(globalThis.LUM);
