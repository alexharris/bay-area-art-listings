import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Art Board | Bay Area Art Exhibitions & Gallery Openings";
const siteDescription = "Current and upcoming art exhibitions, gallery openings, and museum shows across the San Francisco Bay Area.";

export const metadata = {
  title: {
    default: siteTitle,
    template: "%s | Art Board",
  },
  description: siteDescription,
  metadataBase: new URL("https://bayareaartlist.com"),
  openGraph: {
    title: "Art Board",
    description: siteDescription,
    url: "https://bayareaartlist.com",
    siteName: "Art Board",
    images: [
      {
        url: "/favicon/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Board",
    description: siteDescription,
    images: ["/favicon/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    title: "Art Board",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.usefathom.com/script.js" data-site="RPZZSMRK" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
