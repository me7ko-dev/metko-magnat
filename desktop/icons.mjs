// Рисува иконите (златна монета с „М“ върху зелена банкнота):
//   desktop/icon.png + desktop/icon.ico (Windows) и android/res/mipmap-*/ (Android)
// npm run icons   (ползва глобалния Playwright и Chrome: PW="$(npm root -g)/playwright")
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&display=swap"><span style="font-family:Forum">М</span>');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

// mode: 'full' = банкнота + монета, 'bg' = само банкнотата (квадрат), 'fg' = само монетата (прозрачно)
async function draw(size, mode) {
  const b64 = await page.evaluate(([s, mode]) => {
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d');
    const rr = (px, py, w, h, r) => { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); };
    if (mode !== 'fg') {
      if (mode === 'bg') x.rect(0, 0, s, s); else rr(0, 0, s, s, s * 0.22);
      const bg = x.createLinearGradient(0, 0, s, s);
      bg.addColorStop(0, '#17503A'); bg.addColorStop(1, '#0C2C1E');
      x.fillStyle = bg; x.fill();
      if (s >= 48) {
        x.save(); x.clip();
        x.strokeStyle = 'rgba(226,190,92,.28)'; x.lineWidth = Math.max(0.6, s / 256);
        for (let k = 0; k < 7; k++) {
          x.beginPath();
          for (let px = 0; px <= s; px += 2) {
            const py = s * 0.5 + Math.sin(px / (s / 7) + k * 0.8) * s * 0.36 * Math.cos(px / (s * 0.9) + k * 0.4);
            if (px === 0) x.moveTo(px, py); else x.lineTo(px, py);
          }
          x.stroke();
        }
        x.restore();
      }
    }
    if (mode === 'bg') return c.toDataURL('image/png').split(',')[1];
    // златна монета
    const cx = s / 2, cy = s / 2, R = mode === 'fg' ? s * 0.25 : s * (s <= 24 ? 0.44 : 0.38);
    const g = x.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#FFF1B8'); g.addColorStop(0.45, '#E9C55E'); g.addColorStop(1, '#A97A17');
    x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fillStyle = g; x.fill();
    x.lineWidth = Math.max(1, R * 0.058); x.strokeStyle = '#7A5410'; x.stroke();
    if (R >= 12) { x.beginPath(); x.arc(cx, cy, R * 0.82, 0, Math.PI * 2); x.lineWidth = Math.max(0.8, R * 0.032); x.strokeStyle = 'rgba(122,84,16,.7)'; x.stroke(); }
    x.fillStyle = '#113A28';
    x.font = Math.round(R * 1.25) + 'px Forum, Georgia, serif';
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const m = x.measureText('М');
    const h = m.actualBoundingBoxAscent - m.actualBoundingBoxDescent;
    x.fillText('М', cx, cy + h / 2);
    return c.toDataURL('image/png').split(',')[1];
  }, [size, mode]);
  return Buffer.from(b64, 'base64');
}

// Windows
const pngs = [];
for (const size of [16, 24, 32, 48, 64, 128, 256]) pngs.push({ size, buf: await draw(size, 'full') });
// Android: старите телефони (кръгла/квадратна икона) и adaptive icon (Android 8+)
const dens = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, size] of Object.entries(dens)) {
  fs.mkdirSync(`android/res/mipmap-${d}`, { recursive: true });
  fs.writeFileSync(`android/res/mipmap-${d}/ic_launcher.png`, await draw(size, 'full'));
}
fs.writeFileSync('android/res/mipmap-xxxhdpi/ic_launcher_bg.png', await draw(432, 'bg'));
fs.writeFileSync('android/res/mipmap-xxxhdpi/ic_launcher_fg.png', await draw(432, 'fg'));
await browser.close();

// ICO с PNG вътре (Windows Vista и нагоре)
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
const dir = Buffer.alloc(16 * pngs.length);
let off = 6 + dir.length;
pngs.forEach((p, i) => {
  const b = i * 16;
  dir.writeUInt8(p.size >= 256 ? 0 : p.size, b);
  dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 1);
  dir.writeUInt16LE(1, b + 4);
  dir.writeUInt16LE(32, b + 6);
  dir.writeUInt32LE(p.buf.length, b + 8);
  dir.writeUInt32LE(off, b + 12);
  off += p.buf.length;
});
fs.writeFileSync('desktop/icon.ico', Buffer.concat([head, dir, ...pngs.map((p) => p.buf)]));
fs.writeFileSync('desktop/icon.png', pngs[pngs.length - 1].buf);
console.log('OK иконите за Windows и Android');
