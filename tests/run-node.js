// Führt alle Logik-Tests in Node aus: node tests/run-node.js [filter]
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
function load(rel) {
  const file = path.join(root, rel);
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
}

load('js/files.js');
load('tests/harness.js');
load('tests/files.js');
for (const f of globalThis.LUM_FILES.logic) load(f);
for (const f of globalThis.LUM_TEST_FILES) load(f);

// Jede Datei unter js/ muss in js/files.js stehen (sonst lädt das Spiel sie nicht).
describe('files.js', () => {
  it('lists every js file', () => {
    const listed = new Set(globalThis.LUM_FILES.logic.concat(globalThis.LUM_FILES.ui));
    const missing = [];
    (function walk(dir) {
      for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = dir + '/' + e.name;
        if (e.isDirectory()) walk(rel);
        else if (rel.endsWith('.js') && rel !== 'js/files.js' && !listed.has(rel)) missing.push(rel);
      }
    })('js');
    assert.eq(missing, []);
  });
});

const res = globalThis.TEST.run(process.argv[2]);
for (const l of res.lines) {
  if (l.ok) console.log('  ✓ ' + l.name);
  else console.log('  ✗ ' + l.name + '\n      ' + (l.error && l.error.stack ? l.error.stack.split('\n').slice(0, 3).join('\n      ') : l.error));
}
console.log('\n' + res.passed + ' passed, ' + res.failed + ' failed');
if (res.failed) process.exitCode = 1;
