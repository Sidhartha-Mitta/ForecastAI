import GlassCard from './GlassCard';

const toneStyles = {
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-rose-200 bg-rose-50',
};

export default function StatusBanner({ icon: Icon, title, message, tone = 'warning' }) {
  return (
    <GlassCard className={`p-4 ${toneStyles[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-2.5 shadow-sm">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>
      </div>
    </GlassCard>
  );
}
