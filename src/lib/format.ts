/** Strips everything except digits and a single decimal point, returns a number or null for empty input. */
export function parseCurrencyInput(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (cleaned === "") return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

/** Formats a number with thousand separators for display inside an input. */
export function formatCurrencyInput(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSigned(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}`;
}
