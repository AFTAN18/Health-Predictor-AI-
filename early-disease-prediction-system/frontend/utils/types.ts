export interface PredictionPayload {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  BMI: number;
  diabetes_pedigree: number;
  age: number;
  cholesterol: number;
}

export interface PredictionResult {
  current_risk: "Low" | "Medium" | "High";
  future_risk: "Low" | "Medium" | "High";
  probability: number;
  future_probability: number;
  diabetes_probability: number;
  heart_probability: number;
  risk_score: number;
  key_risk_factors: string[];
  health_insights: string[];
}

export interface PredictionRecord {
  id: string;
  user_id: string;
  age: number;
  glucose: number;
  blood_pressure: number;
  cholesterol: number;
  BMI: number;
  prediction: 0 | 1;
  probability: number;
  future_probability: number;
  created_at: string;
}
