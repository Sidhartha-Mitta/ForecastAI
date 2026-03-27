import { CalendarRange, MapPinned } from 'lucide-react';
import GlassCard from './GlassCard';

function modeLabel(mode) {
  if (mode === 'single') return 'Single specific day';
  if (mode === 'range') return 'From date to date';
  if (mode === 'year') return 'Full year prediction';
  return 'Next 7 days';
}

function getDateLabel(result) {
  const start = result.start_date ?? result.startDate;
  const end = result.end_date ?? result.endDate;

  if (start && end && start !== end) return `${start} to ${end}`;
  if (start) return start;
  if (end) return end;
  if (result.days?.length === 1) return result.days[0].date;
  if (result.days?.length) return `${result.days[0].date} to ${result.days[result.days.length - 1].date}`;
  return 'Forecast window ready';
}

export default function ResultsHero({ result }) {
  return (
    <GlassCard className="overflow-hidden p-6">
      <div className="rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_52%,#f0fdf4_100%)] p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Prediction Result</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">{modeLabel(result.mode)}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          A cleaner forecast summary with interactive temperature and rainfall views for the selected window.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm">
            <MapPinned className="h-4 w-4 text-sky-700" />
            {result.city}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm">
            <CalendarRange className="h-4 w-4 text-sky-700" />
            {getDateLabel(result)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
