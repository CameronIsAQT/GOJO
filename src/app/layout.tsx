import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Polymarket Bot Tracker",
  description: "Track and monitor your Polymarket trading bots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Background Image - Glowing Eyes */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
            }}
          />
          <Image
            src="/eyes.png"
            alt=""
            fill
            className="object-contain opacity-[0.18]"
            style={{
              objectPosition: 'center',
              filter: 'brightness(1.4) drop-shadow(0 0 60px rgba(56, 189, 248, 0.5)) drop-shadow(0 0 100px rgba(56, 189, 248, 0.3))',
            }}
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 bg-slate-950/90 backdrop-blur-md border-b border-sky-500/20">
          <div className="w-full px-6 lg:px-10">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 mr-3 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <span className="text-white font-bold text-sm">PM</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    Polymarket Tracker
                  </span>
                </Link>
                <div className="ml-12 flex items-center space-x-1">
                  <Link
                    href="/"
                    className="text-slate-300 hover:text-sky-400 hover:bg-slate-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/trades"
                    className="text-slate-300 hover:text-sky-400 hover:bg-slate-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Trades
                  </Link>
                  <Link
                    href="/bots"
                    className="text-slate-300 hover:text-sky-400 hover:bg-slate-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Bots
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 w-full px-6 lg:px-10 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
