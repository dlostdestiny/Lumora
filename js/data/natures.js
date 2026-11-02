// Wesen: ein Wert +10 %, ein anderer −10 %.
(function (L) {
  [
    ['mutig', 'Mutig', 'atk', 'spe'],
    ['frech', 'Frech', 'atk', 'def'],
    ['robust', 'Robust', 'def', 'atk'],
    ['gemuetlich', 'Gemütlich', 'def', 'spe'],
    ['hastig', 'Hastig', 'spe', 'def'],
    ['froh', 'Froh', 'spe', 'atk'],
    ['kraeftig', 'Kräftig', 'hp', 'atk'],
    ['sanftmuetig', 'Sanftmütig', 'hp', 'def'],
    ['wild', 'Wild', 'atk', 'hp'],
    ['stur', 'Stur', 'def', 'hp'],
  ].forEach(([id, name, up, down]) => L.def.nature({ id, name, up, down }));
})(globalThis.LUM);
