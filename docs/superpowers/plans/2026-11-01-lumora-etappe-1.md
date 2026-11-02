# Lumora Etappe 1 – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Ziel:** Ein spielbares Monster-Roguelite im Browser mit vollständigem Kampfsystem, Akt 1 „Flüsterwald“ (2 Gebiets-Varianten), Story-Anfang, Geheimnissen und gespeichertem Fortschritt.

**Architektur:** Klassische `<script>`-Dateien hängen alles an den globalen Namensraum `LUM`. Inhalte (Monster, Attacken, Akte …) sind Daten, die sich in einer Registry anmelden. Die Logik (battle, run, meta) kennt kein DOM und liefert Ereignislisten. Die UI spielt diese Listen mit Animationen ab. Eine einzige Datei `js/files.js` legt die Ladereihenfolge fest. `index.html` und der Node-Testlauf lesen beide diese Liste.

**Technik:** HTML/CSS/JavaScript ohne Abhängigkeiten oder Build. SVG für die Grafik. Node.js (vorhanden, v26) nur zum Ausführen der Tests.

**Spezifikation:** `docs/superpowers/specs/2026-11-01-lumora-monster-roguelite-design.md`

## Global Constraints

- Keine externen Bibliotheken, kein Build. `index.html` muss per Doppelklick (`file://`) laufen, daher keine ES-Module und kein `fetch` lokaler Dateien.
- Jede Datei hat die Form `(function (L) { … })(globalThis.LUM);`. Nur `js/core/namespace.js` legt `globalThis.LUM` an.
- Logik-Dateien (`js/core`, `js/data`, `js/battle`, `js/run`, `js/meta`, `js/art`) greifen nie auf `document` oder `window` zu. Nur `js/ui/*` und `js/main.js` dürfen das.
- Jede Zufallsentscheidung läuft über ein `Rng`-Objekt (Task 2), niemals über `Math.random`.
- Alle Spieltexte sind auf Deutsch. IDs sind kleingeschrieben, ASCII und ohne Umlaute (`gluehwurm`).
- Typ-IDs: `glut, flut, spross, funke, stein, schatten, stern`.
- Wertebereich der Stufen: −3 bis +3. Team-Größe: `L.config.teamSize = 4`. Level 1–50.
- Alle Zugriffe auf localStorage stehen in try/catch. Ohne Speicher läuft das Spiel trotzdem.
- Lesbar ab 1280×720, Bedienung mit der Maus, Tasten 1–4 für Attacken.
- Tests: `node tests/run-node.js` muss mit Exit-Code 0 enden. `tests.html` zeigt dieselben Tests im Browser.

## Review Focus

1. **Lauf-Fortsetzung nach Neuladen mitten in einem Knoten** (z. B. während eines Kampfes). Erwartung: Der Lauf steht wieder auf der Karte vor diesem Knoten, nichts ist doppelt vergeben, der Seed-Zustand bleibt stabil. Test in Task 16 (`resume mid-node returns to map`).
2. **Alle Team-Monster gleichzeitig K.-o.** (z. B. Gift am Rundenende beim letzten Monster). Erwartung: Der Kampf endet sauber mit `lost`, ohne Auswahl-Aufforderung. Test in Task 8 (`last mon fainting from poison ends battle lost`).
3. **Fangen mit vollem Team.** Erwartung: Der Kampf endet mit `captured`, und die UI fragt, welches Monster freigelassen wird (oder ob man das neue verwirft). Kein fünftes Monster ohne Bannträger-Weg. Test in Task 14 (`capture with full team yields pendingRelease`).
4. **Monster lernt eine 5. Attacke oder entwickelt sich mitten in der EP-Verteilung.** Erwartung: Das wird als Angebot in eine Warteschlange gestellt und nach dem Kampf nacheinander gefragt. Kein Monster hat mehr als 4 Attacken. Test in Task 5 (`gainExp queues learn offer when 4 moves`).
5. **Beschädigter oder alter Spielstand.** Erwartung: Er wird nach `lumora_backup` verschoben, danach folgt ein frischer Meta-Spielstand mit Hinweis-Flag statt eines Absturzes. Test in Task 16 (`corrupt save is backed up`).

---

## Dateistruktur (Etappe 1)

```
index.html, tests.html, css/style.css
js/files.js                        Ladereihenfolge: LUM_FILES = { logic: [...], ui: [...] }
js/core/namespace.js, config.js, rng.js, registry.js, bus.js, clock.js, hooks.js
js/data/types.js, natures.js, traits.js, statuses.js, weather.js, abilities.js,
        moves.js, items.js, relics.js, blessings.js, affixes.js, resonance.js,
        characters.js, trainers.js
js/data/monsters/act1.js, js/data/monsters/unique.js
js/data/story/act1.js, js/data/events/act1.js, js/data/acts/act1.js
js/battle/stats.js, monster.js, damage.js, engine.js, ai.js, capture.js
js/run/conditions.js, mapgen.js, encounters.js, rewards.js, run.js, nodes.js
js/meta/save.js, progress.js
js/art/palette.js, monsterArt.js, portraitArt.js, backgrounds.js
js/ui/dom.js, screens.js, fx.js, hub.js, dialog.js, map.js, battle.js,
      reward.js, spring.js, shop.js, event.js, summary.js, dex.js, team.js
js/main.js
tests/harness.js, tests/files.js, tests/run-node.js, tests/*.test.js
```

---

### Task 1: Projekt-Gerüst, Testgerüst, Ladereihenfolge

**Files:**
- Create: `js/files.js`, `js/core/namespace.js`, `js/core/config.js`, `tests/harness.js`, `tests/files.js`, `tests/run-node.js`, `tests/harness.test.js`, `tests.html`, `index.html`, `css/style.css` (leer bis auf Farb-Tokens), `js/main.js` (Stub), `.gitignore`

**Interfaces:**
- Produces:
  - `globalThis.LUM` mit `L.version = '0.1.0'` und `L.config = { teamSize: 4, maxLevel: 50, shinyChance: 0.01 }`
  - `globalThis.LUM_FILES = { logic: string[], ui: string[] }`: Pfade relativ zum Projektordner
  - `globalThis.LUM_TEST_FILES: string[]`
  - Testgerüst global: `describe(name, fn)`, `it(name, fn)`, `assert.eq(actual, expected, msg?)` (tiefer Vergleich per JSON), `assert.ok(v, msg?)`, `assert.near(a, b, eps=1e-9)`, `assert.throws(fn, pattern?)`, `TEST.run() -> {passed, failed, failures:[{name, error}]}`
  - Loader in `index.html`/`tests.html`: Script-Tags aus `LUM_FILES` (und `LUM_TEST_FILES`) per `document.createElement('script')` mit `async = false` nacheinander anhängen, danach `L.main()` bzw. `TEST.run()` mit Ergebnisanzeige.

- [ ] **Step 1:** `git init`, `.gitignore` (`node_modules/`, `*.log`) anlegen. Spezifikation und Plan committen.
- [ ] **Step 2:** Den fehlschlagenden Test `tests/harness.test.js` schreiben:

```js
describe('harness', () => {
  it('eq compares deeply', () => { assert.eq({a:[1,2]}, {a:[1,2]}); });
  it('throws detects errors', () => { assert.throws(() => { throw new Error('x'); }, /x/); });
  it('namespace exists', () => { assert.eq(LUM.config.teamSize, 4); });
});
```

- [ ] **Step 3:** `node tests/run-node.js` ausführen. Erwartet: Fehler, weil die Dateien fehlen.
- [ ] **Step 4:** Die Dateien anlegen. `run-node.js` lädt `js/files.js`, `tests/harness.js` und `tests/files.js` per `vm.runInThisContext(code, {filename})`, danach jede Datei aus `LUM_FILES.logic` und `LUM_TEST_FILES`. Es gibt `✓/✗ name` aus, dazu eine Zusammenfassung, und setzt `process.exitCode = 1` bei Fehlern. Optionales Argument: Filter auf Testnamen.
- [ ] **Step 5:** `node tests/run-node.js` ausführen. Erwartet: `3 passed, 0 failed`.
- [ ] **Step 6:** Commit `chore: Projektgerüst und Testgerüst`

---

### Task 2: Zufall, Registry, Bus, Uhr, Hooks

**Files:**
- Create: `js/core/rng.js`, `js/core/registry.js`, `js/core/bus.js`, `js/core/clock.js`, `js/core/hooks.js`
- Test: `tests/core.test.js`

