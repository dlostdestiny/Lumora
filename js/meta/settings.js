// Einstellungen als Daten. Das Einstellungs-Fenster (js/ui/settings.js) wird daraus erzeugt.
// Neue Einstellung = neuer Eintrag hier + Stelle im Code, die L.settings.get(meta, id) liest.
(function (L) {
  const onOff = [{ value: true, label: 'An' }, { value: false, label: 'Aus' }];
  const defs = [
    // Spiel
    { id: 'speed', group: 'Spiel', label: 'Kampf-Tempo', type: 'choice', default: 1, options: [{ value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' }] },
    { id: 'textSpeed', group: 'Spiel', label: 'Text-Tempo', type: 'choice', default: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'schnell', label: 'Schnell' }, { value: 'sofort', label: 'Sofort' }] },
    { id: 'clickToContinue', group: 'Spiel', label: 'Kampftexte per Klick weiter', desc: 'Kampftexte warten, bis du klickst.', type: 'toggle', default: false, options: onOff },
    { id: 'damageNumbers', group: 'Spiel', label: 'Schadenszahlen anzeigen', type: 'toggle', default: true, options: onOff },
    { id: 'effHints', group: 'Spiel', label: 'Typ-Tipps auf Attacken', desc: 'Zeigt „sehr effektiv“ auf den Knöpfen. Aus = schwerer!', type: 'toggle', default: true, options: onOff },
    { id: 'catchChance', group: 'Spiel', label: 'Fangchance anzeigen', type: 'toggle', default: true, options: onOff },
    { id: 'tutorial', group: 'Spiel', label: 'Miras Tipps (Tutorial)', desc: 'Zeigt beim ersten Mal kurze Erklärungen. Alle Tipps stehen auch in der Anleitung.', type: 'toggle', default: true, options: onOff },
    { id: 'confirm', group: 'Spiel', label: 'Sicherheitsfragen', desc: 'Nachfragen vor Freilassen und Aufgeben.', type: 'toggle', default: true, options: onOff },
    // Ton
    { id: 'musicVolume', group: 'Ton', label: 'Musik', type: 'choice', default: 50, options: [{ value: 0, label: 'Aus' }, { value: 25, label: '25 %' }, { value: 50, label: '50 %' }, { value: 75, label: '75 %' }, { value: 100, label: '100 %' }] },
    { id: 'mute', group: 'Ton', label: 'Ton aus', desc: 'Schaltet Musik und Geräusche stumm (auch per 🔊-Knopf im Kampf oder Taste M).', type: 'toggle', default: false, options: onOff },
    { id: 'sfxVolume', group: 'Ton', label: 'Geräusche', type: 'choice', default: 75, options: [{ value: 0, label: 'Aus' }, { value: 25, label: '25 %' }, { value: 50, label: '50 %' }, { value: 75, label: '75 %' }, { value: 100, label: '100 %' }] },
    // Darstellung
    { id: 'artMode', group: 'Darstellung', label: 'Monster-Grafik', type: 'choice', default: 'bilder', options: [{ value: 'bilder', label: 'Deine Bilder (falls vorhanden)' }, { value: 'gezeichnet', label: 'Immer gezeichnet' }] },
    { id: 'fxLevel', group: 'Darstellung', label: 'Effekt-Stufe (Belastung)', desc: 'Niedrig schont schwache PCs. Ultra ist völlig übertrieben!', type: 'choice', default: 'hoch',
      options: [{ value: 'niedrig', label: 'Niedrig' }, { value: 'mittel', label: 'Mittel' }, { value: 'hoch', label: 'Hoch' }, { value: 'ultra', label: 'Ultra 🔥' }] },
    { id: 'motion', group: 'Darstellung', label: 'Animationen', type: 'choice', default: 'voll', options: [{ value: 'voll', label: 'Voll' }, { value: 'reduziert', label: 'Reduziert' }] },
    { id: 'shake', group: 'Darstellung', label: 'Bildschirmwackeln', type: 'toggle', default: true, options: onOff },
    { id: 'weatherFx', group: 'Darstellung', label: 'Wetter-Effekte', type: 'toggle', default: true, options: onOff },
    { id: 'cutins', group: 'Darstellung', label: 'Bindungs-Einblendungen', type: 'toggle', default: true, options: onOff },
    { id: 'fontSize', group: 'Darstellung', label: 'Schriftgröße', type: 'choice', default: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'gross', label: 'Groß' }] },
    // Story
    { id: 'playerName', group: 'Story', label: 'Dein Name', desc: 'So nennen dich die Figuren. Leer = Bannträgerin/Bannträger.', type: 'text', default: '', maxLength: 16 },
    { id: 'skipSeenScenes', group: 'Story', label: 'Bekannte Szenen überspringen', type: 'toggle', default: false, options: onOff },
    { id: 'avatar', group: 'Story', label: 'Spielfigur', type: 'choice', default: 'spieler_a', options: [{ value: 'spieler_a', label: 'Bannträgerin' }, { value: 'spieler_b', label: 'Bannträger' }] },
  ];

  const byId = {};
  for (const d of defs) byId[d.id] = d;

  L.settings = {
    defs,
    groups: ['Spiel', 'Ton', 'Darstellung', 'Story'],
    defaults() {
      const out = {};
      for (const d of defs) out[d.id] = d.default;
      return out;
    },
    get(meta, id) {
      const d = byId[id];
      if (!d) throw new Error('Unbekannte Einstellung: ' + id);
      const v = meta && meta.settings ? meta.settings[id] : undefined;
      return v === undefined ? d.default : v;
    },
    set(meta, id, value) {
      const d = byId[id];
      if (!d) throw new Error('Unbekannte Einstellung: ' + id);
      if (d.type === 'text') {
        meta.settings[id] = String(value || '').replace(/[<>"&]/g, '').trim().slice(0, d.maxLength || 32);
        return;
      }
      if (!d.options.some((o) => o.value === value)) throw new Error('Ungültiger Wert für ' + id + ': ' + value);
      meta.settings[id] = value;
    },
  };
})(globalThis.LUM);
