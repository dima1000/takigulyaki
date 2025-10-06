# Таки Гуляки — афиша (SPA, /events/:slug)

React + Vite + Tailwind. Страницы событий: `/events/<slug>`. Мета-теги OG/Twitter + JSON-LD на странице события.

## Быстрый старт
```bash
npm install
npm run dev
```

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Node: 20 (см. `.nvmrc` и `package.json` → `engines`)
- SPA роутинг: `public/_redirects` и `netlify.toml`

## Данные
Редактируйте `public/data/events.json`, коммитьте — деплой обновится.
