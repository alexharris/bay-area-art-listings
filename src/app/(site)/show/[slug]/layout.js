// Show pages aren't public yet — keep them out of search results.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function ShowLayout({ children }) {
  return children;
}
