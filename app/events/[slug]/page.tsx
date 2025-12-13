import events from "@/app/data/events.json";
import type { EventItem } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return (events as EventItem[]).map((e) => ({ slug: e.slug }));
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const ev = (events as EventItem[]).find((e) => e.slug === params.slug);
  if (!ev) return notFound();

  const when = `${ev.date}${ev.startTime ? " · " + ev.startTime : ""}${ev.endTime ? "—" + ev.endTime : ""}`;

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:underline">← На главную</Link>

      <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {ev.image ? <img src={ev.image} alt="cover" className="w-full h-60 object-cover" /> : <div className="w-full h-60 bg-zinc-200" />}
        <div className="p-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 border border-zinc-200">{ev.category || "Общее"}</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">{ev.title}</h1>
          <div className="text-sm mb-3">
            {when}{ev.location ? ` • 📍 ${ev.location}` : ""}{ev.price ? ` • ${ev.price}` : ""}
          </div>
          {ev.url && (
            <a href={ev.url} target="_blank" rel="noreferrer" className="inline-flex px-3 py-1.5 rounded-xl bg-black text-white text-sm mb-3">
              Перейти на страницу события
            </a>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-zinc-700">{ev.description}</p>
        </div>
      </div>
    </article>
  );
}
