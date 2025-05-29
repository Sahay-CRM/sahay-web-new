export const createOptions = <T>(
  data: T[] | undefined,
  defaultLabel: string,
  valueKey: keyof T,
  labelKey: keyof T,
  disabled = true,
) => {
  return [
    { id: "", value: "", label: defaultLabel, disabled }, // Ensure empty values are properly typed
    ...(data?.map((item) => ({
      id: convertToStringOrUndefined(
        item[valueKey] as string | number | boolean | undefined | null,
      ), // Explicitly type it
      value: convertToStringOrUndefined(
        item[valueKey] as string | number | boolean | undefined | null,
      ), // Explicitly type it
      label: convertToStringOrUndefined(
        item[labelKey] as string | number | boolean | undefined | null,
      ), // Explicitly type it
      disabled: false,
    })) || []),
  ];
};

// Utility function to convert value to string or undefined
const convertToStringOrUndefined = (
  value: string | number | boolean | undefined | null,
): string | number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  // Convert boolean values to strings
  if (typeof value === "boolean") {
    return String(value); // "true" or "false"
  }

  return value;
};
