import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wisply — עוזר AI חכם לאתר שלך",
  description:
    "Wisply הוא עוזר AI חכם לאתר — עונה בעברית, לוכד לידים, מדבר בקול, ומתחבר ל-CRM ולדיוור. מוקם עבורך, מנוהל, ומוכן תוך ימים.",
  openGraph: {
    title: "Wisply — עוזר AI חכם לאתר שלך",
    description:
      "עונה בעברית, לוכד לידים, מדבר בקול, מתחבר ל-CRM ולדיוור. Done-for-you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
