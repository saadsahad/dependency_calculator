import { useEffect } from "react";
import type { QuestionStep } from "@/data/questions";
import type { QuizAnswers } from "@/lib/quiz";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";

interface QuizStepProps {
  questionStep: QuestionStep;
  answers: QuizAnswers;
  onAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
}

export function QuizStep({ questionStep, answers, onAnswer }: QuizStepProps) {
  // Pre-fill fields like "Meta spend today" from an earlier answer (e.g. Q1)
  // the first time this step is shown, while keeping it editable.
  useEffect(() => {
    for (const field of questionStep.fields) {
      if (field.type === "currency" && field.prefillFrom && answers[field.key] === null) {
        const sourceValue = answers[field.prefillFrom];
        if (sourceValue !== null) {
          onAnswer(field.key, sourceValue);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStep.id]);

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">{questionStep.question}</h2>
      {questionStep.helper && <p className="mt-2 text-sm text-slate-400">{questionStep.helper}</p>}

      <div className="mt-8 space-y-5">
        {questionStep.fields.map((field) => {
          if (field.type === "boolean") {
            const selected = answers[field.key];
            return (
              <div key={field.key} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAnswer(field.key, true)}
                  className={`rounded-xl border px-5 py-4 text-left text-sm font-medium transition ${
                    selected === true
                      ? "border-accent bg-accent/10 text-white"
                      : "border-slate-700 bg-panel text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {field.yesLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer(field.key, false)}
                  className={`rounded-xl border px-5 py-4 text-left text-sm font-medium transition ${
                    selected === false
                      ? "border-accent bg-accent/10 text-white"
                      : "border-slate-700 bg-panel text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {field.noLabel}
                </button>
              </div>
            );
          }

          return (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">{field.label}</span>
              <div className="flex items-center rounded-xl border border-slate-700 bg-panel px-4 focus-within:border-accent">
                <span className="text-slate-500">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={formatCurrencyInput(answers[field.key])}
                  onChange={(e) => onAnswer(field.key, parseCurrencyInput(e.target.value))}
                  className="w-full bg-transparent px-2 py-3.5 text-lg text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
