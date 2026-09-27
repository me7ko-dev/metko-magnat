# Метко Магнат

Бърза IDLE игра за натрупване на пари: от будка за лимонада до галактическа империя.
15 бизнеса, мениджъри, 224 подобрения, инвеститори (продажба на империята), диаманти, златни куфарчета, турбо и 117 постижения.

**Играй (телефон и компютър):** https://me7ko-dev.github.io/metko-magnat/

- **Хранилище в GitHub:** https://github.com/me7ko-dev/metko-magnat
- **Частно копие (Artifact):** https://claude.ai/artifact/VchcvHUQhobaNZviu6FxSM
- **Папка на компютъра:** `C:\Users\roika\Projects\metko-magnat`
- **Локално:** двоен клик на `index.html`

## Файлове

| Файл | Какво е |
|---|---|
| `engine.js` | Цялата логика и всички числа за баланса (най-горе във файла) |
| `game.html` | Интерфейсът (формат за Artifact, без `<html>`/`<head>`) |
| `index.html` | Пълна страница за браузър — прави се с `sh build.sh` от `game.html` |
| `PROMPT.md` | Пълният промпт, по който е направена играта |
| `test/sim.mjs` | Робот, който играе с ускорено време: `node test/sim.mjs 300` (минути) |
| `test/serve.mjs` | Малък сървър за проверка: `node test/serve.mjs` → http://localhost:5190 |
