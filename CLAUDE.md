# Lumora – Projektwissen für Claude

## Über das Projekt
Lumora ist ein eigenes Monster-Sammel-Roguelite im Browser (Genre wie Pokémon, aber eigene Monster, Welt und Namen – keine Kopie eines bestehenden Spiels). Begonnen am 2026-11-01. Der Nutzer will **sehr lange** daran arbeiten und viel verbessern und erweitern.

- Schwerpunkt: rundenbasierte Kämpfe mit viel Tiefe (Typen, Fähigkeiten, Merkmale, Wesen, Status, Wetter, Bindung, Resonanz, Relikte, Affixe, Gegner-KI)
- Roguelite: 3 Akte mit verzweigten Karten, Echo-Stein-Zeitschleife als Story-Grund, Freischaltungen zwischen Läufen
- Stil: Anime / Chibi
- Geheimnisse: Schimmer-Varianten, versteckte Pfade, einzigartige Monster (Wispelin, Pochi, später Stellio, Nyxelle, Sunnyfex, Mirrok)

## Über den Nutzer
- Schreibt Deutsch, locker und mit Tippfehlern. **Immer auf Deutsch antworten**, einfach und freundlich, ohne Fachjargon.
- Mag Anime/Chibi, viel Tiefe, Story, Geheimnisse und Abwechslung.
- **Bilder-Ablauf:** Der Nutzer legt neue KI-Bilder in den Ordner `bilder für game/`, der nicht in git ist. Claude erkennt sie am Dateinamen oder durch Ansehen, verkleinert sie mit PowerShell `System.Drawing` (Monster und Figuren auf höchstens 512 px als PNG mit Transparenz, Hintergründe auf 1600 px als JPG mit Qualität 86) und speichert sie unter den richtigen Namen in `img/`. `bilder.html` zeigt nur fehlende Bilder. Für jedes neue Monster und jede neue Figur muss ein Prompt in `js/data/prompts.js` stehen, ein Test prüft das. Ersatz-Hintergründe liegen in `img/bg/extra/`. Schimmer-Bilder erzeugt `powershell -File tools/make-shiny.ps1 [-Only <id>]` durch Umfärben; für neue Monster dort eine Zeile mit Farbwerten ergänzen. Im Kampf werden Monster per `ui.art.battleMonster` mit dem Umgebungslicht des Orts eingefärbt (Farben in `js/ui/battle.js`, `LIGHT`).
- Fand die Code-SVG-Grafik nicht schön genug. Er erzeugt selbst **KI-Bilder** und legt sie ab unter `img/monsters/<id>.png` (optional `<id>_shiny.png`), `img/portraits/<id>.png` (optional `<id>_<ausdruck>.png`) und `img/bg/<id>.png`. Die Prompts stehen in `js/data/prompts.js`, die Anleitung auf `bilder.html`. Die SVG-Grafik in `js/art/` ist nur der Rückfall.

## Wichtige Dateien
- Spezifikation: `docs/superpowers/specs/2026-11-01-lumora-monster-roguelite-design.md`
- Plan Etappe 1: `docs/superpowers/plans/2026-11-01-lumora-etappe-1.md`
- Fortschritt und Entscheidungen: `.superpowers/sdd/2026-11-01-lumora-etappe-1/progress.md` (git-ignoriert; Entscheidungen stehen auch in den Commit-Nachrichten)
- Ladereihenfolge aller Skripte: `js/files.js`. **Neue Dateien, z. B. ein neuer Akt, dort eintragen.**

