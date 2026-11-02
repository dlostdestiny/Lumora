# Lumora – Monster-Roguelite · Design-Spezifikation

Stand: 2026-11-01 · Status: Entwurf zur Freigabe

## 1. Ziel

Ein eigenes Monster-Sammel-Spiel im Browser mit dem Schwerpunkt auf **rundenbasierten Kämpfen** und dem Aufbau eines **Roguelites**. Es gibt eine Story, viel spielerische Tiefe, Monster im Anime- bzw. Chibi-Stil und geheime Inhalte. Alle Monster, Figuren, Orte und Namen sind eigene Schöpfungen.

**Erfolg heißt:**
- Ein Lauf durch einen Akt ist spannend, fühlt sich jedes Mal anders an und verlangt echte Entscheidungen (Weg, Team, Belohnungen, Attacken).
- Die Kämpfe haben Tiefe: Typen, Fähigkeiten, Status, Bindung und kluge Gegner.
- Mit jedem Lauf erfährt man mehr von der Story.
- Neue Akte, Monster, Items und Ereignisse lassen sich **nur durch neue Daten** hinzufügen, ohne die Spiel-Logik umzubauen.
- Es gibt Geheimnisse, die man nicht beim ersten Lauf findet.

**Rahmen:** Browser am PC, Bedienung mit der Maus, Texte auf Deutsch, Einzelspieler gegen den Computer, Spielstand im Browser (localStorage). Start per Doppelklick auf `index.html`, ohne Installation und ohne Build. Optional kann das Spiel als Artifact-Webseite veröffentlicht werden.

## 2. Story

**Welt:** Lumora. Die *Sternenquelle* gibt allen Monstern ihre Kraft. Ein schwarzer *Schleier* verdunkelt sie, deshalb verwildern die Monster.

**Spielfigur:** ein junger Bannträger bzw. eine junge Bannträgerin (Auswahl am Anfang, rein optisch). Die Figur kann eine *Bindung* mit Monstern eingehen.

**Roguelite-Begründung:** Der *Echo-Stein* bringt die Spielfigur nach einer Niederlage zum Schrein zurück, und die Erinnerungen bleiben erhalten. Die Figuren reagieren darauf („Du warst schon einmal hier, oder?“).

**Figuren:**
| Figur | Rolle |
|---|---|
| Mira | Mentorin am Schrein. Erklärt die Spielregeln und hat ein eigenes Geheimnis. |
| Kael | Rivale. Taucht als eigener Kartenknoten auf, mal als Gegner, mal mit Hilfe. Seine Haltung ändert sich über die Läufe. |
| Wächterin Fenna (Akt 1, Wald) | Hüterin des Waldes, vom Schleier verdorben. Ihr Boss-Monster ist vom Typ Spross. |
| Wächter Brakk (Akt 2, Vulkan) | Schmied der Glut. Boss mit Glut und Stein. |
| Wächterin Sola (Akt 3, Gipfel) | Sturmseherin. Boss mit Funke und Schatten. |
| Der Schleierträger | Eigentlicher Gegenspieler. Seine Identität wird erst über mehrere Läufe enthüllt. |

**Story-Fortschritt:** Jede Story-Szene hat Bedingungen, zum Beispiel „Lauf Nr. ≥ 2“, „Boss X einmal besiegt“ oder „Fragment Y gefunden“. Gespielte Szenen werden gespeichert. Es gibt *Erinnerungs-Fragmente* (insgesamt 9) als seltene Funde.
- **Normales Ende:** Den Boss von Akt 3 besiegen.
- **Wahres Ende:** Alle 9 Fragmente besitzen und Akt 3 mit dem einzigartigen Monster *Stellio* im Team abschließen. Danach folgt ein geheimer Endkampf gegen den Schleierträger.

## 3. Monster

### 3.1 Typen
Es gibt sechs normale Typen und einen geheimen Typ:

Glut · Flut · Spross · Funke · Stein · Schatten · *(geheim)* Stern

Effektivität (×2 = sehr effektiv, ×0,5 = nicht sehr effektiv, alles andere ×1):

| Angreifer → | sehr effektiv gegen | nicht sehr effektiv gegen |
|---|---|---|
| Glut | Spross, Schatten | Flut, Stein, Glut |
| Flut | Glut, Stein | Spross, Flut |
| Spross | Flut, Stein | Glut, Spross |
| Funke | Flut, Schatten | Stein, Funke |
| Stein | Glut, Funke | Spross, Flut |
| Schatten | Funke, Stern | Glut, Schatten |
| Stern | alle sechs normalen | Stern |

