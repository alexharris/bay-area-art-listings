'use client'

import DisplayListings from "../components/displayListings";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-items-start min-h-screen px-4 gap-8 sm:px-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 sm:items-start w-full">
        <DisplayListings />
      </main>
      <footer className="w-full py-8 px-1 flex flex-col md:flex-row justify-between">
        <div>Bay Area Art List</div>
        <div>
          this is the footer
        </div>
        <div>right</div>
      </footer> 
    </div>
  );
}
