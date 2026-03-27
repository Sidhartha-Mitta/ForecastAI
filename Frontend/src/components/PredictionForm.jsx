import { useMemo, useState } from 'react';
import { CalendarDays, CalendarRange, LoaderCircle, MapPinned, Sparkles, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateString, amount) {
  const value = new Date(dateString);
  value.setDate(value.getDate() + amount);
  return value.toISOString().slice(0, 10);
}

function formatRangeLabel(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function formatRangeHeadline(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function getRangePreview(startDate, endDate) {
  const totalDays = Math.max(Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1, 1);
  const points = Array.from({ length: Math.min(totalDays, 14) }, (_, index) => {
    const progress = totalDays === 1 ? 1 : index / Math.max(Math.min(totalDays, 14) - 1, 1);
    const wave = Math.sin(progress * Math.PI * 1.35) * 18;
    const drift = Math.cos(progress * Math.PI * 2.4) * 10;
    const height = 56 + wave + drift + progress * 18;
    return {
      date: addDays(startDate, Math.min(index, totalDays - 1)),
      value: Math.max(18, Math.min(92, Math.round(height))),
    };
  });

  return points;
}

function buildPreviewPath(points, width, height) {
  if (points.length === 1) {
    return `M ${width / 2} ${height / 2}`;
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const valueRange = Math.max(maxValue - minValue, 1);
  const stepX = width / (points.length - 1);

  return points
    .map((point, index) => {
      const x = stepX * index;
      const y = height - ((point.value - minValue) / valueRange) * (height - 16) - 8;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildPreviewArea(points, width, height) {
  if (points.length === 1) {
    return `M 0 ${height} L ${width / 2} ${height / 2} L ${width} ${height} Z`;
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const valueRange = Math.max(maxValue - minValue, 1);
  const stepX = width / (points.length - 1);
  const segments = points.map((point, index) => {
    const x = stepX * index;
    const y = height - ((point.value - minValue) / valueRange) * (height - 16) - 8;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return `M 0 ${height} L ${segments.join(' L ')} L ${width} ${height} Z`;
}

function getPreviewPoint(point, index, total, width, height, minValue, maxValue) {
  const valueRange = Math.max(maxValue - minValue, 1);
  const x = total === 1 ? width / 2 : (width / (total - 1)) * index;
  const y = height - ((point.value - minValue) / valueRange) * (height - 16) - 8;
  return { x, y };
}

function RangePresetButton({ label, days, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(days)}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
        isActive
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-white'
      }`}
    >
      {label}
    </button>
  );
}

export default function PredictionForm({ cities, forecastDays, isLoading, onSubmit }) {
  const [city, setCity] = useState(cities[0] ?? '');
  const [date, setDate] = useState(getDefaultDate);
  const [startDate, setStartDate] = useState(getDefaultDate);
  const [endDate, setEndDate] = useState(getDefaultDate);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState('single');
  const [hoveredPreviewIndex, setHoveredPreviewIndex] = useState(null);

  const modes = [
    { id: 'single', label: 'Single specific day' },
    { id: 'range', label: 'From date to date' },
    { id: 'next7', label: `Next ${forecastDays} days` },
    { id: 'year', label: 'Full year prediction' },
  ];

  const rangeDays = Math.max(Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1, 1);
  const rangePreview = useMemo(() => getRangePreview(startDate, endDate), [startDate, endDate]);
  const previewWidth = 640;
  const previewHeight = 180;
  const previewPath = useMemo(() => buildPreviewPath(rangePreview, previewWidth, previewHeight), [rangePreview]);
  const previewArea = useMemo(() => buildPreviewArea(rangePreview, previewWidth, previewHeight), [rangePreview]);
  const previewMax = Math.max(...rangePreview.map((point) => point.value), 1);
  const previewMin = Math.min(...rangePreview.map((point) => point.value), 0);
  const activePreviewIndex = hoveredPreviewIndex ?? rangePreview.length - 1;
  const activePreviewPoint = rangePreview[Math.max(activePreviewIndex, 0)] ?? rangePreview[0];
  const presets = [
    { label: '3 days', days: 3 },
    { label: '7 days', days: 7 },
    { label: '14 days', days: 14 },
    { label: '30 days', days: 30 },
  ];

  function applyRangePreset(days) {
    const nextEndDate = addDays(startDate, days - 1);
    setEndDate(nextEndDate);
  }

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
          <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#eaf6ff_42%,#eef2ff_100%)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-700/70">Range Planner</p>
                <h4 className="font-display mt-2 text-xl font-semibold text-slate-900">Build a forecast story across your selected window</h4>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Explore the selected date span on a visual timeline before you run the forecast.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {rangeDays} day{rangeDays > 1 ? 's' : ''} selected
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-white/70 bg-slate-950 p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Interactive preview</p>
                  <h5 className="mt-2 font-display text-2xl font-semibold">Date window pulse</h5>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                    Hover across the chart to inspect the span and tune the range before predicting.
                  </p>
                </div>
                <div className="grid gap-2 rounded-2xl bg-white/8 p-3 text-sm backdrop-blur">
                  <div className="text-slate-300">Focused checkpoint</div>
                  <div className="font-semibold text-white">{formatRangeHeadline(activePreviewPoint.date)}</div>
                  <div className="inline-flex items-center gap-2 text-sky-200">
                    <TrendingUp className="h-4 w-4" />
                    Forecast momentum preview {activePreviewPoint.value}%
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[640px]">
                  <svg viewBox={`0 0 ${previewWidth} ${previewHeight}`} className="h-52 w-full" role="img" aria-label="Selected date range timeline preview">
                    <defs>
                      <linearGradient id="rangePreviewArea" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="rangePreviewLine" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="50%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>

                    {[0.2, 0.45, 0.7, 0.9].map((ratio) => (
                      <line
                        key={ratio}
                        x1="0"
                        y1={previewHeight * ratio}
                        x2={previewWidth}
                        y2={previewHeight * ratio}
                        stroke="rgba(255,255,255,0.12)"
                        strokeDasharray="6 8"
                      />
                    ))}

                    <path d={previewArea} fill="url(#rangePreviewArea)" />
                    <path d={previewPath} fill="none" stroke="url(#rangePreviewLine)" strokeWidth="4" strokeLinecap="round" />

                    {rangePreview.map((point, index) => {
                      const previewPoint = getPreviewPoint(
                        point,
                        index,
                        rangePreview.length,
                        previewWidth,
                        previewHeight,
                        previewMin,
                        previewMax,
                      );
                      const isActive = index === activePreviewIndex;

                      return (
                        <g key={point.date}>
                          <circle
                            cx={previewPoint.x}
                            cy={previewPoint.y}
                            r={isActive ? 7 : 4}
                            fill={isActive ? '#ffffff' : '#7dd3fc'}
                            stroke={isActive ? '#38bdf8' : 'transparent'}
                            strokeWidth="3"
                          />
                          <rect
                            x={previewPoint.x - 18}
                            y="0"
                            width="36"
                            height={previewHeight}
                            fill="transparent"
                            onMouseEnter={() => setHoveredPreviewIndex(index)}
                            onFocus={() => setHoveredPreviewIndex(index)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300 sm:grid-cols-4 lg:grid-cols-7">
                    {rangePreview.map((point, index) => {
                      const isActive = index === activePreviewIndex;

                      return (
                        <button
                          key={point.date}
                          type="button"
                          onMouseEnter={() => setHoveredPreviewIndex(index)}
                          onFocus={() => setHoveredPreviewIndex(index)}
                          onClick={() => setHoveredPreviewIndex(index)}
                          className={`rounded-2xl border px-3 py-3 text-left transition ${
                            isActive
                              ? 'border-sky-300 bg-white/14 text-white'
                              : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold">{formatRangeLabel(point.date)}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sky-200/80">
                            Step {index + 1}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <RangePresetButton
                    key={preset.days}
                    label={preset.label}
                    days={preset.days}
                    isActive={rangeDays === preset.days}
                    onClick={applyRangePreset}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">From</span>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => {
                        const nextStartDate = event.target.value;
                        setStartDate(nextStartDate);
                        if (endDate < nextStartDate) {
                          setEndDate(nextStartDate);
                        }
                      }}
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

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[24px] bg-white/90 px-4 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-sky-100">
                  From
                  <div className="mt-1 font-display text-lg font-semibold text-slate-900">{formatRangeHeadline(startDate)}</div>
                </div>
                <div className="rounded-[24px] bg-white/90 px-4 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-sky-100">
                  To
                  <div className="mt-1 font-display text-lg font-semibold text-slate-900">{formatRangeHeadline(endDate)}</div>
                </div>
                <div className="rounded-[24px] bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-4 text-sm text-white shadow-sm">
                  Window
                  <div className="mt-1 font-display text-lg font-semibold">{rangeDays} day comparison</div>
                </div>
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
