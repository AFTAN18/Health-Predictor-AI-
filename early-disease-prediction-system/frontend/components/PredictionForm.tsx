"use client";
import React, { useState } from 'react';

interface PredictionFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    pregnancies: 0,
    glucose: 100,
    blood_pressure: 70,
    skin_thickness: 20,
    insulin: 79,
    BMI: 25.0,
    diabetes_pedigree: 0.5,
    age: 30
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const fields = [
    { name: 'age', label: 'Age', step: '1', min: '0' },
    { name: 'glucose', label: 'Glucose Level', step: '1', min: '0' },
    { name: 'blood_pressure', label: 'Blood Pressure (mm Hg)', step: '1', min: '0' },
    { name: 'BMI', label: 'BMI', step: '0.1', min: '0' },
    { name: 'pregnancies', label: 'Number of Pregnancies (if applicable)', step: '1', min: '0' },
    { name: 'skin_thickness', label: 'Skin Thickness (mm)', step: '1', min: '0' },
    { name: 'insulin', label: 'Insulin (mu U/ml)', step: '1', min: '0' },
    { name: 'diabetes_pedigree', label: 'Diabetes Pedigree Function', step: '0.01', min: '0' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Health Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <input
                type="number"
                name={field.name}
                step={field.step}
                min={field.min}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-lg font-semibold text-white transition-all shadow-md ${
            isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : 'Predict Disease Risk'}
        </button>
      </div>
    </form>
  );
}
