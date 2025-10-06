# Таки Гуляки — афиша (Netlify-ready)

React + Vite + Tailwind. Данные лежат в `public/data/events.json` (на проде — путь `/data/events.json`).

## Быстрый старт
```bash
npm install
npm run dev
```

## Деплой на Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 (см. `.nvmrc` и `package.json` → `engines`)
- SPA-роутинг: `public/_redirects` и `netlify.toml` уже добавлены.

## Обновление афиши
Правьте `public/data/events.json` и коммитьте — Netlify пересоберёт сайт.
