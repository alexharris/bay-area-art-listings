'use client'

import DisplayListings from "../components/displayListings";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-between min-h-screen px-4 gap-8 sm:px-4 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <DisplayListings />
      </main>
      {/* <footer className="w-full py-2 px-1 flex flex-col lg:flex-row justify-between">
        <div>
          
        </div>
        <div>
          <a href="/about">About Bay Area Art List</a>
        </div>
        <div>

        </div>
      </footer>  */}
    </div>
  );
}