**Interfaces:**
- Produces:
  - `L.rng.create(seed: number|string) -> Rng`: Mulberry32. Ein String-Seed wird per FNV-1a-Hash zu einer Zahl.
    `Rng`: `next(): number in [0,1)`, `int(min, max)` (inklusive), `chance(p): bool`, `pick(arr)`, `weighted(arr, key='weight')`, `shuffle(arr)` (gibt eine Kopie zurück), `getState(): number`, `setState(n)`
  - `L.rng.dailySeed(date: Date) -> string` im Format `'YYYY-MM-DD'` (wird erst in Etappe 3 genutzt, ist aber schon klein und getestet)
  - `L.registry`: `add(kind, def)` (wirft bei doppelter ID oder fehlender `id`), `get(kind, id)` (wirft `Unbekannt: kind/id`), `has(kind,id)`, `all(kind) -> def[]` (in Einfügereihenfolge), `addValidator(kind, fn(def, registry) -> string[])`, `validate() -> string[]`
  - Kurzformen: `L.def = { type, nature, trait, status, weather, ability, move, species, item, relic, blessing, affix, resonance, character, trainer, scene, event, act }`, jeweils `(def) => registry.add(kind, def)`
  - `L.bus`: `on(name, fn) -> off()`, `emit(name, payload)`
  - `L.clock`: `now()` (überschreibbar für Tests), `isNight(date=L.clock.now()) -> bool` (20:00–05:59 Uhr)
  - `L.hooks.run(handlers: {source, fn}[], name: string, ctx: object, initial?: any) -> any`: Für `modify*`-Namen wird der Wert der Reihe nach durchgereicht (`value = fn(value, ctx) ?? value`). Für `on*`-Namen werden alle aufgerufen, ohne Rückgabewert.

- [ ] **Step 1:** Tests schreiben:
  - `rng is deterministic`: Zweimal `create(42)` ergibt dieselben ersten 5 `next()`-Werte.
  - `string seeds differ`: `create('a').next() !== create('b').next()`
  - `int stays in range`: 1000 × `int(1,6)` liegt in [1,6], und jeder Wert kommt vor.
  - `weighted respects zero weight`: Ein Eintrag mit `weight:0` wird in 500 Zügen nie gezogen.
  - `state roundtrip`: `getState`, 3× `next`, `setState`, 3× `next` ergibt gleiche Werte.
  - `registry rejects duplicate`: `assert.throws(...)` mit eigener Test-Kind `'_t'`
  - `registry get unknown throws /Unbekannt/`
  - `isNight`: 21:00 → true, 12:00 → false, 05:59 → true, 06:00 → false
  - `hooks modify chains`: Zwei Handler `v*2` und `v+1` mit Start 3 ergeben 7.
- [ ] **Step 2:** Ausführen, erwartet FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** `node tests/run-node.js` → alle PASS
- [ ] **Step 5:** Commit `feat(core): rng, registry, bus, clock, hooks`

---

### Task 3: Typen, Wesen, Merkmale, Werte

**Files:**
- Create: `js/data/types.js`, `js/data/natures.js`, `js/data/traits.js`, `js/battle/stats.js`
- Test: `tests/stats.test.js`

**Interfaces:**
- Produces:
  - Typ-Definition: `{id, name, color, icon, strong: [typeIds], weak: [typeIds]}` (`weak` = „nicht sehr effektiv gegen“). Die Werte stehen exakt in Spezifikation 3.1.
  - `L.types.effectiveness(attackType, defenderTypes: string[]) -> number` (Produkt aus 2 / 0,5 / 1)
  - Wesen: `{id, name, up: 'atk'|'def'|'spe'|'hp', down: …}`. 10 Stück, alle Paare mit `up !== down` aus {hp, atk, def, spe}, außer `hp↔spe` und `spe↔hp`.
  - Merkmal: `{id, name, desc, rarity: 'common'|'rare'|'veryRare', statMods?: {hp?, atk?, def?, spe?} (Faktoren), hooks?: {...}, bondRate?: number, extraMove?: true}`. Etappe 1: `riesig` (hp 1.15, spe 0.9, common), `winzig` (Ausweichen +10 % per Hook `modifyEvasion`, common), `flink` (spe 1.1, common), `zaeh` (def 1.1, common), `wild` (atk 1.1, common), `vernarbt` (atk 1.15, bondRate 0.5, rare), `sternaeugig` (Volltreffer-Stufe +1, rare), `sanft` (bondRate 2, rare), `uralt` (kennt `extraMove` aus `species.ancientMove`, veryRare), `strahlend` (alle Werte 1.05, veryRare)
  - `L.stats.calc(species, level, natureId, traitId|null) -> {hp, atk, def, spe}`
    - Nicht-KP: `floor(base * level / 25) + 5`. KP: `floor(base * level / 25) + level + 10`
    - Danach Wesen ×1.1 bzw. ×0.9, dann Merkmal-Faktoren, jeweils mit `Math.floor` nach jeder Multiplikation.
  - `L.stats.stageMult(stage) -> number`: `stage >= 0 ? (2+stage)/2 : 2/(2-stage)`

- [ ] **Step 1:** Tests schreiben:
  - `fire beats grass`: `effectiveness('glut',['spross']) === 2`
  - `dual types multiply`: `effectiveness('flut',['glut','stein']) === 4`
  - `stern hits all normal x2`: Für alle sechs gilt 2. `effectiveness('stern',['stern']) === 0.5`
  - `shadow beats stern`: 2
  - `stat formula`: Species-Fixture `{base:{hp:50,atk:60,def:40,spe:70}}` ergibt bei Lv 10 mit neutralem Wesen (Test-Wesen `_neutral`), ohne Merkmal `{hp:40, atk:29, def:21, spe:33}`.
  - `nature applies`: Ein Wesen mit up atk ergibt atk `floor(29*1.1) = 31`.
  - `stage mult`: +3 → 2.5, −3 → 0.4, 0 → 1
  - `ten natures registered`
- [ ] **Step 2:** FAIL prüfen. **Step 3:** Implementieren. **Step 4:** PASS. **Step 5:** Commit `feat: typen, wesen, merkmale, werte`

---

### Task 4: Status, Wetter, Attacken

**Files:**
- Create: `js/data/statuses.js`, `js/data/weather.js`, `js/data/moves.js`
- Test: `tests/moves.test.js`

**Interfaces:**
- Produces:
  - Status: `{id, name, icon, color}` mit den IDs `brand, gift, laehmung, schlaf`. Die Logik steckt im Engine-Code (Task 8). Verwirrung ist ein Flüchtiger-Status `volatile.verwirrt`.
  - Wetter: `{id, name, turns: 5, typeMods: {typeId: factor}, accuracyMod?: number, alwaysHitTypes?: [typeId]}`
    `nebel` (accuracyMod 0.85), `glutregen` (glut 1.3, flut 0.7), `stroemung` (flut 1.3, glut 0.7), `sturm` (funke 1.3, alwaysHitTypes ['funke'])
  - Attacke: `{id, name, type, power (0 = Status), accuracy (0–100, 0 = trifft immer), priority (Standard 0), effects: Effect[], desc, upgrades: {a: Partial<Move> & {name}, b: Partial<Move> & {name}}}`
    `Effect` = `{kind:'status', status, chance, target:'foe'|'self'}` | `{kind:'stage', stat, delta, chance, target}` | `{kind:'heal', fraction, target:'self'}` | `{kind:'drain', fraction}` | `{kind:'recoil', fraction}` | `{kind:'weather', weather}` | `{kind:'confuse', chance}` | `{kind:'critUp'}` | `{kind:'multiHit', min, max}` | `{kind:'cleanse', target:'self'}`
  - `L.moves.resolve(ref: {id, upgrade: null|'a'|'b'}) -> Move` (flache Zusammenführung von Basis und Upgrade, `name` aus dem Upgrade)
  - Struggle-Ersatz `verzweiflung` (typlos `null`, Stärke 40, recoil 0.25) für den Fall, dass keine Attacke nutzbar ist. Es gibt keine AP, daher ist das nur ein Absicherungsfall.
  - Etappe 1: **mindestens 36 Attacken**, mindestens 4 pro normalem Typ, davon mindestens 1 Status-Attacke pro Typ, dazu typlose Basis-Attacken (`tackle`→`rempler`, `kratzer`, `brueller` mit atk −1 beim Gegner, `konzentration` mit critUp). Jede Attacke hat genau 2 Upgrades.
  - Validator: Typ existiert, Status- und Wetter-IDs existieren, `upgrades.a` und `upgrades.b` vorhanden.