Stern-Monster erleiden von allen normalen Typen ×1, nur Schatten trifft sie mit ×2. Zweifach-Typen multiplizieren die Werte.

### 3.2 Werte
- **Basiswerte:** KP, Angriff (ANG), Verteidigung (VER), Tempo (TEM)
- **Level** 1–50. Ein Wert auf einem Level ergibt sich aus: `floor(Basis * Level / 25) + 5` (KP: `+ Level + 10`)
- **Wesen** (10 Stück): Je ein Wert +10 %, ein anderer −10 %. Beim Fangen wird zufällig gewürfelt.
- **Fähigkeit:** eine passive Fähigkeit pro Art, z. B. *Glutherz* (bei KP < 33 % → Glut-Attacken ×1,5)
- **Attacken:** maximal 4. Neue Attacken gibt es durch Level-Ups, Schriftrollen und Belohnungen.
- **Erfahrung:** EP nach Kämpfen, an alle Team-Monster verteilt. Das aktive Monster bekommt einen Bonus.

### 3.3 Seltenheit
| Stufe | Wo | Chance |
|---|---|---|
| Häufig | normale Kämpfe | Hauptanteil |
| Selten | normale Kämpfe, Ereignisse | ca. 10 % |
| Sehr selten | nur bei Wetter, versteckten Pfaden oder Ereignissen | ca. 2–3 % |
| Einzigartig | jeweils eine feste geheime Bedingung | höchstens einmal pro Lauf |

**Schimmer-Variante:** Jedes wilde Monster ist mit einer Chance von 1/100 eine Schimmer-Variante. Sie hat eine andere Farbpalette, glitzert und bringt beim ersten Fang Bonus-Kristalle. Im Lexikon wird sie gesondert vermerkt.

### 3.4 Einzigartige Monster
Jedes hat einen eigenen Typ oder eine eigene Mechanik, die kein anderes Monster besitzt.

| Name | Typ | Bedingung | Besonderheit |
|---|---|---|---|
| **Stellio** | Stern | Alle 9 Fragmente besitzen, dann taucht in Akt 3 ein Ereignis am „Sternenriss“ auf | Fähigkeit *Sternenecho*: Einmal pro Kampf überlebt es einen K.-o.-Treffer mit 1 KP. Schlüssel zum wahren Ende. |
| **Nyxelle** | Schatten/Funke | Akt 3, Ereignis „Mondfinsternis“ (selten), nur ab Echo-Stufe 1 | *Finsterschleier*: Die ersten 2 Runden kann sie nicht getroffen werden. |
| **Sunnyfex** (Sonnenfuchs) | Glut | Eine Quelle betreten, während 3 Glut-Monster im Team sind | *Wiedergeburt*: Einmal pro Lauf steht es nach einem K.-o. mit 50 % KP wieder auf. |
| **Mirrok** | Stein | Versteckter Pfad in Akt 2 (Kartenknoten 🔮, 15 %) | *Spiegelkern*: Übernimmt zu Kampfbeginn den Typ des Gegners. |
| **Wispelin** | Spross/Schatten | Akt 1 ohne Heilung an einer Quelle durchspielen. Dann erscheint vor dem Boss ein Irrlicht-Ereignis mit einem fangbaren Kampf. | *Irrlicht*: Gegnerische Status-Attacken werden zurückgeworfen. |
| **Pochi** | Funke | 0,5 % in jedem normalen Kampf, in jedem Akt | *Glückspfote*: verdoppelt Gold- und Kristall-Belohnungen. Unscheinbar, aber sehr wertvoll. |

### 3.5 Normale Monster
Ziel ist 24+ Arten über alle drei Akte, davon ca. 12 in Etappe 1. Jede Art bekommt Name, Typ(en), Basiswerte, Fähigkeit, Lern-Liste, Seltenheit, Lebensraum (Akte) und eventuell Entwicklung. Entwicklungen gibt es per Level (z. B. Lv 16) oder als **verzweigte Entwicklung**, bei der man zwischen zwei Formen wählt (z. B. bestimmt das Wesen oder die Bindung den Vorschlag).

