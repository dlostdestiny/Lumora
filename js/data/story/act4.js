// Story-Szenen für Akt 4: Jenseits des Schleiers. Die Geschichte von Vael, der Ersten Bannträgerin.
(function (L) {
  const S = (def) => L.def.scene(def);
  const l = (who, expr, text) => ({ who, expr, text });

  S({
    id: 'act4_intro', trigger: 'actIntro', once: false, condition: { act: 'act4' },
    lines: [
      l('erzaehler', null, 'Akt 4 – Jenseits des Schleiers'),
      l('erzaehler', null, 'Der Schleier ist zerrissen. Doch dahinter wartet keine Leere, sondern eine Welt aus Glas, Eis und Sternenwind. Alles klingt hier ganz leise, wie ein Lied aus weiter Ferne.'),
      l('mira', 'ueberrascht', 'Das habe ich nicht erwartet. Das hier ist … wunderschön. Und ein bisschen traurig.'),
      l('mira', 'ernst', 'Der Schleier war nicht einfach böse, {name}. Er besteht aus allem, was in den vielen Schleifen vergessen wurde. Jemand hat ihn gemacht, lange vor Ardan.'),
      l('mira', 'froh', 'Du hast das Echo besiegt und die Schleife gebrochen. Jetzt schauen wir uns an, was dahinter liegt. Wir gehen zusammen.'),
    ],
  });
  S({
    id: 'kael_act4_first', trigger: 'rival', once: true, condition: { act: 'act4' },
    lines: [
      l('kael', 'ueberrascht', 'Du auch hier, {name}? Ich dachte, nach dem Kampf mit meinem Bruder wäre alles vorbei.'),
      l('kael', 'froh', 'Ardan und ich haben die ganze Nacht geredet. Zum ersten Mal seit Ewigkeiten. Er hat mir alles erzählt.'),
      l('kael', 'ernst', 'Er sagt, hinter dem Schleier wohnt eine Frau. Die erste, die einen Echo-Stein trug. Sie hat ihn zu etwas gebracht, das er nie wollte.'),
      l('kael', 'wuetend', 'Ich will sie nicht bekämpfen. Ich will sie verstehen. Aber wenn ich dafür stark sein muss, dann los!'),
    ],
  });
  S({
    id: 'kael_act4_again', trigger: 'rival', once: false, condition: { act: 'act4' },
    lines: [
      l('kael', 'froh', 'Schon wieder du! Ich freue mich langsam richtig darauf.'),
      l('kael', 'ernst', 'Weißt du, früher wollte ich dich schlagen. Heute will ich nur sehen, wie weit wir zusammen kommen.'),
    ],
  });
  S({
    id: 'vael_pre', trigger: 'bossPre', once: false, condition: { act: 'act4' },
    lines: [
      l('erzaehler', null, 'Mitten im Sternenwind schwebt ein Thron aus Uhrwerk und Eis. Riesige Zifferblätter drehen sich lautlos im Nebel. Auf dem Thron sitzt eine Frau mit Haaren wie Raureif.'),
      l('vael', 'ernst', 'Du hast also den Schleier durchschritten. Das hat seit Jahrhunderten niemand mehr geschafft.'),
      l('vael', 'traurig', 'Mein Name ist Vael. Ich war die Erste, die einen Echo-Stein trug. Mein Gefährte Velumora war bei mir, seit ich ein kleines Mädchen war.'),
      l('vael', 'traurig', 'An einem Wintertag hat der Schleier ihn mitgenommen. Ich habe die Zeit zurückgedreht. Einmal. Zweimal. Und dann so oft, dass ich aufgehört habe zu zählen.'),
      l('vael', 'wuetend', 'Alles, was ich dabei vergessen habe, ist hier gelandet. Es ist mein Schleier, {name}. Und ich lasse ihn nicht noch einmal gehen!'),
      l('mira', 'traurig', 'Sie ist nicht böse. Sie hat nur so schrecklich viel Angst, jemanden zu verlieren.'),
    ],
  });
  S({
    id: 'vael_phase2', trigger: 'phase', once: false, condition: { act: 'act4' },
    lines: [
      l('vael', 'wuetend', 'Noch einmal! Nur noch dieses eine Mal!'),
      l('erzaehler', null, 'Ein Schneesturm fegt über den Thron. Velumora hebt den Kopf und singt ein Lied, so leise und so schön, dass die Zifferblätter für einen Moment stehen bleiben.'),
    ],
  });
  S({
    id: 'vael_post', trigger: 'bossPost', once: false, condition: { act: 'act4' },
    lines: [
      l('vael', 'ueberrascht', 'Das Lied … Velumora, du singst wieder. Ich dachte, ich hätte es vergessen.'),
      l('vael', 'traurig', 'Ich habe ihn so oft zurückgeholt, dass ich nie mehr gefragt habe, ob er überhaupt zurückwollte.'),
      l('erzaehler', null, 'Velumora legt seinen Kopf an Vaels Schulter. Er wirkt nicht traurig. Eher so, als hätte er sehr lange auf diese Umarmung gewartet.'),
      l('vael', 'froh', 'Er hat mir nie böse gewesen. Er hat nur gewartet. Danke, {name}. Du hast mir die Augen geöffnet.'),
      l('vael', 'ernst', 'Ich lasse los. Den Echo-Stein, die Zeit und die Angst. Nimm das Echo mit, und erinnere dich für mich.'),
    ],
  });
  S({
    id: 'act4_outro', trigger: 'actOutro', once: false, condition: { act: 'act4' },
    lines: [
      l('erzaehler', null, 'Die Zifferblätter zerfallen zu Sternenstaub. Der Wind trägt jede vergessene Erinnerung nach Hause: ein Lachen, ein Name, ein Lied, ein Winterabend.'),
      l('erzaehler', null, 'Vael steht auf. Zum ersten Mal seit Jahrhunderten lächelt sie, und Velumora steht an ihrer Seite. Gemeinsam gehen sie langsam in das Licht.'),
      l('mira', 'froh', 'Sie sind frei. Alle beide. Spürst du das, {name}? Die Welt klingt plötzlich so viel heller.'),
      l('kael', 'froh', 'Schau mal, wer da kommt!'),
      l('ardan', 'froh', 'Ich habe es gespürt. Der Schleier ist weg. Ganz weg. Danke, dass du ihr zugehört hast, statt nur gegen sie zu kämpfen.'),
      l('kael', 'froh', 'Na, großer Bruder? Dann gehen wir jetzt endlich gemeinsam nach Hause.'),
      l('ardan', 'froh', 'Gemeinsam. Das klingt gut. Das klingt sogar sehr gut.'),
      l('mira', 'ernst', 'Dein Echo-Stein ist still geworden, {name}. Er hat getan, wofür er gemacht wurde. Ab heute dreht sich die Zeit nur noch vorwärts.'),
      l('erzaehler', null, 'Und irgendwo weit über den Wolken flimmert ein einzelner Stern im Sternenwind. Als würde er zwinkern.'),
      l('erzaehler', null, '✨ JENSEITS DES SCHLEIERS ✨ – Danke fürs Spielen!'),
    ],
  });
})(globalThis.LUM);
