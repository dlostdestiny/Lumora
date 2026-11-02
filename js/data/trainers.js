// Trainer: Eliten, Rivale und Bosse. levelOffset bezieht sich auf das Gegner-Level des Knotens.
(function (L) {
  const T = (def) => L.def.trainer(def);
  T({
    id: 'pilz_theo', name: 'Pilzsammler Theo', character: 'theo', ai: 'elite',
    team: [{ species: 'moosling', levelOffset: 0 }, { species: 'pilzpuff', levelOffset: 1, held: 'blattbrosche' }],
    lines: { start: 'Pssst! Du trampelst auf meine Pilze! Dafür gibt es einen Kampf!', win: 'Meine schönen Pilze …', lose: 'Ha! Pilze sind eben zäh.' },
  });
  T({
    id: 'ida_waldlaeuferin', name: 'Waldläuferin Ida', character: 'ida', ai: 'elite',
    team: [{ species: 'zwirbel', levelOffset: 0 }, { species: 'nachtschu', levelOffset: 1 }],
    lines: { start: 'Der Wald ist unruhig. Zeig mir, dass du ihm helfen kannst!', win: 'Du hast ein gutes Herz. Und starke Freunde.', lose: 'Noch nicht. Komm stärker zurück.' },
  });
  T({
    id: 'jonas_schueler', name: 'Schüler Jonas', character: 'jonas', ai: 'elite',
    team: [{ species: 'kieselkrabb', levelOffset: 0 }, { species: 'summsel', levelOffset: 1, held: 'funkenring' }],
    lines: { start: 'Mira sagt, ich soll üben. Du bist perfekt dafür!', win: 'Uff. Ich muss noch viel lernen.', lose: 'Ich hab gewonnen! Ich hab wirklich gewonnen!' },
  });
  T({
    id: 'kael_act1', name: 'Kael', character: 'kael', ai: 'trainer', rival: true,
    counter: { glimmi: 'plitsch', plitsch: 'knospi', knospi: 'glimmi', zapfi: 'kiesi', kiesi: 'plitsch', nachtmiez: 'zapfi' },
    team: [{ species: 'nachtschu', levelOffset: -1 }],
    lines: { start: 'Da bist du ja. Mal sehen, ob du mithalten kannst!', win: 'Tch. Glück gehabt. Nächstes Mal nicht.', lose: 'Zu langsam! Komm wieder, wenn du bereit bist.' },
  });
  T({
    id: 'fenna', name: 'Wächterin Fenna', character: 'fenna', ai: 'boss', boss: true,
    team: [{ species: 'nachtschu', levelOffset: -3 }, { species: 'dornkoenigin', levelOffset: 0 }],
    items: { superheiltrank: 1 },
    phases: [{ mon: 1, atHpBelow: 0.5, scene: 'fenna_phase2', weather: 'nebel', addMove: 'dornenwirbel', stageBoost: { stat: 'atk', delta: 1 } }],
    lines: { start: 'Geh … solange du noch kannst …', win: 'Das Licht … ich sehe es wieder …', lose: 'Der Schleier … verschlingt alles …' },
  });

  // --- Akt 2: Die Glutschmiede ---
  T({
    id: 'schmied_gero', name: 'Schmiedelehrling Gero', character: 'gero', ai: 'elite',
    team: [{ species: 'magmolch', levelOffset: -2 }, { species: 'steinspatz', levelOffset: 0 }, { species: 'zischkaefer', levelOffset: 1, held: 'glutfeder' }],
    lines: { start: 'Meister Brakk redet nicht mehr mit uns. Ich muss stärker werden, um ihn zu erreichen!', win: 'Mein Hammer … ist noch zu weich.', lose: 'Geschmiedet und gehärtet!' },
  });
  T({
    id: 'forscherin_lia', name: 'Grottenforscherin Lia', character: 'lia', ai: 'elite',
    team: [{ species: 'geysirling', levelOffset: -2 }, { species: 'kieselkrabb', levelOffset: -1 }, { species: 'basaltbock', levelOffset: 1, held: 'kieselschale' }],
    lines: { start: 'Die Kristalle hier singen, wenn man still ist. Aber erst ein Kampf!', win: 'Faszinierend! Deine Monster sind wie geschliffen.', lose: 'Notiz: Gegner war nicht vorbereitet.' },
  });
  T({
    id: 'aschenmoench_tao', name: 'Aschenmönch Tao', character: 'tao', ai: 'elite',
    team: [{ species: 'russmaus', levelOffset: -2 }, { species: 'aschling', levelOffset: 1 }, { species: 'aschegeist', levelOffset: 1, held: 'schattenschleier' }],
    lines: { start: 'Asche ist, was bleibt, wenn das Feuer vergisst. Zeig mir, was in dir brennt.', win: 'Dein Feuer ist echt. Geh in Frieden.', lose: 'Auch Glut wird zu Asche.' },
  });
  T({
    id: 'kael_act2', name: 'Kael', character: 'kael', ai: 'trainer', rival: true,
    counter: { glimmi: 'plitsch', plitsch: 'knospi', knospi: 'glimmi', lumini: 'plitsch', pilzpuff: 'glimmi', brummfels: 'plitsch', zapfi: 'kiesi', kiesi: 'plitsch', nachtmiez: 'zapfi' },
    team: [{ species: 'russmaus', levelOffset: -1 }, { species: 'steinspatz', levelOffset: 0 }],
    lines: { start: 'Schon wieder du. Gut. Ich muss wissen, ob ich stärker geworden bin.', win: 'Verdammt … du wirst wirklich besser.', lose: 'Siehst du? Ich brauche niemanden!' },
  });
  T({
    id: 'brakk', name: 'Wächter Brakk', character: 'brakk', ai: 'boss', boss: true,
    team: [{ species: 'aschegeist', levelOffset: -4 }, { species: 'lavarisk', levelOffset: -3 }, { species: 'schmiedgolem', levelOffset: -1 }],
    items: { superheiltrank: 1 },
    phases: [{ mon: 2, atHpBelow: 0.5, scene: 'brakk_phase2', weather: 'glutregen', addMove: 'schmiedeglut', stageBoost: { stat: 'atk', delta: 1 } }],
    lines: { start: 'Die Schmiede gehört dem Schleier. Und du bist nur Erz für den Amboss.', win: 'Das Feuer … es ist wieder rot …', lose: 'Zu Asche mit dir.' },
  });

  // --- Akt 3: Der Sturmgipfel ---
  T({
    id: 'bergfuehrerin_maren', name: 'Bergführerin Maren', character: 'maren', ai: 'elite',
    team: [{ species: 'gipfelbock', levelOffset: -2 }, { species: 'wolkenwoll', levelOffset: 0 }, { species: 'donneradler', levelOffset: 0, held: 'kieselschale' }],
    lines: { start: 'Niemand geht ohne Prüfung auf den Gipfel. Nicht bei diesem Sturm!', win: 'Gut. Du bist bereit. Pass auf dich auf da oben.', lose: 'Geh zurück ins Tal. Der Berg verzeiht keine Fehler.' },
  });
  T({
    id: 'sturmjaeger_ruvik', name: 'Sturmjäger Ruvik', character: 'ruvik', ai: 'elite',
    team: [{ species: 'blitzfink', levelOffset: -2 }, { species: 'windwiesel', levelOffset: 0 }, { species: 'sturmmarder', levelOffset: 1, held: 'funkenring' }],
    lines: { start: 'Ich jage Blitze, seit ich laufen kann. Fang mich, wenn du kannst!', win: 'Ha! Du bist schneller als ein Gewitter.', lose: 'Zu langsam. Der Sturm wartet auf niemanden.' },
  });
  T({
    id: 'sterndeuterin_ella', name: 'Sterndeuterin Ella', character: 'ella', ai: 'elite',
    team: [{ species: 'kraehling', levelOffset: -2 }, { species: 'nebelmotte', levelOffset: 0 }, { species: 'edelweissa', levelOffset: 1, held: 'blattbrosche' }],
    lines: { start: 'Die Sterne haben mir von dir erzählt. Sie sagen, du warst schon oft hier.', win: 'Die Sterne hatten recht. Du bist anders.', lose: 'Die Sterne irren sich nie … oder doch?' },
  });
  T({
    id: 'kael_act3', name: 'Kael', character: 'kael', ai: 'trainer', rival: true,
    counter: { glimmi: 'plitsch', plitsch: 'knospi', knospi: 'glimmi', lumini: 'plitsch', pilzpuff: 'glimmi', brummfels: 'plitsch', zapfi: 'kiesi', kiesi: 'plitsch', nachtmiez: 'zapfi' },
    team: [{ species: 'rabenfuerst', levelOffset: -1 }, { species: 'lavarisk', levelOffset: -1 }],
    lines: { start: 'Ein letztes Mal. Danach gehe ich zu Sola. Allein … oder mit dir?', win: 'Okay. Okay! Ich hab verstanden. Gemeinsam.', lose: 'Siehst du? Ich schaffe das allein!' },
  });
  T({
    id: 'sola', name: 'Wächterin Sola', character: 'sola', ai: 'boss', boss: true,
    team: [{ species: 'nebelmotte', levelOffset: -4 }, { species: 'rabenfuerst', levelOffset: -3 }, { species: 'sturmkrone', levelOffset: -1 }],
    items: { superheiltrank: 1 },
    phases: [{ mon: 2, atHpBelow: 0.5, scene: 'sola_phase2', weather: 'sturm', addMove: 'himmelszorn', stageBoost: { stat: 'spe', delta: 1 } }],
    lines: { start: 'Ich habe das Ende gesehen. Es ist dunkel. Und du kannst es nicht ändern.', win: 'Die Sterne … sie leuchten wieder …', lose: 'So endet es. Immer wieder.' },
  });

  // --- Akt 4: Jenseits des Schleiers ---
  T({
    id: 'uhrmacherin_tikka', name: 'Uhrmacherin Tikka', character: 'tikka', ai: 'elite',
    team: [{ species: 'zahnradwicht', levelOffset: -2 }, { species: 'scherbenkrebs', levelOffset: 0 }, { species: 'uhrwerkritter', levelOffset: 1, held: 'magnetkern' }],
    lines: { start: 'Pssst, hörst du das Ticken? Hier läuft jede Uhr ein bisschen anders. Zeig mir, ob du im Takt bleibst!', win: 'Auf die Sekunde genau. Du hast ein gutes Gefühl für Zeit.', lose: 'Zu spät, zu früh … nie ganz im Takt.' },
  });
  T({
    id: 'eisweber_joran', name: 'Eisweber Joran', character: 'joran', ai: 'elite',
    team: [{ species: 'reifkitz', levelOffset: -2 }, { species: 'schleierfuchs', levelOffset: 0 }, { species: 'polarhirsch', levelOffset: 1, held: 'frostkristall' }],
    lines: { start: 'Ich webe aus Frost und Wind. Willst du sehen, wie schön Eis sein kann?', win: 'Schön gekämpft. Mein Muster hat ein Loch, aber es steht dir gut.', lose: 'Zu kalt für dich? Das Eis wartet.' },
  });
  T({
    id: 'echohueter_nim', name: 'Echohüter Nim', character: 'nim', ai: 'elite',
    team: [{ species: 'flimmerfalter', levelOffset: -2 }, { species: 'echomotte', levelOffset: 0 }, { species: 'vergessling', levelOffset: 1, held: 'schattenschleier' }],
    lines: { start: 'Ich hüte alles, woran sich keiner mehr erinnert. Wirst du dich an mich erinnern?', win: 'Ich werde mich an dich erinnern, {name}. Versprochen.', lose: 'Auch das wirst du vergessen …' },
  });
  T({
    id: 'kael_act4', name: 'Kael', character: 'kael', ai: 'trainer', rival: true,
    counter: { glimmi: 'plitsch', plitsch: 'knospi', knospi: 'glimmi', lumini: 'plitsch', pilzpuff: 'glimmi', brummfels: 'plitsch', zapfi: 'kiesi', kiesi: 'plitsch', nachtmiez: 'zapfi' },
    team: [{ species: 'aurorafalter', levelOffset: -1 }, { species: 'taktgeist', levelOffset: -1 }, { species: 'polarhirsch', levelOffset: -1 }],
    lines: { start: 'Ardan ist da hinten und ruht sich aus. Aber vorher will ich wissen, wie stark wir wirklich geworden sind!', win: 'Wir sind stark. Und wir müssen es nicht mehr beweisen.', lose: 'Noch ein Stück, dann sind wir so weit. Versprochen.' },
  });
  T({
    id: 'vael', name: 'Erste Bannträgerin Vael', character: 'vael', ai: 'boss', boss: true,
    team: [{ species: 'echomotte', levelOffset: -3 }, { species: 'schleierfuchs', levelOffset: -2 }, { species: 'taktgeist', levelOffset: -1, held: 'lebensorb' }, { species: 'velumora', levelOffset: 1 }],
    items: { superheiltrank: 2 },
    phases: [{ mon: 3, atHpBelow: 0.5, scene: 'vael_phase2', weather: 'schneesturm', addMove: 'schleiergesang', stageBoost: { stat: 'atk', delta: 1 } }],
    lines: { start: 'Ich habe die Zeit so oft zurückgedreht, dass ich die Zahl vergessen habe. Ich lasse ihn nicht noch einmal gehen.', win: 'Velumora … du hast so lange auf mich gewartet. Es tut mir leid.', lose: 'Noch einmal von vorn. Dieses Mal ganz bestimmt.' },
  });

  L.registry.addValidator('trainer', (def, reg) => {
    const errs = [];
    for (const m of def.team) if (!reg.has('species', m.species)) errs.push('unbekannte Art ' + m.species);
    for (const m of def.team) if (m.held && !reg.has('item', m.held)) errs.push('unbekanntes Item ' + m.held);
    if (!reg.has('character', def.character)) errs.push('unbekannte Figur ' + def.character);
    for (const p of def.phases || []) {
      if (p.scene && !reg.has('scene', p.scene)) errs.push('unbekannte Szene ' + p.scene);
      if (p.addMove && !reg.has('move', p.addMove)) errs.push('unbekannte Attacke ' + p.addMove);
    }
    return errs;
  });
})(globalThis.LUM);
