import { format, getDay, parseISO } from "date-fns";

export function formatToDateOnly(date?: string | Date | null): string {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().split("T")[0];
}

interface KpiDataEntry {
  startDate: string;
  endDate: string;
  isHoliday?: boolean;
  isSkipDay?: boolean;
}

interface KpiHeader {
  label: string;
  year: string;
  data: object;
  isSunday?: boolean;
  isHoliday?: boolean;
  isSkipDay?: boolean;
}

export function getKpiHeadersFromData(
  data: KpiDataEntry[][],
  selectedPeriod: string,
): KpiHeader[] {
  if (!data || !data.length || !data[0].length) return [];

  return data[0].map((entry: KpiDataEntry): KpiHeader => {
    const start = parseISO(entry.startDate);
    const end = parseISO(entry.endDate);
    const year = format(start, "yyyy");

    switch (selectedPeriod.toUpperCase()) {
      case "YEARLY":
        return {
          label: `${format(start, "yyyy")}-${format(end, "yyyy")}`,
          year: "",
          data: entry,
        };
      case "HALFYEARLY":
        return {
          label: `${format(start, "MMM")}-${format(end, "MMM")}`,
          year,
          data: entry,
        };
      case "QUARTERLY":
        return {
          label: `${format(start, "MMM")}-${format(end, "MMM")}`,
          year,
          data: entry,
        };
      case "MONTHLY":
        return {
          label: format(start, "MMM"),
          year,
          data: entry,
        };
      case "WEEKLY":
        return {
          label: `${format(start, "dd MMM")}`,
          year: `${format(end, "dd MMM")}`,
          data: entry,
        };
      case "DAILY":
        return {
          label: format(start, "dd MMM"),
          year,
          data: entry,
          isSunday: getDay(start) === 0,
          isHoliday: entry.isHoliday,
          isSkipDay: entry.isSkipDay,
        };
      default:
        return {
          label: format(start, "dd MMM"),
          year,
          data: entry,
        };
    }
  });
}

export function isValidInput(
  validationType: string,
  inputValue: string,
  value1: string | number | null,
  value2?: string | number | null,
): boolean {
  const val = parseFloat(inputValue);
  const num1 = parseFloat(value1 as string);
  const num2 = value2 != null ? parseFloat(value2 as string) : undefined;

  if (isNaN(val)) return false;

  switch (validationType) {
    case "EQUAL_TO":
      return val === num1;
    case "GREATER_THAN":
      return val > num1;
    case "LESS_THAN":
      return val < num1;
    case "GREATER_THAN_OR_EQUAL_TO":
      return val >= num1;
    case "LESS_THAN_OR_EQUAL_TO":
      return val <= num1;
    case "BETWEEN":
      return val >= num1 && val <= (num2 ?? num1);
    case "YES_NO":
      return (val === 1 && value1 === "1") || (val === 0 && value1 === "0");
    default:
      return false;
  }
}

export function formatCompactNumber(input: string | number | null | undefined) {
  if (input === null || input === undefined || input === "") return "";
  const num = Number(input);
  if (isNaN(num)) return input.toString();
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatIndianSystem(
  input: string | number | null | undefined,
): string {
  if (input === null || input === undefined || input === "") return "";
  const num = Number(input);
  if (isNaN(num)) return input.toString();

  if (num === 0) return "0";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e7) {
    // 1 Crore
    return sign + (absNum / 1e7).toFixed(1).replace(/\.0$/, "") + "Cr";
  } else if (absNum >= 1e5) {
    // 1 Lakh
    return sign + (absNum / 1e5).toFixed(1).replace(/\.0$/, "") + "L";
  } else if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return num.toString();
  }
}

const colors = [
  "bg-red-200",
  "bg-red-300",
  "bg-red-200",
  "bg-green-200",
  "bg-green-300",
  "bg-green-200",
  "bg-blue-200",
  "bg-blue-300",
  "bg-blue-200",
  "bg-yellow-200",
  "bg-yellow-300",
  "bg-yellow-200",
  "bg-purple-200",
  "bg-purple-300",
  "bg-purple-200",
  "bg-pink-200",
  "bg-pink-300",
  "bg-pink-200",
  "bg-indigo-200",
  "bg-indigo-300",
  "bg-indigo-200",
  "bg-teal-200",
  "bg-teal-300",
  "bg-teal-200",
  "bg-orange-200",
  "bg-orange-300",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-cyan-300",
  "bg-cyan-200",
  "bg-lime-200",
  "bg-lime-300",
  "bg-lime-200",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-amber-300",
  "bg-amber-200",
  "bg-fuchsia-200",
  "bg-fuchsia-300",
  "bg-fuchsia-200",
  "bg-rose-200",
  "bg-rose-300",
  "bg-rose-200",
  "bg-sky-200",
  "bg-sky-300",
  "bg-sky-200",
  "bg-violet-200",
  "bg-violet-300",
];

export function getColorFromName(name?: string) {
  if (!name) return "bg-gray-200";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function formatTempValuesToPayload(
  tempValues: Record<string, { value: string; comment?: string }>,
) {
  return Object.entries(tempValues).map(([key, obj]) => {
    const [kpiId, startDate, endDate] = key.split("/");
    return {
      kpiId,
      startDate,
      endDate,
      data: obj.value,
      note: obj.comment || "",
    };
  });
}

export function formatTempValuesMeetingToPayload(
  tempValues: Record<string, string>,
  ioId: string,
  ioType: string,
  ioKPIId: string,
  meetingId: string,
  selectedIssueId: string,
) {
  const data = Object.entries(tempValues).map(([key, value]) => {
    const [kpiId, startDate, endDate] = key.split("/");
    return {
      kpiId,
      startDate,
      endDate,
      data: value,
    };
  });

  return {
    data,
    ioId,
    ioType,
    ioKPIId,
    meetingId,
    issueObjectiveId: selectedIssueId,
  };
}

export interface FormattedPeriodDate {
  label: string;
  year?: string;
}

export function formatPeriodDate(
  startDate: string | Date,
  endDate: string | Date,
  period: string,
): FormattedPeriodDate {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { label: String(startDate), year: String(endDate) };
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  switch (period.toUpperCase()) {
    case "YEARLY":
      return {
        label: `${format(start, "yyyy")}-${format(end, "yyyy")}`,
        year: "",
      };
    case "HALFYEARLY":
      return {
        label: `${monthNames[start.getMonth()]}-${monthNames[end.getMonth()]}`,
        year: start.getFullYear().toString(),
      };
    case "QUARTERLY":
      return {
        label: `${monthNames[start.getMonth()]}-${monthNames[end.getMonth()]}`,
        year: end.getFullYear().toString(),
      };
    case "MONTHLY":
      return {
        label: monthNames[start.getMonth()],
        year: start.getFullYear().toString(),
      };
    case "WEEKLY":
      return {
        label: `${start.getDate()} ${monthNames[start.getMonth()]}`,
        year: `${end.getDate()} ${monthNames[end.getMonth()]}`,
      };
    case "DAILY":
      return {
        label: `${start.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`,
      };
    default:
      return {
        label: `${start.getDate()} ${monthNames[start.getMonth()]}`,
        year: end.getFullYear().toString(),
      };
  }
}