- [ ] **Step 1:** Tests schreiben: `resolve applies upgrade name and power` (z. B. `glutbiss`, Upgrade a hat höhere Stärke), `every move has two upgrades`, `registry validate has no move errors`, `at least 4 moves per normal type`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS
- [ ] **Step 5:** Commit `feat(data): status, wetter, attacken`

---

### Task 5: Monster-Arten Akt 1 + Einzigartige, Monster-Instanzen, EP

**Files:**
- Create: `js/data/abilities.js` (nur Definitionen, Hooks kommen in Task 10, bis dahin leere `hooks:{}`), `js/data/monsters/act1.js`, `js/data/monsters/unique.js`, `js/battle/monster.js`
- Test: `tests/monster.test.js`

**Interfaces:**
- Produces:
  - Art: `{id, name, types: [1–2], base: {hp, atk, def, spe}, ability, rarity: 'common'|'rare'|'veryRare'|'unique'|'boss', baseExp, learnset: [{level, move}], ancientMove?, evolves?: [{to, level, condition?}], bondMove?: moveId, dex: string, art: ArtSpec}`
    `ArtSpec` = `{body: 'round'|'tall'|'quad'|'serpent'|'bird'|'blob', palette: {main, belly, accent, eye}, shinyPalette: {...}, ears?: 'cat'|'long'|'leaf'|'horn'|'fin'|'none', tail?: 'flame'|'leaf'|'fluffy'|'bolt'|'fin'|'none', pattern?: 'spots'|'stripes'|'none', extras?: string[]}`
  - Arten Etappe 1 (IDs festgelegt):
    - Starter + Entwicklung Lv 14: `glimmi`→`glutaro` (Glut, Maus), `plitsch`→`platschotter` (Flut, Otter), `knospi`→`bluehreh` (Spross, Kitz)
    - Häufig: `summsel` (Funke, Hummel), `kieselkrabb` (Stein, Krabbe), `moosling` (Spross, Pilzwesen), `tropfling` (Flut, Schleim), `nachtschu` (Schatten, Eule), `zwirbel` (Funke, Eichhörnchen)
    - Selten: `pilzpuff` (Spross/Schatten, nur Moorlichtung), `lumini` (Glut/Funke, nur nachts)
    - Sehr selten: `brummfels` (Stein, nur versteckter Pfad)
    - Einzigartig (`unique.js`): `wispelin` (Spross/Schatten), `pochi` (Funke)
    - Boss: `dornkoenigin` (Spross/Schatten, `rarity:'boss'`)
  - Fähigkeiten-IDs (1 pro Art, Effekte in Task 10): `glutherz, flutherz, sprossherz` (Starter: Typ ×1.5 bei KP < 1/3), `summflug` (TEM +1 Stufe beim Einwechseln), `panzerschale` (Volltreffer-immun), `sporenwolke` (30 % Schlaf beim Kontakt-Treffer gegen sich), `schleimhaut` (heilt 1/16 pro Runde), `nachtauge` (Genauigkeit wird nie gesenkt, nachts ANG ×1.2), `wirbelwind` (Priorität +1 bei der ersten Attacke im Kampf), `nebelhauch` (setzt beim Einwechseln Nebel, wenn kein Wetter aktiv ist), `gluehlicht` (Brand-Chance eigener Glut-Attacken +20 %), `felsenfest` (überlebt einen Treffer bei vollen KP mit 1 KP), `irrlicht` (Status-Attacken des Gegners werden auf ihn zurückgeworfen), `glueckspfote` (Gold und Kristalle ×2 am Kampfende, wenn im Team), `dornenkrone` (Kontakt-Angreifer verliert 1/8 KP)
  - `L.mon.create({species, level, rng, nature?, trait?, shiny?, moves?}) -> Mon`
    `Mon` = `{uid, species, level, exp, nature, trait, shiny, hp, moves: [{id, upgrade}], status: null, statusTurns: 0, bond: 0, held: null}`
    Ohne `moves` sind es die letzten 4 Attacken aus dem `learnset` bis zum Level. Merkmal ohne Vorgabe: Mit 35 % ein Merkmal, gewichtet common 10, rare 3, veryRare 1. `uralt` fügt `ancientMove` hinzu (ersetzt dabei die älteste Attacke). `uid` aus `rng` (`'m' + int`).
  - `L.mon.stats(mon) -> {hp, atk, def, spe}` (über `L.stats.calc`)
  - `L.mon.expForLevel(level) = Math.floor(0.8 * level ** 3)`
  - `L.mon.gainExp(mon, amount) -> Offer[]`: Erhöht EP und Level (bis maxLevel). KP steigen um die Differenz der Max-KP. `Offer` = `{kind:'learn', mon:uid, move}` (immer als Angebot, wenn schon 4 Attacken, sonst direkt gelernt und als `{kind:'learned'}` gemeldet) | `{kind:'evolve', mon:uid, to}`
  - `L.mon.learn(mon, moveId, replaceIndex|null)`, `L.mon.evolve(mon, toId)` (behält KP-Anteil), `L.mon.heal(mon, fraction)`, `L.mon.isFainted(mon)`
  - Validator für Arten: Attacken, Fähigkeit und Entwicklungs-Ziel existieren, `base`-Summe zwischen 200 und 520 (Boss bis 650).

- [ ] **Step 1:** Tests schreiben:
  - `create uses last 4 learnset moves`
  - `create is deterministic with same seed`
  - `expForLevel(10) === 800`
  - `gainExp levels up and raises hp by maxhp diff`
  - `gainExp queues learn offer when 4 moves` (Review Focus 4)
  - `gainExp offers evolution at level 14 for glimmi`
  - `evolve keeps hp ratio`
  - `all species validate`
  - `starter base totals within 300–330`
- [ ] **Step 2–4:** FAIL → implementieren → PASS
- [ ] **Step 5:** Commit `feat: monster-arten akt 1, instanzen, EP`

---

### Task 6: Schadensformel

**Files:**
- Create: `js/battle/damage.js`
- Test: `tests/damage.test.js`

**Interfaces:**
- Consumes: `L.stats`, `L.types`, `L.moves.resolve`, `L.hooks.run`
- Produces: `L.damage.calc({attacker, defender, move, battle, rng, forceCrit?, forceRoll?}) -> {amount, effectiveness, crit, stab}`
  - `atk` und `def` sind Werte mit Stufen (aus `battle.sides[x].stages`, Task 7). Bei Brand ×0.75 auf atk.
  - Basis: `floor(floor(floor(2*lv/5+2) * power * atk / def) / 50) + 2`
  - Danach in dieser Reihenfolge, jeweils ohne Zwischenrunden: × Wetter-Typ-Faktor × STAB 1.25 (wenn der Attacken-Typ in `types`) × Effektivität × Volltreffer 1.5 × Zufall (`forceRoll` ?? `0.85 + rng.next()*0.15`) × `hooks modifyDamage` (Angreifer) × `hooks modifyIncomingDamage` (Verteidiger). Am Ende `Math.max(1, Math.floor(x))`. Bei Effektivität 0 gibt es das nicht (kein Typ ist immun).
  - Volltreffer-Stufe: 0 → 1/16, 1 → 1/8, 2 → 1/4, ≥3 → 1/2. Stufe +1 bei Bindung ≥ 70, dazu Hooks `modifyCritStage`.

- [ ] **Step 1:** Tests schreiben (feste Monster mit `L.mon.create`, `forceRoll:1`, `forceCrit:false`):
  - `neutral damage matches formula` (Zahl im Test von Hand nachgerechnet und als Konstante eingetragen)
  - `stab multiplies 1.25`
  - `super effective doubles` (Verhältnis mit `assert.near` innerhalb einer Rundung)
  - `crit multiplies 1.5`
  - `burn reduces attack`
  - `minimum damage 1`
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 7: Kampf-Engine (Kern)

**Files:**
- Create: `js/battle/engine.js`
- Test: `tests/engine.test.js`

