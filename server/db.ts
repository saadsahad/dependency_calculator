import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_PATH ?? path.join(DATA_DIR, "leads.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    website TEXT,
    meta_spend REAL NOT NULL,
    total_spend REAL NOT NULL,
    has_other_channel INTEGER NOT NULL,
    email_revenue REAL NOT NULL,
    new_customer_revenue REAL NOT NULL,
    meta_spend_12mo_ago REAL NOT NULL,
    meta_spend_today REAL NOT NULL,
    score INTEGER NOT NULL,
    base_score REAL NOT NULL,
    band_label TEXT NOT NULL,
    adjustments_json TEXT NOT NULL
  );
`);

export interface LeadRecord {
  name: string;
  email: string;
  company: string;
  website: string;
  metaSpend: number;
  totalSpend: number;
  hasOtherChannel: boolean;
  emailRevenue: number;
  newCustomerRevenue: number;
  metaSpend12moAgo: number;
  metaSpendToday: number;
  score: number;
  baseScore: number;
  bandLabel: string;
  adjustments: { label: string; value: number }[];
}

const insertStatement = db.prepare(`
  INSERT INTO leads (
    name, email, company, website,
    meta_spend, total_spend, has_other_channel,
    email_revenue, new_customer_revenue,
    meta_spend_12mo_ago, meta_spend_today,
    score, base_score, band_label, adjustments_json
  ) VALUES (
    @name, @email, @company, @website,
    @metaSpend, @totalSpend, @hasOtherChannel,
    @emailRevenue, @newCustomerRevenue,
    @metaSpend12moAgo, @metaSpendToday,
    @score, @baseScore, @bandLabel, @adjustmentsJson
  )
`);

export function insertLead(record: LeadRecord): number {
  const result = insertStatement.run({
    ...record,
    website: record.website ?? "",
    hasOtherChannel: record.hasOtherChannel ? 1 : 0,
    adjustmentsJson: JSON.stringify(record.adjustments),
  });
  return Number(result.lastInsertRowid);
}

export function listLeads() {
  return db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
}
