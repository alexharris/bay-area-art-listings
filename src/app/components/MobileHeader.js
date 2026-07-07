'use client'

import { useState, useEffect } from 'react';
import Link from "next/link";
import { X, Menu } from "lucide-react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { SheetPortal, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AboutContent from './aboutContent';

export default function MobileHeader({ onSearch, onClear }) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, 250);
    return () => clearTimeout(timer);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <header className="lg:hidden flex flex-row items-center gap-2 px-3 h-12 bg-white border-b border-gray-300">
      <Link href="/" className="flex-shrink-0">
        <img
          src="/art-board-logo.png"
          alt="Art Board"
          className="h-8"
        />
      </Link>

      <form className="flex-1 flex items-center" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <input
            type="text"
            className="w-full text-[16px] bg-white border border-gray-300 rounded-full pl-8 pr-7 py-1 outline-none focus:border-gray-500 placeholder:text-gray-400"
            placeholder="Search..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {value && (
            <button
              type="button"
              onClick={() => { setValue(''); onClear?.(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      <button
        onClick={() => setMenuOpen(true)}
        className="flex-shrink-0 text-gray-600 hover:text-black p-1"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Main menu drawer */}
      <SheetPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetPortal>
          <SheetPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-[60] flex flex-col w-80 bg-white shadow-xl transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <div className="px-6 pt-12 pb-6 flex flex-col gap-1">
              <div className="mb-4 p-8">
                <img src="/art-board-logo.png" alt="Art Board" className="h-24" />
              </div>
              <button
                className="text-left py-3 text-base border-b border-gray-100 hover:text-gray-600"
                onClick={() => { setMenuOpen(false); setAboutOpen(true); }}
              >
                About
              </button>
              <button
                className="text-left py-3 text-base border-b border-gray-100 hover:text-gray-600"
                onClick={() => { setMenuOpen(false); setNewsletterOpen(true); }}
              >
                Newsletter
              </button>
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </SheetPrimitive.Root>

      {/* About drawer */}
      <SheetPrimitive.Root open={aboutOpen} onOpenChange={setAboutOpen}>
        <SheetPortal>
          <SheetPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-[60] flex flex-col w-full bg-white shadow-xl overflow-y-auto transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
            <SheetTitle className="sr-only">About</SheetTitle>
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="px-6 py-8">
              <AboutContent />
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </SheetPrimitive.Root>

      {/* Newsletter drawer */}
      <SheetPrimitive.Root open={newsletterOpen} onOpenChange={setNewsletterOpen}>
        <SheetPortal>
          <SheetPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-[60] flex flex-col w-full max-w-sm bg-white shadow-xl transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
            <SheetTitle className="sr-only">Newsletter</SheetTitle>
            <button
              onClick={() => setNewsletterOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="px-6 py-8 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Newsletter</h2>
              <form
                action="https://buttondown.com/api/emails/embed-subscribe/artboard"
                method="post"
                className="embeddable-buttondown-form space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="mobile-bd-email" className="text-sm font-medium">
                    Enter your email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    id="mobile-bd-email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Subscribe</Button>
              </form>
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </SheetPrimitive.Root>
    </header>
  );
}