**Interfaces:**
- Consumes: `L.damage.calc`, `L.mon`, `L.hooks`
- Produces:
  - `L.battle.create({player: {team: Mon[], items: {id: count}, relics: string[], blessing?: string}, enemy: {team: Mon[], kind: 'wild'|'trainer'|'elite'|'boss', trainer?: trainerId, affixes?: string[], phases?: Phase[]}, weather?: string, rng: Rng, run?: Run}) -> Battle`
    `Battle` = `{sides: [Side, Side], turn, weather: {id, turnsLeft}|null, state: 'choose'|'forceSwitch'|'won'|'lost'|'captured', log: Event[], kind, rng, flags: {}}`
    `Side` = `{team, active: index, stages: {atk, def, spe, acc, eva, crit}, volatile: {}, items, relics, bondUsed: false, participants: Set-ähnliches uid-Array}`. Stufen und flüchtige Zustände gelten für das aktive Monster und werden beim Wechsel zurückgesetzt.
  - `L.battle.start(battle) -> Event[]` (Einwechsel-Hooks, `onBattleStart`)
  - `L.battle.step(battle, playerAction) -> Event[]`: Die KI-Aktion holt die Engine über `L.ai.choose` (bis Task 11 Platzhalter `L.ai.choose = (b) => ({type:'move', index:0})`).
    `Action` = `{type:'move', index}` | `{type:'bond'}` | `{type:'switch', index}` | `{type:'item', item, target}` | `{type:'capture', ball}`
  - `L.battle.legal(battle, sideIndex) -> Action[]`
  - `L.battle.forceSwitch(battle, index) -> Event[]` (im Zustand `forceSwitch`)
  - Events (die UI braucht genau diese): `{t:'turnStart', turn}`, `{t:'switch', side, from, to}`, `{t:'move', side, move, name}`, `{t:'miss', side}`, `{t:'damage', side, amount, hp, maxHp, effectiveness, crit}`, `{t:'heal', side, amount, hp}`, `{t:'status', side, status}`, `{t:'statusTick', side, status, amount}`, `{t:'statusEnd', side, status}`, `{t:'cantMove', side, reason}`, `{t:'stage', side, stat, delta, now}`, `{t:'weather', id}`, `{t:'weatherEnd', id}`, `{t:'faint', side, uid}`, `{t:'bond', side, uid, value}`, `{t:'bondMove', side, uid}`, `{t:'ability', side, uid, ability}`, `{t:'text', text}`, `{t:'phase', index}`, `{t:'captureTry', ball, shakes, success}`, `{t:'end', result}`
  - Rundenablauf: 1) Wechsel → 2) Items → 3) Fangen → 4) Attacken nach (Priorität, effektives Tempo inklusive Lähmung und Stufen, Zufall bei Gleichstand) → 5) Rundenende: Status-Ticks, Wetter-Countdown, Hooks `onTurnEnd`, Bindung +3 für jedes aktive Monster des Spielers → 6) K.-o. prüfen: Gegner K.-o. → nächstes Monster der KI oder `won`. Spieler K.-o. → `forceSwitch`, oder `lost`, wenn keines mehr übrig ist.
  - Ein Monster, das in dieser Runde K.-o. gegangen ist, greift nicht mehr an.

- [ ] **Step 1:** Tests schreiben (Seed fest, KI-Platzhalter):
  - `faster mon moves first`
  - `priority beats speed`
  - `fainted enemy mon replaced by next`
  - `last enemy faint → state won, end event`
  - `player faint with bench → forceSwitch`
  - `switch happens before enemy attack and takes the hit`
  - `legal excludes capture in trainer battles`
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 8: Status, Stufen, Wetter und Effekte in der Engine

**Files:**
- Modify: `js/battle/engine.js` (Effekt-Ausführung als `applyEffect(battle, sideIdx, effect, events)` in eigenem Abschnitt)
- Test: `tests/effects.test.js`

**Interfaces:**
- Werte aus der Spezifikation:
  - Brand: 1/16 Max-KP pro Runde, atk ×0.75 (Task 6)
  - Gift: n/16 Max-KP, n beginnt bei 1, +1 pro Runde, höchstens 4
  - Lähmung: TEM ×0.5, 25 % Aussetzen
  - Schlaf: 1–3 Runden, kein Zug
  - Verwirrung: 2–4 Runden, 33 % Selbsttreffer mit Stärke 40, typlos
  - Ein Monster hat höchstens einen Haupt-Status. Typ-Immunität: Glut gegen Brand, Funke gegen Lähmung, Schatten gegen Gift.
- Wetter: 5 Runden (Hook `modifyWeatherTurns`), Typfaktoren in Task 6, `accuracyMod`, `alwaysHitTypes`
- Treffer: `accuracy * stageMult(acc − eva) * Wetter-accuracyMod`, Hooks `modifyAccuracy`/`modifyEvasion`

- [ ] **Step 1:** Tests schreiben:
  - `burn ticks 1/16`
  - `poison escalates`
  - `paralysis halves speed`
  - `sleep blocks 1-3 turns then wakes`
  - `glut immune to brand`
  - `stage capped at +3`
  - `weather expires after 5 turns`
  - `sturm makes funke always hit`
  - `drain heals attacker`
  - `last mon fainting from poison ends battle lost` (Review Focus 2)
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 9: Items, Bindung und EP im Kampf

**Files:**
- Create: `js/data/items.js`
- Modify: `js/battle/engine.js`
- Test: `tests/battle-items.test.js`

**Interfaces:**
- Item: `{id, name, desc, kind: 'heal'|'revive'|'cure'|'ball'|'held'|'secret', price, value?, ballMod?, nightBallMod?, hooks?}`
  - `heiltrank` (heal 0.5, 30), `superheiltrank` (heal 1.0, 60), `allheiler` (cure, 35), `beleber` (revive 0.5, 70), `fangkugel` (ball 1.0, 20), `superkugel` (ball 1.5, 45), `mondkugel` (ball: Nacht 3.0, sonst 0.5, 60, nur im Geheimshop bzw. auf versteckten Pfaden)
  - Getragen (`held`, Typ-Boost ×1.2): `glutfeder, tropfenperle, blattbrosche, funkenring, kieselschale, schattenschleier`, dazu `beerenbeutel` (einmal pro Kampf Heilung um 25 % bei KP < 50 %)
- Bindung: +3 pro Runde für das aktive Monster des Spielers, +10 bei einem Sieg für Teilnehmer, höchstens 100. Merkmale können über `bondRate` multiplizieren. Die Bindungs-Attacke braucht Bindung 100 und `!side.bondUsed`. Danach ist `bond = 60`. Stärke = `max(90, 1.5 × stärkste Schadens-Attacke)`, Typ = erster Typ des Monsters, trifft immer, Volltreffer-Stufe +1, oder `species.bondMove`, falls definiert.
- `L.battle.rewards(battle) -> {exp: {uid: amount}, offers: Offer[], bondGains}`, am Kampfende aufrufen: EP = `floor(baseExp * enemyLevel / 5)` je besiegtem Gegner, × 1.5 bei Trainer, Elite oder Boss. Teilnehmer bekommen 100 %, die anderen lebenden Team-Monster 50 %. Danach Hooks `modifyExp`.

- [ ] **Step 1:** Tests schreiben: `heiltrank heals half and consumes item`, `beleber only targets fainted`, `bond move unavailable below 100`, `bond move sets bond to 60 and only once per battle`, `exp split participants 100 bench 50`, `trainer exp x1.5`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 10: Fähigkeiten, Merkmale, Relikte, Segen, Affixe, Resonanz über Hooks

**Files:**
- Modify: `js/data/abilities.js`, `js/data/traits.js`
- Create: `js/data/relics.js`, `js/data/blessings.js`, `js/data/affixes.js`, `js/data/resonance.js`
- Modify: `js/battle/engine.js` (Funktion `collectHandlers(battle, sideIdx) -> {source, fn}[]` je Hook-Name)
- Test: `tests/hooks.test.js`

