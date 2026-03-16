"use client";

import { PredictionResult as PredictionResultData } from "@/utils/types";

import RiskChart from "./RiskChart";

interface PredictionResultProps {
  result: PredictionResultData | null;
}

function riskPillClass(risk: "Low" | "Medium" | "High"): string {
  if (risk === "Low") return "bg-emerald-100 text-emerald-700";
  if (risk === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function confidencePillClass(confidence: "Low" | "Medium" | "High"): string {
  if (confidence === "High") return "bg-emerald-100 text-emerald-700";
  if (confidence === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export default function PredictionResult({ result }: PredictionResultProps) {
  if (!result) {
    return (
      <div className="surface-card flex min-h-[620px] items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-700">Prediction Result</p>
          <p className="mt-2 text-sm text-slate-500">Submit your health parameters to see real-time and future disease risk.</p>
        </div>
      </div>
    );
  }

  const overallScore = Math.max(0, Math.min(100, result.risk_score));

  return (
    <div className="surface-card min-h-[620px] space-y-5 p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Current Risk</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(result.current_risk)}`}>
              {result.current_risk}
            </span>
            <span className="text-sm font-semibold text-slate-700">{(result.probability * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Future Risk (5 Years)</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(result.future_risk)}`}>
              {result.future_risk}
            </span>
            <span className="text-sm font-semibold text-slate-700">{(result.future_probability * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Confidence</p>
          <div className="mt-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidencePillClass(result.confidence)}`}>
              {result.confidence}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Ensemble Agreement</p>
          <p className="mt-2 text-base font-bold text-slate-800">
            {result.ensemble_agreement} / {result.ensemble_total_models} models
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Predicted Class</p>
          <p className="mt-2 text-base font-bold text-slate-800">{result.prediction === 1 ? "At Risk" : "Lower Risk"}</p>
        </div>
      </div>

      {result.uncertainty_message && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {result.uncertainty_message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Health Score Gauge</p>
          <span className="text-sm font-bold text-brand-700">{overallScore.toFixed(1)} / 100</span>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${overallScore}%` }} />
        </div>
      </div>

      <RiskChart
        diabetesProbability={result.diabetes_probability}
        heartProbability={result.heart_probability}
        currentProbability={result.probability}
        futureProbability={result.future_probability}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">Top Risk Factors</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {result.key_risk_factors.map((factor) => (
              <li key={factor} className="rounded-lg bg-slate-50 px-3 py-2">
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">Feature Importance (XAI)</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {result.feature_importance.slice(0, 4).map((item) => (
              <li key={item.feature} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-700">{item.feature}</span>
                <span className="ml-2 text-xs text-slate-500">Impact {item.contribution.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Health Insights</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {result.health_insights.slice(0, 5).map((insight) => (
            <li key={insight} className="rounded-lg bg-slate-50 px-3 py-2">
              {insight}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{result.disclaimer}</div>
    </div>
  );
}
