'use client';

import { SettingsContext } from '@/shared/settings-context';
import { bindAll } from 'bind-event-listener';
import { PanelTopClose, PanelTopOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { FPSPanel } from './fps-panel';
import { SettingsDialog } from './settings-dialog';

type TRoute = { title: string; href: string };

const routes = {
  board: { title: 'Board', href: '/board' },
  oneColumn: { title: 'One Column', href: '/one-column' },
  twoColumns: { title: 'Two Columns', href: '/two-columns' },
} as const satisfies { [key: string]: TRoute };

export function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTopBarExpanded, setIsTopBarExpanded] = useState<boolean>(true);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { settings } = useContext(SettingsContext);

  const isFullScreen: boolean = searchParams.get('full-screen') === 'true';

  useEffect(() => {
    if (isFullScreen) {
      return;
    }

    return bindAll(window, [
      {
        type: 'keydown',
        listener(event) {
          if (event.key !== 'Escape') {
            return;
          }

          if (isSettingsDialogOpen) {
            setIsSettingsDialogOpen(false);
            return;
          }
          setIsTopBarExpanded((current) => !current);
        },
      },
      {
        type: 'click',
        listener(event) {
          if (!(event.target instanceof Element)) {
            return;
          }

          if (!isSettingsDialogOpen) {
            return;
          }

          const dialog = settingsDialogRef.current;
          const trigger = settingsTriggerRef.current;
          if (!dialog || !trigger) {
            return;
          }
          if (trigger.contains(event.target)) {
            return;
          }

          if (dialog.contains(event.target)) {
            return;
          }

          setIsSettingsDialogOpen(false);
        },
      },
    ]);
  }, [isTopBarExpanded, isSettingsDialogOpen, isFullScreen]);

  if (isFullScreen) {
    return null;
  }

  return (
    <>
      {isTopBarExpanded ? (
        <header className="flex h-12 flex-row items-center gap-3 border-b bg-sky-800 px-3 leading-4 text-white">
          {Object.values(routes).map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={`rounded p-2 font-bold hover:bg-sky-700 active:bg-sky-600 ${pathname === route.href ? 'bg-blue-900' : ''}`}
            >
              {route.title}
            </Link>
          ))}
        </header>
      ) : null}
      <div className="fixed right-2 top-0 isolate z-[1] flex h-12 flex-row items-center justify-center">
        {settings.isFPSPanelEnabled ? (
          <div className="pr-1">
            <FPSPanel />
          </div>
        ) : null}
        <button
          type="button"
          className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
          onClick={() => setIsTopBarExpanded((current) => !current)}
          aria-label="toggle top bar visibility"
        >
          {isTopBarExpanded ? <PanelTopClose size={16} /> : <PanelTopOpen size={16} />}
        </button>
        <button
          type="button"
          ref={settingsTriggerRef}
          className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
          onClick={() => setIsSettingsDialogOpen((current) => !current)}
          aria-label="toggle top bar visibility"
        >
          <Settings size={16} />
        </button>
        {isSettingsDialogOpen ? <SettingsDialog ref={settingsDialogRef} /> : null}
      </div>
    </>
  );
}
