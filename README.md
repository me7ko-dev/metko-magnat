# Метко Магнат

Бърза IDLE игра за натрупване на пари: от будка за лимонада до галактическа империя.
15 бизнеса, мениджъри, 224 подобрения, инвеститори (продажба на империята), диаманти, златни куфарчета, турбо и 117 постижения.

**Играй (телефон и компютър):** https://me7ko-dev.github.io/metko-magnat/

- **Windows програма:** иконата „Метко Магнат“ на работния плот (`release\MetkoMagnat-win32-x64\MetkoMagnat.exe`)
- **Хранилище в GitHub:** https://github.com/me7ko-dev/metko-magnat
- **Частно копие (Artifact):** https://claude.ai/artifact/VchcvHUQhobaNZviu6FxSM
- **Папка на компютъра:** `C:\Users\roika\Projects\metko-magnat`
- **Локално в браузъра:** двоен клик на `index.html`

## Как се пуска

| Какво | Команда |
|---|---|
| Нова Windows програма след промени | `npm run exe` |
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
| `PROMPT.md` | Пълният промпт, по който е направена играта |
| `test/sim.mjs` | Робот, който играе с ускорено време |
| `test/exe.mjs` | Пуска .exe-то и прави снимка в `test/out/exe.png` |
