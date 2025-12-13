import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Home from "./components/Home.jsx";
import ClientBookingPelmeni from "./components/ClientBookingPelmeni.jsx";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("tg-theme") || "light");

  // Тема (светлая/тёмная)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tg-theme", theme);
  }, [theme]);

  // Загрузка данных
  useEffect(() => {
    fetch("/data/events.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <div className="grid place-items-center h-screen text-zinc-500">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Шапка */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 grid place-items-center text-white font-bold shadow">
            TG
          </div>
          <div className="mr-auto">
            <Link to="/" className="no-underline">
              <h1 className="text-xl sm:text-2xl font-semibold">Таки Гуляки</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Афиша проекта «Таки Гуляки»</p>
            </Link>
          </div>
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
          >
            Тема: {theme === "light" ? "светлая" : "тёмная"}
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home events={events} />} />
          <Route path="/events/:slug" element={<EventPage events={events} />} />
          <Route path="*" element={<div className="text-center text-zinc-500">Страница не найдена.</div>} />
        </Routes>
      </main>

      {/* Подвал */}
      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          Сайт публикует события из файла <code>/data/events.json</code>. Обновите JSON — Netlify пересоберёт.
        </p>
      </footer>
    </div>
  );
}

/* ================= Страница события ================= */

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

      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-zinc-5
