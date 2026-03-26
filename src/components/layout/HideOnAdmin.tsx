"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, always render children so the fiber tree
  // matches between server and client — prevents the Turbopack static flag error.
  if (!mounted) return <>{children}</>;

  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
