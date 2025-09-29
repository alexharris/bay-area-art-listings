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

export const metadata = {
  title: "Art Board",
  description: "A directory of visual arts exhibitions in the San Francisco Bay Area.",
  metadataBase: new URL("https://bayareaartlist.com"),
  openGraph: {
    title: "Art Board",
    description: "A directory of visual arts exhibitions in the San Francisco Bay Area.",
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
    description: "A directory of visual arts exhibitions in the San Francisco Bay Area.",
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
        <meta itemProp="name" content="Art Board"></meta>    
        <meta itemProp="description" content="A directory of visual arts exhibitions in the San Francisco Bay Area."></meta>    
        <meta itemProp="image" content="https://bayareaartlist.com/favicon/opengraph-image.png"></meta>        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
