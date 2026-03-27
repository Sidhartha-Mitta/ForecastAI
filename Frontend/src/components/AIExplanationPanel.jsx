import { useEffect, useState } from 'react';
import { Lightbulb, LoaderCircle, Sprout, TrendingUp, TriangleAlert } from 'lucide-react';
import { getExplanation } from '../api/forecastApi';
import GlassCard from './GlassCard';

function buildSingleDayReason(day, city) {
  const spread = (day.temperature_max - day.temperature_min).toFixed(1);
  const rainText = day.rainfall > 5
    ? 'Rainfall is meaningful enough to influence soil moisture and outdoor timing.'
    : 'Rainfall stays light, so the day leans more on temperature than on wet weather.';

  return `${city} shows a ${day.trend.toLowerCase()} setup on ${day.date}, with a day-to-night temperature spread of ${spread} °C. ${rainText}`;
}

function formatRiskNote(alert) {
  return alert === 'Normal Conditions'
    ? 'No major alert stands out for this selected day.'
    : alert;
}

export default function AIExplanationPanel({ result }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (result.total_days === 1 && result.days?.[0]?.explanation) {
      const day = result.days[0];
      setDetails({
        summary: day.explanation,
        weather_reason: buildSingleDayReason(day, result.city),
        agricultural_assessment: day.advice,
        risk_note: formatRiskNote(day.alert),
      });
      setError('');
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadExplanation() {
      try {
        setIsLoading(true);
        const data = await getExplanation({
          city: result.city,
          mode: result.mode,
          startDate: result.start_date ?? result.startDate,
          endDate: result.end_date ?? result.endDate,
        });
        if (!cancelled) {
          setDetails(data);
          setError('');
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.detail ??
            requestError?.message ??
            'Unable to load explanation right now.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadExplanation();

    return () => {
      cancelled = true;
    };
  }, [result]);

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">AI Explanation</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">Why this prediction happened</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading explanation from backend...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm leading-7 text-rose-700">{error}</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="h-4 w-4 text-sky-700" />
              <span className="font-medium">Explanation</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{details?.summary}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{details?.weather_reason}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
              <span className="font-medium">Alert Summary</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{details?.risk_note}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
            <div className="flex items-center gap-2 text-slate-900">
              <Sprout className="h-4 w-4 text-emerald-700" />
              <span className="font-medium">Agricultural Impact</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{details?.agricultural_assessment}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
