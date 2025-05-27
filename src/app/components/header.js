import Link from "next/link";

export default async function header() {
 return (
  <header className="p-4 flex flex-row justify-center">
    <Link href="/">
      <img 
        className="h-24 md:hidden"
        src="/baal-logo.png" 
        alt="Bay Area Art List Logo"                            
      />    
    </Link>
    <Link className="md:hidden" href="/">Bay Area Art Listings</Link>
  </header>
 )
}