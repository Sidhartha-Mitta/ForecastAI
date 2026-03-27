import { CloudSun } from 'lucide-react';

export default function Navbar({ appName, page, onNavigate }) {
  return (
    <nav className="sticky top-0 z-20 mb-8 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-700/70">Weather Forecast Project</p>
            <h1 className="font-display text-lg font-semibold text-slate-900">{appName}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              page === 'home' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Landing Page
          </button>
          <button
            type="button"
            onClick={() => onNavigate('predict')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              page === 'predict' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
            }`}
          >
            Predict Weather
          </button>
        </div>
      </div>
    </nav>
  );
}
