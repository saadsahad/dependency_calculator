export const INTRO_COPY = {
  eyebrow: "Free 2-minute assessment",
  title: "Meta Dependency Calculator",
  paragraphs: [
    "Most DTC brands know Meta is their biggest channel. Very few know exactly how exposed they are if it breaks.",
    "This calculator takes your actual spend numbers and gives you a single honest figure: your Meta dependency score.",
    "It's a number that accounts for what you'd lose tomorrow if Meta went down, how fast it would hit you, and whether you have anything to absorb it - not just your spend split.",
    "Close estimates are fine. You don't need exact figures - ballpark numbers give you a result that's accurate enough to be useful.",
  ],
  cta: "Start the calculator",
};

export type CurrencyFieldKey =
  | "metaSpend"
  | "totalSpend"
  | "emailRevenue"
  | "newCustomerRevenue"
  | "metaSpend12moAgo"
  | "metaSpendToday";

export interface CurrencyField {
  type: "currency";
  key: CurrencyFieldKey;
  label: string;
  placeholder: string;
  /** If set, this field is pre-filled with the value of another currency field but remains editable. */
  prefillFrom?: CurrencyFieldKey;
}

export interface BooleanField {
  type: "boolean";
  key: "hasOtherChannel";
  yesLabel: string;
  noLabel: string;
}

export type QuestionField = CurrencyField | BooleanField;

export interface QuestionStep {
  id: string;
  step: number;
  question: string;
  helper?: string;
  fields: QuestionField[];
}

export const QUESTIONS: QuestionStep[] = [
  {
    id: "metaSpend",
    step: 1,
    question: "What's your monthly Meta ad spend?",
    helper: "Your average monthly spend on Facebook & Instagram ads.",
    fields: [
      {
        type: "currency",
        key: "metaSpend",
        label: "Monthly Meta ad spend",
        placeholder: "e.g. 80,000",
      },
    ],
  },
  {
    id: "totalSpend",
    step: 2,
    question: "What's your total monthly paid ad spend across all channels?",
    helper: "Meta + Google + TikTok + anything else you run.",
    fields: [
      {
        type: "currency",
        key: "totalSpend",
        label: "Total monthly paid spend",
        placeholder: "e.g. 100,000",
      },
    ],
  },
  {
    id: "hasOtherChannel",
    step: 3,
    question: "Do you have any active paid channel outside Meta and Google right now?",
    helper: "Think TikTok, native, programmatic, podcasts, influencer/affiliate spend, etc.",
    fields: [
      {
        type: "boolean",
        key: "hasOtherChannel",
        yesLabel: "Yes, we run something else too",
        noLabel: "No, it's just Meta and Google",
      },
    ],
  },
  {
    id: "emailRevenue",
    step: 4,
    question: "What's your monthly revenue from email?",
    helper: "Revenue attributed to email/SMS campaigns and flows.",
    fields: [
      {
        type: "currency",
        key: "emailRevenue",
        label: "Monthly email revenue",
        placeholder: "e.g. 40,000",
      },
    ],
  },
  {
    id: "newCustomerRevenue",
    step: 5,
    question: "What's your monthly new customer revenue?",
    helper: "Revenue from first-time buyers in a typical month.",
    fields: [
      {
        type: "currency",
        key: "newCustomerRevenue",
        label: "Monthly new customer revenue",
        placeholder: "e.g. 250,000",
      },
    ],
  },
  {
    id: "metaTrend",
    step: 6,
    question: "What did you spend on Meta 12 months ago vs. today?",
    helper: "Close estimates are fine - this just shows us your trend.",
    fields: [
      {
        type: "currency",
        key: "metaSpend12moAgo",
        label: "Meta spend, 12 months ago",
        placeholder: "e.g. 55,000",
      },
      {
        type: "currency",
        key: "metaSpendToday",
        label: "Meta spend, today",
        placeholder: "e.g. 80,000",
        prefillFrom: "metaSpend",
      },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;
