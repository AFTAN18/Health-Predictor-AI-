import * as React from 'react';
import { useNavigate } from 'react-router';
import { getPredictions, PredictionData } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Activity, Plus, History, PieChart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

export function Dashboard() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = React.useState<PredictionData[]>([]);

  React.useEffect(() => {
    const data = getPredictions();
    setPredictions(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  const highRiskCount = predictions.filter(p => p.prediction === 1).length;
  const lowRiskCount = predictions.filter(p => p.prediction === 0).length;

  const chartData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#3b82f6' },
    { name: 'High Risk', value: highRiskCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your patient predictions and analytics.</p>
        </div>
        <Button onClick={() => navigate('/predict')} className="gap-2 shadow-sm">
          <Plus size={16} />
          New Prediction
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Predictions</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictions.length}</div>
            <p className="text-xs text-slate-500 mt-1">Lifetime assessments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">High Risk Identified</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highRiskCount}</div>
            <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low Risk Cases</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{lowRiskCount}</div>
            <p className="text-xs text-slate-500 mt-1">Normal baseline observed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Breakdown of AI predictions between low and high risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {predictions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Latest assessments ran by the model</CardDescription>
              </div>
              <History className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {predictions.length > 0 ? (
              <div className="space-y-4">
                {predictions.slice(0, 5).map((pred) => (
                  <div key={pred.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Patient Age: {pred.age}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-sm text-slate-500">{format(new Date(pred.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        BMI: {pred.BMI} | Gluc: {pred.glucose}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      pred.prediction === 1 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {pred.prediction === 1 ? 'High Risk' : 'Low Risk'}
                      <span className="ml-1 opacity-70">{(pred.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p>Run your first prediction to see history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
