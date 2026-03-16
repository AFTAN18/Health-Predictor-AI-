"use client";

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

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

interface RiskChartProps {
  diabetesProbability: number;
  heartProbability: number;
  currentProbability: number;
  futureProbability: number;
}

export default function RiskChart({
  diabetesProbability,
  heartProbability,
  currentProbability,
  futureProbability,
}: RiskChartProps) {
  const comparisonData = {
    labels: ["Current Risk", "Future Risk (5y)"],
    datasets: [
      {
        label: "Overall Probability (%)",
        data: [currentProbability * 100, futureProbability * 100],
        backgroundColor: ["#3b82f6", "#1d4ed8"],
        borderRadius: 8,
      },
    ],
  };

  const diseaseData = {
    labels: ["Diabetes", "Heart Disease"],
    datasets: [
      {
        data: [diabetesProbability * 100, heartProbability * 100],
        backgroundColor: ["#2563eb", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-700">Risk Trend</h4>
        <div className="mt-3 h-48">
          <Bar
            data={comparisonData}
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
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-700">Disease Probability Mix</h4>
        <div className="mt-3 h-48">
          <Doughnut data={diseaseData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}
