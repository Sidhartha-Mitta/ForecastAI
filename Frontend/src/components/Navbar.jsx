import { CloudSun, Download, Smartphone } from 'lucide-react';

export default function Navbar({ appName, page, onNavigate, canInstall, isInstalled, isIosInstallHint, onInstall }) {
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

          {canInstall ? (
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          ) : null}

          {!canInstall && !isInstalled && isIosInstallHint ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
              <Smartphone className="h-4 w-4" />
              Add to Home Screen on Safari
            </div>
          ) : null}

          {isInstalled ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <Smartphone className="h-4 w-4" />
              Web app installed
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
