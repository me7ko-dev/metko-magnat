// Прави release/MetkoMagnat-win32-x64/MetkoMagnat.exe: npm run exe
// Самият Electron .exe НЕ се променя (само се преименува), за да не го блокира Windows Smart App Control.
import fs from 'fs';
import path from 'path';
import { createPackage } from '@electron/asar';

const OUT = 'release/MetkoMagnat-win32-x64';
const SRC = 'node_modules/electron/dist';
const STAGE = 'release/_app';

if (!fs.existsSync(path.join(SRC, 'electron.exe'))) {
  console.error('Липсва Electron. Пусни: node node_modules/electron/install.js');
  process.exit(1);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(STAGE, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });
fs.renameSync(path.join(OUT, 'electron.exe'), path.join(OUT, 'MetkoMagnat.exe'));
fs.rmSync(path.join(OUT, 'resources', 'default_app.asar'), { force: true });

fs.mkdirSync(path.join(STAGE, 'desktop'), { recursive: true });
for (const f of ['index.html', 'engine.js']) fs.copyFileSync(f, path.join(STAGE, f));
fs.copyFileSync('desktop/main.cjs', path.join(STAGE, 'desktop/main.cjs'));
fs.copyFileSync('desktop/icon.png', path.join(STAGE, 'desktop/icon.png'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
fs.writeFileSync(path.join(STAGE, 'package.json'), JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, main: 'desktop/main.cjs' }, null, 2));
await createPackage(STAGE, path.join(OUT, 'resources', 'app.asar'));
fs.rmSync(STAGE, { recursive: true, force: true });
fs.copyFileSync('desktop/icon.ico', path.join(OUT, 'MetkoMagnat.ico'));
console.log('OK ' + OUT);
