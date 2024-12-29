import Link from "next/link";

export default async function header() {
 return (
  <header className="p-4">
    <Link href="/">Bay Area Art Listings</Link>
  </header>
 )
}