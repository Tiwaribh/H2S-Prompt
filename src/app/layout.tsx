import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirSathi – Civic Air Intelligence | PromptWars MVP',
  description:
    'From live air quality data to local action. Real public API air intelligence platform for Indian municipalities and citizens.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold text-xs"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
