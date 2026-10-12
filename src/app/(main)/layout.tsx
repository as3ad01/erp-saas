import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isRtl } from "@/i18n/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return { title: dict.metadata.title, description: dict.metadata.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <ClerkProvider afterSignOutUrl="/sign-in" localization={locale === "ar" ? arSA : undefined}>
      <html
        lang={locale}
        dir={isRtl(locale) ? "rtl" : "ltr"}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster dir={isRtl(locale) ? "rtl" : "ltr"} position={isRtl(locale) ? "top-left" : "top-right"} />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
