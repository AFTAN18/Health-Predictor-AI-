import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              AI-powered preventive healthcare
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Predict Real-Time Disease Risk,
              <span className="block text-brand-700">See 5-Year Forecasts Instantly</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              MediPredict AI uses trained ML models to estimate disease risk from core health parameters. Log in,
              run predictions, and monitor risk trends in one dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/predict"
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Start prediction
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="surface-card grid content-between gap-5 p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MVP Features</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="rounded-lg bg-slate-50 px-3 py-2">Instant guest prediction flow (no login required)</li>
                <li className="rounded-lg bg-slate-50 px-3 py-2">Strict medical-range validation and anomaly checks</li>
                <li className="rounded-lg bg-slate-50 px-3 py-2">Ensemble-validated prediction confidence across ML models</li>
                <li className="rounded-lg bg-slate-50 px-3 py-2">Dashboard trends for future disease risk</li>
              </ul>
            </div>
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
              This tool provides risk estimation only and is not a medical diagnosis. Always consult a healthcare professional.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
