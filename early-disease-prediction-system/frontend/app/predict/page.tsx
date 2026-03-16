"use client";

import axios from "axios";
import React, { useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import PredictionForm from "@/components/PredictionForm";
import ResultCard from "@/components/ResultCard";
import { backendApiUrl } from "@/utils/config";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";
import { PredictionPayload, PredictionResult } from "@/utils/types";

export default function PredictPage() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [probability, setProbability] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (data: PredictionPayload) => {
    setIsLoading(true);
    setPrediction(null);
    setProbability(null);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Your session expired. Please login again.");
      }

      const response = await axios.post<PredictionResult>(`${backendApiUrl}/predict`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setPrediction(response.data.prediction);
      setProbability(response.data.risk_probability);
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
        <AuthGuard>
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
              <ResultCard prediction={prediction} probability={probability} />
            </div>
          </div>
        </AuthGuard>
      </main>
    </div>
  );
}
