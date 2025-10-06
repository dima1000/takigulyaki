import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

export default function App() {
  const [events, setEvents] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('tg-theme') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('tg-theme', theme)
  }, [theme])

  useEffect(() => {
    // load static data
    fetch('/data/events.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) return <div className="grid place-items-center h-screen text-zinc-500">Загрузка…</div>

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo />
          <div className="mr-auto">
            <Link to="/" className="no-underline">
              <h1 className="text-xl sm:text-2xl font-semibold">Таки Гуляки</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Афиша проекта «Таки Гуляки»</p>
            </Link>
          </div>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
            Тема: {theme === 'light' ? 'светлая' : 'тёмная'}
          </button>
          <Link to="/admin" className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm shadow hover:opacity-90">
            + Добавить событие
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ListPage events={events} />} />
          <Route path="/e/:slug" element={<EventPage events={events} />} />
          <Route path="/admin" element={<AdminPage events={events} setEvents={setEvents} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-500 dark:text-zinc-400">
        <p>Этот сайт статически публикует события из файла <code>/data/events.json</code>. Для обновления афиши — отредактируйте JSON в репозитории и задеплойте.</p>
      </footer>
    </div>
  )
}

function NotFound() {
  return <div className="text-center text-zinc-500">Страница не найдена.</div>
}

function Logo() {
  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 grid place-items-center text-white font-bold shadow">
      TG
    </div>
  );
}

function ListPage({ events }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('upcoming')

  const categories = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))], [events])
  const now = new Date()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...events].filter(e => {
      const matchQuery = !q ? true : [e.title, e.description, e.location, e.category].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
      const matchCategory = category === 'all' || e.category === category
      const dt = parseDateTime(e.date, e.startTime)
      const isUpcoming = dt >= startOfDay(now)
      const matchStatus = status === 'all' ? true : status === 'upcoming' ? isUpcoming : !isUpcoming
      return matchQuery && matchCategory && matchStatus
    }).sort((a,b)=>{
      const da = parseDateTime(a.date, a.startTime).getTime()
      const db = parseDateTime(b.date, b.startTime).getTime()
      return status === 'past' ? db - da : da - db
    })
  }, [events, query, category, status])

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
        <input
          placeholder="Поиск по названию, месту, описанию..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Все категории' : c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <option value="upcoming">Будущие</option>
          <option value="past">Прошедшие</option>
          <option value="all">Все</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-medium mb-2">Пока что нет мероприятий</h2>
          <p className="text-zinc-500">Добавьте первое в разделе «Добавить событие».</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(e => <EventCard key={e.id} item={e} />)}
        </div>
      )}
    </>
  )
}

