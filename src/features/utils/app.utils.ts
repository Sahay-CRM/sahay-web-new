import { toast } from "sonner";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isSmallScreen(): boolean {
  return window?.innerWidth < 768;
}

export function formatTime(ms: number) {
  const sign = ms < 0 ? "-" : "";
  ms = Math.abs(ms);
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${sign}${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatFrequencyType(value: string) {
  if (!value) return value;

  if (value === "HALFYEARLY") {
    return "Half-Yearly";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function notifyMessage(
  message: string,
  type: "error" | "warn" | "success" = "error",
): void {
  if (message && message.length > 0) {
    if (type === "error") toast.error(message);
    else if (type === "warn") toast.warning(message);
    else toast.success(message);
  }
}

export function convertToLocalDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 16);
}

export function calculateDaysBetween(
  startDate: string | Date,
  endDate: string | Date,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.abs(diff / (1000 * 3600 * 24));
}

export const hasPermission = (
  permissions: Array<{ moduleKey: string | string[]; permissions: string[] }>,
  moduleKey: string | string[],
  routePermission: string,
): boolean => {
  const moduleKeysArray = Array.isArray(moduleKey) ? moduleKey : [moduleKey];

  return moduleKeysArray.some((key) =>
    permissions.some((item) => {
      const itemKeys = Array.isArray(item.moduleKey)
        ? item.moduleKey
        : [item.moduleKey];
      return (
        itemKeys.includes(key) && item.permissions.includes(routePermission)
      );
    }),
  );
};

export const getYearOptions = (
  startYear: number,
  count: number,
): Array<{ value: string; label: string }> => {
  const options = [];
  for (let i = 0; i < count; i++) {
    const year1 = startYear + i;
    const year2 = year1 + 1;
    options.push({
      value: `${year1}-${year2.toString().slice(-2)}`,
      label: `${year1}-${year2.toString().slice(-2)}`,
    });
  }
  return options;
};

export const getCurrentFinancialYear = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = (fyStart + 1).toString().slice(-2);
  return `${fyStart}-${fyEnd}`;
};

export const convertLabel = (value: string): string => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function formatUTCDateToLocal(utcDate: string | Date): string {
  if (!utcDate) return "";

  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

  // Convert UTC to local time
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  const day = String(localDate.getDate()).padStart(2, "0");
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const year = localDate.getFullYear();

  return `${day}/${month}/${year}`;
}

export const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(" ");
  const firstInitial = names[0]?.charAt(0) || "";
  const secondInitial = names.length > 1 ? names[1]?.charAt(0) || "" : "";
  return (firstInitial + secondInitial).toUpperCase();
};

export function formatIndianNumber(value: string | number) {
  if (!value) return "";
  const num = value.toString().replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("en-IN");
}

export function handleIndianNumberInput(
  e: React.ChangeEvent<HTMLInputElement>,
  field: { value: string; onChange: (val: string) => void },
) {
  const input = e.target;
  const selectionStart = input.selectionStart || 0;

  // Remove non-digit characters
  const raw = input.value.replace(/[^0-9]/g, "");

  // Format number for display
  const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";

  // Update form value with raw
  field.onChange(raw);

  // Update input value and restore cursor
  requestAnimationFrame(() => {
    input.value = formatted;

    // Adjust cursor position
    const diff = formatted.length - raw.length;
    input.setSelectionRange(selectionStart + diff, selectionStart + diff);
  });
}

export function convertToLocalTime(deadline: string | Date | null): string {
  if (!deadline) return ""; // handle null early

  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffInDays = Math.round(
    (deadlineDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

// utils/dateFormatter.js
export const formatToLocalDateTime = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Format date as dd mm yyyy
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Format time as hh:mm am/pm
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};

// Alternative: Using Intl.DateTimeFormat (more reliable)
export const formatToLocalDateTimeIntl = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
