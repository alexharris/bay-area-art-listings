'use client'

import Header from '../components/header';
import { usePathname } from 'next/navigation';

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const isMainPage = pathname === '/';
  console.log('Current pathname:', pathname);
  console.log('Is main page:', isMainPage);
  return (
    <div className="w-full mx-auto max-w-8xl">
      <Header className={isMainPage ? 'lg:hidden' : ''} />
      {children}
    </div>
  );
}
