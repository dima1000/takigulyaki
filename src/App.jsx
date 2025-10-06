import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Home from "./components/Home.jsx";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("tg-theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tg-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/data/events.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <div className="grid place-items-center h-screen text-zinc-500">Загрузка…</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 grid place-items-center text-white font-bold shadow">TG</div>
          <div className="mr-auto">
            <Link to="/" className="no-underline">
              <h1 className="text-xl sm:text-2xl font-semibold">Таки Гуляки</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Афиша проекта «Таки Гуляки»</p>
            </Link>
          </div>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
            Тема: {theme === "light" ? "светлая" : "тёмная"}
          </button>
          <Link to="/events/otkrytaya-vstrecha-soobshchestva"
                className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm shadow hover:opacity-90">
            Ближайшее
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home events={events} />} />
          <Route path="/events/:slug" element={<EventPage events={events} />} />
          <Route path="*" element={<div className="text-center text-zinc-500">Страница не найдена.</div>} />
        </Routes>
      </main>
    </div>
  );
}

function EventPage({ events }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const ev = events.find((e) => e.slug === slug);
  if (!ev) return <div className="text-center text-zinc-500">Событие не найдено.</div>;

  const when = formatDateTime(ev.date, ev.startTime, ev.endTime);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://taki-gulyaki.netlify.app";
  const pageUrl = `${origin}/events/${ev.slug || slug}`;
  const title = `${ev.title} — Таки Гуляки`;
  const description = (ev.description || "").replace(/\s+/g, " ").slice(0, 160);
  const image = ev.image?.startsWith("http") ? ev.image : `${origin}${ev.image || "/favicon.svg"}`;
  const startISO = `${ev.date}T${(ev.startTime || "00:00")}:00`;
  const endISO = ev.endTime ? `${ev.date}T${ev.endTime}:00` : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: ev.description,
    startDate: startISO,
    endDate: endISO,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: ev.location ? { "@type": "Place", name: ev.location } : undefined,
    image,
    url: pageUrl,
    organizer: { "@type": "Organization", name: "Таки Гуляки", url: origin },
  };

  return (
    <article className="max-w-3xl mx-auto">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="event" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-zinc-500 hover:underline">← Назад</button>
      <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {ev.image ? <img src={ev.image} alt="cover" className="w-full h-60 object-cover" /> : <div className="w-full h-60 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />}
        <div className="p-5">
          <div className="mb-2"><span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{ev.category || "Общее"}</span></div>
          <h1 className="text-2xl font-semibold mb-2">{ev.title}</h1>
          <div className="text-sm mb-3">{when}{ev.location ? ` • 📍 ${ev.location}` : ""}</div>
          {ev.url && <a href={ev.url} target="_blank" rel="noreferrer" className="inline-flex px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm mb-3">Перейти на страницу события</a>}
          <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-200">{ev.description}</p>
        </div>
      </div>
    </article>
  );
}

// === Минимальные утилиты (как в предыдущей версии)
function parseDateTime(dateStr, timeStr) { const [y,m,d]=(dateStr||'').split('-').map(Number); const [hh,mm]=(timeStr||'00:00').split(':').map(Number); return new Date(y,(m||1)-1,d||1,hh||0,mm||0,0); }
function formatDateTime(date, startTime, endTime){ const s=parseDateTime(date,startTime); const e=endTime?parseDateTime(date,endTime):null; const d=new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'2-digit',month:'long',year:'numeric', timeZone:'Asia/Jerusalem'}).format(s); const t=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit', timeZone:'Asia/Jerusalem'}).format(s); const te=e?new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit', timeZone:'Asia/Jerusalem'}).format(e):null; return `${d}, ${t}${te?'—'+te:''}`; }