### 3.6 Bindung
- Leiste 0–100 pro Monster. Sie steigt pro Runde im Kampf, bei Siegen und bei bestimmten Ereignissen.
- Bei 100: **Bindungs-Attacke**, einmal pro Kampf. Sie ist stark, hat einen eigenen Effekt und wird mit Anime-Einblendung gezeigt.
- Hohe Bindung erhöht leicht die Volltrefferchance.

## 4. Kampf

- **1 gegen 1:** Dein Team hat bis zu 4 Monster, eines kämpft aktiv.
- **Aktionen pro Runde:** Attacke · Wechseln · Item · Fangen (nur bei wilden Monstern) · Bindungs-Attacke (wenn bereit)
- **Reihenfolge:** Wechsel und Items vor Attacken, danach nach Priorität der Attacke, dann nach Tempo. Gleichstand wird ausgewürfelt.
- **Schaden:** `((2*Lv/5+2) * Stärke * ANG/VER) / 50 + 2`, dann × Typ-Bonus (1,25 bei gleichem Typ) × Effektivität × Volltreffer (1,5) × Zufall (0,85–1,0) × Modifikatoren aus Fähigkeiten, Items, Relikten und Wetter
- **Treffergenauigkeit** pro Attacke. Volltreffer-Grundchance 1/16.
- **Status:** Brand (Schaden pro Runde, ANG −), Gift (wachsender Schaden), Lähmung (TEM −, 25 % Aussetzen), Schlaf (1–3 Runden), Verwirrung. Es gibt Werte-Stufen von −3 bis +3.
- **Wetter/Felder:** Glutregen, Strömung, Sturm, Nebel. Sie kommen vom Akt, von Attacken oder Ereignissen und halten 5 Runden.
- **Fangen:** Die Chance hängt von verbleibenden KP, Status, Seltenheit und Kugelart ab. Ist das Team voll, wählt man, wen man freilässt.
- **Gegner-KI:** bewertet jede Aktion nach erwartetem Schaden, Typvorteil, Status-Nutzen, Heilbedarf und Wechselvorteil. Je nach Gegnerart (Wild, Trainer, Elite, Boss) handelt sie unterschiedlich klug, mit etwas Zufall.
- **Bosse** haben Phasen. Bei 50 % KP folgt eine Phase mit Dialog, neuer Attacke oder anderem Wetter.
- **Niederlage:** Sind alle Monster K.-o., endet der Lauf. Dann gibt es Kristalle, und der Echo-Stein bringt dich zum Schrein zurück.

## 5. Ablauf eines Laufs

1. **Schrein (Hub):** Dialog mit Mira, Freischaltungen, Lexikon, Echo-Stufe wählen, Startmonster wählen
2. **Akt 1 → 2 → 3:** Jeder Akt hat eine eigene erzeugte Karte.
3. **Karte:** 12–15 Ebenen, 2–4 Knoten pro Ebene, Wege verzweigen sich. Man sieht die Art der Knoten, aber nicht den genauen Inhalt.
   - ⚔️ Kampf (wildes Monster) · 💀 Elite (Trainer) · ⛲ Quelle (heilen **oder** trainieren) · 🛒 Shop · ❓ Ereignis · 🗡️ Rivale Kael · 👑 Boss
   - 🔮 **Versteckter Pfad**: selten, führt zu sehr seltenen Monstern, geheimen Items oder Fragmenten
4. **Belohnung nach einem Sieg:** Wähle 1 aus 3, z. B. Monster, Attacken-Schriftrolle, Relikt, Item oder Gold.
5. **Zwischen den Akten:** Volle Heilung und eine Story-Szene.

## 6. Items und Relikte

- **Verbrauchs-Items:** Heiltrank, Super-Heiltrank, Gegengift, Weckglocke, Fangkugeln (normal, Super, Mond-Kugel nur nachts in Echtzeit)
- **Getragene Items** (1 pro Monster): z. B. *Glutfeder* (Glut-Attacken +20 %)
- **Relikte** (passiv für den ganzen Lauf, können sich gegenseitig verstärken): z. B. *Kompass des Wanderers* (zeigt Inhalte von Ereignis-Knoten), *Doppelband* (Bindung wächst doppelt so schnell)
- **Geheime Items:**
  - *Sternenscherben* (3 Teile): Zusammen ergeben sie den *Sternenkompass*, der versteckte Pfade sichtbar macht.
  - *Alte Münze*: Wer sie im Shop beim Händler abgibt, schaltet einen Geheimshop frei.
  - *Erinnerungs-Fragmente* (9): treiben die Story voran und bleiben über Läufe hinweg erhalten.

