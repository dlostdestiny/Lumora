// Haupt-Status. Die Regeln dazu stehen in der Kampf-Engine.
(function (L) {
  L.def.status({ id: 'brand', name: 'Brand', icon: '🔥', color: '#ff7a3d', immune: ['glut'], desc: 'Verliert jede Runde 1/16 KP, Angriff ×0,75.' });
  L.def.status({ id: 'gift', name: 'Gift', icon: '☠️', color: '#b05cd6', immune: ['schatten'], desc: 'Verliert jede Runde mehr KP (1/16 bis 4/16).' });
  L.def.status({ id: 'laehmung', name: 'Lähmung', icon: '⚡', color: '#ffd23f', immune: ['funke'], desc: 'Tempo halbiert, setzt zu 25 % aus.' });
  L.def.status({ id: 'frost', name: 'Frost', icon: '🧊', color: '#7dd3fc', immune: ['frost'], desc: 'Eingefroren: 1–2 Runden handlungsunfähig. Glut-Treffer tauen sofort auf.' });
  L.def.status({ id: 'schlaf', name: 'Schlaf', icon: '💤', color: '#9fb0d6', immune: [], desc: 'Kann 1–3 Runden nicht handeln.' });
})(globalThis.LUM);
