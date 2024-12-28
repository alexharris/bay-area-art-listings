
import DisplayListings from "./components/displayListings";
import GetDataFromSheet from "./components/getDataFromSheet";

export default function Home() {
  return (
    <div className="flex flex-col mt-8 items-center justify-items-center min-h-screen px-8 pb-20 gap-16 sm:px-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <DisplayListings />
      </main>
      <footer className="">
        
      </footer>
    </div>
  );
}