function EventCard({ item }) {
  const { title, description, date, startTime, endTime, location, url, category, image, slug } = item
  const when = formatDateTime(date, startTime, endTime)

  return (
    <article className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      {image ? <img src={image} alt="cover" className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{category || 'Общее'}</span>
          <div className="text-xs text-zinc-500">{formatForList(date)}</div>
        </div>
        <Link to={`/e/${slug}`} className="block">
          <h3 className="text-lg font-semibold leading-tight mb-1 hover:underline">{title}</h3>
        </Link>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-3">{description}</p>
        <div className="text-sm mb-3">
          <div>{when}</div>
          {location && <div className="text-zinc-500">📍 {location}</div>}
        </div>
        <div className="flex gap-2">
          <DownloadICS item={item} />
          {url && <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm">Перейти</a>}
          <Link to={`/e/${slug}`} className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">Подробнее</Link>
        </div>
      </div>
    </article>
  )
}

function EventPage({ events }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const ev = events.find(e => e.slug === slug)
  if (!ev) return <div className="text-center text-zinc-500">Событие не найдено.</div>

  const when = formatDateTime(ev.date, ev.startTime, ev.endTime)

  return (
    <article className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-zinc-500 hover:underline">← Назад</button>
      <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {ev.image ? <img src={ev.image} alt="cover" className="w-full h-60 object-cover" /> : <div className="w-full h-60 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />}
        <div className="p-5">
          <div className="mb-2"><span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{ev.category || 'Общее'}</span></div>
          <h1 className="text-2xl font-semibold mb-2">{ev.title}</h1>
          <div className="text-sm mb-3">{when}{ev.location ? ` • 📍 ${ev.location}` : ''}</div>
          {ev.url && <a href={ev.url} target="_blank" rel="noreferrer" className="inline-flex px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm mb-3">Перейти на страницу события</a>}
          <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-200">{ev.description}</p>
          <div className="mt-4"><DownloadICS item={ev} /></div>
        </div>
      </div>
    </article>
  )
}

function DownloadICS({ item }) {
  function downloadICS() {
    const ics = buildICS(item)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${slugify(item.title)}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return <button onClick={downloadICS} className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">В календарь (.ics)</button>
}

function AdminPage({ events, setEvents }) {
  const [searchParams] = useSearchParams()
  // local edits only; export JSON for commit
  const [list, setList] = useState(() => {
    const local = localStorage.getItem('tg-events-v1')
    return local ? JSON.parse(local) : events
  })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    localStorage.setItem('tg-events-v1', JSON.stringify(list))
  }, [list])

  function upsert(e) {
    const item = { ...e }
    if (!item.title?.trim()) return alert('Введите название')
    if (!item.date) return alert('Выберите дату')
    if (!item.slug) item.slug = slugify(item.title)
    if (item.id) {
      setList(prev => prev.map(x => x.id === item.id ? item : x))
    } else {
      item.id = crypto.randomUUID()
      setList(prev => [item, ...prev])
    }
    setEditing(null)
  }

  function del(id) {
    if (!confirm('Удалить мероприятие?')) return
    setList(prev => prev.filter(x => x.id !== id))
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `events.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Редактор афиши (локально)</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={exportJSON} className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Экспорт JSON</button>
        <Link to="/" className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700">На главную</Link>
      </div>

      {editing ? (
        <EventForm initial={editing} onSubmit={upsert} onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing({ title: '', description: '', date: new Date().toISOString().slice(0,10), startTime: '18:00', endTime: '19:00', location: '', url: '', category: 'Общее', image: '' })}
                className="mb-4 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">+ Добавить событие</button>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map(ev => (
          <div key={ev.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="font-medium">{ev.title || 'Без названия'}</div>
            <div className="text-xs text-zinc-500">{ev.slug || slugify(ev.title)}</div>
            <div className="text-sm mt-1">{formatDateTime(ev.date, ev.startTime, ev.endTime)}</div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700" onClick={() => setEditing(ev)}>Редактировать</button>
              <button className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20" onClick={() => del(ev.id)}>Удалить</button>
              <Link to={`/e/${ev.slug || slugify(ev.title)}`} className="ml-auto px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700">Открыть</Link>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mt-6">После редактирования выгрузите <code>events.json</code> и замените файл в папке <code>/data</code> репозитория — Netlify сам пересоберёт сайт.</p>
    </div>
  )
}

function EventForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', date: new Date().toISOString().slice(0,10), startTime: '18:00', endTime: '19:00',
    location: '', url: '', category: 'Общее', image: '', slug: ''
  })
  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  function submit(e) {
    e.preventDefault()
    const payload = initial ? { ...initial, ...form } : form
    if (!payload.slug) payload.slug = slugify(payload.title)
    onSubmit(payload)
  }
  return (
    <form onSubmit={submit} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Название *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Слаг (URL)</label>
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="taki-gulyaki-meetup" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Дата *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Начало</label>
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Окончание</label>
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Место</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="Адрес, площадка, онлайн-ссылка" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Ссылка</label>
          <input name="url" value={form.url} onChange={handleChange} placeholder="Страница регистрации/трансляции" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Категория</label>
          <input name="category" value={form.category} onChange={handleChange} placeholder="Напр., Мастер-класс, Встреча" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div>
          <label className="block text-sm mb-1">Обложка (URL)</label>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://...jpg" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Описание</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">{initial ? 'Сохранить' : 'Добавить'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700">Отмена</button>
      </div>
    </form>
  )
}

// === Utils ===
function parseDateTime(dateStr, timeStr) {
  const [y,m,d] = (dateStr || '').split('-').map(Number)
  const [hh,mm] = (timeStr || '00:00').split(':').map(Number)
  return new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0)
}
function startOfDay(d) {
  const x = new Date(d); x.setHours(0,0,0,0); return x
}
function pad(n){return String(n).padStart(2,'0')}
function slugify(str){
  return String(str).toLowerCase().trim()
    .replace(/\\s+/g,'-')
    .replace(/[^a-z0-9\\-а-яё]/g,'')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'')
}
function toICSDate(date, time){
  const dt = parseDateTime(date, time)
  return `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
}
function buildICS(e){
  const uid = e.id || crypto.randomUUID()
  const dtstamp = new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TakiGulyaki//RU//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp.getUTCFullYear()}${pad(dtstamp.getUTCMonth()+1)}${pad(dtstamp.getUTCDate())}T${pad(dtstamp.getUTCHours())}${pad(dtstamp.getUTCMinutes())}${pad(dtstamp.getUTCSeconds())}Z`,
    `DTSTART:${toICSDate(e.date, e.startTime || '00:00')}`,
    e.endTime ? `DTEND:${toICSDate(e.date, e.endTime)}` : `DTEND:${toICSDate(e.date, e.startTime || '00:00')}`,
    `SUMMARY:${escapeICS(e.title)}`,
    e.location ? `LOCATION:${escapeICS(e.location)}` : null,
    e.description ? `DESCRIPTION:${escapeICS(e.description)}` : null,
    e.url ? `URL:${escapeICS(e.url)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\\r\\n')
}
function escapeICS(s){
  return String(s).replace(/\\\\/g,'\\\\\\\\').replace(/\\n/g,'\\\\n').replace(/,/g,'\\\\,').replace(/;/g,'\\\\;')
}
function formatDateTime(date, startTime, endTime) {
  const start = parseDateTime(date, startTime)
  const end = endTime ? parseDateTime(date, endTime) : null
  const fmtDate = new Intl.DateTimeFormat('ru-RU', { weekday:'short', day:'2-digit', month:'long', year:'numeric', timeZone: 'Asia/Jerusalem' }).format(start)
  const fmtTime = new Intl.DateTimeFormat('ru-RU', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem' }).format(start)
  const fmtEnd = end ? new Intl.DateTimeFormat('ru-RU', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Jerusalem' }).format(end) : null
  return `${fmtDate}, ${fmtTime}${fmtEnd ? '—' + fmtEnd : ''}`
}
function formatForList(date) {
  const d = parseDateTime(date, '00:00')
  return new Intl.DateTimeFormat('ru-RU', { day:'2-digit', month:'short', timeZone: 'Asia/Jerusalem' }).format(d)
}
