// Usage: node graph-art.mjs preview | node graph-art.mjs build <dir> <email> [commitsPerCell]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const FONT = {
  P: ['111', '101', '111', '100', '100'],
  I: ['111', '010', '010', '010', '111'],
  X: ['101', '101', '010', '101', '101'],
  E: ['111', '100', '111', '100', '111'],
  L: ['100', '100', '100', '100', '111'],
  C: ['111', '100', '100', '100', '111'],
  A: ['111', '101', '111', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  H: ['101', '101', '111', '101', '101'],
};
const TEXT = 'PIXEL CLASH';

// build a 5-row bitmap
const cols = [];
for (const ch of TEXT) {
  if (ch === ' ') { cols.push([0,0,0,0,0], [0,0,0,0,0]); continue; }
  const g = FONT[ch];
  for (let x = 0; x < 3; x++) cols.push(g.map(r => +r[x]));
  cols.push([0,0,0,0,0]);
}
cols.pop(); // trailing gap

// graph: 53 week columns, Sunday first. Last column = week containing today.
const today = new Date();
const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
const lastSunday = todayUTC - new Date(todayUTC).getUTCDay() * 86400000;
const firstSunday = lastSunday - 52 * 7 * 86400000;
const offset = Math.floor((52 - cols.length) / 2); // leave the partial last week empty
const ROW0 = 1; // Monday..Friday

const cells = [];
cols.forEach((c, x) => c.forEach((v, y) => {
  if (!v) return;
  const day = firstSunday + ((offset + x) * 7 + ROW0 + y) * 86400000;
  cells.push(day);
}));

const mode = process.argv[2];
if (mode === 'preview') {
  for (let r = 0; r < 7; r++) {
    let line = '';
    for (let w = 0; w < 53; w++) line += cells.includes(firstSunday + (w * 7 + r) * 86400000) ? '#' : '.';
    console.log(line);
  }
  console.log(`${cells.length} lit cells, ${new Date(Math.min(...cells)).toISOString().slice(0,10)} .. ${new Date(Math.max(...cells)).toISOString().slice(0,10)}`);
} else if (mode === 'build') {
  const [dir, email, per = '12'] = process.argv.slice(3);
  mkdirSync(dir, { recursive: true });
  const git = (args, env = {}) => execFileSync('git', args, { cwd: dir, env: { ...process.env, ...env }, stdio: 'pipe' });
  git(['init', '-b', 'main']);
  git(['config', 'user.name', 'John Azar']);
  git(['config', 'user.email', email]);
  cells.sort((a, b) => a - b);
  let n = 0;
  for (const day of cells) {
    for (let k = 0; k < +per; k++) {
      const d = new Date(day + 12 * 3600000 + k * 60000).toISOString().replace('.000Z', '+0000');
      git(['commit', '--allow-empty', '-m', `pixel ${++n}`], { GIT_AUTHOR_DATE: d, GIT_COMMITTER_DATE: d });
    }
  }
  console.log(`made ${n} commits in ${dir}`);
}
