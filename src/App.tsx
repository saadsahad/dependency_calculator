import { useState } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { QuizStep } from "@/components/QuizStep";
import { ProgressBar } from "@/components/ProgressBar";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { ResultScreen } from "@/components/ResultScreen";
import { QUESTIONS, TOTAL_STEPS } from "@/data/questions";
import {
  EMPTY_ANSWERS,
  EMPTY_LEAD,
  getStepError,
  toDependencyInputs,
  type LeadInfo,
  type QuizAnswers,
} from "@/lib/quiz";
import { calculateDependencyScore, type ScoreBreakdown } from "@/lib/scoring";
import { submitLead } from "@/lib/api";
import { SITE_CONFIG } from "@/config";

type Phase = "intro" | "quiz" | "lead" | "result";

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [lead, setLead] = useState<LeadInfo>(EMPTY_LEAD);
  const [result, setResult] = useState<ScoreBreakdown | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[stepIndex];
  const stepError = getStepError(currentQuestion, answers);

  const handleAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (stepError) return;
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPhase("lead");
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      setPhase("intro");
    }
  };

  const handleLeadSubmit = async (leadInfo: LeadInfo) => {
    setLead(leadInfo);
    setSubmitting(true);
    setSubmitError(null);

    const inputs = toDependencyInputs(answers);
    const breakdown = calculateDependencyScore(inputs);

    try {
      await submitLead({ lead: leadInfo, answers: inputs, result: breakdown });
    } catch (err) {
      // Don't block the lead magnet on a storage failure - they still get
      // their score. Log it so we can investigate why a submission was lost.
      console.error("Failed to save lead", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
      setResult(breakdown);
      setPhase("result");
    }
  };

  const handleRestart = () => {
    setPhase("intro");
    setStepIndex(0);
    setAnswers(EMPTY_ANSWERS);
    setLead(EMPTY_LEAD);
    setResult(null);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-slate-800/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-200">
            {SITE_CONFIG.brandName}
          </span>
          <span className="text-xs text-slate-500">Meta Dependency Calculator</span>
        </div>
      </header>

      <main className="px-6 py-12 sm:py-16">
        {phase === "intro" && <IntroScreen onStart={() => setPhase("quiz")} />}

        {phase === "quiz" && (
          <div className="mx-auto max-w-xl">
            <ProgressBar current={stepIndex + 1} total={TOTAL_STEPS} />
            <div className="mt-8">
              <QuizStep questionStep={currentQuestion} answers={answers} onAnswer={handleAnswer} />
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <button type="button" onClick={goBack} className="text-sm text-slate-400 hover:text-slate-200">
                &larr; Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!!stepError}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stepIndex < QUESTIONS.length - 1 ? "Next" : "See my score"}
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {phase === "lead" && (
          <div className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="mb-4 text-sm text-slate-400 hover:text-slate-200"
            >
              &larr; Back to questions
            </button>
            <LeadCaptureForm onSubmit={handleLeadSubmit} submitting={submitting} submitError={submitError} />
          </div>
        )}

        {phase === "result" && result && (
          <ResultScreen result={result} name={lead.name} onRestart={handleRestart} />
        )}
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE_CONFIG.brandName}. Your numbers stay private.
      </footer>
    </div>
  );
}