**Interfaces:**
- Hook-Namen (vollständige Liste, Engine und Daten nutzen genau diese): `onBattleStart, onSwitchIn, onTurnEnd, onHit (Verteidiger wurde getroffen), onDealDamage, onFaint, onStatusInflict (kann {reflect:true} oder {block:true} zurückgeben), modifyStat(stat), modifyDamage, modifyIncomingDamage, modifyCritStage, modifyAccuracy, modifyEvasion, modifyPriority, modifyWeatherTurns, modifyExp, modifyCatchRate, modifyGold, modifyCrystals, modifyHealAfterBattle, modifySurvive (gibt true zurück → überlebt mit 1 KP)`
- Quellen und Reihenfolge: Fähigkeit → Merkmal → getragenes Item → Resonanz → Relikte → Segen (bei Spieler-Seite) bzw. Affixe (bei Gegner-Seite)
- Relikte Etappe 1 (`{id, name, desc, rarity, hooks}`), 12 Stück: `doppelband` (Bindung ×2), `wanderkompass` (zeigt Ereignis-Inhalte auf der Karte, ein Flag, das die Lauf-Logik liest), `gluecksklee` (Gold +25 %), `fangnetz` (Fangchance ×1.2), `heilmoos` (nach jedem Kampf 5 % Heilung), `wetterfahne` (Wetter 8 Runden), `schaerfstein` (Volltreffer-Stufe +1), `schutzamulett` (erster Treffer pro Kampf −50 %), `ersthelfer` (Einwechseln heilt 10 %), `lehrbuch` (EP +25 %), `federleicht` (TEM ×1.1), `typprisma` (sehr effektiv ×2.2 statt 2, über `modifyDamage` mit Faktor 1.1 bei Effektivität ≥2)
- Segen Etappe 1 (`{id, name, desc, apply(run)}` bzw. Hooks), 8 Stück: `kugelregen` (+3 Fangkugeln), `fruehstart` (Starter +3 Level), `weitblick` (4 statt 3 Belohnungs-Optionen), `goldbeutel` (+100 Gold), `kraeuterkorb` (+3 Heiltränke), `altes_erbe` (zufälliges seltenes Relikt), `seelenband` (Starter beginnt mit Bindung 50), `schimmerglanz` (Schimmer-Chance ×3)
- Affixe (`{id, name, icon, hooks}`), 5 Stück: `gepanzert` (VER +1 Stufe beim Einwechseln), `rasend` (ANG +1 Stufe bei jedem Rundenende, höchstens +3), `regeneriert` (1/12 Heilung pro Runde), `spiegelnd` (20 % des erlittenen Schadens zurück), `gespalten` (beim ersten Fallen unter 50 %: Klon mit 50 % Max-KP wird ans Ende des Gegner-Teams gehängt, Event `{t:'text'}`)
- Resonanz (`{id, name, desc, check(team) -> bool, hooks}`):
  - `duo_<typ>` (2 gleiche: Typ ×1.1), `trio_<typ>` (3 gleiche: Typ ×1.2 und KP-Wert ×1.1, ersetzt Duo)
  - `gewitter` (Flut + Funke: Funke-Attacken treffen immer)
  - `waldbrand` (Glut + Spross: Brand-Chancen +10 %)
  - `wurzelfels` (Stein + Spross: VER +1 Stufe beim Einwechseln)
  - `nachtblitz` (Schatten + Funke: Volltreffer-Stufe +1)
  - `harmonie` (4 verschiedene Erst-Typen: alle Werte ×1.05)
  - `L.resonance.active(team) -> resonanceDef[]` (nur lebende Monster zählen)

- [ ] **Step 1:** Tests schreiben, mindestens einen pro Hook-Familie: `glutherz boosts below third hp`, `panzerschale blocks crit`, `felsenfest survives at full hp`, `irrlicht reflects status`, `relic lehrbuch adds 25% exp`, `affix gespalten adds clone once`, `resonance duo vs trio exclusive`, `harmonie needs 4 distinct types`, `validate: all hook names known` (Validator wirft bei unbekanntem Hook-Namen in Daten).
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 11: Gegner-KI

**Files:**
- Create: `js/battle/ai.js` (ersetzt den Platzhalter)
- Test: `tests/ai.test.js`

**Interfaces:**
- `L.ai.choose(battle, sideIdx, rng) -> Action`
- Jede legale Attacke bekommt eine Punktzahl:
  - Erwarteter Schaden in Prozent der aktuellen Ziel-KP mit `forceRoll: 0.925`, ohne Volltreffer, × Trefferchance. K.-o. möglich → +50.
  - Status-Attacke: +25, wenn das Ziel keinen Status hat und nicht immun ist, sonst −100.
  - Stufen-Attacke: +15 pro Stufe bis +2, danach 0.
  - Heilung: + (fehlende KP in %) wenn unter 50 %.
- Wechsel (nur `trainer`, `elite`, `boss`): Wenn das aktive Monster gegen den Gegner Effektivität ≤ 0.5 bei allen Attacken hat **und** ein Bank-Monster ≥ 2 hat, wird mit Punktzahl 60 gewechselt.
- Wild-Monster: Zufall gewichtet nach Punktzahl (`weight = max(1, score)`). Trainer: beste Punktzahl mit 20 % Zufall unter den Top 2. Elite und Boss: immer die beste Punktzahl. Bei Boss mit Phasen nutzt die KI die Phasen-Attacke, sobald verfügbar.
- Gegner nutzen keine Items, außer Bosse: Je ein `superheiltrank` bei KP < 25 %, einmal pro Kampf.

- [ ] **Step 1:** Tests schreiben: `elite picks KO move`, `does not repeat status on statused target`, `trainer switches out of bad matchup`, `wild never switches`, `boss heals once below 25%`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 12: Bedingungen und Fangen

**Files:**
- Create: `js/run/conditions.js`, `js/battle/capture.js`
- Modify: `js/battle/engine.js` (Fang-Aktion ruft `L.capture`)
- Test: `tests/conditions.test.js`, `tests/capture.test.js`

**Interfaces:**
- `L.cond.check(cond, ctx: {run?, meta?, now?: Date, rng?}) -> bool`. Bedingungen:
  `{all:[…]}`, `{any:[…]}`, `{not:c}`, `{chance:p}` (braucht `rng`), `{realTime:'night'|'day'}`, `{runNumber:{min}}`, `{metaFlag:id}`, `{runFlag:id}`, `{bossDefeated:id}`, `{fragments:n}`, `{act:id}`, `{variant:id}`, `{teamTypeCount:{type, min}}`, `{noHealInAct:actId}`, `{hasRelic:id}`, `{hasItem:id}`, `{sceneSeen:id}`
  Eine unbekannte Bedingungs-Art wirft `Unbekannte Bedingung: x`.
- `L.capture.chance({target: Mon, ball: itemId, battle, now}) -> number`:
  `(1 − (2/3) * hp/maxHp) × rarity(common 1, rare 0.6, veryRare 0.35, unique 0.2) × status(schlaf 2, sonst mit Status 1.5, ohne 1) × ballMod × hooks modifyCatchRate`, begrenzt auf [0.02, 0.95]. `boss`-Arten und Trainer-Monster lassen sich nicht fangen (`legal` schließt das aus).
- Fang-Ablauf: 3 Wackler, jeder mit `p^(1/3)`. Bei Erfolg ist `state = 'captured'`, `battle.captured = mon`. Volles Team → `battle.pendingRelease = true` (Review Focus 3).

- [ ] **Step 1:** Tests schreiben: `night condition uses injected now`, `nested all/any/not`, `unknown condition throws`, `chance at full hp common fangkugel = 1/3`, `sleep doubles`, `clamped to 0.95`, `capture with full team yields pendingRelease`, `boss not capturable`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 13: Kartenerzeugung

**Files:**
- Create: `js/run/mapgen.js`
- Test: `tests/mapgen.test.js`

**Interfaces:**
- `L.mapgen.generate(act, variant, rng, opts: {run?, now?}) -> GameMap`
  `GameMap` = `{layers: number, nodes: {[id]: Node}, start: nodeId[], boss: nodeId}`
  `Node` = `{id: 'L{layer}C{col}', layer, col, kind, links: nodeId[], data: {}}`
  `kind` ∈ `battle, elite, spring, shop, event, rival, hidden, boss`
- Algorithmus:
  1. 5 Spalten (0–4) und `act.map.layers` Ebenen (Akt 1: 13, Index 0–12).
  2. 4 Pfade, Start jeweils in einer zufälligen Spalte auf Ebene 0, die ersten zwei Pfade in verschiedenen Spalten. Jeder Schritt geht zu Spalte −1, 0 oder +1 (innerhalb der Grenzen). Eine Kante darf keine bestehende Kante kreuzen (sonst Spalte 0 wählen).
  3. Ebene 12 ist ein einzelner Boss-Knoten, mit dem alle Knoten auf Ebene 11 verbunden sind.
  4. Arten: Ebene 0 nur `battle`, Ebene 11 nur `spring`. Sonst gewichtet nach `variant.nodeWeights ?? act.map.nodeWeights` mit diesen Regeln:
     - `elite` erst ab Ebene 4
     - `spring` und `shop` nicht vor Ebene 3, nicht zweimal hintereinander auf einer Kante
     - genau **ein** `rival` auf den Ebenen 5–8 (falls `act.rival` existiert)
     - `hidden`: Jeder Knoten ab Ebene 3 wird mit `act.map.hiddenChance` (Akt 1: 0.08) zu `hidden` umgewandelt, höchstens 1 pro Karte
     - mindestens 1 `shop` und 2 `event` pro Karte, sonst werden zufällige `battle`-Knoten umgewandelt
