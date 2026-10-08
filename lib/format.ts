export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatSigned(n: number): string {
  const v = Math.round(n * 100) / 100;
  return v > 0 ? `+${v}` : `${v}`;
}
