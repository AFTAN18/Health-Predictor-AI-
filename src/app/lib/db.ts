export type PredictionData = {
  id: string;
  age: number;
  glucose: number;
  blood_pressure: number;
  BMI: number;
  pregnancies: number;
  insulin: number;
  skin_thickness: number;
  diabetes_pedigree: number;
  prediction: number;
  probability: number;
  created_at: string;
};

export const savePrediction = (prediction: Omit<PredictionData, 'id' | 'created_at'>) => {
  const existing = getPredictions();
  const newPrediction: PredictionData = {
    ...prediction,
    id: Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('predictions_default', JSON.stringify([...existing, newPrediction]));
  return newPrediction;
};

export const getPredictions = (): PredictionData[] => {
  const data = localStorage.getItem('predictions_default');
  return data ? JSON.parse(data) : [];
};
