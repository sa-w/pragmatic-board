'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function SideNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <nav className="flex flex-col bg-slate-200">
      <h2 className="bg-purple-50 p-2">🤹 Automatic scrolling playground</h2>
      <Link
        href="/example/list"
        className={`p-2 ${pathname === '/example/list' ? 'bg-blue-100' : ''}`}
      >
        List example
      </Link>
    </nav>
  );
}
