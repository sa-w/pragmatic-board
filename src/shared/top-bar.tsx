'use client';

import { bindAll } from 'bind-event-listener';
import { PanelTopClose, PanelTopOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type TLink = { title: string; href: string };

const links: TLink[] = [
  { title: 'Board', href: '/board' },
  { title: 'One column', href: '/one-column' },
  { title: 'Two columns', href: '/two-columns' },
];

export function TopBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  useEffect(() => {
    return bindAll(window, [
      {
        type: 'keydown',
        listener(event) {
          if (event.key === 'Escape') {
            toggle();
          }
        },
      },
    ]);
  }, [toggle]);

  const toggleButton = (
    <div className="fixed right-2 top-0 z-10 flex h-12 flex-col items-center">
      <button
        type="button"
        className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
        onClick={() => setIsOpen(true)}
      >
        <PanelTopOpen size={16} />
      </button>
    </div>
  );

  return (
    <>
      {isOpen ? (
        <header className="flex h-12 flex-row items-center gap-3 border-b bg-sky-800 px-3 leading-4 text-white">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className={`rounded p-2 font-bold hover:bg-sky-700 active:bg-sky-600 ${pathname === link.href ? 'bg-blue-900' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </header>
      ) : null}
      <div className="fixed right-2 top-0 isolate z-[1] flex h-12 flex-col justify-center">
        <button
          type="button"
          className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
          onClick={toggle}
          aria-label="toggle top bar visibility"
        >
          {isOpen ? <PanelTopClose size={16} /> : <PanelTopOpen size={16} />}
        </button>
      </div>
    </>
  );
}
