import { useEffect, useState } from 'react';
import { Lightbulb, LoaderCircle, MessageSquareQuote, Sprout, TrendingUp, TriangleAlert, Workflow } from 'lucide-react';
import { getExplanation } from '../api/forecastApi';
import GlassCard from './GlassCard';

function buildSingleDayReason(day, city) {
  const spread = (day.temperature_max - day.temperature_min).toFixed(1);
  const rainText = day.rainfall > 5
    ? 'Rainfall is meaningful enough to influence soil moisture and outdoor timing.'
    : 'Rainfall stays light, so the day leans more on temperature than on wet weather.';

  return `${city} shows a ${day.trend.toLowerCase()} setup on ${day.date}, with a day-to-night temperature spread of ${spread} °C. ${rainText}`;
}

function buildSingleDayPattern(day) {
  const spread = day.temperature_max - day.temperature_min;

  if (day.rainfall >= 8) {
    return `The strongest signal is moisture, with ${day.rainfall.toFixed(1)} mm of rainfall making wet conditions a key part of the day rather than a minor detail.`;
  }

  if (day.temperature_max >= 35) {
    return `The strongest signal is daytime heat, because the temperature climbs to ${day.temperature_max.toFixed(1)} °C and pushes the forecast toward a hotter afternoon profile.`;
  }

  return `The forecast stays fairly balanced, but the ${spread.toFixed(1)} °C spread between minimum and maximum temperature still means the day can feel noticeably different from morning to afternoon.`;
}

function buildSingleDayGuidance(day) {
  if (day.rainfall >= 8) {
    return 'If you are planning travel, outdoor work, or field activity, it makes sense to leave room for wet ground, delayed movement, and changing surface conditions.';
  }

  if (day.temperature_max >= 35) {
    return 'The safer operating window is earlier in the day, with the afternoon better treated as a higher-heat period for people, crops, and any exposed activity.';
  }

  return 'This day looks easier to plan around, so the main focus is simple timing rather than major weather disruption.';
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
        pattern_breakdown: buildSingleDayPattern(day),
        operational_guidance: buildSingleDayGuidance(day),
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
        <div className="mt-6 space-y-4">
          <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <MessageSquareQuote className="h-4 w-4 text-sky-700" />
              <span className="font-medium">AI Weather Brief</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{details?.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900">
                <TrendingUp className="h-4 w-4 text-sky-700" />
                <span className="font-medium">Why These Numbers Matter</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{details?.weather_reason}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Workflow className="h-4 w-4 text-indigo-700" />
                <span className="font-medium">Pattern Breakdown</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{details?.pattern_breakdown}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="font-medium">AI Planning Guidance</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{details?.operational_guidance}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-900">
                <TriangleAlert className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Alert Summary</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{details?.risk_note}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
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
