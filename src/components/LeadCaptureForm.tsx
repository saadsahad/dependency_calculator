import { useState } from "react";
import type { LeadInfo } from "@/lib/quiz";
import { getLeadError } from "@/lib/quiz";

interface LeadCaptureFormProps {
  onSubmit: (lead: LeadInfo) => void;
  submitting: boolean;
  submitError: string | null;
}

export function LeadCaptureForm({ onSubmit, submitting, submitError }: LeadCaptureFormProps) {
  const [lead, setLead] = useState<LeadInfo>({ name: "", email: "", company: "", website: "" });
  const [touched, setTouched] = useState(false);

  const error = getLeadError(lead);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    onSubmit(lead);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-panel px-4 py-3.5 text-base text-white placeholder:text-slate-600 focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">Where should we send your results?</h2>
      <p className="mt-2 text-sm text-slate-400">
        Your Meta Dependency Score is ready. Pop in your details and we'll unlock it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Full name</span>
          <input
            type="text"
            value={lead.name}
            onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
            placeholder="Jordan Smith"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Work email</span>
          <input
            type="email"
            value={lead.email}
            onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
            placeholder="jordan@brand.com"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Company / brand name</span>
          <input
            type="text"
            value={lead.company}
            onChange={(e) => setLead((l) => ({ ...l, company: e.target.value }))}
            placeholder="Acme Apparel"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">
            Website <span className="text-slate-500">(optional)</span>
          </span>
          <input
            type="text"
            value={lead.website}
            onChange={(e) => setLead((l) => ({ ...l, website: e.target.value }))}
            placeholder="acmeapparel.com"
            className={inputClass}
          />
        </label>

        {touched && error && <p className="text-sm text-red-400">{error}</p>}
        {submitError && <p className="text-sm text-red-400">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Calculating..." : "Show my score"}
          {!submitting && <span aria-hidden="true">&rarr;</span>}
        </button>

        <p className="text-center text-xs text-slate-500">
          We'll only use this to send you your results and relevant follow-up. No spam.
        </p>
      </form>
    </div>
  );
}
