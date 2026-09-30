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
fs.copyFileSync(path.join(root, 'engine.js'), path.join(out, 'engine.js'));
// SDK на CrazyGames: записът отива в техния Data модул (гост → localStorage, влязъл играч → акаунта му)
const sdk = `<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
<script>
window.MM_BOOT = (function () {
  var sdk = window.CrazyGames && window.CrazyGames.SDK;
  if (!sdk) return Promise.resolve();
  return sdk.init().then(function () {
    window.MM_CG = sdk;
    if (sdk.environment !== 'disabled' && sdk.data) window.MM_STORE = sdk.data;
  });
})();
</script>
`;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tag = '<script src="engine.js"></script>';
if (!html.includes(tag)) throw new Error('engine.js tag not found');
fs.writeFileSync(path.join(out, 'index.html'), html.replace(tag, sdk + tag));
const zip = path.join(root, 'release', 'metko-tycoon-crazygames.zip');
fs.rmSync(zip, { force: true });
execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${out}\*' -DestinationPath '${zip}'`], { stdio: 'inherit' });
console.log('OK', zip, Math.round(fs.statSync(zip).size / 1024) + ' KB');
