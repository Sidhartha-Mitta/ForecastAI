import { motion } from 'framer-motion';
import { CloudSun, Droplets, Sparkles, Wind } from 'lucide-react';

const featurePills = [
  { label: 'Climate trend', icon: Wind },
  { label: 'Rainfall view', icon: Droplets },
  { label: 'AI insight', icon: Sparkles },
];

export default function WorkspaceShowcase() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-56 w-56 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#dbeafe_0%,#bfdbfe_34%,#e0f2fe_62%,#ffffff_100%)] shadow-[0_25px_60px_rgba(148,163,184,0.28)]"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-5 rounded-full border border-sky-200"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute inset-0 rounded-full border border-sky-100"
          />
          <div className="relative rounded-full bg-white p-7 text-sky-700 shadow-lg">
            <CloudSun className="h-16 w-16" />
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-900">Live prediction hub</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Use the planner to generate single-day, date-range, next-7-days, or full-year weather predictions and review them in one clean dashboard.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {featurePills.map(({ label, icon: Icon }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
