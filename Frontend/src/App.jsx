import { startTransition, useEffect, useState } from 'react';
import { ServerCrash } from 'lucide-react';
import { getMeta, getPlannerPrediction } from './api/forecastApi';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import PredictionForm from './components/PredictionForm';
import ResultsPage from './components/ResultsPage';
import StatusBanner from './components/StatusBanner';
import WorkspaceShowcase from './components/WorkspaceShowcase';

const FALLBACK_META = {
  app_name: 'Forecast AI',
  supported_cities: ['Chennai', 'Delhi', 'Hyderabad', 'Lucknow', 'Kolkata'],
  forecast_days: 7,
};

function App() {
  const [meta, setMeta] = useState(FALLBACK_META);
  const [page, setPage] = useState('home');
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const result = await getMeta();
        if (!cancelled) {
          setMeta(result);
          setMetaError('');
        }
      } catch {
        if (!cancelled) {
          setMeta(FALLBACK_META);
          setMetaError('Using local defaults because the backend metadata endpoint is unavailable.');
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePredict(payload) {
    if (payload.mode === 'validation_error') {
      setError(payload.message);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await getPlannerPrediction(payload);
      startTransition(() => {
        setForecast(result);
      });
    } catch (requestError) {
      const detail =
        requestError?.response?.data?.detail ??
        requestError?.message ??
        'Unable to fetch prediction. Make sure the FastAPI backend is running on port 8000.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  }

  function openPredictPage() {
    setPage('predict');
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Navbar appName={meta.app_name} page={page} onNavigate={setPage} />

        <main className="flex-1 py-4">
          {page === 'home' ? (
            <LandingPage onStart={openPredictPage} />
          ) : (
            <div className="space-y-6">
              <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6">
                  <PredictionForm
                    cities={meta.supported_cities}
                    forecastDays={meta.forecast_days}
                    isLoading={isLoading}
                    onSubmit={handlePredict}
                  />

                  {metaError ? (
                    <StatusBanner
                      icon={ServerCrash}
                      title="Metadata fallback active"
                      tone="warning"
                      message={metaError}
                    />
                  ) : null}

                  {error ? (
                    <StatusBanner
                      icon={ServerCrash}
                      title="Prediction request failed"
                      tone="danger"
                      message={error}
                    />
                  ) : null}
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Predict Workspace</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">Generate and inspect forecast results</h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Choose a forecast mode, run the prediction, and inspect a cleaner dashboard with interactive temperature and rainfall views.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">Single day for exact weather insight</div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">Date range for a focused comparison window</div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">Next 7 days for quick planning</div>
                  </div>
                  <WorkspaceShowcase />
                </div>
              </section>

              {forecast ? (
                <ResultsPage result={forecast} />
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                  Prediction results will appear here after you run the forecast.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
