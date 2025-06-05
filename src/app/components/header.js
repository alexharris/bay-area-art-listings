import Link from "next/link";

export default async function header() {
 return (
  <header className="p-4 flex flex-row justify-start">
    <Link href="/">
      <img 
        className="h-24 lg:hidden"
        src="/baal-handwritten-logo.png" 
        alt="Bay Area Art List Logo"                            
      />    
    </Link>
    <Link className="hidden" href="/">Bay Area Art Listings</Link>
  </header>
 )
}