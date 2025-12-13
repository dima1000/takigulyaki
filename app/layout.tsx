import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Таки Гуляки — события",
  description: "Мероприятия сообщества: Прогулки, встречи и мастер-классы.",
  openGraph: {
    title: "Таки Гуляки — события",
    description: "Мероприятия сообщества: Прогулки, встречи и мастер-классы.",
    images: ["/images/og-home.jpg"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen text-zinc-900">
          <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-zinc-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
              <a href="/" className="no-underline">
                <div className="text-xl font-semibold">Таки Гуляки</div>
                <div className="text-sm text-zinc-500">события</div>
              </a>
              <a
                href="https://wa.me/972527909171"
                className="ml-auto inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                WhatsApp
              </a>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-500">© {new Date().getFullYear()} Таки Гуляки</footer>
        </div>
      </body>
    </html>
  );
}
