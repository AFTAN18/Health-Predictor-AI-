"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";
import { PredictionRecord } from "@/utils/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.");
        setIsLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        setError("Please login again to load analytics.");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPredictions((data || []) as PredictionRecord[]);
      }

      setIsLoading(false);
    };

    fetchPredictions();
  }, []);

  const stats = useMemo(() => {
    const total = predictions.length;
    const highRisk = predictions.filter((item) => item.prediction === 1).length;
    const lowRisk = total - highRisk;
    const averageRisk = total > 0 ? predictions.reduce((sum, item) => sum + item.probability, 0) / total : 0;

    return { averageRisk, highRisk, lowRisk, total };
  }, [predictions]);

  const doughnutData = useMemo(
    () => ({
      labels: ["High Risk", "Low Risk"],
      datasets: [
        {
          data: [stats.highRisk, stats.lowRisk],
          backgroundColor: ["#ef4444", "#10b981"],
          borderWidth: 0,
        },
      ],
    }),
    [stats.highRisk, stats.lowRisk],
  );

  const recentForChart = useMemo(() => [...predictions].slice(0, 7).reverse(), [predictions]);

  const barData = useMemo(
    () => ({
      labels: recentForChart.map((item) => new Date(item.created_at).toLocaleDateString()),
      datasets: [
        {
          label: "Risk probability (%)",
          data: recentForChart.map((item) => Number((item.probability * 100).toFixed(2))),
          backgroundColor: "#2563eb",
          borderRadius: 8,
        },
      ],
    }),
    [recentForChart],
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AuthGuard>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Health Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Track prediction volume, risk distribution, and your recent records.</p>

          {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {isLoading ? (
            <div className="mt-14 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            </div>
          ) : (
            <>
              <section className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Predictions</p>
                  <p className="mt-3 text-4xl font-extrabold text-slate-900">{stats.total}</p>
                </div>
                <div className="surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">High Risk Cases</p>
                  <p className="mt-3 text-4xl font-extrabold text-red-600">{stats.highRisk}</p>
                </div>
                <div className="surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Average Risk</p>
                  <p className="mt-3 text-4xl font-extrabold text-brand-700">{(stats.averageRisk * 100).toFixed(1)}%</p>
                </div>
              </section>

              <section className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="surface-card p-6">
                  <h2 className="text-lg font-bold text-slate-900">Risk Distribution</h2>
                  <div className="mt-4 h-72">
                    {stats.total > 0 ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} /> : <EmptyState />}
                  </div>
                </div>

                <div className="surface-card p-6">
                  <h2 className="text-lg font-bold text-slate-900">Recent Risk Probability</h2>
                  <div className="mt-4 h-72">
                    {stats.total > 0 ? (
                      <Bar
                        data={barData}
                        options={{
                          maintainAspectRatio: false,
                          scales: { y: { beginAtZero: true, max: 100 } },
                        }}
                      />
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </div>
              </section>

              <section className="surface-card mt-7 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="text-lg font-bold text-slate-900">Recent Predictions</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Age</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Glucose</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">BMI</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Probability</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.slice(0, 15).map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-6 py-3 text-sm text-slate-600">{new Date(item.created_at).toLocaleString()}</td>
                          <td className="px-6 py-3 text-sm text-slate-700">{item.age}</td>
                          <td className="px-6 py-3 text-sm text-slate-700">{item.glucose}</td>
                          <td className="px-6 py-3 text-sm text-slate-700">{item.BMI}</td>
                          <td className="px-6 py-3 text-sm font-semibold text-slate-800">{(item.probability * 100).toFixed(1)}%</td>
                          <td className="px-6 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                item.prediction === 1 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.prediction === 1 ? "High Risk" : "Low Risk"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {predictions.length === 0 && (
                    <div className="px-6 py-10 text-sm text-slate-500">
                      No predictions yet.{" "}
                      <Link href="/predict" className="font-semibold text-brand-700 hover:underline">
                        Run your first prediction
                      </Link>
                      .
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </AuthGuard>
      </main>
    </div>
  );
}

function EmptyState() {
  return <div className="grid h-full place-items-center text-sm text-slate-400">No chart data available yet.</div>;
}
