// Tastatur-Steuerung für alle Bildschirme.
// Fenster: 1–9 wählt eine Option, Enter bestätigt, Esc bricht ab. Auswahl-Bildschirme: 1–9 wählt eine Karte.
// Karte: 1–4 betritt ein offenes Feld (von links nach rechts). Esc: Zurück. Der Kampf hat eigene Tasten (js/ui/battle.js).
(function (L) {
  const ui = L.ui;
  const visible = (el) => el && el.offsetParent !== null && !el.disabled;
  const click = (el) => { if (visible(el)) { el.click(); return true; } return false; };

  ui.KEY_HELP = [
    ['1–9', 'Option, Karte oder Feld wählen'],
    ['Enter / Leertaste', 'Bestätigen, Text weiter'],
    ['Esc', 'Abbrechen oder zurück'],
    ['Im Kampf: 1–4', 'Attacke'],
    ['Im Kampf: B / W / H', 'Tasche / Wechseln / Bindung'],
    ['Im Kampf: P / T / M', 'Kampf-Protokoll / Typen / Ton an-aus'],
  ];

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const root = ui.root();
    if (root.querySelector('.tut-layer, .dialog')) return;
    const n = Number(e.key);
    const modals = root.querySelectorAll('.modal');
    const modal = modals[modals.length - 1];
    if (modal) {
      if (n >= 1 && n <= 9) { const opts = [...modal.querySelectorAll('.opt')].filter(visible); if (opts[n - 1]) { opts[n - 1].click(); e.preventDefault(); } return; }
      if (e.key === 'Escape') { if (click(modal.querySelector('[data-cancel]')) || click(modal.querySelector('[data-close]')) || click(modal.querySelector('[data-skip]'))) e.preventDefault(); return; }
      if (e.key === 'Enter') { if (click(modal.querySelector('[data-ok]')) || click(modal.querySelector('[data-close]'))) e.preventDefault(); return; }
      return;
    }
    if (root.querySelector('.battle')) return;
    const scr = root.querySelector('.screen');
    if (!scr) return;
    if (n >= 1 && n <= 9) {
      // Karte: offene Felder von links nach rechts
      const nodes = [...scr.querySelectorAll('.node.open')].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      if (nodes.length) { if (nodes[n - 1]) { nodes[n - 1].dispatchEvent(new MouseEvent('click', { bubbles: true })); e.preventDefault(); } return; }
      const cards = [...scr.querySelectorAll('.cards > .card, .shop-grid [data-buy]')].filter((c) => visible(c) && !c.classList.contains('locked') && !c.classList.contains('locked-starter'));
      if (cards[n - 1]) { cards[n - 1].click(); e.preventDefault(); }
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (click(scr.querySelector('[data-go]')) || click(scr.querySelector('[data-ok]')) || click(scr.querySelector('[data-done]'))) e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      if (click(scr.querySelector('[data-back]')) || click(scr.querySelector('[data-skip]')) || click(scr.querySelector('[data-act="menu"]'))) e.preventDefault();
    }
  });
})(globalThis.LUM);
