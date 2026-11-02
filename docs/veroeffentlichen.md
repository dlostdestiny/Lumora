# Lumora veroeffentlichen

Lumora ist jetzt eine installierbare Web-App (PWA): Nach dem ersten Besuch laeuft sie auch offline, und man kann sie auf Handy oder PC "installieren". Das geht nur ueber `https://` (nicht per Doppelklick, nicht auf localhost - dort ist der Offline-Modus absichtlich aus).

## Was NICHT hochgeladen werden soll

- `bilder für game/` (deine Roh-Bilder, riesig)
- `.env.local` (Geheimschluessel!)
- `.superpowers/`, `docs/`, `tests/`, `tools/`, `node_modules/`, `AGENTS.md`, `CLAUDE.md`
- `*.html` fuer Entwicklung (`tests.html`, `art-preview.html`, `bilder.html`) sind harmlos, koennen aber weg

Noetig sind: `index.html`, `manifest.webmanifest`, `sw.js`, `css/`, `js/`, `img/`.

## A) Im Web

### Variante 1: GitHub Pages (kostenlos)

1. Auf github.com ein neues Repository anlegen (z. B. `lumora`).
2. Wichtig: `.env.local` und `bilder für game/` stehen schon in `.gitignore`. Vorher mit `git status` pruefen, dass nichts Geheimes dabei ist.
3. Im Projektordner: `git remote add origin https://github.com/<name>/lumora.git` und `git push -u origin main` (bzw. deinen Branch).
4. Im Repository: Settings, Pages, "Deploy from a branch", Branch `main`, Ordner `/ (root)`, speichern.
5. Nach ein paar Minuten laeuft das Spiel unter `https://<name>.github.io/lumora/`.

Alle Pfade im Spiel sind relativ, deshalb geht der Unterpfad `/lumora/` problemlos.

### Variante 2: Netlify Drop oder itch.io

- Netlify: auf app.netlify.com/drop einen Ordner hineinziehen. Lege dafuer einen Ordner `public-build` an und kopiere nur `index.html`, `manifest.webmanifest`, `sw.js`, `css`, `js`, `img` hinein.
- itch.io: denselben Ordner als ZIP packen, als "HTML"-Projekt hochladen, "This file will be played in the browser" anhaken. (Der Offline-Modus der PWA geht dort nicht immer, das Spiel selbst laeuft.)

### Neue Version veroeffentlichen

In `sw.js` oben `VERSION = 'v1'` auf `'v2'` usw. erhoehen. Dann loescht der Browser die alten Daten. Spiel-Dateien werden sowieso zuerst online geholt, Bilder aus dem Zwischenspeicher.

## B) Als App (Android / iOS) mit Capacitor

Voraussetzung: Node.js. Im Projektordner:

1. `npm init -y`
2. `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios`
3. `npx cap init Lumora de.deinname.lumora --web-dir www` (webDir ist der Ordner mit den Spiel-Dateien; kopiere dafuer `index.html`, `css`, `js`, `img`, `manifest.webmanifest` in einen Ordner `www`, ohne `bilder für game`).
4. `npx cap add android` und/oder `npx cap add ios`
5. Nach jeder Aenderung: Dateien nach `www` kopieren, dann `npx cap sync`.

### Android

- Android Studio installieren, `npx cap open android`, dann Build, Generate Signed Bundle (AAB).
- Google Play Console: einmalig 25 $ Entwicklerkonto, dann das AAB hochladen, Store-Seite ausfuellen, Pruefung abwarten.

### iOS

- Braucht einen Mac mit Xcode (`npx cap open ios`) und das Apple Developer Program (99 $ pro Jahr). Ohne Mac geht iOS nicht.

### Wichtig: Spielstand

Der Spielstand liegt im `localStorage` des Browsers bzw. der App. Das heisst: Web-Version, installierte PWA und Capacitor-App haben je einen eigenen Spielstand, und Loeschen der Browserdaten loescht ihn. Dafuer gibt es im Spiel den Spielstand-Export/-Import (Einstellungen) zum Sichern und Umziehen.