// Mini-Testgerüst ohne Abhängigkeiten. Läuft in Node (run-node.js) und im Browser (tests.html).
(function (G) {
  const suites = [];
  let current = null;

  G.describe = function (name, fn) {
    const suite = { name, tests: [] };
    suites.push(suite);
    const prev = current;
    current = suite;
    try { fn(); } finally { current = prev; }
  };

  G.it = function (name, fn) {
    if (!current) throw new Error('it() außerhalb von describe(): ' + name);
    current.tests.push({ name, fn });
  };

  function fmt(v) {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }

  G.assert = {
    eq(actual, expected, msg) {
      const a = fmt(actual), b = fmt(expected);
      if (a !== b) throw new Error((msg ? msg + ': ' : '') + 'erwartet ' + b + ', bekommen ' + a);
    },
    ok(v, msg) {
      if (!v) throw new Error(msg || 'erwartet truthy, bekommen ' + fmt(v));
    },
    near(a, b, eps, msg) {
      if (eps === undefined) eps = 1e-9;
      if (!(Math.abs(a - b) <= eps)) throw new Error((msg ? msg + ': ' : '') + a + ' ist nicht ≈ ' + b + ' (±' + eps + ')');
    },
    throws(fn, pattern) {
      let threw = false;
      try { fn(); } catch (e) {
        threw = true;
        if (pattern && !pattern.test(String(e && e.message))) {
          throw new Error('Fehler passt nicht zu ' + pattern + ': ' + (e && e.message));
        }
      }
      if (!threw) throw new Error('erwartet Fehler, aber keiner geworfen');
    },
  };

  G.TEST = {
    run(filter) {
      const result = { passed: 0, failed: 0, failures: [], lines: [] };
      for (const s of suites) {
        for (const t of s.tests) {
          const full = s.name + ' › ' + t.name;
          if (filter && full.indexOf(filter) === -1) continue;
          try {
            t.fn();
            result.passed++;
            result.lines.push({ ok: true, name: full });
          } catch (e) {
            result.failed++;
            result.failures.push({ name: full, error: e });
            result.lines.push({ ok: false, name: full, error: e });
          }
        }
      }
      return result;
    },
  };
})(globalThis);
