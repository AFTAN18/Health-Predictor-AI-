export interface PredictionPayload {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  BMI: number;
  diabetes_pedigree: number;
  age: number;
}

export interface PredictionResult {
  prediction: 0 | 1;
  risk_probability: number;
}

export interface PredictionRecord {
  id: string;
  user_id: string;
  age: number;
  glucose: number;
  blood_pressure: number;
  BMI: number;
  prediction: 0 | 1;
  probability: number;
  created_at: string;
}
