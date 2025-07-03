'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function header() {
  const pathname = usePathname();
  const isMainPage = pathname === '/';


  return (
    <header
      className={`flex flex-row justify-between items-start m-4 ${isMainPage ? 'lg:hidden' : ''}`}
    >
      <Link href="/">
        <img
          className="h-24"
          src="/baal-handwritten-logo.png"
          alt="Bay Area Art List Logo"
        />
      </Link>
      <Link className="" href="/about">
        About
      </Link>
      <Link className="hidden" href="/">
        Bay Area Art Listings
      </Link>
    </header>
  );
}