import { CloudRain, Flame, Snowflake, Waves } from 'lucide-react';
import MetricCard from './MetricCard';

export default function SummaryStats({ result }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Average Max" value={result.average_max.toFixed(1)} unit="°C" icon={Flame} accent="bg-orange-100" />
      <MetricCard label="Average Min" value={result.average_min.toFixed(1)} unit="°C" icon={Snowflake} accent="bg-sky-100" />
      <MetricCard label="Total Rainfall" value={result.rainfall_total.toFixed(1)} unit="mm" icon={CloudRain} accent="bg-cyan-100" />
      <MetricCard label="Analysed Days" value={String(result.total_days)} unit="days" icon={Waves} accent="bg-emerald-100" />
    </div>
  );
}
