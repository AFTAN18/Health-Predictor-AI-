"use client";

import React, { useState } from "react";

import { PredictionPayload } from "@/utils/types";

interface PredictionFormProps {
  onSubmit: (data: PredictionPayload) => Promise<void>;
  isLoading: boolean;
}

export default function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionPayload>({
    pregnancies: 0,
    glucose: 100,
    blood_pressure: 70,
    skin_thickness: 20,
    insulin: 79,
    BMI: 25.0,
    diabetes_pedigree: 0.5,
    age: 30,
    cholesterol: 180,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parsedValue = Number(value);

    setValidationError(null);
    setFormData({
      ...formData,
      [name]: Number.isFinite(parsedValue) ? parsedValue : 0,
    });
  };

  const validate = (payload: PredictionPayload): string | null => {
    const ranges: Array<{ label: string; value: number; min: number; max: number }> = [
      { label: "Age", value: payload.age, min: 0, max: 120 },
      { label: "Glucose", value: payload.glucose, min: 50, max: 300 },
      { label: "Blood Pressure", value: payload.blood_pressure, min: 60, max: 200 },
      { label: "BMI", value: payload.BMI, min: 10, max: 60 },
      { label: "Pregnancies", value: payload.pregnancies, min: 0, max: 20 },
      { label: "Insulin", value: payload.insulin, min: 0, max: 900 },
      { label: "Skin Thickness", value: payload.skin_thickness, min: 0, max: 100 },
      { label: "Cholesterol", value: payload.cholesterol, min: 100, max: 400 },
    ];

    for (const field of ranges) {
      if (field.value < field.min || field.value > field.max) {
        return `${field.label} must be between ${field.min} and ${field.max}.`;
      }
    }

    if (payload.age < 10 && payload.pregnancies > 0) {
      return "Pregnancies must be 0 when age is below 10.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate(formData);
    if (error) {
      setValidationError(error);
      return;
    }

    await onSubmit(formData);
  };

  const fields = [
    { name: "age", label: "Age", step: "1", min: "0", max: "120" },
    { name: "glucose", label: "Glucose", step: "1", min: "50", max: "300" },
    { name: "blood_pressure", label: "Blood Pressure", step: "1", min: "60", max: "200" },
    { name: "BMI", label: "BMI", step: "0.1", min: "10", max: "60" },
    { name: "pregnancies", label: "Pregnancies", step: "1", min: "0", max: "20" },
    { name: "skin_thickness", label: "Skin Thickness", step: "1", min: "0", max: "100" },
    { name: "insulin", label: "Insulin", step: "1", min: "0", max: "900" },
    { name: "diabetes_pedigree", label: "Diabetes Pedigree", step: "0.01", min: "0", max: "3" },
    { name: "cholesterol", label: "Cholesterol", step: "1", min: "100", max: "400" },
  ];

  return (
    <form onSubmit={handleSubmit} className="surface-card flex h-full flex-col justify-between p-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Health Parameters</h2>
        <p className="mb-6 text-sm text-slate-500">Fill core health parameters for current and future risk estimation.</p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-slate-700">{field.label}</label>
              <input
                type="number"
                name={field.name}
                step={field.step}
                min={field.min}
                max={field.max}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
                required
              />
            </div>
          ))}
        </div>

        {validationError && <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">{validationError}</p>}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl py-3.5 text-base font-semibold text-white transition-all ${
            isLoading
              ? "cursor-not-allowed bg-brand-400"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Predict Disease Risk"
          )}
        </button>
      </div>
    </form>
  );
}
