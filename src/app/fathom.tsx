'use client';

import { load, trackPageview } from 'fathom-client';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function TrackPageView() {
  const pathname = usePathname();

  // Load the Fathom script on mount
  useEffect(() => {
    const fathomId = process.env.NEXT_PUBLIC_FATHOM_ID;

    if (!fathomId) {
      return;
    }

    load(fathomId, {
      auto: false,
    });
  }, []);

  // Record a Page View when route changes
  useEffect(() => {
    if (!pathname) {
      return;
    }

    trackPageview({
      url: pathname,
      referrer: document.referrer,
    });
  }, [pathname]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
