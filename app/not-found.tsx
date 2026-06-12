import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-center">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2">Could not find requested resource</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
