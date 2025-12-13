import Link from "next/link";
import type { EventItem } from "@/types";

export default function EventCard({ item }: { item: EventItem }) {
  const { title, description, date, startTime, endTime, location, category, image, slug, price } = item;
  const when = `${date}${startTime ? " · " + startTime : ""}${endTime ? "—" + endTime : ""}`;

  return (
    <article className="group rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="cover" className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-zinc-200" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-zinc-100 border border-zinc-200">
            {category || "Общее"}
          </span>
          <div className="text-xs text-zinc-500">{formatForList(date)}</div>
        </div>
        <Link href={`/events/${slug}`} className="block">
          <h3 className="text-lg font-semibold leading-tight mb-1 hover:underline">{title}</h3>
        </Link>
        <p className="text-sm text-zinc-600 mb-3">{description}</p>
        <div className="text-sm mb-3">
          <div>{when}</div>
          {location && <div className="text-zinc-500">📍 {location}</div>}
          {price && <div className="text-zinc-600 mt-1">{price}</div>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/events/${slug}`} className="px-3 py-1.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-sm">
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatForList(date: string) {
  try {
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: "Asia/Jerusalem" }).format(dt);
  } catch {
    return date;
  }
}
