"use client";
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as metaPixel from '@/lib/metaPixel';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // To prevent React Strict Mode duplicate firing on mount
  const lastTrackedUrl = useRef('');

  useEffect(() => {
    if (!metaPixel.PIXEL_ID) return;
    
    // Construct current URL signature
    const currentUrl = pathname + (searchParams?.toString() || '');
    
    // Prevent duplicate firing for the same URL
    if (lastTrackedUrl.current === currentUrl) return;
    
    lastTrackedUrl.current = currentUrl;
    metaPixel.pageview();
  }, [pathname, searchParams]);

  return null;
}
