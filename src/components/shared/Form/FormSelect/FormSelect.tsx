"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // ShadCN components
import { FormLabel } from "@/components/ui/form";

// Define the type for each option in the select dropdown
interface Option {
  id?: string | number;
  value?: string | number;
  label?: string | number;
}

// Define the props for the FormSelect component
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClass?: string;
  containerClass?: string;
  className?: string;
  id?: string;
  placeholder?: string;
  options: Option[];
  error?: { message?: string };
  isMandatory?: boolean;
}

const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  function FormSelect(
    {
      label,
      options,
      error,
      className,
      labelClass,
      containerClass,
      isMandatory,
      placeholder,
      ...rest
    },
    ref,
  ) {
    const [selectedValue, setSelectedValue] = React.useState<
      string | number | undefined
    >(
      Array.isArray(rest.value)
        ? rest.value[0]
        : (rest.value ?? rest.defaultValue),
    );

    // Sync when value/defaultValue changes
    React.useEffect(() => {
      const newVal = Array.isArray(rest.value)
        ? rest.value[0]
        : (rest.value ?? rest.defaultValue);
      setSelectedValue(newVal);
    }, [rest.value, rest.defaultValue]);

    const handleSelect = (value: string) => {
      setSelectedValue(value);
      rest.onChange?.({
        target: { value },
      } as React.ChangeEvent<HTMLSelectElement>);
    };

    const selectedOption =
      options.find((opt) => String(opt.value) === String(selectedValue)) ||
      null;
    const displayValue = selectedOption?.label ?? placeholder;

    return (
      <div
        className={twMerge("mt-2 w-full tb:mt-3 min-w-32", containerClass)}
        ref={ref}
      >
        {label && (
          <FormLabel className={twMerge("mb-2", labelClass)}>
            {label} {isMandatory && <span className="text-red-500">*</span>}
          </FormLabel>
        )}

        <Select value={selectedValue?.toString()} onValueChange={handleSelect}>
          <SelectTrigger
            className={twMerge(
              "w-full bg-white border border-dark-600/70 p-2 text-left text-sm rounded-md",
              className,
            )}
          >
            <div
              className={`${!selectedOption ? "text-muted-foreground" : ""}`}
            >
              {displayValue}
            </div>
          </SelectTrigger>

          <SelectContent className="bg-white border border-dark-600/600 shadow rounded-md">
            {options
              .filter(
                (opt) =>
                  opt.value !== undefined &&
                  opt.value !== null &&
                  opt.value !== "",
              )
              .map((opt) => (
                <SelectItem
                  key={opt.id ?? String(opt.value)}
                  value={String(opt.value)}
                >
                  {opt.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {error?.message && (
          <span className="text-red-600 text-sm mt-1">{error.message}</span>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
