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
  confidence: "Low" | "Medium" | "High";
  probability: number;
  future_probability: number;
  diabetes_probability: number;
  heart_probability: number;
  risk_score: number;
  prediction: 0 | 1;
  ensemble_agreement: number;
  ensemble_total_models: number;
  uncertainty_message: string | null;
  key_risk_factors: string[];
  feature_importance: Array<{
    feature: string;
    contribution: number;
    model_importance: number;
  }>;
  ensemble_votes: Array<{
    model_name: string;
    prediction: 0 | 1;
    probability: number;
  }>;
  health_insights: string[];
  disclaimer: string;
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
