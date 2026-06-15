import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { calculateDependencyScore, type DependencyInputs } from "../shared/scoring";
import { insertLead, listLeads } from "./db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMERIC_FIELDS: (keyof DependencyInputs)[] = [
  "metaSpend",
  "totalSpend",
  "emailRevenue",
  "newCustomerRevenue",
  "metaSpend12moAgo",
  "metaSpendToday",
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateLeadPayload(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const { lead, answers } = body as Record<string, unknown>;

  if (!lead || typeof lead !== "object") return "Missing lead details.";
  const { name, email, company, website } = lead as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return "Missing name.";
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) return "Invalid email.";
  if (typeof company !== "string" || !company.trim()) return "Missing company.";
  if (website !== undefined && typeof website !== "string") return "Invalid website.";

  if (!answers || typeof answers !== "object") return "Missing answers.";
  const a = answers as Record<string, unknown>;
  for (const field of NUMERIC_FIELDS) {
    if (!isFiniteNumber(a[field]) || (a[field] as number) < 0) return `Invalid value for ${field}.`;
  }
  if (typeof a.hasOtherChannel !== "boolean") return "Invalid value for hasOtherChannel.";
  if ((a.totalSpend as number) <= 0) return "Total spend must be greater than 0.";

  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/leads", (req, res) => {
  const error = validateLeadPayload(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { lead, answers } = req.body as { lead: Record<string, string>; answers: DependencyInputs };

  // Recompute the score server-side rather than trusting the client value.
  const result = calculateDependencyScore(answers);

  const id = insertLead({
    name: lead.name.trim(),
    email: lead.email.trim().toLowerCase(),
    company: lead.company.trim(),
    website: (lead.website ?? "").trim(),
    metaSpend: answers.metaSpend,
    totalSpend: answers.totalSpend,
    hasOtherChannel: answers.hasOtherChannel,
    emailRevenue: answers.emailRevenue,
    newCustomerRevenue: answers.newCustomerRevenue,
    metaSpend12moAgo: answers.metaSpend12moAgo,
    metaSpendToday: answers.metaSpendToday,
    score: result.score,
    baseScore: result.baseScore,
    bandLabel: result.band.label,
    adjustments: result.adjustments,
  });

  res.status(201).json({ id, score: result.score, band: result.band.label });
});

// Simple admin endpoint for viewing captured leads. Requires ADMIN_TOKEN to
// be set and matched via `Authorization: Bearer <token>`.
app.get("/api/leads", (req, res) => {
  if (!ADMIN_TOKEN) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  res.json(listLeads());
});

if (process.env.NODE_ENV === "production") {
  const clientDir = path.resolve(__dirname, "../client");
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
