import Link from "next/link";

export default async function header() {
 return (
  <header className="p-4 flex flex-row justify-between">
    <Link href="/">Bay Area Art Listings</Link>
    <Link href="/about">About</Link>
  </header>
 )
}