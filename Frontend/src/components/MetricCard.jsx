import GlassCard from './GlassCard';

export default function MetricCard({ icon: Icon, label, value, unit, accent }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="font-display text-3xl font-semibold text-slate-900">{value}</p>
            <p className="pb-1 text-sm text-slate-500">{unit}</p>
          </div>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5 text-slate-900" />
        </div>
      </div>
    </GlassCard>
  );
}
