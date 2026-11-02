// Lauf-Ende (Sieg oder Niederlage) und Lexikon.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  ui.screens.register('summary', {
    render(el, params) {
      const g = ui.game, run = g.run;
      const res = L.progress.finishRun(g.meta, run);
      const echo = R().get('echo', 'echo' + (run.echo || 0));
      const victory = params.result === 'victory';
      const caught = run.stats.caught.map((id) => R().get('species', id).name);
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade"></div>' +
        '<div class="screen node-screen"><h2>' + (run.flags.jenseits ? '🌌 Jenseits des Schleiers: Vael hat losgelassen!' : run.flags.trueEnd ? '✨ Das wahre Ende! Die Schleife ist gebrochen!' : victory ? '🌟 Du hast es geschafft! Der Schleier weicht!' : '💫 Der Echo-Stein leuchtet …') + '</h2>' +
        '<div class="panel" style="padding:18px 24px;min-width:min(520px,94vw)">' +
        '<div class="row wrap" style="gap:8px;margin-bottom:10px">' + run.team.map((m) => '<div style="width:80px;height:80px" title="' + ui.esc(ui.spName(m)) + ' Lv ' + m.level + '">' + ui.monArt(m) + '</div>').join('') + '</div>' +
        '<p>Siege: <b>' + run.stats.battlesWon + '</b> · Gefangen: <b>' + (caught.length ? ui.esc(caught.join(', ')) : 'keine') + '</b>' + (run.stats.shinies ? ' · ✨ ' + run.stats.shinies + ' Schimmer!' : '') + '</p>' +
        '<p>Erreichte Akte: <b>' + res.reached + '</b> · Echo-Stufe: <b>' + echo.icon + ' ' + ui.esc(echo.name) + '</b>' + (run.echo ? ' <small class="muted">(Kristalle ×' + L.echo.of(run).crystalMult + ')</small>' : '') + '</p>' +
        (res.unlocked ? '<p style="color:var(--accent);font-weight:900">🔓 Neue Echo-Stufe freigeschaltet: ' + ui.esc(R().get('echo', 'echo' + res.unlocked).name) + '!</p>' : '') +
        (res.rankXp ? '<div class="sum-rank"><span>⭐ +' + res.rankXp + ' Rang-Erfahrung</span>' + ui.rankBadge(g.meta) + (res.rankAfter > res.rankBefore ? '<b class="rank-up">🎉 Rang ' + res.rankAfter + ' erreicht! Neue Talentpunkte im Schrein.</b>' : '') + '</div>' : '') +
        '<p style="font-size:22px">💎 +' + res.crystals + ' Kristalle <small class="muted">(insgesamt ' + g.meta.crystals + ')</small></p>' +
        (res.eggs && (res.eggs.added || res.eggs.converted) ? '<p>🥚 Eier: ' + (res.eggs.added ? res.eggs.added + ' ins Brutnest' : '') + (res.eggs.converted ? (res.eggs.added ? ', ' : '') + res.eggs.converted + ' × 10 💎 (Nest voll)' : '') + ' · Nest +' + res.eggs.warmth + ' 🔥</p>' : (g.meta.eggs || []).length ? '<p>🥚 Deine Eier bekommen +' + L.eggs.warmthFor(run) + ' 🔥 Wärme.</p>' : '') +
        (res.mastery && Object.keys(res.mastery).length ? '<p>📚 Meisterschaft: ' + Object.keys(res.mastery).map((sp) => ui.esc(R().get('species', sp).name) + ' +' + res.mastery[sp] + (L.mastery.of(g.meta, sp) ? ' ' + L.mastery.LEVELS[L.mastery.of(g.meta, sp)].icon : '')).join(', ') + '</p>' : '') +
        (run.mode === 'turm' ? '<p style="font-size:20px">🗼 Echo-Turm: Stockwerk <b>' + (run.towerFloors || L.tower.floors(run)) + '</b> (Bestwert ' + (g.meta.stats.towerBest || 0) + ')</p>' : '') +
        ((run.foundFragments || []).length ? '<p>🌠 Sternenfragmente: <b>' + run.foundFragments.map((f) => ui.esc(L.fragments.label(f))).join(', ') + '</b> (' + (g.meta.fragments || []).length + ' / 9)</p>' : '') +
        (run.daily && g.meta.daily[run.daily] ? '<p>📅 Tages-Herausforderung: <b>' + g.meta.daily[run.daily].score + ' Punkte</b></p>' : '') +
        ((run.quests || []).some((q) => q.done) ? '<p>📜 Aufträge erledigt: <b>' + run.quests.filter((q) => q.done).map((q) => ui.esc(R().get('quest', q.id).name)).join(', ') + '</b></p>' : '') +
        ((run.curses || []).length ? '<p>Flüche: ' + run.curses.map((id) => R().get('curse', id).icon + ' ' + ui.esc(R().get('curse', id).name)).join(', ') + '</p>' : '') +
        '<p class="muted">Im 💎 Kristall-Shop im Schrein kannst du Kristalle gegen neue Starter, Segen und Relikt-Sets tauschen.</p></div>' +
        '<button class="btn big" data-ok>Zurück zum Schrein</button></div>';
      res.team = run.team.slice();
      g.run = null;
      g.persist();
      // Pflegestation: ein Monster mit Bronze-Meisterschaft legt ein Ei seiner Art
      const breeders = (res.team || run.team).filter((m) => L.eggs.canBreed(g.meta, m));
      el.querySelector('[data-ok]').onclick = async () => {
        if (breeders.length && (g.meta.eggs || []).length < L.eggs.slots(g.meta) && !run._bred) {
          const pick = await ui.choose('🪺 Pflegestation', 'Ein Monster mit 🥉 Meisterschaft kann bei der Pflegestation bleiben. Es legt ein Ei seiner Art, mit einer seiner Attacken als Ei-Attacke.',
            breeders.map((m) => ({ label: ui.esc(ui.spName(m)) + ' Lv ' + m.level, sub: m.moves.map((x) => L.moves.resolve(x).name).join(', '), art: ui.monArt(m), value: m.uid })), 'Nein danke');
          if (pick) {
            const parent = breeders.find((m) => m.uid === pick);
            g.meta.eggs.push(L.eggs.uniqueId(g.meta, L.eggs.fromParent(parent, L.rng.create(Date.now() >>> 0))));
            run._bred = true;
            L.save.saveMeta(g.meta);
            await ui.alert('🥚 Ein Zuchtei!', ui.esc(ui.spName(parent)) + ' hat ein Ei gelegt. Es liegt jetzt in deinem Brutnest.');
          }
        }
        ui.screens.show('hub');
      };
    },
  });

  ui.screens.register('dex', {
    render(el) {
      const meta = ui.game.meta;
      const list = L.progress.dexList(meta);
      el.innerHTML = '<div class="bg">' + ui.art.background('schrein', {}) + '</div><div class="shade" style="background:rgba(15,10,25,.7)"></div>' +
        '<div class="screen node-screen"><h2>📖 Lexikon · ' + Math.round(L.progress.dexCompletion(meta) * 100) + ' %</h2><div class="dex-grid"></div><button class="btn" data-back>Zurück</button></div>';
      el.querySelector('.dex-grid').innerHTML = list.map((x) => {
        const e = x.entry;
        const seen = e && e.seen;
        const nm = x.secret ? '???' : seen ? x.species.name : '???';
        const art = x.secret ? '<div class="center" style="height:100%;font-size:54px">❔</div>' : ui.art.monster(x.species.id, {});
        return '<div class="dex-card panel' + (seen ? '' : ' unseen') + '" data-id="' + x.species.id + '"><div class="art">' + art + '</div>#' + String(x.no).padStart(3, '0') + ' ' + ui.esc(nm) +
          (e && e.caught ? ' ✔️' : '') + (e && e.shinySeen ? ' ✨' : '') + (L.mastery.of(meta, x.species.id) ? ' ' + L.mastery.LEVELS[L.mastery.of(meta, x.species.id)].icon : '') + '</div>';
      }).join('');
      const masteryHtml = (id) => {
        const pts = L.mastery.points(meta, id), lv = L.mastery.level(pts), next = L.mastery.LEVELS[lv + 1];
        return '<p><b>Meisterschaft:</b> ' + (lv ? L.mastery.LEVELS[lv].icon + ' ' + L.mastery.LEVELS[lv].name : 'noch keine') + ' · ' + pts + ' Punkte' + (next ? ' (' + next.icon + ' ' + next.name + ' ab ' + next.need + ')' : '') +
          '<br><small class="muted">Punkte gibt es am Laufende für jedes Monster im Team. Ab Bronze startet diese Art mit mehr Bindung (' + L.mastery.LEVELS.slice(1).map((x) => x.icon + ' ' + x.bond).join(', ') + ').</small></p>';
      };
      el.querySelectorAll('.dex-card').forEach((c) => {
        c.onclick = () => {
          const sp = R().get('species', c.dataset.id), e = meta.dex[sp.id];
          if (sp.rarity === 'unique' && !(e && e.seen)) {
            const rk = sp.legend ? sp.legend.rank : 0, mine = L.rank.level(meta);
            return ui.alert('Ein Geheimnis …', '<p>' + ui.esc(sp.hint || 'Niemand weiß, wo dieses Monster lebt.') + '</p>' +
              (rk ? '<p>👑 <b>Legende</b> · zeigt sich erst ab Bannträger-Rang <b>' + rk + '</b> ' + (mine >= rk ? '(✓ du bist bereit)' : '(du bist Rang ' + mine + ')') + '.<br><small class="muted">Legenden kämpfen stärker als alles um sie herum und sind schwer zu fangen.</small></p>' : ''));
          }
          if (!e || !e.seen) return ui.alert('???', '<p>Dieses Monster hast du noch nicht gesehen.</p>');
          const traits = (e.traits || []).map((t) => R().get('trait', t).name).join(', ');
          ui.alert(sp.name, '<div class="row" style="align-items:flex-start"><div style="width:180px;height:180px;flex:none">' + ui.art.monster(sp.id, { shiny: !!e.shinySeen }) + '</div><div>' +
            sp.types.map(ui.typeChip).join('') + '<p>' + ui.esc(sp.dex) + '</p><p><b>Fähigkeit:</b> ' + R().get('ability', sp.ability).name + '</p>' +
            (sp.hiddenAbility ? '<p><b>Versteckte Fähigkeit:</b> ' + (e.hiddenSeen ? '✨ ' + ui.esc(R().get('ability', sp.hiddenAbility).name) + ' – ' + ui.esc(R().get('ability', sp.hiddenAbility).desc) : '??? <small class="muted">(selten bei wilden Monstern)</small>') + '</p>' : '') +
            '<p>' + (e.caught ? '✔️ Gefangen' : 'Nur gesehen') + (e.shinyCaught ? ' · ✨ Schimmer gefangen' : e.shinySeen ? ' · ✨ Schimmer gesehen' : '') + '</p>' +
            (traits ? '<p><b>Gesehene Merkmale:</b> ' + ui.esc(traits) + '</p>' : '') + masteryHtml(sp.id) + '</div></div>', 'Schließen');
        };
      });
      el.querySelector('[data-back]').onclick = () => ui.screens.show('hub');
    },
  });
})(globalThis.LUM);
