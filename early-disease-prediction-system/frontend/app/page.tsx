import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold mb-8 border border-blue-100 shadow-sm animate-fade-in-down">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            AI-Powered Healthcare
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Predict Disease Risk <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Before It Happens
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Leverage our advanced machine learning models to analyze your health parameters and predict your risk for early onset diseases like Diabetes today.
          </p>

          <div className="flex justify-center flex-col sm:flex-row gap-4">
            <Link href="/predict" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
              Start Prediction
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
              View Dashboard
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 opacity-90 max-w-5xl mx-auto text-left">
            <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Predictive AI</h3>
               <p className="text-gray-600">Trained on thousands of genuine clinical datasets to provide robust, accurate predictions.</p>
            </div>
            
            <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Secure</h3>
               <p className="text-gray-600">Your data is processed instantly securely at the edge, offering real-time insights.</p>
            </div>

            <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-6 text-purple-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Rich Analytics</h3>
               <p className="text-gray-600">Track and manage your history utilizing insightful visualizations and trends.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
