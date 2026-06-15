# Nativize — Meta Dependency Calculator

A self-serve quiz that gives DTC brands a "Meta Dependency Score" based on
their own spend and revenue numbers, gates the result behind a short lead
form, and stores every submission for follow-up.

This is **Tool 01** from the Nativize outreach strategy doc — the M1 opener.
It's built as its own standalone project (separate from `dc-automyz-advertai*`).

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind (`src/`)
- **Backend:** Express + better-sqlite3 (`server/`)
- **Shared:** scoring logic lives in `shared/scoring.ts` and is used by both
  the client (instant feedback) and the server (recomputes the score from
  submitted answers so it can't be tampered with client-side)

## Getting started

```bash
npm install
npm run dev
```

This runs the Vite dev server (http://localhost:5173) and the API server
(http://localhost:3001) together, with `/api/*` proxied from the frontend to
the backend. A SQLite database is created automatically at
`data/leads.sqlite` on first run.

## Production build

```bash
npm run build
npm start
```

`npm start` runs a single Express process that serves the built frontend
(`dist/client`) and the API (`/api/*`) from the same origin.

## The quiz, scoring, and copy

- Questions, intro copy, and result-band copy: `src/data/questions.ts` and
  `src/lib/scoring.ts` (`SCORE_BANDS`)
- Scoring algorithm: `shared/scoring.ts` — implements the brief's base score
  + adjustments, clamped to 18–97

### Assumptions made in the scoring logic

The brief's scoring adjustments reference two figures the six questions
don't collect directly. Both are documented inline in
`shared/scoring.ts`, and were chosen in the spirit of the brief's "ballpark
numbers are fine":

1. **"Google spend %"** — there's no dedicated Google-spend question.
   We treat *everything that isn't Meta spend* (total spend − Meta spend) as
   the Google share for this adjustment.
2. **"Email revenue as % of monthly revenue"** — the only other revenue
   figure collected is Q5 (monthly new-customer revenue), so email % is
   calculated against that.

If you'd rather collect these explicitly (e.g. add a "Google spend" question,
or a "total monthly revenue" question), update `QUESTIONS` in
`src/data/questions.ts`, the `DependencyInputs` type, and the two adjustments
in `shared/scoring.ts` accordingly.

## Lead capture & data

Leads are captured **after** the quiz, before the score is revealed (the
recommended flow for completion + lead quality). On submit, the full payload
(contact info + every answer + the computed score/breakdown) is POSTed to
`POST /api/leads` and recomputed/stored server-side in SQLite
(`leads` table, see `server/db.ts`).

To view captured leads:

1. Set `ADMIN_TOKEN` in `.env` (copy from `.env.example`)
2. `curl -H "Authorization: Bearer <token>" http://localhost:3001/api/leads`

## Before launch checklist

- [ ] Replace `SITE_CONFIG.bookingUrl` in `src/config.ts` with the real
      booking link for the "Book a working session" CTA.
- [ ] Confirm the scoring assumptions above match intent (see above).
- [ ] SQLite is fine for getting started, but doesn't work on serverless
      hosts (Vercel/Netlify) since the filesystem isn't persistent. If
      deploying there, swap `server/db.ts` for a hosted Postgres (e.g.
      Supabase) — the `insertLead`/`listLeads` interface is small and easy
      to re-implement against another driver.
- [ ] Consider rate-limiting `POST /api/leads` before sharing the link
      publicly/at scale.
- [ ] Wire up email delivery of results / CRM sync (e.g. Brevo, used in the
      Advert AI project) if you want leads to land somewhere besides this DB.
# Test_calculator
