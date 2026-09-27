// Проверка на Windows програмата: пуска MetkoMagnat.exe, чака играта и прави снимка в test/out/exe.png
// PW="$(npm root -g)/playwright" node test/exe.mjs
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');

const exe = 'release/MetkoMagnat-win32-x64/MetkoMagnat.exe';
const proc = spawn(exe, ['--remote-debugging-port=9334'], { detached: true, stdio: 'ignore' });
let b;
for (let i = 0; i < 40 && !b; i++) {
  try { b = await chromium.connectOverCDP('http://127.0.0.1:9334'); } catch { await new Promise((r) => setTimeout(r, 500)); }
}
if (!b) { console.error('Програмата не отговаря'); process.exit(1); }
let page;
for (let i = 0; i < 40 && !page; i++) {
  page = b.contexts()[0]?.pages()[0];
  if (!page) await new Promise((r) => setTimeout(r, 250));
}
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.waitForFunction(() => window.MM && document.querySelectorAll('.biz:not([hidden])').length > 0, null, { timeout: 20000 });
await page.waitForTimeout(1500);
fs.mkdirSync('test/out', { recursive: true });
await page.screenshot({ path: 'test/out/exe.png' });
console.log(await page.title(), await page.evaluate(() => [innerWidth, innerHeight, document.getElementById('cash').textContent]), errors.length ? errors : 'без грешки');
await b.close();
try { process.kill(proc.pid); } catch {}
process.exit(0);
