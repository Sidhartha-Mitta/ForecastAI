import { useState } from 'react';
import AIExplanationPanel from './AIExplanationPanel';
import ResultsHero from './ResultsHero';
import SummaryStats from './SummaryStats';
import WeatherChart from './WeatherChart';

export default function ResultsPage({ result }) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="space-y-6">
      <ResultsHero result={result} />
      <SummaryStats result={result} />
      <WeatherChart days={result.days} />

      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setShowExplanation((value) => !value)}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {showExplanation ? 'Hide AI Explanation' : 'Open AI Explanation'}
        </button>
      </div>

      {showExplanation ? <AIExplanationPanel result={result} /> : null}
    </div>
  );
}
