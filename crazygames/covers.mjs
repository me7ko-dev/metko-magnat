// Кориците за CrazyGames: 1920×1080, 800×1200, 800×800 (само заглавието като текст)
//   PW="$(npm root -g)/playwright" node crazygames/covers.mjs  → crazygames/covers/*.png
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'covers');
fs.mkdirSync(dir, { recursive: true });

// 🌌 се рисува като квадратна плочка, затова империята завършва с планетата
const ICONS = ['🍋', '🥐', '🚗', '🍕', '🛒', '🏨', '⚽', '🎬', '🏦', '🛢️', '🤖', '🚀', '🪐'];
// тесните корици: по-малко икони, за да не станат дребни
const ICONS_SHORT = ['🍋', '🥐', '🍕', '🏨', '⚽', '🏦', '🤖', '🚀', '🪐'];

// Пътят на империята: от лимонадата (малка) до галактиката (голяма) по крива
function page(w, h, kind) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&display=swap">
<style>
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:radial-gradient(120% 90% at 70% 30%,#1D6B4A 0%,#113A28 45%,#081D14 100%);position:relative;font-family:Forum,serif}
canvas{position:absolute;inset:0}
.ic{position:absolute;transform:translate(-50%,-50%);line-height:1;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;filter:drop-shadow(0 ${h * 0.006}px ${h * 0.012}px rgba(0,0,0,.45))}
.glow{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(241,211,126,.55) 0%,rgba(226,190,92,.18) 40%,rgba(226,190,92,0) 70%)}
.title{position:absolute;color:#F1D37E;text-transform:uppercase;letter-spacing:.08em;line-height:.92;text-shadow:0 4px 0 #6B4B0C,0 10px 30px rgba(0,0,0,.55)}
.title span{display:block}
.title .b{color:#F8FBF4;text-shadow:0 4px 0 #0A2117,0 10px 30px rgba(0,0,0,.55)}
</style></head><body><canvas id="cv" width="${w}" height="${h}"></canvas><div id="root"></div>
<script>
const W=${w},H=${h},KIND='${kind}',ICONS=${JSON.stringify(kind === 'land' ? ICONS : ICONS_SHORT)};
const x=document.getElementById('cv').getContext('2d');
// гилошировка като на банкнота
x.strokeStyle='rgba(226,190,92,.16)';x.lineWidth=Math.max(1,W/900);
for(let k=0;k<14;k++){x.beginPath();for(let px=0;px<=W;px+=3){const y=H*(0.5+0.06*(k-7))+Math.sin(px/(W/28)+k*0.7)*H*0.05*Math.cos(px/(W/4)+k*0.35);px?x.lineTo(px,y):x.moveTo(px,y);}x.stroke();}
function rose(cx,cy,R,rr,d){x.beginPath();for(let t=0;t<=Math.PI*18;t+=0.01){const q=(R-rr)/rr;const px=cx+(R-rr)*Math.cos(t)+d*Math.cos(q*t),py=cy+(R-rr)*Math.sin(t)-d*Math.sin(q*t);t?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();}
const m=Math.min(W,H);
x.strokeStyle='rgba(226,190,92,.22)';
// рамка от два реда като на банкнота
x.lineWidth=Math.max(2,m/260);x.strokeStyle='rgba(226,190,92,.35)';
const L=[], root=document.getElementById('root');
// крива за иконите: P0 → P1 → P2 (квадратна)
let P0,P1,P2,s0,s1;
if(KIND==='land'){P0=[W*0.06,H*0.88];P1=[W*0.62,H*0.97];P2=[W*0.82,H*0.42];s0=H*0.075;s1=H*0.36;}
else if(KIND==='port'){P0=[W*0.11,H*0.90];P1=[W*1.12,H*0.92];P2=[W*0.46,H*0.58];s0=W*0.10;s1=W*0.40;}
else {P0=[W*0.09,H*0.88];P1=[W*1.02,H*0.94];P2=[W*0.68,H*0.60];s0=W*0.085;s1=W*0.30;}
x.strokeStyle='rgba(226,190,92,.25)';rose(P2[0],P2[1],s1*0.95,s1*0.34,s1*0.62);rose(P2[0],P2[1],s1*0.62,s1*0.22,s1*0.4);
// гъста начупена линия по кривата, за да се мери дължината
const pts=[];for(let k=0;k<=400;k++){const t=k/400;pts.push([(1-t)*(1-t)*P0[0]+2*(1-t)*t*P1[0]+t*t*P2[0],(1-t)*(1-t)*P0[1]+2*(1-t)*t*P1[1]+t*t*P2[1]]);}
const acc=[0];for(let k=1;k<pts.length;k++)acc.push(acc[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
const total=acc[acc.length-1];
function at(d){let k=1;while(k<acc.length-1&&acc[k]<d)k++;const f=(d-acc[k-1])/(acc[k]-acc[k-1]||1);return[pts[k-1][0]+(pts[k][0]-pts[k-1][0])*f,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*f];}
const n=ICONS.length,ratio=Math.pow(s1/s0,1/(n-1)),base=ICONS.map((_,i)=>s0*Math.pow(ratio,i));
// ако кривата е къса, малките икони се смаляват повече от големите (планетата остава голяма)
function fit(f){const sz=base.map((b,i)=>b*Math.pow(f,(n-1-i)/(n-1)));const g=[0];for(let i=1;i<n;i++)g.push(g[i-1]+(sz[i-1]+sz[i])/2*0.9);return{sz,g};}
let lo=0.05,hi=1,F=fit(1);
if(F.g[n-1]>total){for(let it=0;it<40;it++){const mid=(lo+hi)/2;if(fit(mid).g[n-1]>total)hi=mid;else lo=mid;}F=fit(lo);}
const sizes=F.sz,gaps=F.g,k0=total/gaps[n-1];
for(let i=0;i<n;i++){
  const [px,py]=at(gaps[i]*k0);const sz=sizes[i];
  if(i===n-1){const g=document.createElement('div');g.className='glow';g.style.cssText='left:'+px+'px;top:'+py+'px;width:'+sz*2.6+'px;height:'+sz*2.6+'px';root.appendChild(g);}
  const e=document.createElement('div');e.className='ic';e.textContent=ICONS[i];
  e.style.cssText='left:'+px+'px;top:'+py+'px;font-size:'+sz+'px;transform:translate(-50%,-50%) rotate('+(i===n-1?-12:(i%2?1:-1)*6)+'deg)';
  root.appendChild(e);
}
// златни монети
function coin(cx,cy,r){x.save();const g=x.createRadialGradient(cx-r*0.3,cy-r*0.35,r*0.1,cx,cy,r);g.addColorStop(0,'#FFF1B8');g.addColorStop(0.45,'#E2BE5C');g.addColorStop(1,'#8C6E24');
x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.lineWidth=r*0.09;x.strokeStyle='#6B4B0C';x.stroke();
x.beginPath();x.arc(cx,cy,r*0.76,0,Math.PI*2);x.lineWidth=r*0.05;x.strokeStyle='rgba(107,75,12,.6)';x.stroke();
x.fillStyle='#6B4B0C';x.font=(r*1.05)+'px Forum';x.textAlign='center';x.textBaseline='middle';x.fillText('€',cx,cy+r*0.06);x.restore();}
const T=document.createElement('div');T.className='title';T.innerHTML='<span>Metko</span><span class="b">Tycoon</span>';
if(KIND==='land'){T.style.cssText='left:'+W*0.06+'px;top:'+H*0.10+'px;font-size:'+H*0.20+'px';coin(W*0.60,H*0.16,H*0.065);coin(W*0.66,H*0.30,H*0.042);coin(W*0.30,H*0.62,H*0.035);}
else if(KIND==='port'){T.style.cssText='left:0;right:0;text-align:center;top:'+H*0.06+'px;font-size:'+W*0.21+'px';coin(W*0.15,H*0.44,W*0.06);coin(W*0.88,H*0.40,W*0.042);coin(W*0.22,H*0.66,W*0.035);}
else {T.style.cssText='left:'+W*0.07+'px;top:'+H*0.07+'px;font-size:'+W*0.17+'px';coin(W*0.16,H*0.56,W*0.05);coin(W*0.38,H*0.50,W*0.035);coin(W*0.88,H*0.12,W*0.04);}
root.appendChild(T);
</script></body></html>`;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, w, h, kind] of [['cover-1920x1080', 1920, 1080, 'land'], ['cover-800x1200', 800, 1200, 'port'], ['cover-800x800', 800, 800, 'sq']]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(page(w, h, kind));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  const file = path.join(dir, name + '.png');
  await p.screenshot({ path: file });
  console.log('OK', file);
  await p.close();
}
await browser.close();
