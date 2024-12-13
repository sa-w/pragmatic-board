import type { Metadata } from 'next';
import './globals.css';
import { TopBar } from './top-bar';
import { SettingsContextProvider } from '@/shared/settings-context';
import { FathomAnalytics } from './fathom';

export const metadata: Metadata = {
  title: 'Pragmatic board',
  description: 'A board powered by Pragmatic drag and drop, React, Tailwind and Lucide',
  authors: { name: 'Alex Reardon', url: 'https://alexreardon.bsky.social/' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col">
        <FathomAnalytics />
        <SettingsContextProvider>
          <TopBar />
          {/* position: absolute needed for max-height:100% to be respected internally */}
          <div className="relative flex-grow">
            <div className="absolute inset-0">
              <main className="h-full bg-sky-700">{children}</main>
            </div>
          </div>
        </SettingsContextProvider>
      </body>
    </html>
  );
}