- `L.mapgen.reachable(map, fromId) -> Set<nodeId>`

- [ ] **Step 1:** Tests schreiben (für 200 Seeds): `every start reaches boss`, `no dead ends`, `layer 11 all spring`, `exactly one rival`, `no elite before layer 4`, `at most one hidden`, `at least one shop and two events`, `no crossing edges`, `deterministic for seed`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 14: Lauf-Zustand, Begegnungen, Belohnungen, Quellen, Shop

**Files:**
- Create: `js/run/run.js`, `js/run/encounters.js`, `js/run/rewards.js`, `js/run/nodes.js`
- Test: `tests/run.test.js`

**Interfaces:**
- Consumes: `L.mapgen`, `L.cond`, `L.mon`, `L.battle`, Akt-Daten (Task 15. Für Tests registriert die Testdatei bei Bedarf eine Mini-Akt-Fixture `_testact`.)
- `L.run.create({seed, starter, blessing, meta, now?}) -> Run`
  `Run` = `{seed, rngState, number, actIndex, act, variant, map, position: nodeId|null, visited: [], team: Mon[], items: {}, relics: [], gold, crystals, flags: {}, healedInAct: {}, blessing, pending: null|PendingNode, stats: {battlesWon, caught: []}}`
  Start: Starter auf Lv 5 (Segen `fruehstart` +3), 50 Gold, Items `{fangkugel:3, heiltrank:2}`, danach `blessing.apply(run)`. Die Akte kommen aus `L.registry.all('act')`, sortiert nach `order`.
- `L.run.rng(run) -> Rng` (mit `run.rngState` verknüpft, jeder Aufruf schreibt den Zustand zurück)
- `L.run.choices(run) -> nodeId[]` (`map.start`, wenn `position` null ist, sonst `links` der Position)
- `L.run.enter(run, nodeId, now?) -> PendingNode`: Setzt `run.pending`, erzeugt den Inhalt **deterministisch** aus `rng`, damit nach dem Neuladen derselbe Inhalt kommt.
  `PendingNode` = `{node, kind, battle?: BattleSetup, spring?: SpringOptions, shop?: Stock, event?: eventId, scene?: sceneId}`
- `L.encounters.wild(run, rng, now) -> {species, level, shiny, trait}`:
  - Pochi-Prüfung zuerst: `rng.chance(0.005)`
  - Danach eine gewichtete Wahl aus `variant.encounters`, wobei Einträge mit `condition` gefiltert werden
  - Level = `round(lo + (hi − lo) × layer / (layers − 1)) + rng.int(−1, 1)` aus `act.levelRange`
  - Schimmer: `rng.chance(config.shinyChance × blessingFactor)`
- Versteckter Knoten (`hidden`): Mit 50 % kommt ein wilder Kampf gegen eine Art aus `act.hidden.encounters` (Level +2, Schimmer-Chance ×5), danach eine Belohnung `rewards.roll(…, 'hidden')`. Sonst sofort `rewards.roll(…, 'hidden')` ohne Kampf. Zum Test: `hidden node yields brummfels or hidden reward`.
- `L.encounters.elite(run, rng)` (Trainer aus `act.elites`, Level +2, 1 Affix), `L.encounters.boss(run, rng)` (Level = hi + 1, 2 Affixe nur ab Etappe 3, hier keine)
- `L.run.resolveBattle(run, battle) -> Summary`: Gold (battle 15–25, elite 40–60, boss 100, × Hooks), Kristalle (1 / 3 / 10, Erstfang +5, Schimmer-Erstfang +15), EP-Verteilung, `heilmoos` und andere Nachkampf-Hooks, gefangenes Monster ins Team oder `pendingRelease`
- `L.rewards.roll(run, source: 'battle'|'elite'|'boss'|'hidden', rng) -> Reward[]` (3 Stück, 4 mit `weitblick`)
  `Reward` = `{kind:'monster', species, level}` | `{kind:'move', move}` (Schriftrolle) | `{kind:'relic', relic}` | `{kind:'item', item, count}` | `{kind:'gold', amount}`
  Gewichte: battle (Gold 30, Item 30, Schriftrolle 25, Monster 15), elite (Relikt 40, Schriftrolle 30, Monster 30), boss (3 Relikte, `rarity` ≥ rare), hidden (sehr seltenes Monster oder seltenes Relikt). Keine doppelten Relikte, die man schon hat.
- `L.rewards.apply(run, reward, opts: {mon?, replaceIndex?}) -> Offer[]`
- Quelle `L.nodes.spring(run, choice: 'heal'|'train'|'upgrade', opts)`:
  - heal: alle auf volle KP, Status weg, K.-o. wiederbelebt, `run.healedInAct[actId] = true`
  - train: ein Monster +2 Level (über gainExp-Differenz, Angebote werden zurückgegeben)
  - upgrade: eine Attacke eines Monsters bekommt Upgrade `a` oder `b` (nur ohne vorhandenes Upgrade)
  - Wispelin: Wenn `noHealInAct` für den aktuellen Akt gilt **und** Ebene 11 erreicht ist, enthält `spring` die Option `irrlicht` → `BattleSetup` mit `wispelin` (Level hi, wild)
- Shop `L.nodes.shopStock(run, rng) -> [{kind:'item'|'relic'|'move', id, price}]`: 4 Items, 2 Relikte (120–180), 2 Schriftrollen (60). `L.nodes.buy(run, index)` prüft das Gold.
- `L.run.complete(run)`: Setzt `position = pending.node`, `visited.push`, `pending = null`. Beim Boss: `actIndex++`. Gibt es keinen weiteren Akt, ist `run.finished = 'victory'`. Sonst neue Karte, volle Heilung, Szene `act.outro` bzw. `nextAct.intro`.

- [ ] **Step 1:** Tests schreiben:
  - `create gives starter lv5 and starting items`
  - `enter is deterministic after save/restore of rngState`
  - `wild level scales with layer`
  - `night-only encounter filtered by day`
  - `pochi can appear` (Seed suchen, bei dem es klappt, und im Test festhalten)
  - `spring heal sets healedInAct`
  - `irrlicht option only without heal at layer 11`
  - `rewards never duplicate owned relic`
  - `weitblick gives 4 rewards`
  - `buy fails without gold`
  - `boss complete advances act or finishes run`
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 15: Inhalte Akt 1 (Akt, Varianten, Trainer, Figuren, Ereignisse, Story)

**Files:**
- Create: `js/data/acts/act1.js`, `js/data/trainers.js`, `js/data/characters.js`, `js/data/events/act1.js`, `js/data/story/act1.js`
- Modify: `js/run/nodes.js` (Ereignisse und Szenen ausführen)
- Test: `tests/content.test.js`

**Interfaces:**
- Akt (Form wie Spezifikation 9.3, mit Varianten):
  `{id:'act1', order:1, name:'Flüsterwald', levelRange:[3,14], map:{layers:13, hiddenChance:0.08, nodeWeights:{battle:45, elite:10, spring:10, shop:8, event:22}}, rival:'kael_act1', variants:[Variant], elites:[trainerId], boss:{trainer:'fenna', phases:[...]}, intro:'act1_intro', outro:'act1_outro', hidden:{encounters:[{species:'brummfels'}], rewards:'hidden'}}`
  `Variant` = `{id, name, background, palette, weather: weatherId|null, encounters:[{species, weight, condition?}], events:[eventId]}`
  - `fluesterwald`: kein Wetter. Begegnungen summsel 20, kieselkrabb 15, moosling 20, tropfling 15, nachtschu 12, zwirbel 15, lumini 6 (`{realTime:'night'}`)
  - `moorlichtung`: Wetter `nebel`. Begegnungen tropfling 25, moosling 20, nachtschu 18, pilzpuff 10, kieselkrabb 12, summsel 10, lumini 6 (nachts)
- Trainer: `{id, name, character, team:[{species, levelOffset, moves?, held?}], ai:'trainer'|'elite'|'boss', lines:{start, win, lose}}`
  - Eliten: `pilz_theo`, `ida_waldlaeuferin`, `jonas_schueler` (je 2 Monster)
  - Rivale `kael_act1`: Sein Starter hat Typvorteil gegen deinen Starter, Level +1, und er hat 1 weiteres Monster.
  - Boss `fenna`: `dornkoenigin` + 1 Begleiter. Phase bei 50 % KP: Dialog, Wetter `nebel`, `dornkoenigin` lernt `dornenwirbel`.
