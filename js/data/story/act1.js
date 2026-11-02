// Story-Szenen für den Anfang und Akt 1. trigger bestimmt, wann eine Szene in Frage kommt.
// Die erste passende Szene (Reihenfolge der Registrierung) wird gespielt.
(function (L) {
  const S = (def) => L.def.scene(def);
  const l = (who, expr, text) => ({ who, expr, text });

  S({
    id: 'intro_first', trigger: 'runStart', once: true, condition: { runNumber: { max: 1 } },
    lines: [
      l('erzaehler', null, 'Lumora. Eine Welt, in der Monster und Menschen vom Licht der Sternenquelle leben.'),
      l('erzaehler', null, 'Doch seit einiger Zeit legt sich ein schwarzer Schleier über das Land. Monster werden wild. Wälder verstummen.'),
      l('mira', 'froh', 'Ah, da bist du ja, {name}! Willkommen am Schrein. Ich bin Mira.'),
      l('mira', 'ernst', 'Du trägst das Zeichen eines Bannträgers. Du kannst eine Bindung mit Monstern eingehen, so wie es früher viele konnten.'),
      l('mira', 'neutral', 'Nimm diesen Stein. Man nennt ihn den Echo-Stein. Er wird dich beschützen … auf seine Art.'),
      l('mira', 'froh', 'Und jetzt such dir einen Gefährten aus. Der Flüsterwald wartet.'),
    ],
  });
  S({
    id: 'intro_echo', trigger: 'runStart', once: false, condition: { runNumber: { min: 2 } },
    lines: [
      l('erzaehler', null, 'Ein Summen. Ein Leuchten. Der Echo-Stein in deiner Hand wird warm …'),
      l('mira', 'ueberrascht', 'Du … warst schon einmal hier, oder? Ich sehe es in deinen Augen.'),
      l('mira', 'ernst', 'Der Echo-Stein hat dich zurückgebracht. Deine Erinnerungen bleiben. Nutze sie.'),
      l('mira', 'froh', 'Also gut, {name}. Noch einmal. Diesmal schaffst du es.'),
    ],
  });
  S({
    id: 'act1_intro', trigger: 'actIntro', once: false, condition: { act: 'act1' },
    lines: [
      l('erzaehler', null, 'Akt 1 – Der Flüsterwald'),
      l('mira', 'neutral', 'Früher sang der Wald. Jetzt flüstert er nur noch. Seine Wächterin Fenna ist seit Wochen verschwunden.'),
      l('mira', 'ernst', 'Finde sie. Und sei vorsichtig: Wilde Monster greifen jeden an, der den Pfad betritt.'),
    ],
  });
  S({
    id: 'kael_first', trigger: 'rival', once: true, condition: { act: 'act1' },
    lines: [
      l('kael', 'neutral', 'Hm? Noch ein Bannträger? Mira hat wohl jedem einen Echo-Stein gegeben.'),
      l('kael', 'froh', 'Ich bin Kael. Und ich werde den Schleier vertreiben. Allein.'),
      l('kael', 'wuetend', 'Du stehst mir im Weg. Zeig mir, was du kannst!'),
    ],
  });
  S({
    id: 'kael_again', trigger: 'rival', once: false, condition: { sceneSeen: 'kael_first', act: 'act1' },
    lines: [
      l('kael', 'ueberrascht', 'Du schon wieder? Komisch … ich hab das Gefühl, wir hatten diesen Kampf schon mal.'),
      l('kael', 'froh', 'Egal, {name}. Diesmal gewinne ich!'),
    ],
  });
  S({
    id: 'fenna_pre', trigger: 'bossPre', once: false, condition: { act: 'act1' },
    lines: [
      l('erzaehler', null, 'Im Herzen des Waldes steht ein Thron aus schwarzen Dornen.'),
      l('fenna', 'traurig', 'Wer … wer ist da? Geh weg. Ich kann es nicht mehr aufhalten …'),
      l('fenna', 'wuetend', 'Der Schleier flüstert mir zu. Er sagt, du bist eine Bedrohung!'),
      l('fenna', 'wuetend', 'Dornkönigin! Vertreibe den Eindringling!'),
    ],
  });
  S({
    id: 'fenna_phase2', trigger: 'phase', once: false,
    lines: [
      l('fenna', 'wuetend', 'Nein … NEIN! Der Schleier gibt mir Kraft!'),
      l('erzaehler', null, 'Schwarzer Nebel steigt auf. Die Dornen der Königin wachsen.'),
    ],
  });
  S({
    id: 'fenna_post', trigger: 'bossPost', once: false, condition: { act: 'act1' },
    lines: [
      l('fenna', 'ueberrascht', 'Ich … ich kann wieder klar denken. Was habe ich getan?'),
      l('fenna', 'traurig', 'Jemand hat mir den Schleier gebracht. Eine Gestalt in Grau. Sie sagte, sie würde den Wald beschützen.'),
      l('fenna', 'ernst', 'Sie ging nach Osten, zu den Vulkanhöhlen. Zu Brakk, dem Schmied.'),
    ],
  });
  S({
    id: 'act1_outro', trigger: 'actOutro', once: false, condition: { act: 'act1' },
    lines: [
      l('erzaehler', null, 'Der Wald atmet auf. Zum ersten Mal seit Wochen hört man wieder Vogelgesang.'),
      l('mira', 'froh', 'Du hast es geschafft! Fenna ist frei.'),
      l('mira', 'ernst', 'Aber eine Gestalt in Grau … das gefällt mir nicht. Der Weg führt nach Osten.'),
      l('erzaehler', null, 'Du lässt den Flüsterwald hinter dir. Vor dir steigt der Rauch der Glutberge in den Himmel.'),
    ],
  });
  S({
    id: 'gameover_echo', trigger: 'gameOver', once: false,
    lines: [
      l('erzaehler', null, 'Alles wird dunkel. Dann … ein Summen. Der Echo-Stein leuchtet.'),
      l('erzaehler', null, 'Du öffnest die Augen. Du stehst wieder am Schrein.'),
    ],
  });

  L.story = {
    // Platzhalter {name} durch den Spielernamen ersetzen
    format(text, meta) { return String(text).replace(/{name}/g, L.player ? L.player.name(meta) : 'Bannträger'); },
    // Erste passende Szene für einen Auslöser. run und meta dürfen unvollständig sein.
    next(run, meta, trigger) {
      meta = meta || { scenesSeen: [], flags: {}, bossesDefeated: [], fragments: [] };
      for (const s of L.registry.all('scene')) {
        if (s.trigger !== trigger) continue;
        if (s.once && (meta.scenesSeen || []).indexOf(s.id) >= 0) continue;
        if (!L.cond.check(s.condition, { run, meta })) continue;
        return s.id;
      }
      return null;
    },
  };

  L.registry.addValidator('scene', (def, reg) => def.lines.filter((x) => !reg.has('character', x.who)).map((x) => 'unbekannte Figur ' + x.who));
})(globalThis.LUM);
