export const metadata = {
  title: 'Dashboard | Bay Area Art Listings',
  description: 'Statistics and insights for Bay Area art shows',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
