// Story-Szenen für Akt 3: Der Sturmgipfel. Das (vorläufige) Ende der Geschichte.
(function (L) {
  const S = (def) => L.def.scene(def);
  const l = (who, expr, text) => ({ who, expr, text });

  S({
    id: 'act3_intro', trigger: 'actIntro', once: false, condition: { act: 'act3' },
    lines: [
      l('erzaehler', null, 'Akt 3 – Der Sturmgipfel'),
      l('erzaehler', null, 'Der Weg führt hinauf in die Wolken. Blitze zucken um den Gipfel, und der Wind trägt Stimmen, die keiner sprechen hört.'),
      l('mira', 'ernst', 'Ganz oben lebt Sola, die Sturmseherin. Sie kann in die Zukunft sehen … sagt man.'),
      l('mira', 'traurig', 'Wenn die Gestalt in Grau auch sie erreicht hat, dann sieht Sola nur noch Dunkelheit.'),
      l('mira', 'froh', 'Du bist so weit gekommen, {name}. Ich glaube an dich. Und an dein Team.'),
    ],
  });
  S({
    id: 'kael_act3_first', trigger: 'rival', once: true, condition: { act: 'act3' },
    lines: [
      l('kael', 'ernst', 'Ich habe ihn gesehen. Die Gestalt in Grau. Auf dem Pass, im Nebel.'),
      l('kael', 'traurig', 'Er trug den Schal meines Bruders. Denselben Schal.'),
      l('kael', 'wuetend', 'Ich will die Wahrheit wissen, {name}. Aber zuerst muss ich wissen, ob ich stark genug bin. Kämpf mit mir!'),
    ],
  });
  S({
    id: 'kael_act3_again', trigger: 'rival', once: false, condition: { act: 'act3' },
    lines: [
      l('kael', 'ueberrascht', 'Du schon wieder … Weißt du was? Ich glaube, der Echo-Stein zeigt mir jedes Mal ein bisschen mehr.'),
      l('kael', 'froh', 'Diesmal kämpfe ich nicht gegen dich, sondern mit allem, was ich habe!'),
    ],
  });
  S({
    id: 'sola_pre', trigger: 'bossPre', once: false, condition: { act: 'act3', noRunFlag: 'finale' },
    lines: [
      l('erzaehler', null, 'Der Gipfel. Über dir dreht sich der Sturm wie ein riesiges Auge. In seiner Mitte schwebt Sola.'),
      l('sola', 'traurig', 'Ich habe dich kommen sehen. Hundertmal. Tausendmal. Und jedes Mal fällst du.'),
      l('sola', 'ernst', 'Der Mann in Grau hat mir die Wahrheit gezeigt: Alles endet im Schleier. Warum also kämpfen?'),
      l('sola', 'wuetend', 'Sturmkrone! Zeig {name}, wie das Ende aussieht!'),
    ],
  });
  S({
    id: 'sola_phase2', trigger: 'phase', once: false,
    lines: [
      l('sola', 'wuetend', 'Der Himmel selbst ist auf meiner Seite!'),
      l('erzaehler', null, 'Der Sturm bricht los. Sturmkrone wird so schnell, dass ihr Umriss verschwimmt.'),
    ],
  });
  S({
    id: 'sola_post', trigger: 'bossPost', once: false, condition: { act: 'act3', noRunFlag: 'finale' },
    lines: [
      l('sola', 'ueberrascht', 'Das … das habe ich nie gesehen. In keiner Zukunft. Du hast gewonnen.'),
      l('sola', 'ernst', 'Dann ist die Zukunft nicht fest. Der Mann in Grau hat gelogen.'),
      l('sola', 'traurig', 'Er sagte, er heißt Ardan. Er sagte, er habe einen kleinen Bruder, den er beschützen will … vor allem.'),
      l('kael', 'ueberrascht', 'Ardan … das ist mein Bruder.'),
    ],
  });
  S({
    id: 'act3_outro', trigger: 'actOutro', once: false, condition: { act: 'act3', noRunFlag: 'finale', noTeamHasStellio: true, notMode: 'jenseits' },
    lines: [
      l('erzaehler', null, 'Der Sturm legt sich. Zum ersten Mal seit langer Zeit sieht man vom Gipfel aus die Sterne.'),
      l('mira', 'froh', 'Fenna, Brakk und Sola sind frei. Die Sternenquelle leuchtet wieder heller. Du hast es geschafft, {name}!'),
      l('mira', 'ernst', 'Aber Ardan ist noch irgendwo da draußen. Mit einem schwarzen Echo-Stein … und er erinnert sich an jeden Lauf, genau wie du.'),
      l('erzaehler', null, 'Der Schleier ist zurückgedrängt. Doch das Echo hallt weiter …'),
      l('erzaehler', null, 'ENDE – Danke fürs Spielen! (Das wahre Ende wartet noch auf dich …)'),
    ],
  });
})(globalThis.LUM);
