export const metadata = {
  title: 'Dashboard',
  description: 'Statistics and insights for Bay Area art shows',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
