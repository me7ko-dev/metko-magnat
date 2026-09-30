// Пакет за CrazyGames: release/crazygames/ (index.html + engine.js) и release/metko-tycoon-crazygames.zip
//   npm run crazy
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'release', 'crazygames');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'engine.js']) fs.copyFileSync(path.join(root, f), path.join(out, f));
const zip = path.join(root, 'release', 'metko-tycoon-crazygames.zip');
fs.rmSync(zip, { force: true });
execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${out}\*' -DestinationPath '${zip}'`], { stdio: 'inherit' });
console.log('OK', zip, Math.round(fs.statSync(zip).size / 1024) + ' KB');
