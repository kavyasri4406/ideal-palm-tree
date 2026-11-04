// Agmarknet reports arrival dates as dd/mm/yyyy and publishes late in the day,
// so mornings show the previous day's prices — label them plainly.
export function formatPriceDate(ddmmyyyy: string | null | undefined): string {
  if (!ddmmyyyy) return "";
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  if (!d || !m || !y) return ddmmyyyy;
  const reported = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - reported.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return `Yesterday (${ddmmyyyy})`;
  return `${ddmmyyyy} (${days} days ago)`;
}
