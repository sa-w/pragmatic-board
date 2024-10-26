'use-client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SideNavigation() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col bg-slate-200">
      <h2 className="bg-purple-50 p-2">🤹 Automatic scrolling playground</h2>
      <Link href="/list" className={pathname === '/list' ? 'text-blue-300' : ''}>
        List example
      </Link>
    </nav>
  );
}
