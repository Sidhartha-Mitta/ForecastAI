import { useMemo, useState } from 'react';
import { CloudDrizzle, ThermometerSun } from 'lucide-react';
import GlassCard from './GlassCard';

function StatPill({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatShortDate(dateString) {
  return dateString.slice(5);
}

function getSummary(days) {
  const hottest = days.reduce((best, day) => (day.temperature_max > best.temperature_max ? day : best), days[0]);
  const coolest = days.reduce((best, day) => (day.temperature_min < best.temperature_min ? day : best), days[0]);
  const wettest = days.reduce((best, day) => (day.rainfall > best.rainfall ? day : best), days[0]);

  return { hottest, coolest, wettest };
}

function buildLinePath(values, width, height, minValue, maxValue) {
  if (values.length === 1) {
    return `M ${width / 2} ${height / 2}`;
  }

  const valueRange = Math.max(maxValue - minValue, 1);
  const stepX = width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = stepX * index;
      const y = height - ((value - minValue) / valueRange) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(values, width, height, minValue, maxValue) {
  if (values.length === 1) {
    const y = height / 2;
    return `M 0 ${height} L ${width / 2} ${y} L ${width} ${height} Z`;
  }

  const valueRange = Math.max(maxValue - minValue, 1);
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = stepX * index;
    const y = height - ((value - minValue) / valueRange) * height;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return `M 0 ${height} L ${points.join(' L ')} L ${width} ${height} Z`;
}

function getPointPosition(value, index, count, width, height, minValue, maxValue) {
  const valueRange = Math.max(maxValue - minValue, 1);
  const x = count === 1 ? width / 2 : (width / (count - 1)) * index;
  const y = height - ((value - minValue) / valueRange) * height;
  return { x, y };
}

function SingleDayWeatherCard({ day }) {
  const rainPercent = Math.min((day.rainfall / 20) * 100, 100);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Selected Day</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h4 className="font-display text-3xl font-semibold text-slate-900">{day.date}</h4>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              One-day detail with a clear temperature spread and rainfall intensity snapshot.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-sky-800 shadow-sm">
            {day.alert}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatPill label="Max Temp" value={`${day.temperature_max.toFixed(1)} °C`} tone="border-sky-200 bg-sky-50" />
          <StatPill label="Min Temp" value={`${day.temperature_min.toFixed(1)} °C`} tone="border-emerald-200 bg-emerald-50" />
          <StatPill label="Rainfall" value={`${day.rainfall.toFixed(1)} mm`} tone="border-slate-200 bg-slate-50" />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Intensity View</p>

        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Daily temperature band</span>
              <span>{(day.temperature_max - day.temperature_min).toFixed(1)} °C spread</span>
            </div>
            <div className="mt-3 rounded-full bg-slate-100 p-1">
              <div className="flex items-center justify-between rounded-full bg-[linear-gradient(90deg,#0ea5e9_0%,#22c55e_100%)] px-4 py-3 text-sm font-medium text-white">
                <span>{day.temperature_min.toFixed(1)} °C</span>
                <span>{day.temperature_max.toFixed(1)} °C</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Rainfall level</span>
              <span>{day.rainfall.toFixed(1)} mm</span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#c7d2fe_0%,#818cf8_100%)] transition"
                style={{ width: `${Math.max(rainPercent, day.rainfall > 0 ? 8 : 0)}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{day.advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RainfallBars({ days, activeIndex, onSelect }) {
  const maxRain = Math.max(...days.map((day) => day.rainfall), 1);
  const needsScroll = days.length > 8;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Rainfall</p>
          <h4 className="font-display mt-2 text-2xl font-semibold text-slate-900">Daily rainfall intensity</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {needsScroll ? (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Scroll horizontally to view all days
            </span>
          ) : null}
          <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            Peak {maxRain.toFixed(1)} mm
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-3">
        <div className={`flex h-72 items-end gap-4 ${needsScroll ? 'min-w-max pr-4' : ''}`}>
        {days.map((day, index) => {
          const height = Math.max((day.rainfall / maxRain) * 180, day.rainfall > 0 ? 12 : 4);
          const isActive = activeIndex === index;

          return (
            <button
              key={day.date}
              type="button"
              onMouseEnter={() => onSelect(index)}
              onFocus={() => onSelect(index)}
              onClick={() => onSelect(index)}
              className={`flex flex-col items-center justify-end gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                needsScroll ? 'min-w-[96px]' : 'min-w-[80px] flex-1'
              }`}
            >
              <div className={`rounded-full px-3 py-1 text-sm font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {day.rainfall.toFixed(1)} mm
              </div>
              <div className="flex h-44 items-end">
                <div
                  className={`w-10 rounded-t-[18px] shadow-sm transition-all ${
                    isActive
                      ? 'bg-[linear-gradient(180deg,#4f46e5_0%,#a5b4fc_100%)]'
                      : 'bg-[linear-gradient(180deg,#818cf8_0%,#c7d2fe_100%)]'
                  }`}
                  style={{ height }}
                  title={`${day.date}: ${day.rainfall.toFixed(1)} mm`}
              />
            </div>
              <div className={`text-center text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{formatShortDate(day.date)}</div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function TemperatureTrend({ days, activeIndex, onSelect }) {
  const needsScroll = days.length > 8;
  const chartWidth = Math.max(860, days.length * 92);
  const chartHeight = 240;
  const maxTemp = Math.max(...days.map((day) => day.temperature_max));
  const minTemp = Math.min(...days.map((day) => day.temperature_min));
  const paddedMin = Math.floor(minTemp - 2);
  const paddedMax = Math.ceil(maxTemp + 2);
  const lineMinPath = useMemo(
    () => buildLinePath(days.map((day) => day.temperature_min), chartWidth, chartHeight, paddedMin, paddedMax),
    [chartWidth, days, paddedMax, paddedMin],
  );
  const lineMaxPath = useMemo(
    () => buildLinePath(days.map((day) => day.temperature_max), chartWidth, chartHeight, paddedMin, paddedMax),
    [chartWidth, days, paddedMax, paddedMin],
  );
  const areaPath = useMemo(
    () => buildAreaPath(days.map((day) => (day.temperature_max + day.temperature_min) / 2), chartWidth, chartHeight, paddedMin, paddedMax),
    [chartWidth, days, paddedMax, paddedMin],
  );
  const gridValues = Array.from({ length: 5 }, (_, index) => paddedMin + ((paddedMax - paddedMin) / 4) * index).reverse();
  const activeDay = days[activeIndex] ?? days[0];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Temperature</p>
          <h4 className="font-display mt-2 text-2xl font-semibold text-slate-900">Interactive max/min temperature trend</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {needsScroll ? (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Scroll horizontally to view all days
            </span>
          ) : null}
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Focused Day</div>
            <div className="mt-2 font-semibold text-slate-900">{activeDay.date}</div>
            <div className="mt-1 text-sm text-slate-600">
              {activeDay.temperature_min.toFixed(1)} °C to {activeDay.temperature_max.toFixed(1)} °C
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[72px_1fr]">
        <div className="hidden justify-between text-sm font-medium text-slate-500 lg:flex lg:flex-col">
          {gridValues.map((value) => (
            <span key={value}>{value.toFixed(0)}°</span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="rounded-[24px] border border-sky-100 bg-white/90 p-4" style={{ minWidth: `${chartWidth}px` }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 w-full" role="img" aria-label="Temperature chart">
              <defs>
                <linearGradient id="tempArea" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="maxLine" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="minLine" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {gridValues.map((value) => {
                const y = getPointPosition(value, 0, 1, chartWidth, chartHeight, paddedMin, paddedMax).y;
                return <line key={value} x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e2e8f0" strokeDasharray="6 8" />;
              })}

              <path d={areaPath} fill="url(#tempArea)" />
              <path d={lineMaxPath} fill="none" stroke="url(#maxLine)" strokeWidth="4" strokeLinecap="round" />
              <path d={lineMinPath} fill="none" stroke="url(#minLine)" strokeWidth="4" strokeLinecap="round" />

              {days.map((day, index) => {
                const maxPoint = getPointPosition(day.temperature_max, index, days.length, chartWidth, chartHeight, paddedMin, paddedMax);
                const minPoint = getPointPosition(day.temperature_min, index, days.length, chartWidth, chartHeight, paddedMin, paddedMax);
                const isActive = index === activeIndex;

                return (
                  <g key={day.date}>
                    <line
                      x1={maxPoint.x}
                      y1={maxPoint.y}
                      x2={minPoint.x}
                      y2={minPoint.y}
                      stroke={isActive ? '#0f172a' : '#cbd5e1'}
                      strokeWidth={isActive ? 3 : 2}
                      opacity={0.55}
                    />
                    <circle cx={maxPoint.x} cy={maxPoint.y} r={isActive ? 7 : 5} fill="#f97316" stroke="#fff" strokeWidth="3" />
                    <circle cx={minPoint.x} cy={minPoint.y} r={isActive ? 7 : 5} fill="#0ea5e9" stroke="#fff" strokeWidth="3" />
                  </g>
                );
              })}
            </svg>

            <div className="mt-5 flex gap-3">
              {days.map((day, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onMouseEnter={() => onSelect(index)}
                    onFocus={() => onSelect(index)}
                    onClick={() => onSelect(index)}
                    className={`min-w-[96px] rounded-2xl border px-3 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                      isActive ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
                    }`}
                  >
                    <div className="font-medium">{formatShortDate(day.date)}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{day.temperature_max.toFixed(0)}° / {day.temperature_min.toFixed(0)}°</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-orange-700">
          <ThermometerSun className="h-4 w-4" />
          Max trend line
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sky-700">
          <CloudDrizzle className="h-4 w-4" />
          Min trend line
        </span>
      </div>
    </div>
  );
}

function ForecastCards({ days, activeIndex, onSelect }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Daily Outlook</p>
          <h4 className="font-display mt-2 text-2xl font-semibold text-slate-900">Forecast cards</h4>
        </div>
        <div className="text-sm text-slate-500">Hover or tap a day to sync the charts.</div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={day.date}
              type="button"
              onMouseEnter={() => onSelect(index)}
              onFocus={() => onSelect(index)}
              onClick={() => onSelect(index)}
              className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                isActive
                  ? 'border-sky-300 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-sky-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{formatShortDate(day.date)}</div>
                  <div className="mt-2 font-display text-2xl font-semibold text-slate-900">{day.temperature_max.toFixed(1)} °C</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  {day.rainfall.toFixed(1)} mm
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-600">Low {day.temperature_min.toFixed(1)} °C</div>
              <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">{day.alert}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveDayDetails({ day }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
      <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Selected Forecast</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-2xl font-semibold text-slate-900">{day.date}</h4>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{day.advice}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{day.alert}</div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-orange-700/80">Maximum</div>
          <div className="mt-2 font-display text-3xl font-semibold text-slate-900">{day.temperature_max.toFixed(1)} °C</div>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-sky-700/80">Minimum</div>
          <div className="mt-2 font-display text-3xl font-semibold text-slate-900">{day.temperature_min.toFixed(1)} °C</div>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-indigo-700/80">Rainfall</div>
          <div className="mt-2 font-display text-3xl font-semibold text-slate-900">{day.rainfall.toFixed(1)} mm</div>
        </div>
      </div>
    </div>
  );
}

function MultiDayWeatherBoard({ days }) {
  const { hottest, coolest, wettest } = getSummary(days);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = days[activeIndex] ?? days[0];
  const isLongRange = days.length > 8;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatPill
          label="Hottest Day"
          value={`${formatShortDate(hottest.date)} · ${hottest.temperature_max.toFixed(1)} °C`}
          tone="border-orange-200 bg-orange-100"
        />
        <StatPill
          label="Coolest Night"
          value={`${formatShortDate(coolest.date)} · ${coolest.temperature_min.toFixed(1)} °C`}
          tone="border-sky-200 bg-sky-100"
        />
        <StatPill
          label="Wettest Day"
          value={`${formatShortDate(wettest.date)} · ${wettest.rainfall.toFixed(1)} mm`}
          tone="border-cyan-200 bg-cyan-100"
        />
      </div>

      {isLongRange ? (
        <div className="space-y-4">
          <TemperatureTrend days={days} activeIndex={activeIndex} onSelect={setActiveIndex} />
          <RainfallBars days={days} activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <TemperatureTrend days={days} activeIndex={activeIndex} onSelect={setActiveIndex} />
          <RainfallBars days={days} activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>
      )}

      <ActiveDayDetails day={activeDay} />
      <ForecastCards days={days} activeIndex={activeIndex} onSelect={setActiveIndex} />
    </div>
  );
}

export default function WeatherChart({ days }) {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Visual Representation</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
            {days.length === 1 ? 'Single-day weather snapshot' : 'Multi-day forecast dashboard'}
          </h3>
        </div>
        {days.length > 1 ? (
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {days.length} forecast day{days.length > 1 ? 's' : ''}
          </div>
        ) : null}
      </div>

      {days.length === 1 ? <SingleDayWeatherCard day={days[0]} /> : <MultiDayWeatherBoard days={days} />}
    </GlassCard>
  );
}
