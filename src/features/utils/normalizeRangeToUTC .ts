import { DateRange } from "react-day-picker";

export function normalizeRangeToUTC(range?: DateRange): DateRange | undefined {
  if (!range?.from) return range;

  const from = new Date(range.from);
  from.setHours(0, 0, 0, 0); // IST 00:00

  let to: Date | undefined = undefined;
  if (range.to) {
    to = new Date(range.to);
    to.setHours(23, 59, 59, 999); // IST 23:59
  }

  return { from, to };
}
