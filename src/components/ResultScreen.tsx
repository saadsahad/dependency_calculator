import type { ScoreBreakdown } from "@/lib/scoring";
import { formatSigned } from "@/lib/format";
import { ScoreGauge } from "./ScoreGauge";
import { SITE_CONFIG } from "@/config";

interface ResultScreenProps {
  result: ScoreBreakdown;
  name: string;
  onRestart: () => void;
}

export function ResultScreen({ result, name, onRestart }: ResultScreenProps) {
  const { score, baseScore, adjustments, band } = result;
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-slate-400">Hey {firstName}, here's where you stand.</p>

      <div className="mt-4 flex items-end gap-4">
        <span className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">{score}%</span>
        <span className="pb-2 text-lg font-semibold text-slate-300">Meta Dependency Score</span>
      </div>

      <div className="mt-6">
        <ScoreGauge score={score} level={band.level} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-700 bg-panel p-6">
        <h3 className="text-xl font-bold text-white">{band.headline}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{band.description}</p>
      </div>

      <details className="mt-6 rounded-2xl border border-slate-800 bg-panel/50 p-6">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">
          How we calculated this
        </summary>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <div className="flex justify-between">
            <span>Meta as a share of total paid spend</span>
            <span className="font-mono text-slate-200">{baseScore.toFixed(1)}%</span>
          </div>
          {adjustments.map((adj) => (
            <div key={adj.label} className="flex justify-between gap-4">
              <span>{adj.label}</span>
              <span className="font-mono text-slate-200">{formatSigned(adj.value)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-slate-700 pt-2 font-semibold text-slate-100">
            <span>Meta Dependency Score</span>
            <span className="font-mono">{score}%</span>
          </div>
        </div>
      </details>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center">
        <p className="text-base font-semibold text-white">
          Want a plan to bring this number down?
        </p>
        <p className="mt-2 text-sm text-slate-300">
          We run a paid working session for DTC brands: your numbers in, a written diversification
          plan out. $500, fully refunded if it's not useful.
        </p>
        <a
          href={SITE_CONFIG.bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90"
        >
          Book a working session
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 w-full text-center text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
      >
        Run the calculator again
      </button>
    </div>
  );
}
