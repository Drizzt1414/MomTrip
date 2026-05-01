const t = require('../js/data.js');
for (const d of [4, 19, 20, 14]) {
  const rx = new RegExp(`Day\\s*${d}\\b`, 'i');
  const recs = (t.recommendations || []).filter(r => r.when && rx.test(r.when));
  console.log(`Day ${d}:`, recs.length);
  recs.forEach(r => console.log('  -', r.priority, '[' + r.kind + ']', r.name.split('\n')[0]));
}
console.log('\nAll rec when-strings:');
(t.recommendations || []).forEach(r => console.log('  "' + (r.when || '').replace(/\n/g, ' | ') + '"'));
