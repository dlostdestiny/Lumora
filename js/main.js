// Start und Ablauf eines Knotens: betreten → passender Bildschirm → abschließen → speichern → Karte.
(function (L) {
  const ui = L.ui;

  ui.flow = {
    async enterNode(nodeId) {
      // Doppelklick abfangen: nur betreten, wenn der Knoten noch offen ist.
      if (L.run.choices(ui.game.run).indexOf(nodeId) < 0) return;
      L.run.enter(ui.game.run, nodeId, ui.game.now());
      ui.game.persist();
      await ui.flow.runPending();
    },

    // Arbeitet den offenen Knoten ab (auch nach dem Neuladen).
    async runPending() {
      const g = ui.game, run = g.run;
      for (;;) {
        const p = run.pending;
        if (!p) break;
        if (p.event && (!p.eventDone || !p.eventResultSeen)) { await ui.nodeScreens.event(run); continue; }
        if (p.battle && !p.battleDone) {
          if (!p.introDone) {
            if (p.kind === 'rival') await ui.dialog.trigger('rival');
            if (p.kind === 'boss') await ui.dialog.trigger('bossPre');
            p.introDone = true;
            g.persist();
          }
          if (!ui.root().querySelector('.screen')) ui.screens.show('map');
          await ui.battle.start(run);
          if (run.finished === 'defeat') {
            await ui.dialog.trigger('gameOver');
            return ui.screens.show('summary', { result: 'defeat' });
          }
          await ui.resolveOffers(run, p.offers);
          p.offers = [];
          await ui.resolveRelease(run);
          g.persist();
          continue;
        }
        if (p.kind === 'spring' && !p.springDone) { await ui.nodeScreens.spring(run); continue; }
        if (p.kind === 'shop' && !p.shopDone) { await ui.nodeScreens.shop(run); p.shopDone = true; continue; }
        if (p.release) { await ui.resolveRelease(run); continue; }
        if (p.offers && p.offers.length) { await ui.resolveOffers(run, p.offers); p.offers = []; g.persist(); continue; }
        if (p.rewards && !p.rewardsDone) { await ui.nodeScreens.rewards(run); continue; }
        break;
      }
      if (run.eggs && run.eggs.length > (run._eggsSeen || 0)) { run.eggs.slice(run._eggsSeen || 0).filter((e) => !e.toasted).forEach((e) => { e.toasted = true; ui.eggToast(e); }); run._eggsSeen = run.eggs.length; }
      if (run.pending && run.pending.fragment) ui.fragmentToast(run.pending.fragment, L.fragments.known(run).length);
      const wasBoss = run.pending && run.pending.kind === 'boss';
      if (wasBoss) await ui.dialog.trigger('bossPost');
      // Abschluss-Szene des Akts, solange run.act noch der alte Akt ist
      if (wasBoss) await ui.dialog.trigger('actOutro');
      const res = L.run.complete(run);
      g.persist();
      (res.quests || []).forEach((q, i) => setTimeout(() => ui.questToast(q.quest), 300 + i * 900));
      if (res.finale) return ui.flow.runPending();
      if (res.victory) {
        return ui.screens.show('summary', { result: 'victory' });
      }
      if (res.actChanged) await ui.dialog.play(L.encounters.act(run).intro);
      ui.screens.show('map');
    },

    async resume() {
      const run = ui.game.run;
      if (run.pending) {
        ui.screens.show('map');
        await ui.flow.runPending();
      } else ui.screens.show('map');
    },
  };

  L.main = function () {
    const errs = L.registry.validate();
    if (errs.length) console.warn('Datenfehler:', errs);
    ui.game.meta = L.save.loadMeta();
    ui.applySettings();
    ui.screens.show('hub');
  };
})(globalThis.LUM);
