import events from "@/app/data/events.json";
import EventCard from "@/components/EventCard";

function sortByDateAsc(a: any, b: any) {
  const t = (d: string, t?: string) => {
    const [y, m, dd] = d.split("-").map(Number);
    const [hh, mm] = (t || "00:00").split(":").map(Number);
    return new Date(y, (m || 1) - 1, dd || 1, hh || 0, mm || 0).getTime();
  };
  return t(a.date, a.startTime) - t(b.date, b.startTime);
}

export default function Home() {
  const upcoming = [...(events as any[])].sort(sortByDateAsc);
  const featured = upcoming[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-teal-500/15 via-amber-500/10 to-fuchsia-500/10 p-8 md:p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full" />
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Гастрономический Рай</h1>
          <p className="text-zinc-700 max-w-2xl text-lg">Мероприятия сообщества: вкусы, люди и открытия.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#afisha" className="px-5 py-3 rounded-2xl bg-black text-white shadow">Смотреть афишу</a>
            {featured && (
              <a href={`/events/${featured.slug}`} className="px-5 py-3 rounded-2xl border border-zinc-300 bg-white/70 backdrop-blur">
                Ближайшее: {formatForList((featured as any).date)} · {(featured as any).title}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* О сообществе + подписка */}
      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-2">О сообществе</h2>
          <p className="text-zinc-700 leading-relaxed">Мы объединяем людей, которым нравится пробовать новое, готовить, дегустировать и узнавать кухню изнутри.</p>
        </div>
        <aside className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-semibold mb-2">Подписка на анонсы</h3>
          <p className="text-zinc-600 mb-4">Анонсы, приоритетная запись и закрытые дегустации — в нашей рассылке.</p>
          <form name="subscribe" method="POST" data-netlify="true" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="form-name" value="subscribe" />
            <input type="email" name="email" required placeholder="Ваш e-mail" className="flex-1 px-3 py-2 rounded-xl border border-zinc-300" />
            <button className="px-5 py-2 rounded-xl bg-black text-white">Подписаться</button>
          </form>
        </aside>
      </section>

      {/* Афиша */}
      <section id="afisha" className="mt-10">
        {upcoming.length === 0 ? (
          <div className="border border-zinc-200 rounded-2xl p-10 text-center bg-white">
            <h2 className="text-lg font-medium mb-2">Пока что нет мероприятий</h2>
            <p className="text-zinc-500">Добавьте первое — отредактируйте <code>app/data/events.json</code>.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {upcoming.map((e) => <EventCard key={(e as any).id} item={e as any} />)}
          </div>
        )}
      </section>

      {/* Скрытая форма Netlify */}
      <form name="subscribe" data-netlify="true" hidden><input type="email" name="email" /></form>
    </div>
  );
}

function formatForList(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: "Asia/Jerusalem" }).format(dt);
}