## Architektur (Kurzfassung)
- Klassische `<script>`-Dateien ohne Build und ohne ES-Module, globaler Namensraum `LUM`. Das Spiel startet auch per Doppelklick auf `index.html`.
- Inhalte sind Daten, die sich in der Registry anmelden (`L.def.species/move/act/event/scene/...`). Validatoren prüfen alle Verweise.
- Logik (`js/core`, `js/data`, `js/battle`, `js/run`, `js/meta`, `js/art`) kennt kein DOM. Nur `js/ui/*` und `js/main.js` greifen auf das DOM zu.
- Die Kampf-Engine liefert Ereignislisten, die die UI abspielt. Effekte laufen über Hooks (Liste in `js/core/hooks.js`).
- Jede Zufallsentscheidung läuft über `L.rng` mit Seed, nie über `Math.random`.

## Befehle
- Tests: `node tests/run-node.js` (alle müssen grün sein). Im Browser: `tests.html`
- Entwicklungs-Server: `node tools/serve.js 8765`, dann http://localhost:8765 (auch in `.claude/launch.json` als „lumora“)
- Grafik-Vorschau: `art-preview.html`

## Schwierigkeit
Der Nutzer will ein **forderndes** Spiel: Man soll nachdenken müssen, wen man mitnimmt, wann man heilt und wen man levelt. Nicht zu leicht machen! Die Balance-Werte stehen in `js/core/config.js`. Prüfen mit `node tests/sim.js 300` (naiver Bot, Ziel etwa 15–30 % Siege; ein denkender Spieler schafft deutlich mehr).

