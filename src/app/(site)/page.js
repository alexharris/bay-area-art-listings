'use client'

import MainListings from "../components/mainListings";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-between min-h-screen gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <MainListings />
      </main>
    </div>
  );
}
