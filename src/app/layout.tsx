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
        {children}
      </body>
    </html>
  );
}
