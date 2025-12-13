import { Calendar } from "lucide-react";
import { WHATSAPP_BASE_URL } from "../lib/config"; // см. шаг 2

function withMessage(baseUrl, message) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}text=${encodeURIComponent(message)}`;
}

// "24.10"
function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

// "10:00–14:00" (фиксируем таймзону)
function formatTimeRange(startISO, endISO) {
  const opts = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jerusalem" };
  const s = new Date(startISO).toLocaleTimeString("ru-RU", opts);
  const e = new Date(endISO).toLocaleTimeString("ru-RU", opts);
  return `${s}–${e}`;
}

export default function ClientBookingPelmeni({ ev }) {
  // Фиксированный текст при записи в WhatsApp
  const wa = withMessage(
    WHATSAPP_BASE_URL,
    "Здравствуйте! Хочу записаться на «ПЕЛЬМЕНИ & ВИНО — Гастрономическая пятница»."
  );

  return (
    <>
      <h2 className="mt-6 font-semibold">Доступные даты и время</h2>
      <ul className="mt-2 space-y-2">
        {(ev.sessions || []).map((s) => (
          <li key={s.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="tabular-nums">
              {formatShortDate(s.start)} — {formatTimeRange(s.start, s.end)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
        >
          Записаться
        </a>
      </div>

      <div className="mt-6 leading-relaxed text-slate-800">
        Кулинарная встреча с Александрой Пеле — нутрициологом из Сибири, ценителем вкуса и натуральных продуктов.<br />
        Это не мастер-класс — это встреча ценителей.<br />
        Готовим цветные сибирские <span className="text-red-600 font-semibold">Не кошерные</span> пельмени с креативом,
        пьём элитное вино, наслаждаемся атмосферой, вкусом и общением.
      </div>
    </>
  );
}
