/** Indian digit grouping: 1001 → "1,001", 250000 → "2,50,000". */
export function formatRupees(n: number): string {
  const s = String(Math.max(0, Math.floor(n)));
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
}
