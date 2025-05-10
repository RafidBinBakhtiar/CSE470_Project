import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold text-teal-800 mb-4">Page Not Found</h2>
      <p className="mb-6 text-gray-600">Could not find the requested resource</p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
} 