## 7. Fortschritt zwischen den Läufen

- **Kristalle** gibt es für besiegte Gegner, erreichte Akte, Erstfänge und Schimmer-Varianten.
- **Freischaltungen im Schrein:** weitere Startmonster (3 am Anfang, 6 freischaltbar), neue Relikte und Items für den Pool, mehr Startgold
- **Lexikon:** gesehen, gefangen, Schimmer gesehen. Zu jeder Art gibt es einen Beschreibungstext. Einzigartige Monster bleiben als „???“ verborgen, bis man sie gefunden hat.
- **Echo-Stufen 0–10:** Werden nach einem Sieg freigeschaltet. Jede Stufe bringt eine weitere Regel, z. B. stärkere Elite-Gegner oder Quellen, die nur 50 % heilen.
- **Erfolge** (versteckt und sichtbar) schalten kosmetische Dinge frei, z. B. Kartenrahmen oder Titel.

## 7a. Abwechslung und Langzeit-Tiefe

Ziel: Auch nach dem 50. Lauf soll es noch neue Entscheidungen, Kombinationen und Überraschungen geben. Alles in diesem Abschnitt ist datengetrieben, genau wie Akte (9.3).

### Jeder Lauf ist anders
- **Gebiets-Varianten:** Jeder Akt hat 2–3 Varianten mit eigener Monster-Liste, eigenen Ereignissen und eigenem Wetter, die zufällig gewählt werden. Beispiel für Akt 1: *Flüsterwald*, *Moorlichtung*, *Pilzhain*.
- **Wechselnde Bosse:** Jeder Akt hat 2–3 mögliche Bosse. Der Story-Boss (z. B. Fenna) kommt beim ersten Mal sicher, danach wird zufällig gewählt.
- **Segen zum Start:** Zu Beginn eines Laufs wählst du 1 von 3 zufälligen Segen, z. B. „Alle Fangkugeln +1“, „Starter beginnt auf Lv 8“ oder „+1 Relikt-Auswahl“.
- **Flüche:** Manche Ereignisse bieten starke Belohnungen gegen einen Fluch, z. B. „Seltenes Monster, aber Quellen heilen nur 50 %“. Flüche kann man später wieder loswerden.
- **Elite-Affixe:** Elite- und Boss-Gegner bekommen zufällige Eigenschaften wie *Gepanzert*, *Rasend*, *Regeneriert*, *Spiegelnd* oder *Gespalten* (teilt sich bei 50 % KP in zwei Monster).
- **Anomalie-Knoten** (sehr selten): Ein Knoten mit verdrehten Regeln, z. B. Typ-Tabelle umgekehrt, alle Monster Lv 50 oder Kampf im Dunkeln (gegnerische Werte unsichtbar).
- **Tag und Nacht nach echter Uhrzeit:** Nachts erscheinen andere Monster und Ereignisse.

### Jedes Monster ist anders
- **Merkmale:** Jedes gefangene Monster kann zusätzlich zum Wesen ein zufälliges Merkmal haben, z. B. *Riesig* (KP +15 %, TEM −10 %), *Winzig* (Ausweichen +), *Vernarbt* (ANG +, Bindung langsamer), *Sternäugig* (Volltreffer +), *Uralt* (kennt eine seltene Attacke). Merkmale haben eine eigene Seltenheit. Sehr seltene Merkmale werden im Lexikon gesammelt.
- **Attacken verbessern:** An Quellen oder durch Belohnungen werden Attacken zu „+“-Versionen, z. B. *Glutbiss+* mit mehr Stärke oder einem Zusatzeffekt. Jede Attacke hat 1–2 mögliche Verbesserungen, und du entscheidest.
- **Verzweigte Entwicklung** (siehe 3.5) hängt zusätzlich von Merkmal und Bindung ab. So entstehen mehr unterschiedliche Endformen.

### Team-Bau und Synergien
- **Resonanz:** Typ-Kombinationen im Team geben Boni.
  - 2 gleiche Typen → kleiner Bonus für diesen Typ
  - 3 gleiche → großer Bonus
  - Bestimmte Paare wirken zusammen, z. B. Flut + Funke → *Gewitter* (Funke-Attacken treffen immer bei Regen)
  - 4 verschiedene Typen → *Harmonie* (alle Werte +5 %)
