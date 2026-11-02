// Echte Uhrzeit für Tag/Nacht. In Tests wird L.clock.now überschrieben.
(function (L) {
  L.clock = {
    now() { return new Date(); },
    isNight(date) {
      const d = date || L.clock.now();
      const h = d.getHours();
      return h >= 20 || h < 6;
    },
  };
})(globalThis.LUM);
