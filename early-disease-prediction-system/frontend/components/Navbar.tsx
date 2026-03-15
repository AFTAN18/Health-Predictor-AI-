"use client";
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-blue-600 font-bold text-xl tracking-tight">
              MediPredict AI
            </Link>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/predict" className="text-gray-600 hover:text-blue-600 transition-colors">Predict Risk</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