- **Relikt-Sets:** Manche Relikte gehören zu Sets. Mit 2 oder 3 Teilen gibt es einen Zusatzeffekt.
- **Bannträger-Wege:** Im Schrein wählst du vor dem Lauf einen Weg mit eigenem Vorteil und eigener Spielweise:
  - *Sammlerin/Sammler*: bessere Fangchance, 5 Team-Plätze statt 4
  - *Strategin/Stratege*: sieht gegnerische Attacken, 1 zusätzlicher Wechsel ohne Rundenverlust
  - *Züchterin/Züchter*: mehr EP, Merkmale häufiger
  - *Bandhüterin/Bandhüter*: Bindung wächst schneller, 2 Bindungs-Attacken pro Kampf

  Jeder Weg hat einen kleinen **Talentbaum**, der über Läufe mit Kristallen wächst.

### Ziele über viele Läufe
- **Nebenaufträge im Lauf:** Figuren auf der Karte geben Aufgaben, z. B. „Bring mir ein Monster mit Bindung 50“ oder „Besiege eine Elite ohne Items“. Als Belohnung gibt es ein Relikt, ein seltenes Monster oder ein Fragment.
- **Echo-Begleiter:** Nach einem Lauf wählst du ein Monster aus dem Team. Es hinterlässt ein *Echo* und kann in einem späteren Lauf als Ereignis wieder auftauchen und sich dir anschließen. So entsteht eine Verbindung zwischen den Läufen.
- **Kael lernt dazu:** Der Rivale passt sein Team an die Typen an, die du in den letzten Läufen am meisten benutzt hast.
- **Ereignis-Ketten:** Manche Ereignisse gehen erst im nächsten Lauf weiter, z. B. „Das verletzte Monster, dem du geholfen hast, wartet auf dich.“
- **Herausforderungs-Modi** (freischaltbar):
  - *Eiserner Bund*: Monster, die K.-o. gehen, sind für den Lauf verloren.
  - *Mono-Typ*: nur ein Typ erlaubt
  - *Chaos*: zufälliges Team, zufällige Attacken
  - *Tägliches Echo*: Jeden Tag ein fester Seed mit festen Regeln. Die beste Wertung wird lokal gespeichert.
- **Lexikon-Belohnungen:** Wer 25 %, 50 %, 75 % und 100 % des Lexikons füllt, bekommt Freischaltungen. Dazu gibt es Sammelziele für Merkmale und Schimmer-Varianten.
- **Statistik und Bestwerte:** Läufe, Siege, Lieblingsmonster, höchster Schaden, schnellster Sieg, höchste Echo-Stufe pro Bannträger-Weg

## 8. Grafik und Darstellung (Anime/Chibi)

- **Monster:** werden per Code als SVG aus Teilen zusammengesetzt (Körperform, Augen, Ohren/Hörner, Schweif, Muster, Extras). Große glänzende Anime-Augen, klare dunkle Umrisse, Cel-Shading mit harter Schattenkante. Eine leichte Atem- bzw. Hüpf-Animation läuft ständig. Schimmer-Varianten bekommen eine andere Palette und Glitzer.
- **Figuren:** Chibi-Porträts in SVG (großer Kopf, große Augen, einfache Frisuren) für Dialoge und Bosse.
- **Effekte:** Speedlines, Treffer-Blitze, Bildschirmwackeln, schwebende Schadenszahlen, Typfarben, eine Einblendung mit diagonalem Banner und Figur bei Bindungs-Attacken und Volltreffern
- **Akt-Stimmung:** Jeder Akt hat Farbpalette, Hintergrund und Wetter in seinen Daten.
- **Bedienung:** Maus. Zusätzlich Tastenkürzel 1–4 für Attacken. Lesbar ab 1280×720, passt sich größeren Fenstern an.
- **Sound:** zunächst keiner (später möglich).

## 9. Technik und Architektur

### 9.1 Grundsatz
Normale `<script>`-Dateien ohne Module, damit das Spiel auch per Doppelklick (`file://`) läuft. Alles hängt an einem globalen Namensraum `LUM`. **Logik und Anzeige sind strikt getrennt:** Kampf- und Lauf-Logik arbeiten nur mit Daten und Zufallszahlen und kennen kein DOM.

