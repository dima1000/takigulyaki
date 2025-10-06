import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Главная страница проекта «Таки Гуляки»
// - Hero с градиентом и CTA
// - Ближайшее событие (featured)
// - Фильтры по категории и поиску
// - Сетка событий
// - Форма подписки (Netlify Forms)
// Использование: в App.jsx подключите этот компонент для маршрута "/"
//   import Home from "./components/Home.jsx";
//   <Route path="/" element={<Home events={events} />} />

export default function Home({ events = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))],
    [events]
  );

  const now = new Date();
  const upcoming = useMemo(
    () => events.filter((e) => parseDateTime(e.date, e.startTime) >= startOfDay(now)).sort(sortByDateAsc),
    [events]
  );
  const featured = upcoming[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => (category === "all" ? true : e.category === category))
      .filter((e) =>
        !q
          ? true
          : [e.title, e.description, e.location, e.category]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q))
      )
      .sort(sortByDateAsc);
  }, [events, category, query]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-teal-500/15 via-amber-500/10 to-fuchsia-500/10 p-8 md:p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full" />
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Таки Гуляки</h1>
          <p className="text-zinc-700 dark:text-zinc-200 max-w-2xl text-lg">
            Афиша прогулок, встреч и мастер‑классов. Выбирайте событие, добавляйте в календарь и приходите знакомиться.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#afisha" className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow">
              Смотреть афишу
            </a>
            {featured && (
              <Link to={`/events/${featured.slug}`} className="px-5 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
                Ближайшее: {formatForList(featured.date)} · {featured.title}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
        <section className="mt-8">
          <div className="grid lg:grid-cols-2 gap-5 items-stretch">
            <article className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow">
              {featured.image ? (
                <img src={featured.image} alt="cover" className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
              )}
              <div className="p-5">
                <div className="mb-2 text-xs text-zinc-500 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{featured.category || "Общее"}</span>
                  <span>{formatDateTime(featured.date, featured.startTime, featured.endTime)}</span>
                </div>
                <h2 className="text-2xl font-semibold mb-2">{featured.title}</h2>
                {featured.location && (
                  <div className="text-sm text-zinc-500 mb-3">📍 {featured.location}</div>
                )}
                <p className="text-zinc-700 dark:text-zinc-200 mb-4 whitespace-pre-wrap">{featured.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/events/${featured.slug}`} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">Подробнее</Link>
                  <a href={featured.url || `https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(featured.title)}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700">Поделиться</a>
                  <button onClick={() => downloadICS(featured)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700">В календарь (.ics)</button>
                </div>
              </div>
            </article>

            {/* Subscribe block (Netlify Forms) */}
            <aside className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">Подписка на анонсы</h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">Получайте новые события «Таки Гуляки» на e‑mail.</p>
              <form name="subscribe" method="POST" data-netlify="true" className="flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="form-name" value="subscribe" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Ваш e‑mail"
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
                <button className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">Подписаться</button>
              </form>
              <p className="text-xs text-zinc-500 mt-2">*Если используете Netlify Forms впервые, добавьте скрытую форму в index.html для автодетекта (см. инструкции ниже).</p>
            </aside>
          </div>
        </section>
      )}

      {/* FILTERS */}
      <section id="afisha" className="mt-10">
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
          <input
            placeholder="Поиск по названию, месту, описанию..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          />
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "px-3 py-1.5 rounded-xl border text-sm " +
                  (category === c
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                    : "border-zinc-300 dark:border-zinc-700")
                }
              >
                {c === "all" ? "Все категории" : c}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center bg-white dark:bg-zinc-900">
            <h2 className="text-lg font-medium mb-2">Ничего не найдено</h2>
            <p className="text-zinc-500">Попробуйте изменить запрос или категорию.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((e) => (
              <EventCard key={e.id} item={e} />)
            )}
          </div>
        )}
      </section>

      {/* Hidden Netlify form (для надёжного детекта) — добавьте также копию в public/index.html */}
      <form name="subscribe" data-netlify="true" hidden>
        <input type="email" name="email" />
      </form>
    </div>
  );
}

function EventCard({ item }) {
  const { title, description, date, startTime, endTime, location, url, category, image, slug } = item;
  const when = formatDateTime(date, startTime, endTime);

  return (
    <article className="group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/events/${slug}`}>
        {image ? (
          <img src={image} alt="cover" className="w-full h-44 object-cover group-hover:opacity-95 transition" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{category || "Общее"}</span>
          <div className="text-xs text-zinc-500">{formatForList(date)}</div>
        </div>
        <Link to={`/events/${slug}`} className="block">
          <h3 className="text-lg font-semibold leading-tight mb-1 hover:underline">{title}</h3>
        </Link>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">{description}</p>
        <div className="text-sm mb-3">
          <div>{when}</div>
          {location && <div className="text-zinc-500">📍 {location}</div>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadICS(item)} className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">В календарь (.ics)</button>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm">Перейти</a>
          )}
          <Link to={`/events/${slug}`} className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">Подробнее</Link>
        </div>
      </div>
    </article>
  );
}

// --- Вспомогательные функции (локальные копии) ---
function parseDateTime(dateStr, timeStr) {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
}
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function pad(n){ return String(n).padStart(2, "0"); }
function toICSDate(date, time){ const dt = parseDateTime(date, time); return `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`; }
function escapeICS(s){ return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function buildICS(e){
  const uid = e.id || crypto.randomUUID();
  const dtstamp = new Date();
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TakiGulyaki//RU//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp.getUTCFullYear()}${pad(dtstamp.getUTCMonth()+1)}${pad(dtstamp.getUTCDate())}T${pad(dtstamp.getUTCHours())}${pad(dtstamp.getUTCMinutes())}${pad(dtstamp.getUTCSeconds())}Z`,
    `DTSTART:${toICSDate(e.date, e.startTime || '00:00')}`,
    e.endTime ? `DTEND:${toICSDate(e.date, e.endTime)}` : `DTEND:${toICSDate(e.date, e.startTime || '00:00')}`,
    `SUMMARY:${escapeICS(e.title)}`,
    e.location ? `LOCATION:${escapeICS(e.location)}` : null,
    e.description ? `DESCRIPTION:${escapeICS(e.description)}` : null,
    e.url ? `URL:${escapeICS(e.url)}` : null,
    'END:VEVENT','END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}
function downloadICS(item){
  const ics = buildICS(item);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slugify(item.title)}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function slugify(str){ return String(str).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-а-яё]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,''); }
function formatDateTime(date, startTime, endTime) {
  const start = parseDateTime(date, startTime);
  const end = endTime ? parseDateTime(date, endTime) : null;
  const fmtDate = new Intl.DateTimeFormat('ru-RU', { weekday:'short', day:'2-digit', month:'long', year:'numeric', timeZone: 'Asia/Jerusalem' }).format(start);
  const fmtTime = new Intl.DateTimeFormat('ru-RU', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem' }).format(start);
  const fmtEnd = end ? new Intl.DateTimeFormat('ru-RU', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem' }).format(end) : null;
  return `${fmtDate}, ${fmtTime}${fmtEnd ? '—' + fmtEnd : ''}`;
}
function formatForList(date) {
  const d = parseDateTime(date, '00:00');
  return new Intl.DateTimeFormat('ru-RU', { day:'2-digit', month:'short', timeZone: 'Asia/Jerusalem' }).format(d);
}
