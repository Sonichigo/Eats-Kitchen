import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The recipe or restaurant review you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-500 transition-colors w-full shadow-lg shadow-primary/20"
        >
          <Icons.Chef />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}