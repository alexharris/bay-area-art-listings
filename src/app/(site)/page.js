'use client'

import DisplayListings from "../components/displayListings";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen px-4 pb-20 gap-16 sm:px-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 sm:items-start w-full">
        <DisplayListings />
      </main>
      <footer className="">
        this is the footer
      </footer> 
    </div>
  );
}
