import GlassCard from './GlassCard';

export default function DailyPredictionTable({ days }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-sky-700/70">Prediction Table</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">Compact daily data</h3>
          </div>
          <div className="text-sm text-slate-500">Scroll horizontally on smaller screens.</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Max</th>
              <th className="px-6 py-4">Min</th>
              <th className="px-6 py-4">Rainfall</th>
              <th className="px-6 py-4">Alert</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
              <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="px-6 py-5 font-medium text-slate-900">{day.date}</td>
                <td className="px-6 py-5">{day.temperature_max.toFixed(1)} °C</td>
                <td className="px-6 py-5">{day.temperature_min.toFixed(1)} °C</td>
                <td className="px-6 py-5">{day.rainfall.toFixed(1)} mm</td>
                <td className="px-6 py-5">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {day.alert}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
