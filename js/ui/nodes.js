// Bildschirme für Knoten: Belohnung, Quelle, Shop, Ereignis. Jeder gibt ein Promise zurück, das endet, wenn der Spieler fertig ist.
(function (L) {
  const ui = L.ui, R = () => L.registry;

  function frame(el, run, inner) {
    const v = L.encounters.variant(run);
    el.innerHTML = '<div class="bg">' + ui.art.background(v.background, { palette: v.palette }) + '</div><div class="shade" style="background:rgba(15,10,25,.6)"></div>' +
      '<div class="screen node-screen">' + inner + '</div>';
    setTimeout(() => ui.ambient(el), 0);
    return el.querySelector('.node-screen');
  }
  function host() {
    const root = ui.root();
    let el = root.querySelector('.screen');
    if (!el) { el = document.createElement('div'); el.className = 'screen'; root.prepend(el); }
    el.innerHTML = '';
    return el;
  }

  function rewardCard(r) {
    switch (r.kind) {
      case 'gold': return { icon: '🪙', title: r.amount + ' Gold', text: 'Ein Beutel voller Münzen.' };
      case 'item': { const it = R().get('item', r.item); return { icon: it.icon, title: it.name + (r.count > 1 ? ' ×' + r.count : ''), text: it.desc }; }
      case 'relic': { const rel = R().get('relic', r.relic); return { icon: rel.icon, title: rel.name, text: rel.desc, tag: rel.rarity === 'rare' ? 'Selten' : 'Relikt' }; }
      case 'move': { const m = R().get('move', r.move); return { icon: '📜', title: 'Schriftrolle: ' + m.name, text: ui.moveLine({ id: r.move }) + '<br>' + ui.esc(m.desc || '') }; }
      case 'egg': { const k = L.eggs.KINDS[r.egg.kind]; return { art: ui.eggArt(r.egg, 120), title: k.name, text: 'Ein Ei für dein Brutnest im Schrein. Was wohl darin steckt?', tag: 'Ei' }; }
      case 'cursed': {
        const rel = R().get('relic', r.relic), c = R().get('curse', r.curse);
        return { icon: '🕯️', cursed: true, title: 'Verfluchte Truhe: ' + rel.name, text: rel.icon + ' ' + ui.esc(rel.desc) + '<br><span class="curse-txt">' + c.icon + ' Fluch „' + ui.esc(c.name) + '“: ' + ui.esc(c.desc) + '</span>', tag: 'Fluch' };
      }
      case 'monster': { const sp = R().get('species', r.species); return { art: ui.art.monster(r.species, {}), title: sp.name + ' (Lv ' + r.level + ')', text: sp.types.map(ui.typeChip).join('') + '<br>' + ui.esc(sp.dex) }; }
    }
  }

  async function applyReward(run, r) {
    if (r.kind === 'move') {
      const idx = await ui.choose('Wer lernt ' + R().get('move', r.move).name + '?', ui.moveLine({ id: r.move }),
        run.team.map((m, i) => ui.monOption(m, i, { disabled: m.moves.some((x) => x.id === r.move) })), 'Abbrechen');
      if (idx === null) return false;
      return ui.learnMove(run.team[idx], r.move);
    }
    const res = L.rewards.apply(run, r, {});
    if (r.kind === 'egg') ui.eggToast(r.egg);
    if (res.mon) L.progress.caught(ui.game.meta, res.mon);
    if (res.pendingRelease) {
      run.pending.release = res.pendingRelease;
      await ui.resolveRelease(run);
    }
    return true;
  }

  ui.nodeScreens = {
    rewards(run) {
      return new Promise((resolve) => {
        setTimeout(() => ui.tutorial.show('rewards'), 400);
        const p = run.pending;
        const s = frame(host(), run, '<h2>Wähle eine Belohnung</h2><div class="cards"></div><button class="btn secondary" data-skip>Überspringen</button>');
        const cards = s.querySelector('.cards');
        cards.innerHTML = p.rewards.map((r, i) => {
          const c = rewardCard(r);
          return '<div class="card panel' + (c.cursed ? ' cursed-card' : '') + '" data-i="' + i + '">' + (c.art ? '<div class="art">' + c.art + '</div>' : '<div class="icon">' + c.icon + '</div>') +
            (c.tag ? '<span class="chip" style="background:' + (c.cursed ? '#8b3a62' : '#c084fc') + '">' + c.tag + '</span>' : '') + '<h3>' + ui.esc(c.title) + '</h3><p>' + c.text + '</p></div>';
        }).join('');
        cards.querySelectorAll('.card').forEach((c) => {
          c.onclick = async () => {
            const rw = p.rewards[Number(c.dataset.i)];
            if (rw.kind === 'cursed') {
              await ui.tutorial.show('curse');
              if (!L.curses.immune(run) && !(await ui.choose('Verfluchte Truhe öffnen?', 'Du bekommst das Relikt, aber der Fluch bleibt, bis du ihn reinigst (Quelle oder Lotte).', [{ label: 'Ja, öffnen', value: true }], 'Doch nicht'))) return;
            }
            const ok = await applyReward(run, rw);
            if (!ok) return;
            p.rewardsDone = true;
            ui.game.persist();
            resolve();
          };
        });
        s.querySelector('[data-skip]').onclick = () => { p.rewardsDone = true; ui.game.persist(); resolve(); };
      });
    },

    spring(run) {
      return new Promise((resolve) => {
        setTimeout(() => ui.tutorial.show('spring'), 400);
        const p = run.pending;
        const opts = p.spring.options;
        const card = (id, icon, title, text) => opts.indexOf(id) >= 0 ? '<div class="card panel" data-o="' + id + '"><div class="icon">' + icon + '</div><h3>' + title + '</h3><p>' + text + '</p></div>' : '';
        const s = frame(host(), run, '<h2>⛲ Eine stille Quelle</h2><p class="muted">Das Wasser leuchtet sanft. Du kannst eine Sache tun.</p><div class="cards">' +
          card('heal', '💧', 'Ausruhen', 'Das ganze Team wird vollständig geheilt, auch besiegte Monster.') +
          card('train', '💪', 'Trainieren', 'Ein Monster steigt um 2 Level.') +
          card('upgrade', '✨', 'Attacke verbessern', 'Eine Attacke wird stärker oder bekommt einen Zusatzeffekt.') +
          card('purge', '🔆', 'Fluch reinigen', 'Das klare Wasser wäscht einen Fluch von dir ab.') +
          card('irrlicht', '🕯️', '???', 'Ein schwaches Licht flackert zwischen den Bäumen … Es scheint dich zu rufen.') +
          (L.encounters.act(run).secrets || []).filter((x) => x.option && x.option !== 'irrlicht').map((x) => card(x.option, x.icon, x.title, x.text)).join('') +
          '</div>');
        s.querySelectorAll('.card').forEach((c) => {
          c.onclick = async () => {
            const o = c.dataset.o;
            if (o === 'train') {
              const i = await ui.choose('Wer trainiert?', '', run.team.map((m, k) => ui.monOption(m, k, { disabled: m.level >= L.config.maxLevel })), 'Zurück');
              if (i === null) return;
              const before = run.team[i].level;
              L.nodes.spring(run, 'train', { mon: i });
              L.progress.track(ui.game.meta, 'springs');
              await ui.alert('Training!', ui.esc(ui.spName(run.team[i])) + ' steigt von Lv ' + before + ' auf Lv ' + run.team[i].level + '!');
            } else if (o === 'upgrade') {
              const i = await ui.choose('Wessen Attacke?', '', run.team.map((m, k) => ui.monOption(m, k, { disabled: !m.moves.some((x) => !x.upgrade) })), 'Zurück');
              if (i === null) return;
              const mon = run.team[i];
              const mi = await ui.choose('Welche Attacke?', '', mon.moves.map((ref, k) => ({ label: ui.moveLine(ref), sub: ref.upgrade ? 'schon verbessert' : '', value: k, disabled: !!ref.upgrade })), 'Zurück');
              if (mi === null) return;
              const ref = mon.moves[mi];
              const desc = (u) => {
                const m = L.moves.resolve({ id: ref.id, upgrade: u });
                const eff = (m.effects || []).map((e) => e.kind === 'status' ? R().get('status', e.status).name + ' ' + Math.round((e.chance || 1) * 100) + ' %' : e.kind === 'stage' ? (L.battle.STAT_NAMES[e.stat] + ' ' + (e.delta > 0 ? '+' : '') + e.delta) : e.kind === 'critUp' ? 'Volltreffer+' : e.kind === 'priority' ? 'Zuerst' : e.kind).join(', ');
                return 'Stärke ' + (m.power || '–') + ' · Gen. ' + (m.accuracy || '∞') + (m.priority ? ' · Priorität +' + m.priority : '') + (eff ? ' · ' + eff : '');
              };
              const choice = await ui.choose('Wie soll ' + R().get('move', ref.id).name + ' besser werden?', 'Jetzt: ' + desc(null),
                ['a', 'b'].map((u) => ({ label: '<b>' + ui.esc(L.moves.resolve({ id: ref.id, upgrade: u }).name) + '</b>', sub: desc(u), value: u })), 'Zurück');
              if (!choice) return;
              L.nodes.spring(run, 'upgrade', { mon: i, move: mi, choice });
              L.progress.track(ui.game.meta, 'springs');
              await ui.alert('Verbessert!', ui.esc(ui.spName(mon)) + ' beherrscht jetzt <b>' + ui.esc(L.moves.resolve(mon.moves[mi]).name) + '</b>!');
            } else if (o === 'purge') {
              const id = run.curses.length === 1 ? run.curses[0] : await ui.choose('Welchen Fluch reinigen?', '', run.curses.map((cid) => { const c = R().get('curse', cid); return { label: c.icon + ' ' + ui.esc(c.name), sub: ui.esc(c.desc), value: cid }; }), 'Zurück');
              if (!id) return;
              L.nodes.spring(run, 'purge', { curse: id });
              await ui.alert('Gereinigt!', 'Der Fluch „' + ui.esc(R().get('curse', id).name) + '“ ist von dir gewichen.');
            } else {
              L.nodes.spring(run, o, {});
              if (o === 'heal') L.progress.track(ui.game.meta, 'springs');
              if (o === 'heal') await ui.alert('Erholt!', 'Dein Team ist wieder bei vollen Kräften.');
              if (o === 'irrlicht') await ui.alert('Das Irrlicht', 'Du folgst dem Licht tief in den Wald. Plötzlich bleibt es stehen … und dreht sich zu dir um!');
              else { const sec = L.nodes.secretFor(run, o); if (sec && sec.reveal) await ui.alert(sec.icon + ' ' + sec.title, ui.esc(sec.reveal)); }
            }
            ui.game.persist();
            resolve();
          };
        });
      });
    },

    shop(run) {
      return new Promise((resolve) => {
        setTimeout(() => ui.tutorial.show('shop'), 400);
        const p = run.pending;
        const el = host();
        function draw() {
          const s = frame(el, run, '<div class="row" style="gap:20px"><div style="width:150px;height:165px">' + ui.art.portrait('haendlerin', 'froh', {}) + '</div>' +
            '<div><h2>🛒 Lottes Laden</h2><p class="muted">„Schau dich ruhig um!“ · Du hast <span class="gold">🪙 ' + run.gold + '</span></p></div></div>' +
            '<div class="shop-grid"></div><button class="btn" data-done>Weiterziehen</button>');
          s.querySelector('.shop-grid').innerHTML = p.shop.map((e, i) => {
            let icon, name, desc;
            if (e.kind === 'item') { const it = R().get('item', e.id); icon = it.icon; name = it.name; desc = it.desc; }
            if (e.kind === 'relic') { const r = R().get('relic', e.id); icon = r.icon; name = r.name; desc = r.desc; }
            if (e.kind === 'move') { const m = R().get('move', e.id); icon = '📜'; name = 'Schriftrolle: ' + m.name; desc = ui.moveLine({ id: e.id }); }
            if (e.kind === 'purge') { icon = '🔆'; name = 'Reinigungsritual'; desc = 'Lotte entfernt einen Fluch.'; }
            return '<div class="shop-item panel' + (e.sold ? ' sold' : '') + '"><div class="icon">' + icon + '</div><b>' + ui.esc(name) + '</b><p style="font-size:12px" class="muted">' + desc + '</p>' +
              '<button class="btn" data-buy="' + i + '"' + (e.sold || run.gold < e.price ? ' disabled' : '') + '>' + (e.sold ? 'Verkauft' : '🪙 ' + e.price) + '</button></div>';
          }).join('');
          s.querySelectorAll('[data-buy]').forEach((b) => {
            b.onclick = async () => {
              const i = Number(b.dataset.buy), e = p.shop[i];
              let opts = {};
              if (e.kind === 'move') {
                const idx = await ui.choose('Wer lernt ' + R().get('move', e.id).name + '?', '', run.team.map((m, k) => ui.monOption(m, k, { disabled: m.moves.some((x) => x.id === e.id) })), 'Abbrechen');
                if (idx === null) return;
                const mon = run.team[idx];
                let replace = null;
                if (mon.moves.length >= 4) {
                  replace = await ui.choose('Welche Attacke vergessen?', '', mon.moves.map((ref, k) => ({ label: ui.moveLine(ref), value: k })), 'Abbrechen');
                  if (replace === null) return;
                }
                opts = { mon: idx, replaceIndex: replace };
              }
              if (e.kind === 'purge') {
                const id = (run.curses || []).length <= 1 ? run.curses[0] : await ui.choose('Welchen Fluch reinigen?', '', run.curses.map((cid) => { const c = R().get('curse', cid); return { label: c.icon + ' ' + ui.esc(c.name), sub: ui.esc(c.desc), value: cid }; }), 'Abbrechen');
                if (!id) return;
                opts = { curse: id };
              }
              L.nodes.buy(run, i, opts);
              L.progress.track(ui.game.meta, 'purchases');
              ui.game.persist();
              draw();
            };
          });
          s.querySelector('[data-done]').onclick = () => resolve();
        }
        draw();
      });
    },

    event(run) {
      return new Promise((resolve) => {
        setTimeout(() => ui.tutorial.show('event'), 400);
        const p = run.pending;
        const ev = R().get('event', p.event);
        const who = ev.character ? '<div class="who">' + ui.art.portrait(ev.character, 'froh', {}) + '</div>' : '';
        const s = frame(host(), run, '<h2>' + ev.icon + ' ' + ui.esc(ev.title) + '</h2><div class="event-box panel' + (who ? ' has-who' : '') + '">' + who +
          '<div><p>' + ui.esc(ev.text) + '</p><div class="opt-list"></div></div></div>');
        const list = s.querySelector('.opt-list');
        // Ergebnis zeigen; auch nach dem Neuladen, falls die Wahl schon getroffen war.
        const showResult = (texts) => {
          list.innerHTML = texts.map((t) => '<p>' + ui.esc(t) + '</p>').join('') + '<div class="row" style="justify-content:flex-end"><button class="btn" data-ok>' + (p.battle && !p.battleDone ? 'Kämpfen!' : 'Weiter') + '</button></div>';
          list.querySelector('[data-ok]').onclick = () => { p.eventResultSeen = true; ui.game.persist(); resolve(); };
        };
        if (p.eventDone) return showResult(p.eventResult ? p.eventResult.texts : []);
        list.innerHTML = ev.options.map((o, i) => {
          const ok = L.nodes.optionAvailable(run, ev.id, i, ui.game.now());
          return '<button class="opt" data-i="' + i + '"' + (ok ? '' : ' disabled') + '><div><div><b>' + ui.esc(o.label) + '</b></div>' + (o.preview ? '<small>' + ui.esc(o.preview) + '</small>' : '') + (ok ? '' : '<small>(nicht möglich)</small>') + '</div></button>';
        }).join('');
        list.querySelectorAll('[data-i]').forEach((b) => {
          b.onclick = async () => {
            if (p.eventDone) return;
            const res = L.nodes.event(run, ev.id, Number(b.dataset.i), ui.game.now());
            L.progress.track(ui.game.meta, 'events');
            if (res.newMon) L.progress.caught(ui.game.meta, res.newMon);
            ui.game.persist();
            showResult(res.texts);
          };
        });
      });
    },
  };
})(globalThis.LUM);
