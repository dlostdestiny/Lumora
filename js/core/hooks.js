// Hooks: Fähigkeiten, Items, Relikte usw. hängen sich an feste Zeitpunkte im Kampf.
(function (L) {
  L.hooks = {
    NAMES: [
      'onBattleStart', 'onSwitchIn', 'onTurnEnd', 'onHit', 'onDealDamage', 'onFaint', 'onStatusInflict',
      'modifyStat', 'modifyDamage', 'modifyIncomingDamage', 'modifyCritStage', 'modifyAccuracy', 'modifyEvasion',
      'modifyPriority', 'modifyWeatherTurns', 'modifyExp', 'modifyCatchRate', 'modifyGold', 'modifyCrystals',
      'modifyHealAfterBattle', 'modifySurvive', 'modifyStatusChance', 'modifyBondGain',
    ],
    run(handlers, name, ctx, initial) {
      const modify = name.indexOf('modify') === 0;
      let value = initial;
      for (const h of handlers) {
        const out = h.fn(modify ? value : ctx, modify ? ctx : undefined);
        if (modify && out !== undefined && out !== null) value = out;
      }
      return modify ? value : undefined;
    },
    // Zusätzliche Quellen je Seite (Relikt-Sets, Flüche …): fn(side) → [{ source, hooks }]
    sources: [],
    extra(side) {
      const out = [];
      for (const fn of L.hooks.sources) out.push(...(fn(side) || []));
      return out;
    },
    // Prüft, dass ein hooks-Objekt nur bekannte Namen nutzt.
    check(hooks) {
      const errs = [];
      for (const k of Object.keys(hooks || {})) if (L.hooks.NAMES.indexOf(k) === -1) errs.push('unbekannter Hook ' + k);
      return errs;
    },
  };
})(globalThis.LUM);
