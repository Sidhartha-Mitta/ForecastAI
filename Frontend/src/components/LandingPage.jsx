import { ArrowRight, BarChart3, CalendarRange, Sprout } from 'lucide-react';
import GlassCard from './GlassCard';

const features = [
  {
    title: 'Single-day weather prediction',
    text: 'Ask for one specific date and view max temperature, min temperature, rainfall, and guidance.',
    icon: CalendarRange,
  },
  {
    title: 'Range-based analysis',
    text: 'Compare weather behavior between two dates and review the output in a visual dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Agriculture-aware explanation',
    text: 'Open the AI explanation panel to understand what happened and whether it supports farm activity.',
    icon: Sprout,
  },
];

export default function LandingPage({ onStart }) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800">
            ML model + FastAPI backend + React frontend
          </span>
          <h2 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Weather prediction platform with date-based forecasting and agricultural insight.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            This project predicts weather for supported cities, lets users forecast one date, a custom date range,
            or the next 7 days, and then explains the result with clean visuals and agriculture-focused guidance.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-700"
          >
            Go to Predict Page
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <GlassCard className="p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-700/75">Project Summary</p>
          <div className="mt-5 space-y-4 text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Backend</p>
              <p className="mt-2 text-sm leading-7">FastAPI serves the trained ML model and returns weather explanation, alert, trend, advice, and forecast data.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Frontend</p>
              <p className="mt-2 text-sm leading-7">React renders a simple landing page, prediction planner, charts, tables, and the AI explanation panel.</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ title, text, icon: Icon }) => (
          <GlassCard key={title} className="p-6">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 w-fit">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-5 text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
          </GlassCard>
        ))}
      </section>
    </div>
  );
}
