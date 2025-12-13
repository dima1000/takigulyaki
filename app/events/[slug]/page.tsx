// app/events/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import events from "@/app/data/events.json";
import type { EventItem } from "@/types";

// Генерация статических путей: /events/<slug>
export function generateStaticParams() {
  return (events as EventItem[]).map((e) => ({ slug: e.slug }));
}

// Метаданные для превью (OG/Twitter) каждой страницы события
export function generateMetadata(
  { params }: { params: { slug: string } }
): Metadata {
  const ev = (events as EventItem[]).find((e) => e.slug === params.slug);
  if (!ev) return {};

  const title = `${ev.title} — Таки Гуляки`;
  const description = (ev.description || "").slice(0, 160);
  const image = ev.image || "/images/og-home.jpg";
  const url = `https://https://takigulyaki.com//events/${ev.slug}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [image], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const ev = (events as EventItem[]).find((e) => e.slug === params.slug);
  if (!ev) return notFound();

  const when = `${ev.date}${ev.startTime ? " · " + ev.startTime : ""}${
    ev.endTime ? "—" + ev.endTime : ""
  }`;

  // Кнопка записи в WhatsApp с автотекстом
  const wa = `https://wa.me/972527909171?text=${encodeURIComponent(
    `Здравствуйте! Хочу записаться на «${ev.title}» (${ev.date}${
      ev.startTime ? " " + ev.startTime : ""
    }).`
  )}`;

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:underline">
        ← На главную
      </Link>

      <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {ev.image ? (
          <img src={ev.image} alt="cover" className="w-full h-60 object-cover" />
        ) : (
          <div className="w-full h-60 bg-zinc-200" />
        )}

        <div className="p-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 border border-zinc-200">
              {ev.category || "Общее"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold mb-2">{ev.title}</h1>

          <div className="text-sm mb-3">
            {when}
            {ev.location ? ` • 📍 ${ev.location}` : ""}
            {ev.price ? ` • ${ev.price}` : ""}
          </div>

          {/* Кнопка на WhatsApp */}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm mb-3"
          >
            Записаться в WhatsApp
          </a>

          {/* Ссылка на внешнюю страницу события (если есть) */}
          {ev.url && (
            <a
              href={ev.url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex px-3 py-1.5 rounded-xl bg-black text-white text-sm mb-3"
            >
              Страница события
            </a>
          )}

          <p className="whitespace-pre-wrap leading-relaxed text-zinc-700">
            {ev.description}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← На главную
        </Link>
      </div>
    </article>
  );
}
