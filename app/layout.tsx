import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/organisms/ThemeSync";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zen",
  description: "Multi-tool for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme (`.dark` on <html>) is managed imperatively, not via React props:
  //  - the no-flash <head> script applies it before first paint;
  //  - <ThemeSync> re-asserts it on every route change (before paint);
  //  - font/`antialiased` classes live on <body> so React never owns <html>'s
  //    className and can't clobber the theme class.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved (or system) theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
