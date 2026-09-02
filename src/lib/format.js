export function parseDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(date);
}

export function formatDate(date) {
  const d = parseDate(date);
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(date);
}

export function dateValue(date) {
  const d = parseDate(date);
  return d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
}

