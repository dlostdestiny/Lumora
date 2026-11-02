// Story-Szenen für Akt 2: Die Glutschmiede.
(function (L) {
  const S = (def) => L.def.scene(def);
  const l = (who, expr, text) => ({ who, expr, text });

  S({
    id: 'act2_intro', trigger: 'actIntro', once: false, condition: { act: 'act2' },
    lines: [
      l('erzaehler', null, 'Akt 2 – Die Glutschmiede'),
      l('erzaehler', null, 'Hinter dem Wald steigt das Land an. Die Luft wird heiß, der Boden schwarz. Irgendwo im Berg schlägt ein Hammer. Langsam. Schwer.'),
      l('mira', 'ernst', 'Hier wohnt Brakk, der Schmied. Früher hat er Werkzeuge für alle Bannträger geschmiedet.'),
      l('mira', 'traurig', 'Seit Wochen kommt kein Licht mehr aus seiner Schmiede. Nur schwarzer Rauch.'),
      l('mira', 'froh', 'Pass auf dich auf, {name}. Und denk daran: Glut-Monster mögen keinen Regen … aber hier regnet es Asche.'),
    ],
  });
  S({
    id: 'kael_act2_first', trigger: 'rival', once: true, condition: { act: 'act2' },
    lines: [
      l('kael', 'ernst', 'Du hast Fenna befreit? … Ich war zu spät. Schon wieder.'),
      l('kael', 'traurig', 'Weißt du, warum ich das alles allein mache? Mein Bruder war ein Bannträger. Er ist in den Schleier gegangen und nie zurückgekommen.'),
      l('kael', 'wuetend', 'Ich brauche keine Hilfe. Ich brauche Kraft. Zeig mir deine!'),
    ],
  });
  S({
    id: 'kael_act2_again', trigger: 'rival', once: false, condition: { act: 'act2' },
    lines: [
      l('kael', 'ueberrascht', 'Dieser Echo-Stein … ich träume manchmal von diesem Kampf. Als hätten wir ihn hundertmal gekämpft.'),
      l('kael', 'froh', 'Dann gewinne ich eben beim hundertersten Mal, {name}!'),
    ],
  });
  S({
    id: 'brakk_pre', trigger: 'bossPre', once: false, condition: { act: 'act2' },
    lines: [
      l('erzaehler', null, 'Die Große Schmiede. Das Herzfeuer brennt schwarz, und an den Wänden kriechen Schatten.'),
      l('brakk', 'ernst', 'Noch ein Bannträger. Die Gestalt in Grau hat gesagt, dass ihr kommen würdet.'),
      l('brakk', 'traurig', 'Sie hat mir versprochen, dass mein Feuer nie wieder ausgeht. Und jetzt … jetzt kann ich es nicht mehr löschen.'),
      l('brakk', 'wuetend', 'Schmiedgolem! Schlag zu!'),
    ],
  });
  S({
    id: 'brakk_phase2', trigger: 'phase', once: false,
    lines: [
      l('brakk', 'wuetend', 'Das Herzfeuer! Gib mir alles, was du hast!'),
      l('erzaehler', null, 'Glühende Asche regnet von der Decke. Die Haut des Golems wird hart wie Stahl.'),
    ],
  });
  S({
    id: 'brakk_post', trigger: 'bossPost', once: false, condition: { act: 'act2' },
    lines: [
      l('brakk', 'ueberrascht', 'Das Feuer … es ist wieder rot. Warm. Wie früher.'),
      l('brakk', 'ernst', 'Die Gestalt in Grau trug einen Echo-Stein. Genau wie du. Aber ihrer war schwarz.'),
      l('brakk', 'traurig', 'Sie ist zum Gipfel hinauf. Zu Sola, der Sturmseherin. Wenn Sola fällt, fällt der Himmel.'),
    ],
  });
  S({
    id: 'act2_outro', trigger: 'actOutro', once: false, condition: { act: 'act2' },
    lines: [
      l('erzaehler', null, 'Aus der Großen Schmiede steigt wieder heller Rauch auf. Unten im Tal sieht man die Lichter der Dörfer.'),
      l('mira', 'ernst', 'Ein schwarzer Echo-Stein … Es gibt also noch jemanden, der durch die Zeit wandert.'),
      l('mira', 'froh', 'Du warst unglaublich, {name}. Ruh dich aus. Der Gipfel wartet.'),
      l('erzaehler', null, 'Hoch über den Wolken zucken Blitze. Der letzte Weg führt zum Sturmgipfel.'),
    ],
  });
})(globalThis.LUM);
