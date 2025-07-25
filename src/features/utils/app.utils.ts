import { toast } from "sonner";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isSmallScreen(): boolean {
  return window?.innerWidth < 768;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