- `Phase` = `{atHpBelow: 0.5, scene, weather?, addMove?, stageBoost?: {stat, delta}}`
- Figuren: `{id, name, portrait: PortraitSpec}` für `mira`, `kael`, `fenna`, `spieler_a`, `spieler_b`, `theo`, `ida`, `jonas`, `haendlerin`
- Szene: `{id, condition?, once: bool, lines: [{who, expr: 'neutral'|'froh'|'ernst'|'traurig'|'wuetend'|'ueberrascht', text}]}`
  Pflicht-Szenen: `intro_first` (Lauf 1, Mira), `intro_echo` (Lauf ≥ 2), `act1_intro`, `kael_first`, `kael_again` (`sceneSeen kael_first`), `fenna_pre`, `fenna_phase2`, `fenna_post`, `act1_outro` (endet mit „Fortsetzung folgt …“), `gameover_echo`
- Ereignis: `{id, title, scene?, text, options: [{label, condition?, effect: (api) => void, preview?: string}]}`. `api` bietet: `heal(fraction)`, `damageTeam(fraction)`, `gold(delta)`, `item(id, n)`, `relic(id|'random')`, `battle(setup)`, `teachMove(moveId)`, `addMon(speciesId, level)`, `flag(id)`, `text(str)`, `rng`.
  Mindestens 8 Ereignisse für Akt 1: `verirrtes_junges`, `moosaltar`, `wandernde_haendlerin`, `sprechender_pilz` (Rätsel mit 3 Antworten), `beerenstrauch`, `alter_trainer`, `gluehwuermchentanz` (nur nachts → `lumini`), `kaputte_bruecke`
- `L.nodes.event(run, eventId, optionIndex) -> {texts: string[], battle?: BattleSetup, offers: Offer[]}`
- `L.story.next(run, meta, trigger: 'runStart'|'actIntro'|…) -> sceneId|null`: erste passende Szene nach Bedingung und `once`

- [ ] **Step 1:** Tests schreiben: `registry validate returns []` (alle Verweise gültig), `every act1 event option has label and effect`, `intro_first on run 1, intro_echo on run 2`, `variants both reachable via seeds`, `kael counter-picks starter type`, `fenna phase triggers at 50%` (Kampf mit Boss-Setup, Schaden erzwingen, Event `phase` prüfen).
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 16: Speichern, Meta-Fortschritt, Lexikon

**Files:**
- Create: `js/meta/save.js`, `js/meta/progress.js`
- Test: `tests/save.test.js`

**Interfaces:**
- `L.save.setStorage(storageLike|null)` (Standard: `globalThis.localStorage` in try/catch, sonst Speicher im Arbeitsspeicher und `L.save.available = false`)
- Schlüssel: `lumora_meta`, `lumora_run`, `lumora_backup`
- `Meta` = `{version: 1, runs: 0, crystals: 0, totalCrystals: 0, dex: {[speciesId]: {seen, caught, shinySeen, shinyCaught, traits: []}}, scenesSeen: [], bossesDefeated: [], flags: {}, fragments: [], stats: {victories: 0, bestAct: 0}, notices: []}`
- `L.save.loadMeta() -> Meta` (Migration über `L.save.migrations[version]`. Kaputt → Backup nach `lumora_backup`, frisches Meta mit `notices: ['save_corrupt']`), `saveMeta(meta)`
- `L.save.saveRun(run)`, `loadRun() -> Run|null`, `clearRun()`. Ein Lauf wird nach jedem `enter`, `complete` und Kampfende gespeichert. Mon-Objekte sind reines JSON (keine Sets: `participants` ist ein Array).
- `L.run.resume(run)`: Ist `pending.kind === 'battle'`, wird der Kampf **verworfen** und `pending` bleibt. Die UI startet den Kampf aus `pending.battle` neu (Review Focus 1). Deshalb muss `enter` den Inhalt vollständig in `pending` ablegen.
- `L.progress.seen(meta, mon)`, `caught(meta, mon) -> {firstCatch, firstShiny}`, `finishRun(meta, run) -> {crystals, newRecords}` (+5 Kristalle pro erreichtem Akt, `runs++`), `dexCompletion(meta) -> number` (gefangene / nicht-geheime Arten. Einzigartige zählen erst, wenn gesehen)

- [ ] **Step 1:** Tests schreiben (Speicher-Attrappe): `meta roundtrip`, `corrupt save is backed up` (Review Focus 5), `missing storage falls back to memory`, `run roundtrip keeps rng state`, `resume mid-node returns to map with same pending` (Review Focus 1), `first catch flags`, `finishRun adds act crystals`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS. **Step 5:** Commit

---

### Task 17: Monster-Grafik (Anime-SVG)

**Files:**
- Create: `js/art/palette.js`, `js/art/monsterArt.js`
- Test: `tests/art.test.js`, dazu Sichtprüfung über `art-preview.html` (zeigt alle Arten normal und als Schimmer nebeneinander)

**Interfaces:**
- `L.art.monster(speciesId, {shiny=false, facing='left'|'right', size=160, pose='idle'}) -> string` (vollständiges `<svg>`)
  - Aufbau: Schatten-Ellipse → Schweif → Körper (Form aus `body`) → Bauch → Muster → Ohren/Hörner → Augen → Extras
  - **Augen im Anime-Stil**: groß (≥ 18 % der Körperbreite), Iris in `palette.eye` mit Verlauf, 2 weiße Glanzpunkte (groß oben links, klein unten rechts), dunkler Lidstrich oben
  - **Cel-Shading**: pro Körperteil ein zweiter, dunklerer Pfad mit harter Kante (`palette.main` um 18 % verdunkelt, `L.palette.shade(hex, amount)`), Umriss `#2b2238` mit 3px und `stroke-linejoin:round`
  - Wangen-Röte (rosa Ellipsen mit 40 % Deckkraft) bei `round`, `blob`, `quad`
  - Schimmer: `shinyPalette` plus 3 Sternfunkeln als `<path>` mit Klasse `sparkle`
  - Idle-Animation per CSS-Klasse `mon-idle` (Atmen per `transform: scaleY`), keine SMIL-Animation
  - Jede SVG bekommt eindeutige `id`-Präfixe pro Aufruf (Zähler), damit sich Verläufe nicht überschneiden.
- `L.palette.shade(hex, amount) -> hex`, `L.palette.typeColor(typeId)`

- [ ] **Step 1:** Tests schreiben: `every species renders svg string starting with <svg`, `shiny uses shiny palette color`, `gradient ids unique across two calls`, `unknown body throws`.
- [ ] **Step 2–4:** FAIL → implementieren → PASS
- [ ] **Step 5:** `art-preview.html` im Browser-Bereich öffnen, Screenshot machen und prüfen: Augen gut erkennbar, keine abgeschnittenen Teile, jede Art unterscheidbar. Auffälligkeiten nachbessern.
- [ ] **Step 6:** Commit

---

### Task 18: Porträts (Chibi), Hintergründe

**Files:**
- Create: `js/art/portraitArt.js`, `js/art/backgrounds.js`
- Modify: `art-preview.html` (Abschnitt für Porträts und Hintergründe)
- Test: `tests/art.test.js` (ergänzen)

**Interfaces:**
- `PortraitSpec` = `{skin, hair: {style: 'kurz'|'zopf'|'lang'|'stachelig'|'dutt'|'kapuze', color}, eyes: color, outfit: color, accessory?: 'stirnband'|'blume'|'brille'|'krone'|'schal'}`
- `L.art.portrait(characterId, expr='neutral', {size=220}) -> svg`: Chibi mit großem Kopf (Kopf ≈ 60 % der Höhe), Anime-Augen wie bei den Monstern, Mund und Augenbrauen je nach `expr` (6 Ausdrücke aus Task 15), Cel-Shading an Haar und Kleidung
- `L.art.background(bgId, {width=1280, height=720}) -> svg`: `wald` (Fluesterwald: Bäume in Schichten, Lichtstrahlen), `moor` (Nebelschichten, Schilf), `schrein` (Hub), `arena_boss` (dunkler Wald mit Dornen). Die Farben kommen aus `variant.palette`.

- [ ] **Step 1–4:** Tests schreiben (`every character renders`, `every expr renders`, `every background renders`) → FAIL → implementieren → PASS
- [ ] **Step 5:** Sichtprüfung über `art-preview.html` mit Screenshot, dann nachbessern
- [ ] **Step 6:** Commit

---

### Task 19: UI-Grundgerüst, Hub, Starter-, Segen- und Kartenbildschirm

**Files:**
- Create: `js/ui/dom.js`, `js/ui/screens.js`, `js/ui/hub.js`, `js/ui/dialog.js`, `js/ui/map.js`, `js/ui/team.js`, `js/main.js`
- Modify: `css/style.css`, `index.html`

