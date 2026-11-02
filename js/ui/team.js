// Team-Verwaltung außerhalb des Kampfes: Details, Reihenfolge, Items tragen, heilen, freilassen.
(function (L) {
  const ui = L.ui, R = () => L.registry;
  const STAT_LABEL = { hp: 'KP', atk: 'Angriff', def: 'Verteidigung', spe: 'Tempo' };

  function detailsHtml(mon) {
    const sp = R().get('species', mon.species);
    const st = L.mon.stats(mon);
    const nat = R().get('nature', mon.nature);
    const ab = R().get('ability', L.mon.abilityId(mon));
    const tr = mon.trait ? R().get('trait', mon.trait) : null;
    const held = mon.held ? R().get('item', mon.held) : null;
    const stats = Object.keys(STAT_LABEL).map((k) => {
      const mark = nat.up === k ? ' <span style="color:var(--good)">▲</span>' : nat.down === k ? ' <span style="color:var(--bad)">▼</span>' : '';
      return '<span>' + STAT_LABEL[k] + mark + '</span><b>' + st[k] + '</b>';
    }).join('');
    const moves = mon.moves.map((ref) => {
      const m = L.moves.resolve(ref);
      return '<div style="margin:4px 0">' + ui.moveLine(ref) + (ref.upgrade ? ' <span class="chip" style="background:#ffcf5a">verbessert</span>' : '') + '<br><small class="muted">' + ui.esc(m.desc || '') + '</small></div>';
    }).join('');
    return '<div class="row" style="align-items:flex-start;gap:18px"><div style="width:200px;height:200px;flex:none">' + ui.monArt(mon) + '</div><div style="flex:1">' +
      '<h3 style="margin:0">' + ui.esc(sp.name) + (mon.shiny ? ' ✨' : '') + ' <small class="muted">Lv ' + mon.level + '</small></h3>' + ui.typeChips(mon) +
      '<p class="muted" style="margin:6px 0">' + ui.esc(sp.dex) + '</p>' +
      '<div class="stats-mini" style="grid-template-columns:auto auto auto auto;gap:4px 14px;font-size:14px">' + stats + '</div>' +
      '<p style="margin:6px 0">KP ' + mon.hp + '/' + st.hp + (mon.status ? ' · ' + R().get('status', mon.status).icon + ' ' + R().get('status', mon.status).name : '') + '</p>' +
      ui.hpBar(mon.hp, st.hp) + '<div style="height:4px"></div>' + ui.expBar(mon) + '<div style="height:4px"></div>' + ui.bondBar(mon.bond) +
      '<p style="margin:8px 0 2px"><b>Wesen:</b> ' + nat.name + ' · <b>Fähigkeit:</b> ' + (mon.hiddenAbility ? '✨ ' : '') + ab.name + (mon.hiddenAbility ? ' <span class="chip" style="background:#c084fc">versteckt</span>' : '') + ' <small class="muted">(' + ui.esc(ab.desc) + ')</small></p>' +
      (tr ? '<p style="margin:2px 0"><b>Merkmal:</b> ' + tr.name + ' <small class="muted">(' + ui.esc(tr.desc) + ')</small></p>' : '') +
      '<p style="margin:2px 0"><b>Trägt:</b> ' + (held ? held.icon + ' ' + held.name : '–') + '</p>' +
      '<p style="margin:2px 0"><b>Bindung:</b> ' + Math.floor(mon.bond) + '/100' + (mon.bond >= 100 ? ' – Bindungs-Attacke bereit!' : '') + '</p>' +
      '</div></div><h4 style="margin:10px 0 4px">Attacken</h4>' + moves;
  }

  ui.monDetails = async function (run, index) {
    for (;;) {
      const mon = run.team[index];
      const heals = Object.keys(run.items).filter((k) => run.items[k] > 0 && ['heal', 'cure', 'revive'].indexOf(R().get('item', k).kind) >= 0);
      const helds = Object.keys(run.items).filter((k) => run.items[k] > 0 && R().get('item', k).kind === 'held');
      const m = ui.modal(detailsHtml(mon) + '<div class="row wrap" style="margin-top:14px;justify-content:flex-end">' +
        (index > 0 ? '<button class="btn secondary" data-a="front">⬆ An die Spitze</button>' : '') +
        (heals.length ? '<button class="btn secondary" data-a="heal">🧪 Item benutzen</button>' : '') +
        (helds.length || mon.held ? '<button class="btn secondary" data-a="held">🎒 Item tragen</button>' : '') +
        (run.team.length > 1 ? '<button class="btn danger" data-a="release">Freilassen</button>' : '') +
        '<button class="btn" data-a="close">Schließen</button></div>');
      const a = await new Promise((res) => m.el.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => res(b.dataset.a); }));
      m.close();
      if (a === 'close') return;
      if (a === 'front') { run.team.unshift(run.team.splice(index, 1)[0]); index = 0; }
      if (a === 'heal') {
        const id = await ui.choose('Welches Item?', '', heals.map((k) => {
          const it = R().get('item', k);
          const ok = (it.kind === 'heal' && mon.hp > 0 && mon.hp < L.mon.maxHp(mon)) || (it.kind === 'revive' && mon.hp <= 0) || (it.kind === 'cure' && mon.status && mon.hp > 0);
          return { label: it.icon + ' ' + it.name + ' ×' + run.items[k], sub: it.desc, value: k, disabled: !ok };
        }), 'Abbrechen');
        if (id) {
          const it = R().get('item', id);
          const max = L.mon.maxHp(mon);
          if (it.kind === 'heal') mon.hp = Math.min(max, mon.hp + Math.floor(max * it.value));
          if (it.kind === 'revive') mon.hp = Math.floor(max * it.value);
          if (it.kind === 'cure') mon.status = null;
          run.items[id]--;
        }
      }
      if (a === 'held') {
        const opts = helds.map((k) => ({ label: R().get('item', k).icon + ' ' + R().get('item', k).name, sub: R().get('item', k).desc, value: k }));
        if (mon.held) opts.unshift({ label: 'Ablegen: ' + R().get('item', mon.held).name, value: '_none' });
        const id = await ui.choose('Was soll ' + ui.spName(mon) + ' tragen?', '', opts, 'Abbrechen');
        if (id) {
          if (mon.held) run.items[mon.held] = (run.items[mon.held] || 0) + 1;
          mon.held = null;
          if (id !== '_none') { mon.held = id; run.items[id]--; }
        }
      }
      if (a === 'release') {
        const ok = !ui.setting('confirm') || await ui.choose(ui.spName(mon) + ' freilassen?', 'Es kehrt in die Wildnis zurück.', [{ label: 'Ja, freilassen', value: true }], 'Nein');
        if (ok) { L.run.removeFromTeam(run, index); ui.game.persist(); return; }
      }
      ui.game.persist();
    }
  };

  ui.teamManager = async function (run) {
    const idx = await ui.choose('Dein Team', 'Das erste Monster beginnt jeden Kampf.', run.team.map((m, i) => ui.monOption(m, i)), 'Zurück');
    if (idx !== null) { await ui.monDetails(run, idx); return ui.teamManager(run); }
  };
})(globalThis.LUM);
