#!/usr/bin/env node
// Checks the crosswalk data files against each other:
//  - every THEMES entry has LOOPS entries for exactly the ranks it names an adventure for
//  - every chart number resolves to a real requirement of the right adventure in activities.js / range-requirements.js
// Usage: node tools/check-data.js   (exits 1 if anything is wrong)
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'adventure-crosswalk');
const load = f => fs.readFileSync(path.join(dir, f), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(['data/loops.js', 'data/themes.js', 'activities.js', 'data/range-requirements.js'].map(load).join('\n') +
  '\nthis.out={LOOPS,THEMES,ACTIVITIES,RANGE_REQS};', ctx);
const { LOOPS, THEMES, ACTIVITIES, RANGE_REQS } = ctx.out;
const ALL = Object.assign({}, ACTIVITIES, RANGE_REQS);
const R = ['L', 'T', 'W', 'B', 'We', 'A'];
const pairs = v => (v ? (Array.isArray(v[0]) ? v : [v]) : []);
const nums = n => {
  const p = String(n).split(/\s*[–-]\s*/);
  if (p.length === 2 && /^\d+$/.test(p[0]) && /^\d+$/.test(p[1])) { const o = []; for (let i = +p[0]; i <= +p[1]; i++) o.push(String(i)); return o; }
  return String(n).split(/\s*,\s*/);
};
const bad = [], gaps = [];
let cells = 0;
const ids = new Set();
const used = new Set();
THEMES.forEach(t => {
  if (ids.has(t.id)) bad.push(`${t.id}: duplicate id`);
  ids.add(t.id);
  if (!LOOPS[t.id]) { bad.push(`${t.id}: no LOOPS entry`); return; }
  R.forEach(r => {
    const names = t.adv[r] ? [].concat(t.adv[r]) : [];
    if (names.length !== pairs(LOOPS[t.id][r]).length) bad.push(`${t.id} ${r}: ${names.length} adventure name(s) but ${pairs(LOOPS[t.id][r]).length} LOOPS entr(ies)`);
  });
  t.rows.forEach(([skill, m]) => Object.entries(m).forEach(([r, [num, , k = 0]]) => {
    const p = pairs(LOOPS[t.id][r])[k];
    if (!p) { bad.push(`${t.id} "${skill}" ${r}: no adventure #${k}`); return; }
    nums(num).forEach(q => { cells++; used.add(p[0] + '#' + q); if (!(ALL[p[0]] && ALL[p[0]][q])) bad.push(`${t.id} "${skill}" ${r}: ${p[0]} has no requirement ${q}`); });
  }));
});
// Requirements on scouting.org that no chart row mentions (a warning only: some are deliberately folded into other rows).
THEMES.forEach(t => R.forEach(r => pairs(LOOPS[t.id][r]).forEach(([slug]) => Object.keys(ALL[slug] || {}).forEach(q => { if (!used.has(slug + '#' + q)) gaps.push(`${t.id} ${r}: ${slug} requirement ${q} is not in any row`); }))));
Object.keys(LOOPS).forEach(id => { if (!ids.has(id)) bad.push(`${id}: LOOPS entry without a THEMES entry`); });
console.log(`${THEMES.length} themes, ${cells} chart numbers checked, ${bad.length} problem(s), ${gaps.length} requirement(s) not charted`);
if (process.argv.includes('--gaps')) gaps.forEach(g => console.log('  gap: ' + g));
bad.forEach(b => console.log('  ' + b));
process.exit(bad.length ? 1 : 0);