**Interfaces:**
- `L.ui.h(tag, attrs, ...children) -> Element` (kleine Hilfsfunktion), `L.ui.svg(str) -> Element`
- `L.ui.screens.show(name, params)`: Bildschirme registrieren sich mit `L.ui.screens.register(name, {render(root, params), leave?()})`
- `L.ui.dialog.play(sceneId) -> Promise<void>`: Visual-Novel-Fenster mit Porträt links oder rechts, Name, tippender Text (Klick = sofort ganzer Text / weiter)
- `L.ui.game`: Zustandshalter `{meta, run}` plus `L.ui.game.persist()`
- Ablauf: Titel → Hub (Schrein-Hintergrund, Mira. Knöpfe: „Neuer Lauf“, „Weiterspielen“ wenn ein Lauf gespeichert ist, „Lexikon“, Kristall-Anzeige) → Szene `intro_*` → Starter-Wahl (3 Karten mit Monster-SVG, Typ, Werten, Fähigkeit) → Segen-Wahl (3 zufällige) → Akt-Intro → Karte
- Karte: SVG-Knoten mit Icons (⚔️💀⛲🛒❓🗡️🔮👑), Linien zwischen den Knoten, besuchter Pfad hervorgehoben, wählbare Knoten pulsieren. Mit `wanderkompass` zeigt ein Tooltip den Ereignis-Titel. Seitenleiste mit Team (Mini-SVG, KP-Balken, Bindungsleiste), Gold, Items, Relikten (Tooltip). Oben stehen der Akt-Name und die Variante. Das Wetter-Icon zeigt die Variante.
- Team-Fenster (`team.js`): Details zu jedem Monster (Werte, Wesen, Merkmal, Fähigkeit, Attacken mit Upgrade-Markierung, Bindung, getragenes Item), Reihenfolge ändern (das erste Monster startet im Kampf), Item tragen lassen

- [ ] **Step 1:** Umsetzen.
- [ ] **Step 2:** Prüfen im Browser-Bereich (`preview_start` mit der `file://`-URL von `index.html`): Titel → Hub → Intro-Dialog → Starter → Segen → Karte. Pro Bildschirm einen Screenshot. Die Konsole muss ohne Fehler bleiben (`read_console_messages onlyErrors`).
- [ ] **Step 3:** Commit `feat(ui): hub, auswahl, karte`

---

### Task 20: Kampfbildschirm

**Files:**
- Create: `js/ui/battle.js`, `js/ui/fx.js`
- Modify: `css/style.css`

**Interfaces:**
- `L.ui.battle.start(setup: BattleSetup) -> Promise<Summary>`
- Aufbau: Hintergrund (Variante bzw. Boss-Arena). Gegner oben rechts, eigenes Monster unten links (nach rechts schauend). Info-Boxen mit Name, Level, Typ-Chips, KP-Balken mit animierter Abnahme, Status-Icon, Bindungsleiste nur beim eigenen Monster. Unten das Aktionsmenü: 4 Attacken-Knöpfe (Typfarbe, Stärke, Genauigkeit, Effektivitäts-Hinweis „sehr effektiv“ beim Darüberfahren), Knöpfe für Bindung (leuchtet bei 100), Wechseln, Items und Fangen (nur bei wild). Tasten 1–4.
- Event-Abspieler: Er arbeitet die Events aus `L.battle.step` nacheinander ab, mit Wartezeit pro Typ (damage 450 ms, text 900 ms oder Klick).
- `fx.js`: `shake(el)`, `flash(el, color)`, `speedlines(root, dir)`, `floatNumber(root, x, y, text, kind)`, `cutIn(root, speciesId, title)` (diagonales Banner und großes Monster für 1,2 s bei Bindungs-Attacke und Volltreffer), `sparkle(el)` (Schimmer-Auftritt), `captureShake(n)`
- Nach dem Kampf: EP-Balken, Level-Up-Anzeige, Angebote (Attacke lernen mit Auswahl, was ersetzt wird, oder ablehnen; Entwicklung annehmen oder abbrechen; bei verzweigter Entwicklung 2 Karten). Danach `pendingRelease`-Auswahl.

- [ ] **Step 1:** Umsetzen.
- [ ] **Step 2:** Im Browser-Bereich prüfen: Wild-Kampf bis zum Sieg, Fang-Versuch, Wechsel nach K.-o., Bindungs-Attacke (zum Test Bindung per Konsole auf 100 setzen), Level-Up mit Attacken-Angebot. Screenshots machen, die Konsole muss ohne Fehler bleiben.
- [ ] **Step 3:** Commit `feat(ui): kampf`

---

### Task 21: Belohnung, Quelle, Shop, Ereignis, Zusammenfassung, Lexikon

**Files:**
- Create: `js/ui/reward.js`, `js/ui/spring.js`, `js/ui/shop.js`, `js/ui/event.js`, `js/ui/summary.js`, `js/ui/dex.js`
- Modify: `js/main.js` (Knoten-Ablauf: `enter` → passender Bildschirm → `complete` → speichern → Karte)

**Interfaces:**
- Belohnung: 3 oder 4 Karten (Monster-Karte mit SVG, Relikt mit Icon und Text, Schriftrolle mit Ziel-Auswahl). Überspringen ist erlaubt.
- Quelle: 3 Optionen (Heilen, Trainieren mit Monster-Auswahl, Attacke verbessern mit Monster → Attacke → Upgrade a/b im Vergleich), dazu die Irrlicht-Option, falls verfügbar (geheimnisvolle Darstellung: „Ein schwaches Licht flackert zwischen den Bäumen…“)
- Shop: Händlerin-Porträt, Waren mit Preis, ausgegraut bei zu wenig Gold
- Ereignis: Titel, Text, Optionen (Bedingungen nicht erfüllt → ausgegraut mit Grund). Ergebnis-Text, eventuell danach ein Kampf.
- Zusammenfassung bei Niederlage oder Sieg: Szene `gameover_echo` bzw. `act1_outro`, Statistik des Laufs, verdiente Kristalle, neue Lexikon-Einträge, Knopf „Zurück zum Schrein“
- Lexikon: Raster aller Arten mit Silhouette (ungesehen), Farbe (gesehen) und Haken (gefangen). Einzigartige werden als „???“ mit Rätsel-Hinweis angezeigt, bis sie gesehen wurden. Dazu Schimmer-Marker und Fortschritt in Prozent.

- [ ] **Step 1:** Umsetzen.
- [ ] **Step 2:** Im Browser-Bereich einen kompletten Lauf durch Akt 1 spielen (bei Bedarf mit Konsolen-Hilfen wie hohem Level). Prüfen: jede Knotenart einmal, Boss mit Phase, Outro, Zusammenfassung, Hub, „Weiterspielen“ nach Neuladen der Seite mitten im Lauf und mitten im Kampf. Konsole ohne Fehler.
- [ ] **Step 3:** Commit `feat(ui): belohnung, quelle, shop, ereignis, lexikon`

---

### Task 22: Balance-Simulation und Endprüfung

**Files:**
- Create: `tests/sim.js` (Node-Skript, kein Test)

**Interfaces:**
- `node tests/sim.js [runs=200]`: Spielt komplette Läufe automatisch. Der Spieler nutzt die Elite-KI, wählt den ersten erreichbaren Knoten zufällig, heilt an Quellen bei Team-KP < 60 % und nimmt sonst Training. Die Belohnung wird nach Priorität Relikt > Monster > Rest gewählt. Ausgabe: Siegquote gegen Fenna, durchschnittliches Level am Boss, Verteilung, woran Läufe scheitern (Knotenart), häufigste Todesursache.
- Zielwerte für Etappe 1: Siegquote der Simulation 35–65 %, Durchschnittslevel am Boss 13–16. Liegt das außerhalb, werden zuerst `levelRange`, EP-Faktor und Boss-Werte angepasst. Danach `node tests/run-node.js` erneut.

- [ ] **Step 1:** `tests/sim.js` schreiben und ausführen.
- [ ] **Step 2:** Bei Bedarf Werte anpassen, bis die Zielwerte erreicht sind. Die Anpassungen kommen in die Commit-Nachricht.
- [ ] **Step 3:** `node tests/run-node.js` → alle PASS. `tests.html` im Browser-Bereich → alle grün.
- [ ] **Step 4:** Ein letzter kompletter Lauf im Browser mit Screenshots.
- [ ] **Step 5:** Commit `chore: balance etappe 1`
