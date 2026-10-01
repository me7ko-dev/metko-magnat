// Събира index.html (пълна страница за браузър, GitHub Pages и Windows програмата) от game.html: npm run page
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const game = fs.readFileSync(path.join(dir, 'game.html'), 'utf8');
const head = '<!doctype html>\n<html lang="bg">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  '<meta name="theme-color" content="#113A28">\n' +
  // Метко Стор: анонимен брояч — зарежда се само на сайта (не в Windows програмата и не в APK-то)
  '<!-- Метко Стор: анонимен брояч (само на сайта) — https://me7ko-dev.github.io/ -->\n' +
  "<script>if(location.hostname==='me7ko-dev.github.io'){const s=document.createElement('script');s.src='/brojach.js';s.dataset.app='metko-magnat';document.head.appendChild(s)}</script>\n" +
  '</head>\n<body>\n';
fs.writeFileSync(path.join(dir, 'index.html'), head + game + '\n</body>\n</html>\n');
console.log('OK index.html');
