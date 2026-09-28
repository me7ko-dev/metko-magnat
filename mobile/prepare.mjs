// Събира файловете на играта в www/ — оттам Capacitor ги слага в приложението за iPhone.
// Шрифтовете са от fonts/ вместо от Google Fonts, за да работи играта и без интернет.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const google = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\n<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/;
if (!google.test(html)) throw new Error('не намерих шрифтовете от Google в index.html');
html = html.replace(google, '<link rel="stylesheet" href="fonts/fonts.css">');
fs.writeFileSync(path.join(out, 'index.html'), html);
for (const f of ['engine.js', 'fonts']) fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
console.log('www готово');
