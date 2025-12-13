import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Home({ events = [] }) {
  const now = new Date();

  const upcoming = events
    .filter((e) => parseDateTime(e.date, e.startTime) >= startOfDay(now))
    .sort(sortByDateAsc);
  const featured = upcoming[0] || [...events].sort(sortByDateAsc)[0];

  return (
    <div>
      <Helmet>
        <title>Таки Гуляки — афиша событий</title>
        <meta
          name="description"
          content="Прогулки, встречи и мастер-классы сообщества «Таки Гуляки». Выбирайте событие и приходите!"
        />
        <link
          rel="canonical"
          href={typeof window !== "undefined" ? window.location.origin : "https://taki-gulyaki.netlify.app"}
        />
        <meta property="og:title" content="Таки Гуляки — афиша событий" />
        <meta
          property="og:description"
          content="Прогулки, встречи и мастер-классы. Добавляйте в календарь и делитесь с друзьями."
        />
        <meta property="og:image" content="/images/og-home.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-teal-500/15 via-amber-500/10 to-fuchsia-500/10 p-8 md:p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full" />
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Таки Гуляки</h1>
          <p className="text-zinc-700 dark:text-zinc-200 max-w-2xl text-lg">
            Афиша прогулок, встреч и мастер-классов. Выбирайте событие, добавляйте в календарь и приходите знакомиться.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#afisha" className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow">
              Смотреть афишу
            </a>
            {featured && (
              <Link
                to={`/events/${featured.slug}`}
                className="px-5 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 backdrop-blur"
              >
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {featured.category || "Общее"}
                  </span>
                  <span>{formatDateTime(featured.date, featured.startTime, featured.endTime)}</span>
                </div>
                <h2 className="text-2xl font-semibold mb-2">{featured.title}</h2>
                {featured.location && <div className="text-sm text-zinc-500 mb-3">📍 {featured.location}</div>}
                <p className="text-zinc-700 dark:text-zinc-200 mb-4 whitespace-pre-wrap">{featured.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/events/${featured.slug}`}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
                  >
                    Подробнее
                  </Link>
                  <button
                    onClick={() => downloadICS(featured)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700"
                  >
                    В календарь (.ics)
                  </button>
                </div>
              </div>
            </article>

            {/* Subscribe (простая форма Netlify) */}
            <aside className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">Подписка на анонсы</h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                Получайте новые события «Таки Гуляки» на e-mail.
              </p>
              <form name="subscribe" method="POST" data-netlify="true" className="flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="form-name" value="subscribe" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Ваш e-mail"
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
                <button className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">
                  Подписаться
                </button>
              </form>
            </aside>
          </div>
        </section>
      )}

      {/* GRID */}
      <sect
