import Link from "next/link";

export default function header() {
 return (
  <header className="flex flex-row justify-start mb-8">
    <Link href="/">
      <img 
        className="h-24"
        src="/baal-handwritten-logo.png" 
        alt="Bay Area Art List Logo"                            
      />    
    </Link>
    <Link className="hidden" href="/">Bay Area Art Listings</Link>
  </header>
 )
}