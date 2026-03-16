"use client";

import React from "react";

interface ResultCardProps {
  prediction: number | null;
  probability: number | null;
}

export default function ResultCard({ prediction, probability }: ResultCardProps) {
  if (prediction === null || probability === null) {
    return (
      <div className="surface-card flex h-full min-h-[420px] flex-col items-center justify-center p-8">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <svg className="h-10 w-10 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-center text-xl font-semibold text-slate-500">
          Enter your details and submit the form to get your prediction.
        </h3>
      </div>
    );
  }

  const isHighRisk = prediction === 1;
  const percentage = (probability * 100).toFixed(1);

  return (
    <div
      className={`h-full rounded-2xl border p-8 transition-all ${
        isHighRisk ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div className="w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prediction Result</p>
        <h2 className={`mt-2 text-3xl font-extrabold tracking-tight ${isHighRisk ? "text-red-700" : "text-emerald-700"}`}>
          {isHighRisk ? "High Risk Detected" : "Low Risk Detected"}
        </h2>

        <div className="mb-7 mt-8 grid place-items-center">
          <div className="relative h-44 w-44">
            <svg className="h-full w-full -rotate-90 transform">
              <circle className="text-slate-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="88" cy="88" />
              <circle
                className={`${isHighRisk ? "text-red-500" : "text-emerald-500"} transition-all duration-1000 ease-in-out`}
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={440 - 440 * probability}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="88"
                cy="88"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${isHighRisk ? "text-red-600" : "text-emerald-600"}`}>{percentage}%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Probability</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 text-left ${isHighRisk ? "bg-red-100/70" : "bg-emerald-100/70"}`}>
          <h4 className={`mb-1.5 text-lg font-bold ${isHighRisk ? "text-red-800" : "text-emerald-800"}`}>What this means</h4>
          <p className={`text-sm leading-relaxed ${isHighRisk ? "text-red-700" : "text-emerald-700"}`}>
            {isHighRisk
              ? `The model estimates elevated disease risk (${percentage}%). Please consult a licensed medical professional for a clinical evaluation.`
              : `The model estimates lower disease risk (${percentage}%). Continue regular preventive care and healthy routines.`}
          </p>
        </div>
      </div>
    </div>
  );
}
