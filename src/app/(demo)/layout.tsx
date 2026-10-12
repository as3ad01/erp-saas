import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Golden Dragon Academy | Demo",
  description: "Martial arts club management demo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Standalone root layout: the demo has no auth and no database, so it does
// not share the Clerk-wrapped layout used by the main app.
export default async function DemoRootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const lang = store.get("locale")?.value === "en" ? "en" : "ar";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`demo ${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
