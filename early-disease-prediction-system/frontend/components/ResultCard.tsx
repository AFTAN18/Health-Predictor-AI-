"use client";
import React from 'react';

interface ResultCardProps {
  prediction: number | null;
  probability: number | null;
}

export default function ResultCard({ prediction, probability }: ResultCardProps) {
  if (prediction === null || probability === null) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-500 text-center">Enter your details and click predict to see your health risk assessment.</h3>
      </div>
    );
  }

  const isHighRisk = prediction === 1;
  const percentage = (probability * 100).toFixed(1);

  return (
    <div className={`p-8 rounded-2xl shadow-lg border h-full flex flex-col items-center justify-center transition-all ${
      isHighRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="text-center w-full">
        <h2 className={`text-3xl font-extrabold mb-8 drop-shadow-sm tracking-tight ${isHighRisk ? 'text-red-700' : 'text-green-700'}`}>
          {isHighRisk ? 'High Risk Detected' : 'Low Risk Detected'}
        </h2>
        
        <div className="relative inline-block mb-8">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              className="text-gray-200"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="96"
              cy="96"
            />
            <circle
              className={`${isHighRisk ? 'text-red-500' : 'text-green-500'} transition-all duration-1000 ease-in-out drop-shadow-md`}
              strokeWidth="12"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * probability)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="96"
              cy="96"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className={`text-4xl font-black ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>{percentage}%</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Probability</span>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isHighRisk ? 'bg-red-100/50' : 'bg-green-100/50'} text-left backdrop-blur-sm`}>
          <h4 className={`text-lg font-bold mb-2 ${isHighRisk ? 'text-red-800' : 'text-green-800'}`}>What this means:</h4>
          <p className={`text-sm ${isHighRisk ? 'text-red-700' : 'text-green-700'} leading-relaxed`}>
            {isHighRisk 
              ? `Our AI model indicates a high probability (${percentage}%) of early disease onset based on your current health parameters. Please consult with a healthcare professional to review these results.` 
              : `Great news! Our AI model indicates a low probability (${percentage}%) of early disease onset based on your current health parameters. Continue maintaining a healthy lifestyle.`}
          </p>
        </div>
      </div>
    </div>
  );
}
