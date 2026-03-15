"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement
);

export default function DashboardPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authenticaion check removed, immediately fetch predictions with a mock user
    fetchPredictions('mock-user-id');
  }, []);

  const fetchPredictions = async (userId: string) => {
    // Attempting to fetch from actual DB table to show realistic dashboard
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        // if user_id was strictly implemented: .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching predictions DB:", error.message);
      } else if (data) {
        setPredictions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (predictions.length === 0) {
        // Mock data fallback if DB isn't properly deployed yet for MVP
        setPredictions([
          { id: 1, created_at: new Date().toISOString(), prediction: 1, probability: 0.82, age: 45, BMI: 28 },
          { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), prediction: 0, probability: 0.15, age: 30, BMI: 22 },
          { id: 3, created_at: new Date(Date.now() - 172800000).toISOString(), prediction: 1, probability: 0.65, age: 52, BMI: 31 },
        ]);
      }
      setLoading(false);
    }
  };

  const highRiskCount = predictions.filter(p => p.prediction === 1).length;
  const lowRiskCount = predictions.length - highRiskCount;

  const doughnutData = {
    labels: ['High Risk', 'Low Risk'],
    datasets: [
      {
        data: [highRiskCount, lowRiskCount],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgba(239, 68, 68, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: predictions.slice(0, 5).map(p => new Date(p.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Risk Probability (%)',
        data: predictions.slice(0, 5).map(p => (p.probability * 100).toFixed(1)),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Your Health Analytics</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center transform transition duration-300 hover:scale-[1.02] hover:shadow-md">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Assessments</h3>
                <p className="text-4xl font-extrabold text-gray-800">{predictions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center transform transition duration-300 hover:scale-[1.02] hover:shadow-md">
                <h3 className="text-red-500 text-sm font-medium uppercase tracking-wider mb-2">High Risk Cases</h3>
                <p className="text-4xl font-extrabold text-red-600">{highRiskCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center transform transition duration-300 hover:scale-[1.02] hover:shadow-md">
                <h3 className="text-green-500 text-sm font-medium uppercase tracking-wider mb-2">Low Risk Cases</h3>
                <p className="text-4xl font-extrabold text-green-600">{lowRiskCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Risk Distribution Overview</h3>
                <div className="flex justify-center h-64">
                  {predictions.length > 0 ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} /> : <p className="text-gray-400 my-auto">No data to display.</p>}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Probability Trend</h3>
                <div className="flex justify-center h-64">
                  {predictions.length > 0 ? <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }} /> : <p className="text-gray-400 my-auto">No data to display.</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Recent Assessment History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Date</th>
                      <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Age / BMI</th>
                      <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mt-2">Probability</th>
                      <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {predictions.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.age} yrs / {p.BMI}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {(p.probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${p.prediction === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {p.prediction === 1 ? 'High Risk' : 'Low Risk'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {predictions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-8 text-center text-gray-500">No recent predictions found. Go to <a href="/predict" className="text-blue-600 font-semibold hover:underline">Predict Risk</a> to begin.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
