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
  title: "Art Listings",
  description: "A list of art shows",
};

export default function RootLayout({ children }) {


  return (
    <html lang="en">
      <head>
        <title>Bay Area Art List</title>
        <meta name="description" content="A directory of visual arts exhibitions in the San Francisco Bay Area" />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://bayareaartlist.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Bay Area Art List" />
        <meta property="og:description" content="A directory of visual arts exhibitions in the San Francisco Bay Area" />
        <meta property="og:image" content="/favicon/open-graph-image.png" />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="bayareaartlist.com" />
        <meta property="twitter:url" content="https://bayareaartlist.com" />
        <meta name="twitter:title" content="Bay Area Art List"  />
        <meta name="twitter:description" content="A directory of visual arts exhibitions in the San Francisco Bay Area" />
        <meta name="twitter:image" content="/favicon/open-graph-image.png " />

        {/* <!-- Meta Tags --> */}
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Bay Area Art List" />
        <link rel="manifest" href="/favicon/site.webmanifest" />        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
