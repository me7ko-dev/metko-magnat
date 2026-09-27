// Прави release/MetkoMagnat.apk без Gradle, само с Android SDK инструментите: npm run apk
// Нужни: C:\Users\roika\Tools\android-sdk (build-tools 35.0.1, android-35), Tools\jdk17
// и ключ Tools\keystores\metko-magnat.keystore (паролата е във файла до него, НЕ в GitHub).
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const TOOLS = 'C:/Users/roika/Tools';
const SDK = `${TOOLS}/android-sdk`;
const BT = `${SDK}/build-tools/35.0.1`;
const JAR = `${SDK}/platforms/android-35/android.jar`;
const JDK = `${TOOLS}/jdk17/bin`;
const KS = `${TOOLS}/keystores/metko-magnat.keystore`;
const KS_TXT = `${TOOLS}/keystores/metko-magnat-keystore-parola.txt`;
const B = 'android/build';
const OUT = 'release/MetkoMagnat.apk';

const env = { ...process.env, JAVA_HOME: path.dirname(JDK), PATH: `${JDK};${process.env.PATH}` };
const run = (exe, args, opts = {}) => execFileSync(exe, args, { stdio: ['ignore', 'inherit', 'inherit'], env, shell: exe.endsWith('.bat'), ...opts });

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const [ma, mi, pa] = pkg.version.split('.').map(Number);
const versionCode = String(ma * 10000 + mi * 100 + pa);
const pass = (fs.readFileSync(KS_TXT, 'utf8').match(/парола:\s*(\S+)/) || [])[1];
if (!pass) throw new Error('Няма парола в ' + KS_TXT);

fs.rmSync(B, { recursive: true, force: true });
for (const d of ['assets', 'classes', 'dex', 'gen']) fs.mkdirSync(`${B}/${d}`, { recursive: true });
for (const f of ['index.html', 'engine.js']) fs.copyFileSync(f, `${B}/assets/${f}`);

// 1. ресурси + манифест + играта (assets)
run(`${BT}/aapt2.exe`, ['compile', '--dir', 'android/res', '-o', `${B}/res.zip`]);
run(`${BT}/aapt2.exe`, ['link', '-o', `${B}/app.apk`, '-I', JAR, '--manifest', 'android/AndroidManifest.xml',
  '-A', `${B}/assets`, '--min-sdk-version', '24', '--target-sdk-version', '35',
  '--version-code', versionCode, '--version-name', pkg.version, '--java', `${B}/gen`, `${B}/res.zip`]);

// 2. Java → .class → classes.dex
const srcs = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = `${d}/${f}`; if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.java')) srcs.push(p); } })('android/src');
run(`${JDK}/javac.exe`, ['-nowarn', '-encoding', 'UTF-8', '-source', '8', '-target', '8', '-bootclasspath', JAR, '-d', `${B}/classes`, ...srcs], { stdio: ['ignore', 'inherit', 'pipe'] });
const classes = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = `${d}/${f}`; if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.class')) classes.push(p); } })(`${B}/classes`);
run(`${BT}/d8.bat`, ['--release', '--min-api', '24', '--lib', JAR, '--output', `${B}/dex`, ...classes]);

// 3. dex в apk-то, подравняване, подпис
run(`${BT}/aapt.exe`, ['add', path.resolve(`${B}/app.apk`), 'classes.dex'], { cwd: `${B}/dex` });
run(`${BT}/zipalign.exe`, ['-f', '-p', '4', `${B}/app.apk`, `${B}/aligned.apk`]);
fs.mkdirSync('release', { recursive: true });
run(`${BT}/apksigner.bat`, ['sign', '--ks', KS, '--ks-key-alias', 'metkomagnat', '--ks-pass', `pass:${pass}`, '--key-pass', `pass:${pass}`, '--out', OUT, `${B}/aligned.apk`]);
run(`${BT}/apksigner.bat`, ['verify', OUT]);
fs.rmSync(OUT + '.idsig', { force: true });
console.log(`OK ${OUT} (версия ${pkg.version}, код ${versionCode}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
