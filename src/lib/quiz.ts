import type { DependencyInputs } from "./scoring";
import type { QuestionStep } from "@/data/questions";

export interface QuizAnswers {
  metaSpend: number | null;
  totalSpend: number | null;
  hasOtherChannel: boolean | null;
  emailRevenue: number | null;
  newCustomerRevenue: number | null;
  metaSpend12moAgo: number | null;
  metaSpendToday: number | null;
}

export const EMPTY_ANSWERS: QuizAnswers = {
  metaSpend: null,
  totalSpend: null,
  hasOtherChannel: null,
  emailRevenue: null,
  newCustomerRevenue: null,
  metaSpend12moAgo: null,
  metaSpendToday: null,
};

/** Returns an error message for the step, or null if it's ready to proceed. */
export function getStepError(step: QuestionStep, answers: QuizAnswers): string | null {
  for (const field of step.fields) {
    if (field.type === "boolean") {
      if (answers[field.key] === null) return "Pick one to continue.";
      continue;
    }

    const value = answers[field.key];
    if (value === null) return "Enter a number to continue (0 is fine).";
    if (value < 0) return "Enter a positive number.";
  }

  if (step.id === "totalSpend") {
    const meta = answers.metaSpend ?? 0;
    const total = answers.totalSpend ?? 0;
    if (total <= 0) return "Total spend needs to be greater than 0.";
    if (meta > total) return "Total spend should be at least your Meta spend.";
  }

  return null;
}

export interface LeadInfo {
  name: string;
  email: string;
  company: string;
  website: string;
}

export const EMPTY_LEAD: LeadInfo = {
  name: "",
  email: "",
  company: "",
  website: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message for the lead form, or null if it's ready to submit. */
export function getLeadError(lead: LeadInfo): string | null {
  if (!lead.name.trim()) return "Enter your name.";
  if (!lead.email.trim() || !EMAIL_PATTERN.test(lead.email.trim())) return "Enter a valid email.";
  if (!lead.company.trim()) return "Enter your company or brand name.";
  return null;
}

/** Converts validated quiz answers into the shape the scoring function expects. */
export function toDependencyInputs(answers: QuizAnswers): DependencyInputs {
  return {
    metaSpend: answers.metaSpend ?? 0,
    totalSpend: answers.totalSpend ?? 0,
    hasOtherChannel: answers.hasOtherChannel ?? false,
    emailRevenue: answers.emailRevenue ?? 0,
    newCustomerRevenue: answers.newCustomerRevenue ?? 0,
    metaSpend12moAgo: answers.metaSpend12moAgo ?? 0,
    metaSpendToday: answers.metaSpendToday ?? answers.metaSpend ?? 0,
  };
}
