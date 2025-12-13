import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Home({ events = [] }) {
  const categories = ["all", ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];
  const now = new Date();

  const upcoming = events
    .filter((e) => parseDateTime(e.date, e.startTime) >= startOfDay(now))
    .sort(sortByDateAsc);
  const featured = upcoming[0] || events.sort(sortByDateAsc)[0];

  return (
    <div>
      <Helmet>
        <title>Таки Гуляки — афиша событий</title>
        <meta name=\"description\" content=\"Прогулки, встречи и мастер-классы сообщества «Таки Гуляки». Выбирайте событие и приходите!\" />
        <link rel=\"canonical\" href={typeof window !== 'undefined' ? window.location.origin : 'https://taki-gulyaki.netlify.app'} />
        <meta property=\"og:title\" content=\"Таки Гуляки — афиша событий\" />
        <meta property=\"og:description\" content=\"Прогулки, встречи и мастер-классы. Добавляйте в календарь и делитесь с друзьями.\" />
        <meta property=\"og:image\" content=\"/images/og-home.jpg\" />
        <meta property=\"og:type\" content=\"website\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
      </Helmet>

      <section className=\"relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-teal-500/15 via-amber-500/10 to-fuchsia-500/10 p-8 md:p-12\">
        <div className=\"absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 blur-3xl rounded-full\" />
        <div className=\"absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full\" />
        <div className=\"relative\">
          <h1 className=\"text-3xl md:text-5xl font-bold tracking-tight mb-3\">Таки Гуляки</h1>
          <p className=\"text-zinc-700 dark:text-zinc-200 max-w-2xl text-lg\">
            Афиша прогулок, встреч и мастер‑классов. Выбирайте событие, добавляйте в календарь и приходите знакомиться.
          </p>
          <div className=\"mt-6 flex flex-col sm:flex-row gap-3\">
            <a href=\"#afisha\" className=\"px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow\">
              Смотреть афишу
            </a>
            {featured && (
              <Link to={\`/events/${featured.slug}\`} className=\"px-5 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 backdrop-blur\">
                Ближайшее: {formatForList(featured.date)} · {featured.title}
              </Link>
            )}
          </div>
        </div>
      </section>

      {featured && (
        <section className=\"mt-8\">
          <div className=\"grid lg:grid-cols-2 gap-5 items-stretch\">
            <article className=\"rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow\">
              {featured.image ? (
                <img src={featured.image} alt=\"cover\" className=\"w-full h-64 object-cover\" />
              ) : (
                <div className=\"w-full h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700\" />
              )}
              <div className=\"p-5\">
                <div className=\"mb-2 text-xs text-zinc-500 flex items-center gap-2\">
                  <span className=\"inline-flex items-center px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700\">{featured.category || "Общее"}</span>
                  <span>{formatDateTime(featured.date, featured.startTime, featured.endTime)}</span>
                </div>
                <h2 className=\"text-2xl font-semibold mb-2\">{featured.title}</h2>
                {featured.location && (
                  <div className=\"text-sm text-zinc-500 mb-3\">📍 {featured.location}</div>
                )}
                <p className=\"text-zinc-700 dark:text-zinc-200 mb-4 whitespace-pre-wrap\">{featured.description}</p>
                <div className=\"flex flex-wrap gap-2\">
                  <Link to={\`/events/${featured.slug}\`} className=\"px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black\">Подробнее</Link>
                  <button onClick={() => downloadICS(featured)} className=\"px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700\">В календарь (.ics)</button>
                </div>
              </div>
            </article>

            <aside className=\"rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-center\">
              <h3 className=\"text-xl font-semibold mb-2\">Подписка на анонсы</h3>
              <p className=\"text-zinc-600 dark:text-zinc-300 mb-4\">Получайте новые события «Таки Гуляки» на e‑mail.</p>
              <form name=\"subscribe\" method=\"POST\" data-netlify=\"true\" className=\"flex flex-col sm:flex-row gap-3\">
                <input type=\"hidden\" name=\"form-name\" value=\"subscribe\" />
                <input type=\"email\" name=\"email\" required placeholder=\"Ваш e‑mail\" className=\"flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950\" />
                <button className=\"px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black\">Подписаться</button>
              </form>
            </aside>
          </div>
        </section>
      )}

      <section id=\"afisha\" className=\"mt-10\">
        {events.length === 0 ? (
          <div className=\"border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center bg-white dark:bg-zinc-900\">
            <h2 className=\"text-lg font-medium mb-2\">Пока что нет мероприятий</h2>
            <p className=\"text-zinc-500\">Добавьте первое — отредактируйте <code>public/data/events.json</code>.</p>
          </div>
        ) : (
          <div className=\"grid md:grid-cols-2 xl:grid-cols-3 gap-5\">
            {events.sort(sortByDateAsc).map(e => <EventCard key={e.id} item={e} />)}
          </div>
        )}
      </section>

      <form name=\"subscribe\" data-netlify=\"true\" hidden>
        <input type=\"email\" name=\"email\" />
      </form>
    </div>
  );
}

function EventCard({ item }) {
  const { title, description, date, startTime, endTime, location, url, category, image, slug } = item;
  const when = formatDateTime(date, startTime, endTime);
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${slug}` : '';

  return (
    <article className=\"group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow\">
      <div>
        {image ? (
          <img src={image} alt=\"cover\" className=\"w-full h-44 object-cover group-hover:opacity-95 transition\" />
        ) : (
          <div className=\"w-full h-44 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700\" />
        )}
      </div>
      <div className=\"p-4\">
        <div className=\"flex items-center justify-between gap-2 mb-2\">
          <span className=\"inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700\">{category || "Общее"}</span>
          <div className=\"text-xs text-zinc-500\">{formatForList(date)}</div>
        </div>
        <Link to={\`/events/${slug}\`} className=\"block\">
          <h3 className=\"text-lg font-semibold leading-tight mb-1 hover:underline\">{title}</h3>
        </Link>
        <p className=\"text-sm text-zinc-600 dark:text-zinc-300 mb-3\">{description}</p>
        <div className=\"text-sm mb-3\">
          <div>{when}</div>
          {location && <div className=\"text-zinc-500\">📍 {location}</div>}
        </div>
        <div className=\"flex gap-2 flex-wrap\">
          <button onClick={() => downloadICS(item)} className=\"px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm\">В календарь (.ics)</button>
          {url && <a href={url} target=\"_blank\" rel=\"noreferrer\" className=\"px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm\">Перейти</a>}
          <Link to={\`/events/${slug}\`} className=\"px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm\">Подробнее</Link>
        </div>
      </div>
    </article>
  );
}

function parseDateTime(dateStr, timeStr) { const [y,m,d]=(dateStr||'').split('-').map(Number); const [hh,mm]=(timeStr||'00:00').split(':').map(Number); return new Date(y,(m||1)-1,d||1,hh||0,mm||0,0); }
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function pad(n){ return String(n).padStart(2,'0'); }
function formatForList(date) { const d = parseDateTime(date, '00:00'); return new Intl.DateTimeFormat('ru-RU',{ day:'2-digit', month:'short', timeZone:'Asia/Jerusalem' }).format(d) }
function formatDateTime(date, startTime, endTime){ const s=parseDateTime(date,startTime); const e=endTime?parseDateTime(date,endTime):null; const d=new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'2-digit',month:'long',year:'numeric', timeZone:'Asia/Jerusalem'}).format(s); const t=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit', timeZone:'Asia/Jerusalem'}).format(s); const te=e?new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit', timeZone:'Asia/Jerusalem'}).format(e):null; return `${d}, ${t}${te?'—'+te:''}`;}
function sortByDateAsc(a,b){ const da=parseDateTime(a.date,a.startTime).getTime(); const db=parseDateTime(b.date,b.startTime).getTime(); return da-db; }
function slugify(str){ return String(str).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-а-яё]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,''); }
function toICSDate(date, time){ const dt=parseDateTime(date, time); return `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`; }
function escapeICS(s){ return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function buildICS(e){ const uid=e.id || (crypto&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`); const dtstamp=new Date(); const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TakiGulyaki//RU//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${dtstamp.getUTCFullYear()}${pad(dtstamp.getUTCMonth()+1)}${pad(dtstamp.getUTCDate())}T${pad(dtstamp.getUTCHours())}${pad(dtstamp.getUTCMinutes())}${pad(dtstamp.getUTCSeconds())}Z`,`DTSTART:${toICSDate(e.date, e.startTime || '00:00')}`,e.endTime?`DTEND:${toICSDate(e.date, e.endTime)}`:`DTEND:${toICSDate(e.date, e.startTime || '00:00')}`,`SUMMARY:${escapeICS(e.title)}`,e.location?`LOCATION:${escapeICS(e.location)}`:null,e.description?`DESCRIPTION:${escapeICS(e.description)}`:null,e.url?`URL:${escapeICS(e.url)}`:null,'END:VEVENT','END:VCALENDAR'].filter(Boolean); return lines.join('\r\n'); }
function downloadICS(item){ const ics=buildICS(item); const blob=new Blob([ics],{ type:'text/calendar;charset=utf-8' }); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${slugify(item.title)}.ics`; a.click(); URL.revokeObjectURL(a.href); }
