import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/Providers";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "StudyFlow - Learn Anything, Powered by AI",
  description: "Unlock your potential with personalized learning paths, instant feedback, and quizzes generated just for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (localTheme === 'dark' || (!localTheme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] font-display overflow-x-hidden antialiased selection:bg-primary selection:text-white transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
