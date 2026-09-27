/* Метко Магнат — логиката на играта (без DOM).
   Ползва се от game.html и от test/sim.mjs. Всички числа за баланса са най-горе. */
(function (root) {
'use strict';

var CFG = {
  startCash: 5,
  mgr0: 60,          // първият мениджър (лимонада)
  mgrX: 40,          // мениджърът струва толкова пъти цената на бизнеса
  upBase: 5e3,       // първото подобрение ×3 на бизнес струва цена × upBase
  upStep: 1e6,       // всяко следващо ниво на подобрение е толкова пъти по-скъпо
  allBase: 1e7,      // първото общо подобрение
  allStep: 1e9,
  invBase: 1e9,      // инвеститори = invK * ∛(всички пари / invBase)
  invK: 10,
  invBonus: 0.02,    // +2% на инвеститор
  achBonus: 0.02,    // +2% на постижение
  turboX: 3, turboSec: 60, turboCd: 180,
  offlineH: 8,
  caseMin: 45, caseMax: 120, caseLife: 12,
  dailyH: 20
};

// ---------- числа ----------
var SUF = ['', 'хил', 'млн', 'млрд', 'трлн', 'квдрлн', 'квнтлн'];
var AZ = 'абвгдежзиклмнопрстуфхцчшщюя';
function suffix(e3) {
  if (e3 < SUF.length) return SUF[e3];
  var k = e3 - SUF.length;
  return AZ[Math.floor(k / AZ.length) % AZ.length] + AZ[k % AZ.length];
}
function trim0(str) { return str.indexOf('.') < 0 ? str : str.replace(/\.?0+$/, ''); }
function fmt(x) {
  if (x !== x) return '0';
  if (!isFinite(x)) return '∞';
  if (x < 0) return '-' + fmt(-x);
  if (x < 1000) {
    if (x < 10) return trim0(x.toFixed(2)).replace('.', ',');
    if (x < 100) return trim0(x.toFixed(1)).replace('.', ',');
    return String(Math.floor(x));
  }
  var e3 = Math.floor(Math.log10(x) / 3);
  var m = x / Math.pow(10, e3 * 3);
  if (m < 1) { m *= 1000; e3--; }
  var str = m < 10 ? m.toFixed(2) : m < 100 ? m.toFixed(1) : m.toFixed(0);
  if (parseFloat(str) >= 1000) { e3++; str = (parseFloat(str) / 1000).toFixed(2); }
  return str.replace('.', ',') + ' ' + suffix(e3);
}
function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return sec + ' сек';
  var m = Math.floor(sec / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return d + ' д ' + (h % 24) + ' ч';
  if (h > 0) return h + ' ч ' + (m % 60) + ' мин';
  return m + ' мин' + (sec % 60 ? ' ' + (sec % 60) + ' сек' : '');
}

// n име, i икона, c цена, g ръст на цената, t секунди на цикъл,
// P за колко секунди една бройка си връща цената (от него се смята печалбата r), mn мениджър
var BIZ = [
  { n: 'Лимонада', i: '🍋', c: 4, g: 1.07, t: 0.6, P: 2, mn: 'Малката Лили' },
  { n: 'Баничарница', i: '🥐', c: 60, g: 1.15, t: 1.5, P: 4, mn: 'Баба Пена' },
  { n: 'Автомивка', i: '🚗', c: 720, g: 1.14, t: 3, P: 9, mn: 'Бате Жоро' },
  { n: 'Пицария', i: '🍕', c: 8640, g: 1.13, t: 5, P: 20, mn: 'Джузепе' },
  { n: 'Супермаркет', i: '🛒', c: 1.04e5, g: 1.12, t: 8, P: 45, mn: 'Госпожа Стоянова' },
  { n: 'Хотел', i: '🏨', c: 1.25e6, g: 1.11, t: 12, P: 100, mn: 'Портиерът Митко' },
  { n: 'Футболен клуб', i: '⚽', c: 1.5e7, g: 1.1, t: 18, P: 210, mn: 'Треньорът Ицо' },
  { n: 'Филмово студио', i: '🎬', c: 1.8e8, g: 1.09, t: 26, P: 440, mn: 'Режисьорът Весо' },
  { n: 'Банка', i: '🏦', c: 2.15e9, g: 1.08, t: 36, P: 900, mn: 'Господин Златев' },
  { n: 'Петролна компания', i: '🛢️', c: 2.6e10, g: 1.075, t: 50, P: 1800, mn: 'Шейх Ахмед' },
  { n: 'AI компания', i: '🤖', c: 3.1e11, g: 1.07, t: 70, P: 3600, mn: 'Робот М-3' },
  { n: 'Космическа агенция', i: '🚀', c: 3.7e12, g: 1.07, t: 95, P: 7000, mn: 'Капитан Нова' },
  { n: 'Астероидни мини', i: '☄️', c: 4.5e13, g: 1.07, t: 130, P: 14000, mn: 'Миньорът Кузман' },
  { n: 'Колония на Марс', i: '🪐', c: 5.4e14, g: 1.07, t: 170, P: 28000, mn: 'Губернатор Рея' },
  { n: 'Галактическа империя', i: '🌌', c: 6.5e15, g: 1.07, t: 220, P: 56000, mn: 'Императорът Метко' }
];
var NB = BIZ.length;
BIZ.forEach(function (b, i) {
  b.r = b.c * b.t / b.P;
  b.m = i === 0 ? CFG.mgr0 : b.c * CFG.mgrX;
});

// Прагове за всеки бизнес: [бройки, 'p' печалба или 's' скорост, ×]
var MS = [[10, 'p', 2], [25, 's', 2], [50, 's', 2], [75, 'p', 2], [100, 's', 2], [150, 'p', 3], [200, 's', 2],
  [250, 'p', 3], [300, 's', 2], [350, 'p', 3], [400, 's', 2], [500, 'p', 5], [600, 'p', 2], [700, 'p', 2],
  [800, 'p', 2], [900, 'p', 2], [1000, 'p', 5]];
for (var k = 1250; k <= 5000; k += 250) MS.push([k, 'p', 2]);

// Когато ВСИЧКИ бизнеси стигнат прага → всички печалби ×
var GMS = [[1, 2], [10, 2], [25, 2], [50, 2], [100, 3], [150, 3], [200, 3], [300, 3], [400, 5], [500, 5], [750, 5], [1000, 10]];

var UPN = ['Реклама по радиото', 'Нова техника', 'Франчайз', 'Мобилно приложение', 'Звезда в рекламата',
  'Износ за Европа', 'Изкуствен интелект', 'Световна марка', 'Монопол', 'Квантова логистика',
  'Междузвездна реклама', 'Черна дупка за пари', 'Машина на времето', 'Паралелна вселена'];
var ALLN = ['Банков кредит', 'Реклама по телевизията', 'Борсова листа', 'Офшорна фирма', 'Глобална корпорация',
  'Лунна база', 'Световно господство', 'Марсианска борса', 'Галактически съюз', 'Вселенски монопол',
  'Мултивселена', 'Краят на времето', 'Нова Голяма експлозия', 'Всичко е твое'];
var UPG = [];
(function () {
  for (var r = 0; r < UPN.length; r++) {
    for (var i = 0; i < NB; i++) {
      UPG.push({ id: 'u' + r + '_' + i, b: i, x: 3, c: BIZ[i].c * CFG.upBase * Math.pow(CFG.upStep, r), nm: UPN[r] });
    }
    UPG.push({ id: 'a' + r, b: -1, x: 3, c: CFG.allBase * Math.pow(CFG.allStep, r), nm: ALLN[r] });
  }
  UPG.sort(function (a, b) { return a.c - b.c; });
})();
var UPI = {};
UPG.forEach(function (u, j) { UPI[u.id] = j; });

// Магазин с диаманти
var PERM = [
  { id: 'profit', nm: 'Златен печат', d: 'Всички печалби ×2 завинаги', max: 99, cost: function (l) { return Math.ceil(10 * Math.pow(1.8, l)); } },
  { id: 'speed', nm: 'Швейцарски часовник', d: 'Всички бизнеси +25% по-бързи', max: 10, cost: function (l) { return Math.ceil(15 * Math.pow(1.8, l)); } },
  { id: 'inv', nm: 'Инвеститорски съвет', d: 'Всеки инвеститор дава +1% повече', max: 8, cost: function (l) { return Math.ceil(20 * Math.pow(1.8, l)); } },
  { id: 'turbo', nm: 'Нитро', d: 'Турбото става с 2 пъти по-силно', max: 5, cost: function (l) { return Math.ceil(12 * Math.pow(2, l)); } },
  { id: 'offline', nm: 'Нощна смяна', d: '+4 ч печалба, докато те няма', max: 6, cost: function (l) { return Math.ceil(8 * Math.pow(1.7, l)); } },
  { id: 'keep', nm: 'Верни мениджъри', d: 'Мениджърите остават след продажба на империята', max: 1, cost: function () { return 40; } },
  { id: 'auto', nm: 'Робот-счетоводител', d: 'Сам купува подобренията, щом имаш пари', max: 1, cost: function () { return 30; } },
  { id: 'magnet', nm: 'Магнит за куфарчета', d: 'Златните куфарчета идват 2 пъти по-често', max: 1, cost: function () { return 20; } }
];
var PERMI = {};
PERM.forEach(function (p) { PERMI[p.id] = p; });
var WARPS = [{ id: 'w1', h: 1, cost: 5 }, { id: 'w6', h: 6, cost: 25 }];

// Постижения
var ACH = [];
(function () {
  var per = [25, 100, 250, 500, 1000];
  BIZ.forEach(function (b, i) {
    per.forEach(function (k, j) {
      ACH.push({ id: 'b' + i + '_' + k, nm: b.n + ' ×' + k, d: 'Притежавай ' + k + ' бр. ' + b.n.toLowerCase(), dm: j + 1, ic: b.i,
        t: function (s) { return s.b[i].n >= k; } });
    });
  });
  var money = [[1e3, 'Първите хиляди'], [1e6, 'Милионер'], [1e9, 'Милиардер'], [1e12, 'Трилионер'], [1e15, 'Квадрилионер'],
    [1e18, 'Квинтилионер'], [1e21, 'Отвъд числата'], [1e27, 'Звездно богат'], [1e33, 'Галактически богат'],
    [1e42, 'Вселенски богат'], [1e60, 'Безкрайно богат'], [1e100, 'Гугол']];
  money.forEach(function (m, j) {
    ACH.push({ id: 'm' + j, nm: m[1], d: 'Спечели общо ' + fmt(m[0]) + ' €', dm: 1 + Math.floor(j / 2), ic: '💰',
      t: function (s) { return s.life >= m[0]; } });
  });
  [[1, 'Всички бизнеси'], [10, 'Империя ×10'], [25, 'Империя ×25'], [50, 'Империя ×50'], [100, 'Империя ×100'], [200, 'Империя ×200'], [500, 'Империя ×500']]
    .forEach(function (g, j) {
      ACH.push({ id: 'g' + g[0], nm: g[1], d: 'Всички 15 бизнеса с поне ' + g[0] + ' бр.', dm: 2 + j, ic: '🏛️',
        t: function (s) { return minOwned(s) >= g[0]; } });
    });
  [[1, 'Първи мениджър'], [5, 'Екип'], [15, 'Пълен екип']].forEach(function (g, j) {
    ACH.push({ id: 'mg' + g[0], nm: g[1], d: 'Наеми ' + g[0] + (g[0] === 1 ? ' мениджър' : ' мениджъра'), dm: 1 + j, ic: '👔',
      t: function (s) { return countMgr(s) >= g[0]; } });
  });
  [[10, 'Първи подобрения'], [50, 'Модернизация'], [100, 'Технологичен скок'], [200, 'Всичко най-ново']].forEach(function (g, j) {
    ACH.push({ id: 'up' + g[0], nm: g[1], d: 'Купи ' + g[0] + ' подобрения', dm: 1 + j, ic: '⚙️',
      t: function (s) { return countUp(s) >= g[0]; } });
  });
  [[1, 'Първа продажба'], [5, 'Сериен предприемач'], [25, 'Легенда на борсата'], [100, 'Вечният магнат']].forEach(function (g, j) {
    ACH.push({ id: 'p' + g[0], nm: g[1], d: 'Продай империята ' + g[0] + (g[0] === 1 ? ' път' : ' пъти'), dm: 3 + j * 2, ic: '🔁',
      t: function (s) { return s.st.pres >= g[0]; } });
  });
  [[100, 'Първи инвеститори'], [1e4, 'Борда на директорите'], [1e6, 'Уолстрийт'], [1e9, 'Всички банки на света']].forEach(function (g, j) {
    ACH.push({ id: 'i' + j, nm: g[1], d: 'Имай ' + fmt(g[0]) + ' инвеститори', dm: 3 + j * 2, ic: '🤝',
      t: function (s) { return s.inv >= g[0]; } });
  });
  [[100, 'Трудолюбив'], [1000, 'Неуморим'], [10000, 'Железен пръст']].forEach(function (g, j) {
    ACH.push({ id: 'c' + g[0], nm: g[1], d: 'Натисни бизнес ' + fmt(g[0]) + ' пъти', dm: 1 + j, ic: '👆',
      t: function (s) { return s.st.clicks >= g[0]; } });
  });
  [[1, 'Златно куфарче'], [25, 'Колекционер'], [100, 'Ловец на злато']].forEach(function (g, j) {
    ACH.push({ id: 'k' + g[0], nm: g[1], d: 'Хвани ' + g[0] + (g[0] === 1 ? ' златно куфарче' : ' златни куфарчета'), dm: 1 + j * 2, ic: '💼',
      t: function (s) { return s.st.cases >= g[0]; } });
  });
  [[10, 'Газ до дупка'], [100, 'Скоростен демон']].forEach(function (g, j) {
    ACH.push({ id: 't' + g[0], nm: g[1], d: 'Пусни турбото ' + g[0] + ' пъти', dm: 1 + j * 2, ic: '⚡',
      t: function (s) { return s.st.turbos >= g[0]; } });
  });
})();

// ---------- състояние ----------
function newState(now) {
  now = now || Date.now();
  var s = {
    v: 1, cash: CFG.startCash, run: 0, life: 0, inv: 0, dm: 0,
    b: BIZ.map(function () { return { n: 0, p: 0, r: 0 }; }),
    mg: BIZ.map(function () { return 0; }),
    up: {}, perm: {}, ach: {},
    st: { clicks: 0, cases: 0, pres: 0, turbos: 0, play: 0, best: 0, start: now, runStart: now, bestRun: 0 },
    // първият дневен бонус идва след 5 минути игра
    tEnd: 0, tReady: 0, fEnd: 0, fX: 1, daily: now - CFG.dailyH * 3600000 + 300000, last: now
  };
  s.b[0].n = 1;
  derive(s);
  return s;
}

function load(obj, now) {
  var s = newState(now);
  if (!obj || typeof obj !== 'object') return s;
  ['cash', 'run', 'life', 'inv', 'dm', 'tEnd', 'tReady', 'fEnd', 'fX', 'daily', 'last'].forEach(function (k) {
    if (typeof obj[k] === 'number' && isFinite(obj[k])) s[k] = obj[k];
  });
  if (Array.isArray(obj.b)) obj.b.forEach(function (x, i) {
    if (i < NB && x) { s.b[i].n = x.n | 0; s.b[i].p = +x.p || 0; s.b[i].r = x.r ? 1 : 0; }
  });
  if (Array.isArray(obj.mg)) obj.mg.forEach(function (x, i) { if (i < NB) s.mg[i] = x ? 1 : 0; });
  ['up', 'perm', 'ach'].forEach(function (k) { if (obj[k] && typeof obj[k] === 'object') s[k] = obj[k]; });
  if (obj.st) for (var k in s.st) if (typeof obj.st[k] === 'number') s.st[k] = obj.st[k];
  derive(s);
  return s;
}

function save(s) {
  var o = {};
  for (var k in s) if (k !== '$') o[k] = s[k];
  return o;
}

// Производни стойности, които се смятат наново след покупка
function derive(s) {
  var up = [], all = 1, i;
  for (i = 0; i < NB; i++) up.push(1);
  for (var id in s.up) {
    var u = UPG[UPI[id]];
    if (!u) continue;
    if (u.b < 0) all *= u.x; else up[u.b] *= u.x;
  }
  var ach = 0;
  for (var a in s.ach) ach++;
  s.$ = { up: up, all: all, ach: ach };
}

function lvl(s, id) { return s.perm[id] || 0; }
function minOwned(s) { var m = Infinity; for (var i = 0; i < NB; i++) m = Math.min(m, s.b[i].n); return m; }
function countMgr(s) { var c = 0; for (var i = 0; i < NB; i++) c += s.mg[i]; return c; }
function countUp(s) { var c = 0; for (var k in s.up) c++; return c; }

function msMult(n, type) {
  var m = 1;
  for (var j = 0; j < MS.length && MS[j][0] <= n; j++) if (MS[j][1] === type) m *= MS[j][2];
  return m;
}
function nextMS(n) {
  for (var j = 0; j < MS.length; j++) if (MS[j][0] > n) return MS[j];
  return null;
}
function gmsMult(s) {
  var mo = minOwned(s), m = 1;
  for (var j = 0; j < GMS.length && GMS[j][0] <= mo; j++) m *= GMS[j][1];
  return m;
}
function nextGMS(s) {
  var mo = minOwned(s);
  for (var j = 0; j < GMS.length; j++) if (GMS[j][0] > mo) return GMS[j];
  return null;
}

function invMult(s) { return 1 + s.inv * (CFG.invBonus + 0.01 * lvl(s, 'inv')); }
function turboX(s) { return CFG.turboX + 2 * lvl(s, 'turbo'); }

// Всички постоянни множители (без турбо и треска)
function globalMult(s) {
  return s.$.all * invMult(s) * (1 + CFG.achBonus * s.$.ach) * Math.pow(2, lvl(s, 'profit')) * gmsMult(s);
}
function cycleTime(s, i) {
  return BIZ[i].t / (msMult(s.b[i].n, 's') * Math.pow(1.25, lvl(s, 'speed')));
}
// Печалба на един цикъл без глобалните множители
function cycleRevBase(s, i) {
  return BIZ[i].r * s.b[i].n * s.$.up[i] * msMult(s.b[i].n, 'p');
}
function cycleRev(s, i) { return cycleRevBase(s, i) * globalMult(s); }
function bizPerSec(s, i) { return s.b[i].n ? cycleRev(s, i) / cycleTime(s, i) : 0; }
function incomePerSec(s) {
  var g = globalMult(s), sum = 0;
  for (var i = 0; i < NB; i++) if (s.mg[i] && s.b[i].n) sum += cycleRevBase(s, i) / cycleTime(s, i);
  return sum * g;
}
function boostNow(s, now) {
  var m = 1;
  if (now < s.tEnd) m *= turboX(s);
  if (now < s.fEnd) m *= s.fX;
  return m;
}
// Средният множител от турбо и треска за интервала [now - dt, now]
function boostAvg(s, now, dtMs) {
  if (dtMs <= 0) return boostNow(s, now);
  var t0 = now - dtMs;
  function part(end, x) {
    var ov = Math.min(now, end) - t0;
    if (ov <= 0) return 1;
    return 1 + (x - 1) * Math.min(1, ov / dtMs);
  }
  return part(s.tEnd, turboX(s)) * part(s.fEnd, s.fX);
}

// ---------- покупки ----------
function costN(s, i, n) {
  var b = BIZ[i], k = s.b[i].n;
  return b.c * Math.pow(b.g, k) * (Math.pow(b.g, n) - 1) / (b.g - 1);
}
function maxBuy(s, i) {
  var b = BIZ[i], k = s.b[i].n;
  var first = b.c * Math.pow(b.g, k);
  if (s.cash < first) return 0;
  var n = Math.floor(Math.log(s.cash * (b.g - 1) / first + 1) / Math.log(b.g));
  while (n > 0 && costN(s, i, n) > s.cash) n--;
  return n;
}
// Колко бройки означава режимът на купуване: 1, 10, 100, 'next', 'max'
function buyCount(s, i, mode) {
  if (mode === 'max') return Math.max(1, maxBuy(s, i));
  if (mode === 'next') { var nm = nextMS(s.b[i].n); return nm ? nm[0] - s.b[i].n : 100; }
  return mode;
}
function isUnlocked(s, i) { return s.b[i].n > 0; }
function buy(s, i, n) {
  if (n < 1) return false;
  var c = costN(s, i, n);
  if (c > s.cash) return false;
  s.cash -= c;
  var before = s.b[i].n;
  s.b[i].n += n;
  return { before: before, after: s.b[i].n };
}
function hire(s, i) {
  if (s.mg[i] || !s.b[i].n || s.cash < BIZ[i].m) return false;
  s.cash -= BIZ[i].m;
  s.mg[i] = 1;
  return true;
}
function buyUp(s, id) {
  var u = UPG[UPI[id]];
  if (!u || s.up[id] || s.cash < u.c) return false;
  s.cash -= u.c;
  s.up[id] = 1;
  derive(s);
  return true;
}
// Следващите некупени подобрения по цена
function nextUps(s, limit) {
  var out = [];
  for (var j = 0; j < UPG.length && out.length < limit; j++) if (!s.up[UPG[j].id]) out.push(UPG[j]);
  return out;
}
function buyAllUps(s) {
  var n = 0;
  for (var j = 0; j < UPG.length; j++) {
    var u = UPG[j];
    if (s.up[u.id]) continue;
    if (u.c > s.cash) break;
    s.cash -= u.c; s.up[u.id] = 1; n++;
  }
  if (n) derive(s);
  return n;
}
function hireAll(s) {
  var n = 0;
  for (var i = 0; i < NB; i++) if (hire(s, i)) n++;
  return n;
}
function click(s, i) {
  var b = s.b[i];
  if (!b.n || s.mg[i] || b.r) return false;
  b.r = 1; b.p = 0;
  s.st.clicks++;
  return true;
}

// ---------- турбо, куфарче, бонуси ----------
function turbo(s, now) {
  if (now < s.tReady) return false;
  s.tEnd = now + CFG.turboSec * 1000;
  s.tReady = s.tEnd + CFG.turboCd * 1000;
  s.st.turbos++;
  return true;
}
function addCash(s, x) {
  if (!(x > 0)) return;
  s.cash += x; s.run += x; s.life += x;
}
// Награда от златното куфарче; r е случайно число 0..1
function openCase(s, now, r) {
  s.st.cases++;
  var ips = incomePerSec(s);
  if (r < 0.45) {
    var x = Math.max(ips * 600, s.cash * 0.1, 100);
    addCash(s, x);
    return { kind: 'cash', x: x };
  }
  if (r < 0.75) { s.fEnd = now + 30000; s.fX = 7; return { kind: 'frenzy', x: 7, sec: 30 }; }
  if (r < 0.9) { s.fEnd = now + 7000; s.fX = 77; return { kind: 'frenzy', x: 77, sec: 7 }; }
  var d = 2 + Math.floor(r * 10) % 3;
  s.dm += d;
  return { kind: 'dm', x: d };
}
function dailyReady(s, now) { return now - s.daily >= CFG.dailyH * 3600000; }
function claimDaily(s, now) {
  if (!dailyReady(s, now)) return false;
  s.daily = now;
  var x = Math.max(incomePerSec(s) * 1800, 500);
  addCash(s, x);
  s.dm += 5;
  return { cash: x, dm: 5 };
}
function offlineCap(s) { return (CFG.offlineH + 4 * lvl(s, 'offline')) * 3600; }
function offlineGain(s, sec) {
  var t = Math.min(sec, offlineCap(s));
  return { sec: t, full: sec, cash: incomePerSec(s) * t };
}

// ---------- диаманти ----------
function permCost(s, id) { var p = PERMI[id]; return p.cost(lvl(s, id)); }
function buyPerm(s, id) {
  var p = PERMI[id];
  if (!p || lvl(s, id) >= p.max) return false;
  var c = p.cost(lvl(s, id));
  if (s.dm < c) return false;
  s.dm -= c;
  s.perm[id] = lvl(s, id) + 1;
  return true;
}
function warp(s, id) {
  var w = WARPS.filter(function (x) { return x.id === id; })[0];
  if (!w || s.dm < w.cost) return false;
  s.dm -= w.cost;
  var x = incomePerSec(s) * w.h * 3600;
  addCash(s, x);
  return x;
}

// ---------- инвеститори ----------
function invPotential(s) { return Math.floor(CFG.invK * Math.cbrt(s.life / CFG.invBase)); }
function invGain(s) { return Math.max(0, invPotential(s) - s.inv); }
// Колко още пари трябва да се спечелят за следващия инвеститор
function invNextAt(s) {
  var p = Math.max(invPotential(s), s.inv) + 1;
  return Math.max(0, Math.pow(p / CFG.invK, 3) * CFG.invBase - s.life);
}
function prestige(s, now) {
  var g = invGain(s);
  if (g < 1) return false;
  var dmGain = 2 * Math.max(1, Math.floor(Math.log10(g + 1)));
  var keep = lvl(s, 'keep') > 0;
  s.inv += g;
  s.dm += dmGain;
  s.cash = CFG.startCash; s.run = 0;
  s.b = BIZ.map(function () { return { n: 0, p: 0, r: 0 }; });
  s.b[0].n = 1;
  if (!keep) s.mg = BIZ.map(function () { return 0; });
  s.up = {};
  s.fEnd = 0;
  s.st.pres++;
  s.st.runStart = now;
  derive(s);
  return { inv: g, dm: dmGain };
}

// ---------- постижения ----------
function checkAch(s) {
  var got = [];
  for (var j = 0; j < ACH.length; j++) {
    var a = ACH[j];
    if (!s.ach[a.id] && a.t(s)) { s.ach[a.id] = 1; s.dm += a.dm; got.push(a); }
  }
  if (got.length) derive(s);
  return got;
}

// ---------- времето тече ----------
// Връща спечеленото и списък с бизнесите, завършили цикъл
function tick(s, dtSec, now) {
  if (!(dtSec > 0)) return { earned: 0, done: [] };
  var mult = globalMult(s) * boostAvg(s, now, dtSec * 1000);
  var earned = 0, done = [];
  for (var i = 0; i < NB; i++) {
    var b = s.b[i];
    if (!b.n || !(s.mg[i] || b.r)) continue;
    b.p += dtSec / cycleTime(s, i);
    if (b.p >= 1) {
      var k = Math.floor(b.p);
      if (s.mg[i]) { b.p -= k; b.r = 0; } else { k = 1; b.p = 0; b.r = 0; }
      var e = k * cycleRevBase(s, i) * mult;
      earned += e;
      done.push({ i: i, x: e, manual: !s.mg[i] });
    }
  }
  addCash(s, earned);
  s.st.play += dtSec;
  s.last = now;
  return { earned: earned, done: done };
}

var MM = {
  CFG: CFG, BIZ: BIZ, MS: MS, GMS: GMS, UPG: UPG, PERM: PERM, WARPS: WARPS, ACH: ACH,
  fmt: fmt, fmtTime: fmtTime,
  newState: newState, load: load, save: save, derive: derive,
  lvl: lvl, minOwned: minOwned, countMgr: countMgr, countUp: countUp,
  msMult: msMult, nextMS: nextMS, gmsMult: gmsMult, nextGMS: nextGMS,
  invMult: invMult, turboX: turboX, globalMult: globalMult, cycleTime: cycleTime,
  cycleRevBase: cycleRevBase, cycleRev: cycleRev, bizPerSec: bizPerSec, incomePerSec: incomePerSec,
  boostNow: boostNow, costN: costN, maxBuy: maxBuy, buyCount: buyCount, isUnlocked: isUnlocked,
  buy: buy, hire: hire, hireAll: hireAll, buyUp: buyUp, buyAllUps: buyAllUps, nextUps: nextUps, click: click,
  turbo: turbo, addCash: addCash, openCase: openCase, dailyReady: dailyReady, claimDaily: claimDaily,
  offlineCap: offlineCap, offlineGain: offlineGain, permCost: permCost, buyPerm: buyPerm, warp: warp,
  invPotential: invPotential, invGain: invGain, invNextAt: invNextAt, prestige: prestige,
  checkAch: checkAch, tick: tick
};
if (typeof module !== 'undefined' && module.exports) module.exports = MM;
else root.MM = MM;
})(this);
