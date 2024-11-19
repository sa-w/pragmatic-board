'use client';

import { bindAll } from 'bind-event-listener';
import { Github, SquareX, X } from 'lucide-react';
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

  if (!isOpen) {
    return null;
  }

  return (
    <header className="flex flex-row items-center gap-3 border-b bg-sky-800 p-2 px-3 leading-4 text-white">
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={`rounded p-2 font-bold hover:bg-blue-500 active:bg-blue-400 ${pathname === link.href ? 'bg-blue-600' : ''}`}
        >
          {link.title}
        </Link>
      ))}
      <Link href="http://github.com" className="ml-auto">
        <Github size={16} />
      </Link>
    </header>
  );
}
