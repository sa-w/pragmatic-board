'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load the Fathom script on mount
  useEffect(() => {
    const fathomId = process.env.NEXT_PUBLIC_FATHOM_ID;
    console.log('fahtom');

    if (!fathomId) {
      return;
    }

    console.log('loding');
    load('hi', {
      auto: false,
    });
  }, []);

  // Record a Page View when route changes
  useEffect(() => {
    if (!pathname) {
      return;
    }

    console.log('tracking page view');
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
