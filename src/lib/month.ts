export function parseMonth(month: string): { year: number; month: number } {
  const [year, m] = month.split("-").map(Number);
  return { year, month: m };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthRange(monthStr: string): { start: string; end: string } {
  const { year, month } = parseMonth(monthStr);
  const start = `${monthKey(year, month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${monthKey(nextYear, nextMonth)}-01`;
  return { start, end };
}

export function shiftMonth(monthStr: string, delta: number): string {
  const { year, month } = parseMonth(monthStr);
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return monthKey(newYear, newMonth);
}

export function monthLabel(monthStr: string): string {
  const { year, month } = parseMonth(monthStr);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-SG", { month: "long", year: "numeric" });
}

export function daysInMonth(monthStr: string): number {
  const { year, month } = parseMonth(monthStr);
  return new Date(year, month, 0).getDate();
}

export function currentMonthKey(): string {
  const now = new Date();
  return monthKey(now.getFullYear(), now.getMonth() + 1);
}
