import { twMerge } from 'tailwind-merge';

export default function GlassCard({ className, children }) {
  return (
    <div
      className={twMerge(
        'rounded-[28px] border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
