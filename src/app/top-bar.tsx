'use client';

import { SettingsContext } from '@/shared/settings-context';
import { bindAll } from 'bind-event-listener';
import { Code, PanelTopClose, PanelTopOpen, Settings, Zap } from 'lucide-react';
//import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { FPSPanel } from './fps-panel';
import { SettingsDialog } from './settings-dialog';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

type TRoute = { title: string; href: string };

const routes = {
  board: { title: 'Kanban', href: '/board' },
  //oneColumn: { title: 'One Column', href: '/one-column' },
  //twoColumns: { title: 'Two Columns', href: '/two-columns' },
} as const satisfies { [key: string]: TRoute };

function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export function TopBar() {
  const pathname = usePathname();
  const [isTopBarExpanded, setIsTopBarExpanded] = useState<boolean>(true);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { settings } = useContext(SettingsContext);

  const breadcrumbs = [
    <Link underline="hover" key="1" color="inherit" href="/" onClick={handleClick}>
      Kanban
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      href="/material-ui/getting-started/installation/"
      onClick={handleClick}
    >
      Board
    </Link>,
  ];

  useEffect(() => {
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
  }, [isTopBarExpanded, isSettingsDialogOpen]);

  return (
    <>
      {isTopBarExpanded ? (
        <header className="flex h-18 flex-col items-start gap-1 border-b px-3">
          {Object.values(routes).map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={`flex-shrink rounded p-2 text-sm font-bold leading-none sm:text-base sm:leading-none ${pathname === route.href ? '' : ''}`}
            >
              {route.title}
            </Link>
          ))}
          <>
          <Stack spacing={2} sx={{marginBottom: '0.5%'}}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                  {breadcrumbs}
                </Breadcrumbs>
              </Stack></>
          
        </header>
      ) : null}


      {/*<div className="fixed right-2 top-0 isolate z-[1] flex h-12 flex-row items-center justify-center gap-1">
        {settings.isFPSPanelEnabled ? <FPSPanel /> : null}
        {isTopBarExpanded ? (
          <>
            <Link
              href="https://github.com/alexreardon/pragmatic-board"
              className="flex h-8 flex-row items-center gap-1 rounded bg-slate-800 px-2 text-white hover:bg-gray-700 active:bg-gray-600"
              target="_blank"
            >
              <Code size={16} />
              <span className="hidden sm:block">Code</span>
            </Link>
            <Link
              href="https://stackblitz.com/~/github.com/alexreardon/pragmatic-board"
              className="flex h-8 flex-row items-center gap-1 rounded bg-slate-800 px-2 text-white hover:bg-gray-700 active:bg-gray-600"
              target="_blank"
            >
              <Zap size={16} />
              <span className="hidden sm:block">Run</span>
            </Link>
          </>
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
      </div>*/}
    </>
  );
}