### 9.2 Dateien
```
index.html                 Einstieg, lädt alle Skripte in fester Reihenfolge
tests.html                 Testseite für Logik (eigenes Mini-Testgerüst)
css/style.css              Layout, Anime-UI, Animationen
js/core/
  namespace.js             LUM-Grundgerüst, Registry-Funktionen
  rng.js                   Zufall mit Seed (reproduzierbar für Tests und Lauf-Seeds)
  registry.js              Registrierung von Daten (Monster, Attacken, Akte, …) + Validierung
  events.js                kleiner Event-Bus (Logik → Anzeige)
js/data/
  types.js                 Typen + Effektivitätstabelle
  natures.js               Wesen
  status.js                Statuseffekte
  abilities.js             Fähigkeiten (Hooks, siehe 9.4)
  moves.js                 Attacken
  monsters/*.js            Monster-Arten (eine Datei pro Akt bzw. Gruppe, plus unique.js)
  items.js, relics.js      Items und Relikte
  characters.js            Figuren + Porträt-Beschreibung
  story/*.js               Story-Szenen
  acts/act1.js …           Akt-Definitionen (siehe 9.3)
js/battle/
  monster.js               Monster-Instanz erzeugen (Level, Werte, Wesen, Attacken)
  damage.js                Schadensformel
  engine.js                Kampfablauf als Zustandsmaschine, gibt Ereignisse aus
  ai.js                    Gegner-KI
  capture.js               Fangchance
js/run/
  mapgen.js                Kartenerzeugung aus Akt-Daten
  run.js                   Lauf-Zustand (Team, Items, Gold, Position, Akt)
  rewards.js               Belohnungs-Auswahl
  events.js                Ereignis-Knoten ausführen
  conditions.js            Bedingungen prüfen (Story, Geheimnisse, Einzigartige)
js/meta/
  save.js                  Speichern/Laden (localStorage, Versionsnummer, try/catch)
  progress.js              Kristalle, Freischaltungen, Lexikon, Echo-Stufen, Erfolge
js/art/
  monsterArt.js            Monster-SVG aus Teil-Beschreibung
  portraitArt.js           Chibi-Porträts
  backgrounds.js           Akt-Hintergründe
  fx.js                    Kampfeffekte
js/ui/
  screens.js               Bildschirm-Wechsel
  hub.js, map.js, battle.js, dialog.js, shop.js, reward.js, dex.js, menus.js
js/main.js                 Start
```

### 9.3 Erweiterbarkeit: Akte als Daten
Ein Akt ist ein Datenobjekt, das sich selbst registriert:
```js
LUM.registry.act({
  id: 'act1', order: 1, name: 'Flüsterwald',
  palette: {...}, background: 'forest', weather: ['nebel'],
  map: { layers: 13, nodeWeights: { battle: 45, elite: 10, spring: 12, shop: 8, event: 20, hidden: 2, rival: 3 } },
  levelRange: [3, 14],
  encounters: [ { species: 'flammi', weight: 10 }, ... ],   // inkl. Seltenheit
  elites: [...], boss: { trainer: 'fenna', team: [...], phases: [...] },
  events: ['verirrtes_kind', ...], storyIntro: 'act1_intro', storyOutro: 'act1_outro',
  secrets: [ { condition: {...}, effect: {...} } ]
});
```
Die Lauf-Logik sortiert alle registrierten Akte nach `order`. **Ein neuer Akt** braucht nur eine neue Datei `js/data/acts/actN.js` (plus Monster und Story, falls neu) und eine Script-Zeile in `index.html`. Die Validierung in `registry.js` meldet fehlende Verweise (z. B. eine unbekannte Monster-ID) beim Start in der Konsole und auf der Testseite.

Monster, Attacken, Items, Relikte, Ereignisse und Story-Szenen werden genauso registriert.

### 9.4 Fähigkeiten, Items, Relikte: Hooks
Effekte hängen sich an feste Zeitpunkte im Kampf, zum Beispiel `onBattleStart`, `modifyDamage`, `onHit`, `onTurnEnd`, `onFaint`, `modifyCatchRate`, `modifyReward`. Die Engine ruft diese Hooks in fester Reihenfolge auf. Neue Effekte brauchen so keine Änderung an der Engine.

