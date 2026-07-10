import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Цифровой паспорт регионов Казахстана",
  description: "Интерактивный прототип аналитической платформы регионального развития Казахстана.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
