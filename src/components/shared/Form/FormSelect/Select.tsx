"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Shadcn Select components

// Define the type for each option in the select dropdown
interface Option {
  id?: string | number; // Allow both string and number for 'id'
  value?: string | number;
  label?: string | number; // You might also want to allow 'number' for the label
}

// Define the props for the FormSelect component
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClass?: string;
  containerClass?: string;
  className?: string;
  id?: string;
  options: Option[]; // Required array of options
  error?: ErrorType;
  isMandatory?: boolean;
}

const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  function FormSelect(
    {
      label,
      id,
      options,
      error,
      className,
      labelClass,
      containerClass,
      isMandatory,
      ...rest
    },
    ref, // <-- This is the ref parameter
  ) {
    const [selectedValue, setSelectedValue] = React.useState<
      string | number | undefined
    >(
      Array.isArray(rest.defaultValue)
        ? rest.defaultValue[0]
        : rest.defaultValue,
    );

    const handleSelect = (value: string | number) => {
      setSelectedValue(value);
      rest.onChange?.({
        target: { value },
      } as React.ChangeEvent<HTMLSelectElement>);
    };

    // Find the label corresponding to the selected value
    const selectedOption =
      options.find((opt) => opt.value === selectedValue) || options[0];
    const displayValue = selectedOption?.label || "";

    return (
      <div
        className={twMerge("mt-2 w-full tb:mt-3 min-w-32", containerClass)}
        ref={ref}
      >
        {label && (
          <div className="mb-1.5">
            <label
              className={twMerge(
                `${isMandatory && "after:content-['_*'] after:text-red-500"}`,
                labelClass,
              )}
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        )}

        <Select onValueChange={handleSelect} value={selectedValue?.toString()}>
          <SelectTrigger
            className={twMerge(
              "w-full bg-white border border-dark-600/70 p-2 text-left text-sm rounded-md",
              className,
            )}
          >
            <div>{displayValue}</div>{" "}
            {/* Display the label instead of the value */}
          </SelectTrigger>

          <SelectContent className="bg-white border border-dark-600/600 shadow rounded-md">
            {options.map((opt) => (
              <SelectItem
                key={opt.id}
                value={opt.value?.toString() || "undefined"}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && error.message && (
          <span className="text-red-600 text-xs whitespace-nowrap">
            {error.message}
          </span>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
