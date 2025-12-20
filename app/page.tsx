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
          {/* Главное фото */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="Главное фото сообщества"
              className="w-full h-64 md:h-80 object-cover"
              loading="eager"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Таки Гуляки</h1>
          <p className="text-zinc-700 max-w-2xl text-lg">
            Прогулки, встречи и мастер-классы. Добавляйте в календарь и делитесь с друзьями.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#afisha" className="px-5 py-3 rounded-2xl bg-black text-white shadow">Смотреть афишу</a>
            {featured && (
              <a href={`/events/${(featured as any).slug}`} className="px-5 py-3 rounded-2xl border border-zinc-300 bg-white/70 backdrop-blur">
                Ближайшее: {formatForList((featured as any).date)} · {(featured as any).title}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* О сообществе (расширено) */}
      <section className="mt-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">О сообществе</h2>

          {/* сохраняем твой базовый текст + расширяем */}
          <div className="space-y-4 text-zinc-700 leading-relaxed">
            <p>
              Афиша прогулок, встреч и мастер-классов. Выбирайте событие, добавляйте в календарь и приходите знакомиться.
            </p>
            <p>
              Мы собираем людей, кому интересно узнавать город, пробовать новое, общаться и проводить время в хорошей компании.
              Форматы разные — от коротких прогулок и уютных встреч до тематических мастер-классов.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Дружелюбная атмосфера и камерные группы.</li>
              <li>Простые форматы — главное общение и опыт.</li>
              <li>Удобный календарь и страницы событий с деталями.</li>
            </ul>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-medium mb-1">Как попасть на событие?</div>
              <p>
                Откройте афишу ниже, зайдите на страницу события — там есть подробности и кнопка записи в WhatsApp.
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
}

function formatForList(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: "Asia/Jerusalem" }).format(dt);
}
