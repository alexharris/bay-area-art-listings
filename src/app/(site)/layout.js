import { client } from "@/sanity/lib/client";
import TopBar from "../components/TopBar";

async function getSettings() {
  try {
    const settings = await client.fetch(`*[_type == "settings" && _id == "settings"][0]{
      topBar
    }`)
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export default async function SiteLayout({ children }) {
  const settings = await getSettings()
  
  return (
    <>
      <TopBar settings={settings} />
      <div className="w-full mx-auto max-w-8xl">
        {children}
      </div>
    </>
  );
}
