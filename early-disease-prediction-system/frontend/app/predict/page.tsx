"use client";

import axios from "axios";
import React, { useState } from "react";

import Navbar from "@/components/Navbar";
import PredictionForm from "@/components/PredictionForm";
import PredictionResultCard from "@/components/PredictionResult";
import { backendApiUrl } from "@/utils/config";
import { PredictionPayload, PredictionResult as PredictionResultType } from "@/utils/types";

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (data: PredictionPayload) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post<PredictionResultType>(`${backendApiUrl}/predict`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setResult(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        setError(detail || "Prediction request failed.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Prediction request failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Prediction</h1>
          <p className="mt-2 text-sm text-slate-600">
            Submit clinical features to receive a model-driven disease risk probability.
          </p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid min-h-[600px] grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="h-full">
            <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
          </div>
          <div className="h-full">
            <PredictionResultCard result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