## Stand
- Etappe 1 ist fertig und geprüft: Akt 1 komplett mit allen Bildschirmen, Speichern, Lexikon und Balance (Bot-Siegquote etwa 18 %). 190 Tests grün. Die unabhängige Abschluss-Prüfung ist erledigt, alle wichtigen Befunde sind behoben.
- Seit Etappe 1 dazugekommen: Kampf-Tempo 1×/2×/4×, Typen-Übersicht, Einstellungs-Fenster (`js/meta/settings.js` als Daten, `js/ui/settings.js`), Spielstand-Export/-Import, eigener Seed, Echo-Stufen 0–5 (`js/data/echo.js`, Regeln über `L.echo.of(run)`; Simulation: `node tests/sim.js 150 <stufe>`).
- Erfolge: `js/data/achievements.js` (Seltenheit gewöhnlich/selten/episch/legendär → 10/30/75/200 Kristalle, seltene geben Titel). Zähler über `L.progress.track(meta, key)` in `meta.stats`; `L.achievements.check(meta)` läuft in `ui.game.persist()`. Oberfläche: `js/ui/achievements.js` (Meldung, Erfolge-Seite, Titel-Auswahl, Spielerkarte im Schrein). Neuer Erfolg = ein `A({...})`-Eintrag.
- Spielername: Einstellung `playerName` (Typ `text`), `L.player.name(meta)`, in Story-Texten `{name}` (wird in `js/ui/dialog.js` ersetzt). Vor dem ersten Lauf fragt das Spiel einmal nach dem Namen.
- Tutorial: Miras Tipps in `js/data/tutorial.js` (`T({ id, trigger, order, topic, title, text, target })`), Oberfläche `js/ui/tutorial.js` (Sprechblase mit Hervorhebung, Anleitung-Seite „📘 Anleitung“ im Schrein). Auslöser: Bildschirmnamen automatisch über `ui.screens.show`, sonst `ui.tutorial.show('<auslöser>')` (Kampf, Knoten, Entwicklung, Team voll). Gesehene Tipps in `meta.tipsSeen`, Einstellung `tutorial`. Neue Auslöser in `TRIGGERS` eintragen.
- Zusatz-Hook-Quellen: `L.hooks.sources` (Funktionen `side → [{ source, hooks }]`), genutzt von Relikt-Sets und Flüchen. Kampfseiten haben `relics` und `curses`.
- Relikt-Sets: `js/data/relicsets.js` (3 Teile → Bonus). Relikte mit `unlock` erscheinen erst nach Kauf; immer `L.relics.available(run)` für Relikt-Pools nutzen.
- Flüche: `js/data/curses.js` (`hooks` wie Relikte, `runMods` für Shop-Preise/Quellen). Quellen: verfluchte Truhen (Belohnung `cursed`), Schattenaltar, Tagesregeln. Reinigen: Quelle (Option `purge`) oder Lotte (Ware `purge`). Segen `fluchbrecher` macht immun.
- Kristall-Shop: `js/data/unlocks.js` (Starter, Segen mit `unlock`, Sets, kleine Vorteile, Kartenrahmen), `meta.unlocks`; ein Lauf kopiert sie beim Start nach `run.unlocks`. UI `js/ui/crystalshop.js`.
- Nebenaufträge: `js/data/quests.js`, je Akt 1 aus 3 (`run.questOffer` → Auswahl auf der Karte), Fortschritt ab Annahme, geprüft in `L.run.complete`.
- Tages-Herausforderung: `js/data/daily.js` (Seed aus Datum, fester Starter/Segen, Tagesregel = Vorteil + Fluch, Echo I, keine Shop-Vorteile), nur erster Versuch zählt (`meta.daily`). UI `js/ui/daily.js`.
- Wetterzonen: `act.weatherPool`, Bänder je 3 Ebenen (Chance `config.weatherZoneChance`), `node.data.weather` → Kampfwetter und mehr passende wilde Monster.
- Lauf-Chronik: `meta.chronicle` (letzte 30, `L.progress.chronicleEntry`), UI `js/ui/chronicle.js`.
- Plitsch: Flutherz mildert sehr effektive Treffer um 40 %, Erdstoß ab Lv 10 (Bot: Plitsch 17 %, Glimmi 18 %, Knospi 26 %).
- Akt 2 „Die Glutschmiede“ (Etappe 2 begonnen): `js/data/acts/act2.js` (Varianten Aschepfad/Kristallgrotten, Stufen 12–22), Monster `js/data/monsters/act2.js` (13 neue, Aschling mit verzweigter Entwicklung → Flammfee/Aschegeist, Auswahl in `ui.resolveOffers`), Story `js/data/story/act2.js`, Ereignisse `js/data/events/act2.js`, Trainer Gero/Lia/Tao, Kael 2, Boss Brakk (Aschegeist, Lavarisk, Schmiedgolem; Phase 2 mit Glutregen und Schmiedeglut). Hintergründe vulkan/grotte/arena_brakk (SVG-Ersatz + Prompts).
- Akt 3 „Der Sturmgipfel“: `js/data/acts/act3.js` (Sturmpfad/Nebelkamm, Stufen 21–31), `js/data/monsters/act3.js` (14 neue, u. a. Blitzfink→Donneradler, Krähling→Rabenfürst, Windwiesel→Sturmmarder, Alpenknospe→Edelweissa, Himmelsdrache sehr selten, Boss Sturmkrone), Story `js/data/story/act3.js` (Enthüllung: die Gestalt in Grau ist Ardan, Kaels Bruder; „wahres Ende“ steht noch aus), Ereignisse `js/data/events/act3.js`, Trainer Maren/Ruvik/Ella, Kael 3, Boss Sola (Phase 2: Sturm + Himmelszorn). Nach Sola ist der Lauf gewonnen.
- Nyxelle: Ereignis „Mondfinsternis“ mit `condition: { echoAtLeast: 1 }` und `rare: 0.35` (Ereignisse dürfen `condition` und `rare` haben, geprüft beim Verteilen in `startAct`). Finsterschleier: in Runde 1–2 nicht treffbar.
- Akt-Abschluss-Szenen (`actOutro`) laufen jetzt nach jedem Wächter (in `js/main.js`, bevor `run.act` wechselt).
- Balance mit 3 Akten (Bot, 900 Läufe): Akt 1 ~19 %, Akt 2 ~4 %, ganzer Lauf ~1 %. Je Akt schafft der Bot etwa jeden fünften Versuch, Sola fällt in fast der Hälfte. Ein denkender Spieler kommt deutlich weiter.
- Einzigartige in Akt 2: Mirrok (versteckter Pfad, Spiegelkern übernimmt die Gegnertypen über `m._types`/`L.mon.types`), Sunnyfex (Geheimnis an jeder Quelle mit 3 Glut-Monstern; Akt-Geheimnisse haben `at: 'spring' | 'lastSpring'` und `option`). Wiedergeburt merkt sich `mon.reborn`.
- Attacken mit `signature: true` erscheinen nie als Schriftrolle oder im Laden.
- Balance (Bot, 900 Läufe): Akt 1 ~21 %, ganzer Lauf ~4 %, Brakk fällt in ~37 %. Jeder Akt bevorzugt einen anderen Starter (Akt 1 Knospi, Akt 2 Plitsch); Akt 3 (Sola, Funke/Schatten) soll Glimmi liegen. Der Bot tauscht schwache Monster gegen stärkere Fänge.
- Bilder: Für die neuen Monster fehlen noch KI-Bilder (bilder.html zeigt sie). Wenn Bilder kommen, in `tools/make-shiny.ps1` Farbwerte ergänzen.
- Bannträger-Rang und Talente (Skalierung zwischen Läufen): `js/data/talents.js` (`L.rank`, 13 Talente in 3 Wegen Kämpfer/Hüter/Sammler, `hooks(level)` und `start(run, level)`), `meta.rankXp`/`meta.talents`, ein Lauf kopiert sie nach `run.talents` (Tageslauf: keine). Rang-Erfahrung in `finishRun` (`L.rank.runXp`). UI `js/ui/talents.js`, Rang-Abzeichen auf der Spielerkarte.
- Rang-Starter: `js/data/monsters/starters2.js` (Zapfi→Blitzigel Funke ab Rang 3, Kiesi→Felspanzer Stein ab Rang 6, Nachtmiez→Schattenpanther Schatten ab Rang 10; Entwicklung schon bei Lv 12). Simulation: `STARTERS=zapfi node tests/sim.js`, alle Talente voll: `TAL=1 node tests/sim.js` (dann ~34 % Siege statt ~1 %).
- Typen: 9 normale Typen + geheimer Stern. Neu: Frost ❄️, Wind 🌪️, Metall ⚙️ (`js/data/types.js`, `L.types.NORMAL` steuert auch Resonanzen). Wetter Schneesturm. Neue Typ-Attacken in `js/data/moves.js`, Partikel in `js/art/monsterArt.js` (aura) und Angriffseffekte in `js/ui/attackfx.js` + CSS. Umgetypt: Windwiesel/Sturmmarder (Wind), Blitzfink (Funke/Wind), Steinspatz/Felsfalke (Wind/Stein), Gipfelbock (Stein/Frost), Zischkäfer (Metall/Glut). Neu: Pustelinchen (Akt 1), Rostratte→Stahlratte (Akt 2), Flockling→Frostbär (Akt 3).
- Legenden: Einzigartige mit `legend: { rank }` (Wispelin 3, Mirrok 6, Sunnyfex 8, Nyxelle 12; Pochi bleibt Glückssache). Sie erscheinen erst ab diesem Bannträger-Rang (`run.rank`, Bedingung `rankAtLeast`), kämpfen mit +`config.legendLevelBonus` Level und dem versteckten Affix `legende` (nie zufällig, `L.affixes.random`), Fangfaktor 0,15, nie als Belohnung. Lexikon zeigt den nötigen Rang.
- Sound/Musik: `js/ui/audio.js` (Web Audio, alles erzeugt; `ui.sound(name)`, `ui.music(track)`, Musik je Bildschirm über `ui.musicFor`), Lautstärke-Einstellungen `musicVolume`/`sfxVolume`.
- Wahres Ende: `js/data/trueend.js` – 9 Fragmente (`meta.fragments`, im Lauf `run.knownFragments`/`foundFragments`: je Akt boss_/hid_/ev_), Ereignis „Sternensplitter“, „Sternenriss“ (alle 9) → Stellio. Sola besiegt mit Stellio im Team → `L.run.complete` gibt `finale` zurück, Endkampf gegen Ardan (Knoten 'FINALE'), dann `trueEnd`. Szenen-Bedingungen `runFlag`/`noRunFlag`.
- Kampf-Protokoll (📜, Taste P) und Tastatur-Steuerung `js/ui/keys.js` (Hilfe in der Anleitung).
- Status Frost (eingefroren, Glut taut auf), Wirbeltanz (verwirrt), Eiskäfig; 10 neue getragene Items (Fokusband, Lebensorb …), Eisbonbon.
- Herausforderungs-Modi `js/data/modes.js` (Allein, Ein Typ, Ohne Heilung; Kristall-Faktor), Auswahl auf dem Echo-Bildschirm.
- Arena-Knoten (🏟️, 3 Runden ohne Heilung, `config.arenaChance`), Ereignisse Tauschhändler und Wetterumschwung (`js/data/events/common.js`).
- Monster-Album `js/data/mastery.js` (Meisterschaft Bronze/Silber/Gold → Start-Bindung), Bestenliste im Tages-Bildschirm.
- Versteckte Fähigkeiten `js/data/hiddenabilities.js` (`species.hiddenAbility`, `mon.hiddenAbility`, `L.mon.abilityId`), Chance `config.hiddenAbilityChance`.
- Handy-Ansicht: Media-Query `max-width: 760px` am Ende von `css/style.css`.
- Nebenakt „Die Versunkene Tiefe“ `js/data/acts/side_tiefe.js` (`side: true`, nicht in `L.run.acts()`): Ereignis „Strudel“ setzt `run.flags.nebenakt`, nach dem nächsten Wächter `run.sideAct`, danach zurück zum Hauptlauf (+ Perle der Tiefe).
- Balance (900 Läufe, naiver Bot): Akt 1 ~16 %, ganzer Lauf <1 % (gewollt schwer, Talente/Meisterschaft helfen über viele Läufe).
- Doppelkämpfe (2 gegen 2): Jede Kampfseite hat `side.slots` (Einzelkampf 1, Doppel 2). `side.active/stages/volatile` zeigen auf den betrachteten Platz `side.slot`; `L.battle.focus(battle, s, k)` setzt den Blick um, so laufen Hooks und Schadensformel unverändert. Doppel-Ablauf getrennt in `stepDouble`/`resolveFaintsDouble`/`forceSwitchDouble` (Einzelkampf-Code bleibt gleich). `step` nimmt im Doppel eine Liste (`{ type, index, slot, foe }`, `foe` = Ziel-Platz), Ereignisse bekommen `slot`/`foeSlot`. Helfer: `liveSlots`, `actives`, `slotMon`, `legal(battle, s, slot)`, KI `L.ai.choose(battle, s, rng, level, slot)`.
- Elite-Doppelkampf: `mapgen` macht mit `config.doubleEliteChance` einen Elite-Knoten zum Doppel (`node.data.double`, auf der Karte „×2“), `L.encounters.doubleElite` (zwei Elite-Trainer, Teams abwechselnd, `setup.double`/`partner`). Belohnung: Gold ×`doubleEliteGold`, 6 Kristalle, Zähler `run.stats.doubles`. Oberfläche: `.battle.double`, Plätze `.mon.<seite>.s0/.s1`, Zielwahl und „↩ Zurück“, Tipp `double`. Tests `tests/doubles.test.js`.
- Monster-Eier `js/data/eggs.js` + UI `js/ui/eggs.js` (Brutnest im Schrein): Ei-Arten (wald/glut/sturm/tiefe/raetsel/schimmer/zucht), Funde im Lauf (`run.eggs`, Belohnung `egg`, Ereignis „Verlassenes Nest“), am Laufende ins Nest (`meta.eggs`, Plätze über Schrein-Ausbauten), Wärme je Lauf (`L.eggs.warmthFor`), Pflege (wärmen/singen/kristall/mondlicht), Schlüpfen → `meta.hort` mit Ei-Attacke. Zucht: Pflegestation in der Zusammenfassung (ab Bronze-Meisterschaft, `L.eggs.fromParent`).
- Begleiter `js/data/companions.js`: `meta.companion` = Hort-Schlüpfling oder Echo (`meta.echoCompanion`, Schnappschuss des stärksten Monsters des letzten Laufs, Level ÷3, mit Echo-Glocke ÷2; verblasst nach einem Lauf). Nicht im Tageslauf und im Modus „Allein“.
- Schrein-Ausbauten: Kategorie „Schrein“ in `js/data/unlocks.js` (Brutnester, Wärmegarten, großer Hort, Echo-Glocke, Bibliothek, Ruhmeshalle, Laternen), sichtbar als Deko im Schrein (`shrineDeco` in `js/ui/hub.js`).
- Bannträger-Wege `js/data/paths.js` (Kämpfer, Hüter, Fänger ab Rang 4, Mystiker ab Rang 8): Dauer-Vorteil über `L.hooks.sources` (`side.path`) und eine Kunst pro Kampf (Aktion `{ type: 'art' }`, `useArt` in der Engine, Knopf/Taste K im Kampf). Auswahl auf dem Echo-Bildschirm.
- Echo-Turm `js/data/acts/side_turm.js` (Modus `turm`, nach dem ersten Sieg): Blöcke à 8 Ebenen, nach jedem Wächter +6 Level (`run.tower.block`, `run.sideLevelBonus`), Wächter reihum (`boss.pool`), Bestwert `meta.stats.towerBest`.
- Geister-Kämpfe: Sieger-Teams landen in `meta.ghosts` (letzte 6) und tauchen als Elite „Echo von …“ auf (`config.ghostChance`, `L.encounters.ghost`).
- Kampf-Bewegungen je Körperform (`body-<form>`-Klasse im Kampf, CSS am Ende von `css/style.css`).
- Etappe 2: Akt 2 + Akt 3 (fertig), Wetter, 24+ Monster, weitere Einzigartige, verzweigte Entwicklungen, Flüche, Anomalien, Relikt-Sets, Nebenaufträge
- Etappe 3: Echo-Stufen, Kristall-Shop, Bannträger-Wege, Echo-Begleiter, Herausforderungs-Modi, wahres Ende (alles fertig).
- Akt 4 „Jenseits des Schleiers“: `js/data/acts/act4.js` (`side: true`, Gläserne Ebene/Sternenstrom, Stufen 33–43), Monster `js/data/monsters/act4.js` (13 neue mit Frost/Wind/Metall, Zahnradwicht verzweigt → Uhrwerkritter/Taktgeist, Boss-Monster Velumora), Story `js/data/story/act4.js`, Ereignisse `js/data/events/act4.js`, Elites Tikka/Joran/Nim, Kael 4, Wächterin Vael (Erste Bannträgerin, Ursprung des Schleiers; Phase 2: Schneesturm + Schleiergesang). Nur im Modus `jenseits` (`requiresTrueEnd`, `L.modes.open(meta, md)`): nach Sola bzw. dem Finale gegen Ardan `enterAct4` in `js/run/run.js` (`run.sideAct = 'act4'`, `actIndex` bleibt 2), Sieg nach Vael → `run.flags.jenseits`/`meta.flags.jenseits`, Erfolg `jenseits`. Simulation: `MODE=jenseits TAL=1 node tests/sim.js 600` (Bot schafft Akt 4 in ~40 %). Tests `tests/act4.test.js`.
