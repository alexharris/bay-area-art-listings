export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Show Not Found</h1>
        <p className="text-gray-600 mb-6">The exhibition you're looking for doesn't exist or has been removed.</p>
        <a 
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
        >
          Back to all shows
        </a>
      </div>
    </div>
  );
}