### 9.5 Bedingungen
`conditions.js` wertet einfache Bedingungs-Objekte aus, z. B.
`{ all: [ { fragments: 9 }, { act: 'act3' } ] }`, `{ teamTypeCount: { type: 'glut', min: 3 } }`, `{ chance: 0.005 }`, `{ realTime: 'night' }`, `{ noHealInAct: 'act1' }`.
Diese Bedingungen nutzen Story-Szenen, Geheimnisse, Einzigartige und versteckte Pfade.

### 9.6 Kampf als Ereignisstrom
`engine.js` nimmt Aktionen entgegen und liefert eine Liste von Ereignissen (`{type:'damage', target, amount, effectiveness}`, `{type:'status', ...}`, `{type:'faint'}` …). Die UI spielt diese Ereignisse nacheinander mit Animationen ab. Dadurch ist der Kampf ohne Anzeige testbar und hängt nicht vom Timing ab.

### 9.7 Speichern
- **Meta-Spielstand:** Kristalle, Freischaltungen, Lexikon, Fragmente, gesehene Szenen, Erfolge
- **Laufender Lauf:** wird nach jedem Knoten gespeichert, damit man weiterspielen kann.
- Mit `version` und Migration. Ist localStorage nicht verfügbar, läuft das Spiel trotzdem, nur ohne Speichern (mit Hinweis).

### 9.8 Fehlerbehandlung
- Daten-Validierung beim Start: Fehler gehen in die Konsole und als sichtbarer Hinweis auf die Testseite.
- Kaputter Spielstand: wird gesichert unter `lumora_backup`, danach startet ein neuer Spielstand mit Hinweis.

## 10. Tests

- `tests.html` mit einem kleinen eigenen Testgerüst ohne Abhängigkeiten
- Getestet werden: Typ-Tabelle, Werteberechnung, Wesen, Schadensformel (mit festem Seed), Reihenfolge der Züge, Status-Effekte, Hooks von Fähigkeiten und Relikten, Fangchance, KI-Entscheidungen in klaren Situationen, Kartenerzeugung (immer ein Weg zum Boss, keine Sackgassen, Knotenverteilung), Bedingungen, Speichern/Laden und Migration, Daten-Validierung (alle Verweise gültig)
- Zusätzlich ein Durchlauf im Browser: Lauf starten, kämpfen, fangen, Boss besiegen

## 11. Etappen

1. **Etappe 1: Fundament + Akt 1**
   Ganzer Kern (core, battle, run, meta-Grundlage, art, ui). Akt 1 „Flüsterwald“ komplett mit ca. 12 Monstern (davon 3 Starter), Boss Fenna mit 2 Phasen, Kael-Begegnung, Story-Intro und Akt-1-Ende, ca. 8 Ereignisse, Shop, Quellen, Relikte und Items (Grundsatz). Dazu die Geheimnisse Wispelin, Pochi, Schimmer-Varianten und versteckte Pfade. Nach dem Boss endet Etappe 1 vorläufig mit „Fortsetzung folgt“ und Kristallen. Kristalle, Lexikon und Speichern funktionieren schon.
   Aus 7a enthält Etappe 1 bereits: **Merkmale**, **Attacken-Verbesserungen**, **Resonanz**, **Segen zum Start**, **Elite-Affixe**, **Tag/Nacht** und **2 Gebiets-Varianten** für Akt 1. Diese Systeme stecken tief im Kern und sollen deshalb von Anfang an drin sein.
2. **Etappe 2: Akt 2 + 3**
   Vulkan und Gipfel, Wetter, insgesamt 24+ Monster, Brakk und Sola, Mirrok, Sunnyfex und Nyxelle, verzweigte Entwicklungen, mehr Relikte
   Aus 7a: wechselnde Bosse, Flüche, Anomalie-Knoten, Relikt-Sets, Nebenaufträge, dritte Gebiets-Variante pro Akt
3. **Etappe 3: Meta + Enden**
   Alle Freischaltungen, Echo-Stufen, Erfolge, Fragmente, Stellio, wahres Ende, Schleierträger
   Aus 7a: Bannträger-Wege mit Talentbäumen, Echo-Begleiter, Kael lernt dazu, Ereignis-Ketten, Herausforderungs-Modi inklusive Tägliches Echo, Lexikon-Belohnungen, Statistik

## 12. Nicht dabei (vorerst)

Mehrspieler, Sound/Musik, Bedienung am Handy, Online-Speicherung, Doppelkämpfe.
