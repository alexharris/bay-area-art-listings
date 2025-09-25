'use client'

import { usePathname } from 'next/navigation';

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const isMainPage = pathname === '/';
  return (
    <div className="w-full mx-auto max-w-8xl">
      {children}
    </div>
  );
}
