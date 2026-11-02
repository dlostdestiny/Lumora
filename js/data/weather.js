(function (L) {
  L.def.weather({ id: 'nebel', name: 'Nebel', icon: '🌫️', turns: 5, typeMods: {}, accuracyMod: 0.85, desc: 'Alle Attacken treffen schlechter.' });
  L.def.weather({ id: 'glutregen', name: 'Glutregen', icon: '🌋', turns: 5, typeMods: { glut: 1.3, flut: 0.7 }, desc: 'Glut stärker, Flut schwächer.' });
  L.def.weather({ id: 'stroemung', name: 'Strömung', icon: '🌧️', turns: 5, typeMods: { flut: 1.3, glut: 0.7 }, desc: 'Flut stärker, Glut schwächer.' });
  L.def.weather({ id: 'schneesturm', name: 'Schneesturm', icon: '🌨️', turns: 5, typeMods: { frost: 1.3, glut: 0.8 }, desc: 'Frost stärker, Glut schwächer.' });
  L.def.weather({ id: 'sturm', name: 'Sturm', icon: '🌩️', turns: 5, typeMods: { funke: 1.3 }, alwaysHitTypes: ['funke'], desc: 'Funke stärker und trifft immer.' });
})(globalThis.LUM);
