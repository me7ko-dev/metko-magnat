// Робот, който играе с ускорено време и показва кога идват милионите.
// node test/sim.mjs [минути=240] [турбо=0|1]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const M = require('../engine.js');

const MIN = +(process.argv[2] || 240);
const USE_TURBO = process.argv[3] === '1';
const NOPRES = !!process.env.NOPRES;
const CURVE = [];
const DT = 0.25;
let now = 0;
const s = M.newState(now);
const log = [];
const t = () => M.fmtTime(now / 1000);
const seen = new Set();
const mark = (key, msg) => { if (!seen.has(key)) { seen.add(key); log.push(`${t().padStart(12)}  ${msg}`); } };

let lastClick = -1;
let runs = 0;

function ipsIfManaged(st) {
  const g = M.globalMult(st);
  let sum = 0;
  for (let i = 0; i < M.BIZ.length; i++) if (st.b[i].n) sum += M.cycleRevBase(st, i) / M.cycleTime(st, i);
  return sum * g;
}

// Кой е най-добрият ход: най-малко (време до купуване + време за изплащане)
function contrib(i) { return s.b[i].n ? M.cycleRevBase(s, i) / M.cycleTime(s, i) : 0; }
function bestBizMove() {
  const g = M.globalMult(s);
  const cur = Math.max(M.incomePerSec(s), 0.5);
  let best = null;
  for (let i = 0; i < M.BIZ.length; i++) {
    if (i > 0 && !s.b[i - 1].n) break;
    const old = contrib(i);
    const nm = M.nextMS(s.b[i].n);
    const opts = [1];
    if (nm) opts.push(nm[0] - s.b[i].n);
    for (const n of opts) {
      const c = M.costN(s, i, n);
      const saved = s.b[i].n;
      s.b[i].n += n;
      const gain = (contrib(i) - old) * g;
      s.b[i].n = saved;
      if (gain <= 0) continue;
      const score = Math.max(0, c - s.cash) / cur + c / gain;
      if (!best || score < best.score) best = { i, n, c, score };
    }
  }
  return best;
}
for (let step = 0; now < MIN * 60000; step++) {
  now += DT * 1000;
  // натискане на бизнесите без мениджър (като човек — 3 пъти в секунда)
  if (now - lastClick >= 333) {
    for (let i = 0; i < M.BIZ.length; i++) if (s.b[i].n && !s.mg[i] && !s.b[i].r) { M.click(s, i); lastClick = now; break; }
  }
  if (USE_TURBO) M.turbo(s, now);
  M.tick(s, DT, now);
  for (const a of M.checkAch(s)) { /* диаманти */ }

  // покупки
  for (let guard = 0; guard < 50; guard++) {
    let did = false;
    for (let i = 0; i < M.BIZ.length; i++) if (M.hire(s, i)) { mark('mg' + i, `мениджър ${M.BIZ[i].n}`); did = true; }
    if (M.buyAllUps(s)) did = true;
    const mv = bestBizMove();
    if (mv && mv.c <= s.cash) {
      const was = s.b[mv.i].n;
      M.buy(s, mv.i, mv.n);
      if (!was) mark('b' + mv.i, `отключен ${M.BIZ[mv.i].n}`);
      did = true;
    }
    if (!did) break;
  }
  // диаманти: печат и часовник, когато може
  M.buyPerm(s, 'keep'); M.buyPerm(s, 'profit'); M.buyPerm(s, 'speed');

  for (const x of [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e30]) if (runs < 3 && s.run >= x) mark('r' + runs + '_' + x, `  рунд ${runs + 1}: ${M.fmt(x)} € (${M.fmt(M.incomePerSec(s))}/сек)`);

  // продажба на империята, когато инвеститорите поне удвоят бонуса
  const g = M.invGain(s);
  if (NOPRES) { const d = Math.floor(Math.log10(Math.max(1, s.run))); if (d % 3 === 0) mark('c' + d, `   10^${d}: ${M.fmt(M.incomePerSec(s))}/сек, бройки ${s.b.map(b => b.n).join(' ')}`); }
  if (!NOPRES && g >= Math.max(20, s.inv)) {
    const r = M.prestige(s, now);
    runs++;
    log.push(`${t().padStart(12)}  *** ПРОДАЖБА ${runs}: +${M.fmt(r.inv)} инвеститори (общо ${M.fmt(s.inv)}, ×${M.fmt(M.invMult(s))}), 💎${s.dm}`);
  }
}
console.log(log.join('\n'));
console.log(`\nКрай: ${t()}, пари ${M.fmt(s.cash)}, ${M.fmt(M.incomePerSec(s))}/сек, инвеститори ${M.fmt(s.inv)}, постижения ${Object.keys(s.ach).length}/${M.ACH.length}, 💎${s.dm}, подобрения ${M.countUp(s)}`);
console.log('Бройки:', s.b.map(b => b.n).join(' '));
