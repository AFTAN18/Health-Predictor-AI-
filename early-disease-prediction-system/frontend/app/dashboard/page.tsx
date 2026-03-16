"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import Navbar from "@/components/Navbar";
import { backendApiUrl } from "@/utils/config";
import { PredictionRecord } from "@/utils/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, LineElement, PointElement, Legend, LinearScale, Tooltip);

function getRiskBucket(probability: number): "Low" | "Medium" | "High" {
  if (probability < 0.35) return "Low";
  if (probability < 0.65) return "Medium";
  return "High";
}

function calculateRiskScore(record: PredictionRecord): number {
  return (
    0.3 * Number(record.glucose) +
    0.25 * Number(record.BMI) +
    0.2 * Number(record.age) +
    0.15 * Number(record.blood_pressure) +
    0.1 * Number(record.cholesterol)
  );
}

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<PredictionRecord[]>(`${backendApiUrl}/predictions?limit=100`);
        setPredictions(response.data || []);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
          setError(detail || "Failed to load dashboard data.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard data.");
        }
      }

      setIsLoading(false);
    };

    fetchPredictions();
  }, []);

  const stats = useMemo(() => {
    const total = predictions.length;
    const averageRiskScore =
      total > 0 ? predictions.reduce((sum, item) => sum + calculateRiskScore(item), 0) / total : 0;
    const averageFutureRisk =
      total > 0 ? predictions.reduce((sum, item) => sum + Number(item.future_probability), 0) / total : 0;

    const distribution = predictions.reduce(
      (acc, item) => {
        const bucket = getRiskBucket(Number(item.probability));
        acc[bucket] += 1;
        return acc;
      },
      { Low: 0, Medium: 0, High: 0 },
    );

    return { averageFutureRisk, averageRiskScore, distribution, total };
  }, [predictions]);

  const doughnutData = useMemo(
    () => ({
      labels: ["Low", "Medium", "High"],
      datasets: [
        {
          data: [stats.distribution.Low, stats.distribution.Medium, stats.distribution.High],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    }),
    [stats.distribution.High, stats.distribution.Low, stats.distribution.Medium],
  );

  const recentForChart = useMemo(() => [...predictions].slice(0, 7).reverse(), [predictions]);

  const barData = useMemo(
    () => ({
      labels: recentForChart.map((item) => new Date(item.created_at).toLocaleDateString()),
      datasets: [
        {
          label: "Health Risk Score",
          data: recentForChart.map((item) => Number(calculateRiskScore(item).toFixed(2))),
          backgroundColor: "#2563eb",
          borderRadius: 8,
        },
      ],
    }),
    [recentForChart],
  );

  const futureLineData = useMemo(
    () => ({
      labels: recentForChart.map((item) => new Date(item.created_at).toLocaleDateString()),
      datasets: [
        {
          label: "Future Disease Risk (%)",
          data: recentForChart.map((item) => Number((Number(item.future_probability) * 100).toFixed(2))),
          borderColor: "#1d4ed8",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [recentForChart],
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Average Risk Score</p>
                <p className="mt-3 text-4xl font-extrabold text-brand-700">{stats.averageRiskScore.toFixed(1)}</p>
              </div>
              <div className="surface-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Avg Future Risk</p>
                <p className="mt-3 text-4xl font-extrabold text-indigo-700">{(stats.averageFutureRisk * 100).toFixed(1)}%</p>
              </div>
            </section>

            <section className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="surface-card p-6">
                <h2 className="text-lg font-bold text-slate-900">Current Risk Distribution</h2>
                <div className="mt-4 h-72">
                  {stats.total > 0 ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} /> : <EmptyState />}
                </div>
              </div>

              <div className="surface-card p-6">
                <h2 className="text-lg font-bold text-slate-900">Health Score Trend</h2>
                <div className="mt-4 h-72">
                  {stats.total > 0 ? (
                    <Bar
                      data={barData}
                      options={{
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>
            </section>

            <section className="surface-card mt-7 p-6">
              <h2 className="text-lg font-bold text-slate-900">Future Disease Risk Trend</h2>
              <div className="mt-4 h-72">
                {stats.total > 0 ? (
                  <Line
                    data={futureLineData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>
            </section>

            <section className="surface-card mt-7 overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">Recent Predictions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Age</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Glucose</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cholesterol</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">BMI</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Current Prob.</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Future Prob.</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(0, 15).map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-6 py-3 text-sm text-slate-600">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-slate-700">{item.age}</td>
                        <td className="px-6 py-3 text-sm text-slate-700">{item.glucose}</td>
                        <td className="px-6 py-3 text-sm text-slate-700">{item.cholesterol}</td>
                        <td className="px-6 py-3 text-sm text-slate-700">{item.BMI}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">{(Number(item.probability) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-3 text-sm font-semibold text-indigo-700">
                          {(Number(item.future_probability) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-700">{calculateRiskScore(item).toFixed(1)}</td>
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
      </main>
    </div>
  );
}

function EmptyState() {
  return <div className="grid h-full place-items-center text-sm text-slate-400">No chart data available yet.</div>;
}
