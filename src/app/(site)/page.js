'use client'

import DisplayListings from "../components/displayListings";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-items-start min-h-screen px-4 gap-8 sm:px-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 sm:items-start w-full">
        <DisplayListings />
      </main>
      <footer className="border border-black w-full p-8 flex flex-row justify-between">
        <div>Bay Area Art List</div>
        <div>
          this is the footer
        </div>
        <div>right</div>
      </footer> 
    </div>
  );
}
