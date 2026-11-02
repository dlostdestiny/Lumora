// Spielerfigur: Anzeigename und Titel.
(function (L) {
  L.player = {
    name(meta) {
      const n = L.settings.get(meta, 'playerName');
      if (n) return n;
      return L.settings.get(meta, 'avatar') === 'spieler_b' ? 'Bannträger' : 'Bannträgerin';
    },
    title(meta) { return (meta && meta.title) || ''; },
  };
})(globalThis.LUM);
