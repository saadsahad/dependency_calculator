import { INTRO_COPY } from "@/data/questions";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        {INTRO_COPY.eyebrow}
      </span>

      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {INTRO_COPY.title}
      </h1>

      <div className="mt-6 space-y-4 text-left text-base leading-relaxed text-slate-300">
        {INTRO_COPY.paragraphs.map((paragraph, i) => (
          <p key={i} className={i === 1 ? "font-medium text-slate-100" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 sm:w-auto sm:px-10"
      >
        {INTRO_COPY.cta}
        <span aria-hidden="true">&rarr;</span>
      </button>

      <p className="mt-4 text-xs text-slate-500">Takes about 2 minutes. Six questions, ballpark numbers are fine.</p>
    </div>
  );
}
