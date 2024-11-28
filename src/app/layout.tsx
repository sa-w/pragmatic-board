import type { Metadata } from 'next';
import './globals.css';
import { TopBar } from './top-bar';
import { SettingsContextProvider } from '@/shared/settings-context';
import { Fathom } from './fathom';

export const metadata: Metadata = {
  title: 'Auto scroll playground',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col">
        <Fathom />
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
