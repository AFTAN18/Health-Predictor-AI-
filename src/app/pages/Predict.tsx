import * as React from 'react';
import { useForm } from 'react-hook-form';
import { savePrediction } from '../lib/db';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Stethoscope, Loader2, Info, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

type PredictForm = {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  BMI: number;
  diabetes_pedigree: number;
  age: number;
};

export function Predict() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PredictForm>();
  
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ prediction: number, probability: number } | null>(null);

  const onSubmit = async (data: PredictForm) => {
    setLoading(true);
    setResult(null);

    // Simulate API Call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock heuristic for the sake of the frontend demo
    // High glucose, BMI, and age increase risk
    const score = (Number(data.glucose) * 0.4) + (Number(data.BMI) * 1.5) + (Number(data.age) * 0.8) + (Number(data.blood_pressure) * 0.2);
    const isHighRisk = score > 120;
    const probability = isHighRisk ? Math.min(0.99, 0.5 + (score - 120) * 0.01) : Math.max(0.01, 0.5 - (120 - score) * 0.01);
    
    const predictionResult = {
      prediction: isHighRisk ? 1 : 0,
      probability: Number(probability.toFixed(2))
    };

    setResult(predictionResult);

    // Save to local storage
    savePrediction({
      ...data,
      ...predictionResult,
    });

    setLoading(false);
  };

  const handleReset = () => {
    reset();
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Prediction</h1>
        <p className="text-slate-500 mt-1">Enter patient vitals to generate an AI risk assessment.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Patient Health Data</CardTitle>
              </div>
              <CardDescription>All fields are required for accurate analysis</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="e.g. 45"
                    {...register('age', { required: true, min: 1, max: 120 })} 
                  />
                  {errors.age && <span className="text-xs text-red-500">Valid age is required</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="glucose">Glucose Level</Label>
                  <Input 
                    id="glucose" 
                    type="number" 
                    placeholder="e.g. 110"
                    {...register('glucose', { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure (mm Hg)</Label>
                  <Input 
                    id="blood_pressure" 
                    type="number" 
                    placeholder="e.g. 80"
                    {...register('blood_pressure', { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="BMI">BMI</Label>
                  <Input 
                    id="BMI" 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 24.5"
                    {...register('BMI', { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pregnancies">Pregnancies (count)</Label>
                  <Input 
                    id="pregnancies" 
                    type="number" 
                    placeholder="e.g. 0"
                    {...register('pregnancies', { required: true, min: 0 })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insulin">Insulin (mu U/ml)</Label>
                  <Input 
                    id="insulin" 
                    type="number" 
                    placeholder="e.g. 85"
                    {...register('insulin', { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skin_thickness">Skin Thickness (mm)</Label>
                  <Input 
                    id="skin_thickness" 
                    type="number" 
                    placeholder="e.g. 20"
                    {...register('skin_thickness', { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diabetes_pedigree">Diabetes Pedigree</Label>
                  <Input 
                    id="diabetes_pedigree" 
                    type="number" 
                    step="0.001"
                    placeholder="e.g. 0.52"
                    {...register('diabetes_pedigree', { required: true })} 
                  />
                </div>

              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl py-4">
                <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                  Clear Data
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[140px]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Run Prediction
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          {!result && !loading && (
            <Card className="bg-blue-50/50 border-blue-100 h-full flex flex-col items-center justify-center text-center p-8">
              <Info className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">Awaiting Data</h3>
              <p className="text-sm text-blue-700/80">
                Fill out the patient form and run the prediction to view AI assessment results here.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin w-16 h-16 m-auto"></div>
                <div className="absolute inset-0 rounded-full border-2 border-slate-100 w-16 h-16 m-auto"></div>
                <Stethoscope className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="font-semibold text-slate-900">Processing Data</h3>
              <p className="text-sm text-slate-500 mt-2">Running random forest model...</p>
            </Card>
          )}

          {result && !loading && (
            <Card className={`h-full shadow-sm overflow-hidden ${result.prediction === 1 ? 'border-red-200' : 'border-emerald-200'}`}>
              <div className={`p-1 ${result.prediction === 1 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <CardContent className="pt-8 flex flex-col items-center text-center px-6 pb-8">
                {result.prediction === 1 ? (
                  <div className="mb-4 rounded-full bg-red-100 p-4 shadow-inner">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                ) : (
                  <div className="mb-4 rounded-full bg-emerald-100 p-4 shadow-inner">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold tracking-tight mb-2 ${result.prediction === 1 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {result.prediction === 1 ? 'High Risk Detected' : 'Low Risk Patient'}
                </h3>
                
                <p className="text-slate-600 text-sm mb-6">
                  The AI model indicates a {result.prediction === 1 ? 'high' : 'low'} probability of disease onset based on the provided vitals.
                </p>

                <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Risk Score</div>
                  <div className="text-4xl font-bold text-slate-900">
                    {(result.probability * 100).toFixed(1)}<span className="text-2xl text-slate-400">%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${result.prediction === 1 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${result.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
