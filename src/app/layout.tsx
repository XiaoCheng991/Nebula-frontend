import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NebulaHub // blog",
  description: "Kyon's Blog — 代码、想法与技术笔记",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_icon.svg" />
      </head>
      <body className="bg-background text-foreground scanlines grid-bg min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a
              href="/"
              className="text-primary font-mono text-lg tracking-wider font-bold text-glow glitch-hover"
            >
              {'<NebulaHub />'}
            </a>
            <div className="flex items-center gap-6 text-sm font-mono">
              <a
                href="/"
                className="text-foreground/70 hover:text-primary transition-colors hover:text-glow glitch-hover"
              >
                [ blog ]
              </a>
              <a
                href="/about"
                className="text-foreground/70 hover:text-primary transition-colors hover:text-glow glitch-hover"
              >
                [ about ]
              </a>
            </div>
          </nav>
        </header>
        <main className="pt-14">
          {children}
        </main>
        <footer className="border-t border-border mt-20">
          <div className="max-w-4xl mx-auto px-4 py-8 text-xs font-mono text-foreground/30 flex justify-between items-center">
            <span>{`/* ${new Date().getFullYear()} NebulaHub */`}</span>
            <span>powered by Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
