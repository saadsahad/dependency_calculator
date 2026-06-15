import type { LeadInfo } from "./quiz";
import type { DependencyInputs, ScoreBreakdown } from "./scoring";

export interface LeadSubmissionPayload {
  lead: LeadInfo;
  answers: DependencyInputs;
  result: Pick<ScoreBreakdown, "score" | "baseScore" | "adjustments">;
}

export async function submitLead(payload: LeadSubmissionPayload): Promise<void> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Something went wrong saving your details. Please try again.");
  }
}
