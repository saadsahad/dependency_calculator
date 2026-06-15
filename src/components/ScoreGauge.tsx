import type { RiskLevel } from "@/lib/scoring";
import { SCORE_BANDS } from "@/lib/scoring";

const LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "#22C55E",
  medium: "#FACC15",
  high: "#FB923C",
  critical: "#EF4444",
};

const SCALE_MIN = SCORE_BANDS[0].min;
const SCALE_MAX = SCORE_BANDS[SCORE_BANDS.length - 1].max;

interface ScoreGaugeProps {
  score: number;
  level: RiskLevel;
}

export function ScoreGauge({ score, level }: ScoreGaugeProps) {
  const pct = ((score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const gradient = `linear-gradient(to right, ${LEVEL_COLORS.low}, ${LEVEL_COLORS.medium}, ${LEVEL_COLORS.high}, ${LEVEL_COLORS.critical})`;

  return (
    <div>
      <div className="relative h-3 w-full rounded-full" style={{ background: gradient }}>
        <div
          className="absolute -top-2.5 h-8 w-1.5 -translate-x-1/2 rounded-full bg-white ring-2 ring-ink"
          style={{ left: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-slate-500 sm:text-[11px]">
        {SCORE_BANDS.map((band) => (
          <span
            key={band.label}
            className={band.level === level ? "font-semibold text-slate-200" : undefined}
          >
            {band.label}
          </span>
        ))}
      </div>
    </div>
  );
}
