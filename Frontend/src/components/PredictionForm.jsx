import { useState } from 'react';
import { CalendarDays, CalendarRange, LoaderCircle, MapPinned, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function PredictionForm({ cities, forecastDays, isLoading, onSubmit }) {
  const [city, setCity] = useState(cities[0] ?? '');
  const [date, setDate] = useState(getDefaultDate);
  const [startDate, setStartDate] = useState(getDefaultDate);
  const [endDate, setEndDate] = useState(getDefaultDate);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState('single');

  const modes = [
    { id: 'single', label: 'Single specific day' },
    { id: 'range', label: 'From date to date' },
    { id: 'next7', label: `Next ${forecastDays} days` },
    { id: 'year', label: 'Full year prediction' },
  ];

  const rangeDays = Math.max(Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1, 1);

  function handleSubmit(event) {
    event.preventDefault();

    if (mode === 'single') {
      onSubmit({ mode, city, date });
      return;
    }

    if (mode === 'range') {
      const daySpan = Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
      if (endDate < startDate) {
        onSubmit({ mode: 'validation_error', message: 'The end date must be on or after the start date.' });
        return;
      }
      if (daySpan > 31) {
        onSubmit({ mode: 'validation_error', message: 'Range prediction supports up to 31 days. Use full year prediction for longer periods.' });
        return;
      }
      onSubmit({ mode, city, startDate, endDate });
      return;
    }

    if (mode === 'year') {
      onSubmit({ mode, city, date: String(year) });
      return;
    }

    onSubmit({ mode, city, date });
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Predict Page</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">Choose prediction type</h3>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800">FastAPI connected</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-3">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                mode === item.id ? 'border-sky-600 bg-sky-50 text-sky-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">City</span>
          <div className="relative">
            <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-12 py-4 text-slate-900 outline-none focus:border-sky-500"
            >
              {cities.map((supportedCity) => (
                <option key={supportedCity} value={supportedCity}>
                  {supportedCity}
                </option>
              ))}
            </select>
          </div>
        </label>

        {mode === 'single' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Specific day</span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-slate-900 outline-none focus:border-sky-500"
              />
            </div>
          </label>
        ) : null}

        {mode === 'range' ? (
          <div className="rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-700/70">Range Planner</p>
                <h4 className="font-display mt-2 text-xl font-semibold text-slate-900">Select a clean forecast window</h4>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {rangeDays} day{rangeDays > 1 ? 's' : ''} selected
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">From</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-sky-100 bg-white px-12 py-4 text-slate-900 outline-none focus:border-sky-500"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">To</span>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-sky-100 bg-white px-12 py-4 text-slate-900 outline-none focus:border-sky-500"
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
                Start
                <div className="mt-1 font-semibold text-slate-900">{startDate}</div>
              </div>
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
                End
                <div className="mt-1 font-semibold text-slate-900">{endDate}</div>
              </div>
              <div className="rounded-2xl bg-sky-600 px-4 py-3 text-sm text-white shadow-sm">
                Window
                <div className="mt-1 font-semibold">{rangeDays} day comparison</div>
              </div>
            </div>
          </div>
        ) : null}

        {mode === 'year' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Year</span>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none focus:border-sky-500"
            />
          </label>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {mode === 'range'
            ? 'Range mode supports up to 31 days for a readable, faster comparison view.'
            : mode === 'year'
              ? 'Full-year prediction can take a little longer because every day is aggregated.'
              : 'Choose a city and run the forecast to update the interactive dashboard.'}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-600 px-5 py-4 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-75"
        >
          {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
          {isLoading ? 'Generating prediction...' : 'Predict Weather'}
        </button>
      </form>
    </GlassCard>
  );
}
