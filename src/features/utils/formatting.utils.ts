export function formatToDateOnly(date?: string | Date | null): string {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().split("T")[0];
}
