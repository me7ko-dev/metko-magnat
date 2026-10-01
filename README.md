# Метко Магнат

Бърза IDLE игра за натрупване на пари: от будка за лимонада до галактическа империя.
15 бизнеса, мениджъри, 224 подобрения, инвеститори (продажба на империята), диаманти, златни куфарчета, турбо и 117 постижения.

**Играй (телефон и компютър):** https://me7ko-dev.github.io/metko-magnat/

- **Android (APK):** https://github.com/me7ko-dev/metko-magnat/releases/latest/download/MetkoMagnat.apk — отвори линка от телефона, свали и инсталирай (разреши „Инсталиране от неизвестни източници“ за браузъра)
- **iPhone:** свържи телефона с Mac-а (кабел или същата Wi-Fi мрежа), отключи го и пусни `bash mobile/ios-install.sh`. С безплатен Apple акаунт работи 7 дни — после пак пусни командата (прогресът се пази).
- **Windows програма:** иконата „Метко Магнат“ на работния плот (`release\MetkoMagnat-win32-x64\MetkoMagnat.exe`)
- **Хранилище в GitHub:** https://github.com/me7ko-dev/metko-magnat
- **Локално в браузъра:** двоен клик на `index.html`

## Как се пуска

| Какво | Команда |
|---|---|
| Нова Windows програма след промени | `npm run exe` |
| Нов Android APK след промени | `npm run apk` → `release/MetkoMagnat.apk` (вдигни `version` в package.json) |
| Прозорец за проба без .exe | `npm run desktop` |
| Обнови `index.html` след промяна в `game.html` | `npm run page` |
| Робот за баланса | `npm run sim` |
| Сървър за проверка в браузъра | `npm run serve` → http://localhost:5190 |

## Файлове

| Файл | Какво е |
|---|---|
| `engine.js` | Цялата логика и всички числа за баланса (най-горе във файла) |
| `game.html` | Интерфейсът (формат за Artifact, без `<html>`/`<head>`) |
| `index.html` | Пълна страница за браузър, GitHub Pages и Windows програмата |
| `desktop/` | Windows програмата (Electron): `main.cjs`, `build.mjs`, иконите |
| `android/` | Android програмата: WebView с играта, `build.mjs` (без Gradle) |
| `PROMPT.md` | Пълният промпт, по който е направена играта |
| `test/sim.mjs` | Робот, който играе с ускорено време |
| `test/exe.mjs` | Пуска .exe-то и прави снимка в `test/out/exe.png` |
