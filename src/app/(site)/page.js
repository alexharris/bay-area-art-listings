import MainListings from "../components/mainListings";
import { client } from "@/sanity/lib/client";

async function getSettings() {
  try {
    const settings = await client.fetch(`*[_type == "settings" && _id == "settings"][0]{
      newsletter
    }`)
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export default async function Home() {
  const settings = await getSettings();
  
  return (
    <div className="flex flex-col items-start justify-between min-h-screen gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <MainListings newsletterSettings={settings?.newsletter} />
      </main>
    </div>
  );
}
