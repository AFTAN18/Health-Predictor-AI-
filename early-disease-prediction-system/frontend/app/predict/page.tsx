"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PredictionForm from '@/components/PredictionForm';
import ResultCard from '@/components/ResultCard';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function PredictPage() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [probability, setProbability] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Authentication removed for this MVP version

  const handlePredict = async (data: any) => {
    setIsLoading(true);
    setPrediction(null);
    setProbability(null);
    
    try {
      // Allow overriding API url using env variable, fallback to localhost
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${backendUrl}/predict`, data);
      
      setPrediction(response.data.prediction);
      setProbability(response.data.risk_probability);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      alert("Failed to connect to the prediction server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center py-10">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[600px] h-full">
            <div className="flex-1 flex flex-col h-full rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
            </div>
            <div className="flex-1 h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 transform lg:scale-[1.02]">
              <ResultCard prediction={prediction} probability={probability} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
