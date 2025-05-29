"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import {
  Select,
  SelectTrigger,
  // SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // ShadCN components

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
  options: Option[];
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
    ref,
  ) {
    const [selectedValue, setSelectedValue] = React.useState<
      string | number | undefined
    >(
      Array.isArray(rest.value)
        ? rest.value[0]
        : (rest.value ?? rest.defaultValue),
    );

    // Keep selectedValue in sync when defaultValue/controlled value changes
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
      options.find((opt) => opt.value === selectedValue) || options[0];
    const displayValue = selectedOption?.label || "";
    return (
      <div
        className={twMerge("mt-2 w-full tb:mt-3  min-w-32", containerClass)}
        ref={ref}
      >
        {label && (
          <div className="mb-1.5">
            <label
              className={twMerge(
                `${isMandatory && " after:content-['_*'] after:text-red-500"}`,
                labelClass,
              )}
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        )}

        <Select value={selectedValue?.toString()} onValueChange={handleSelect}>
          <SelectTrigger
            className={twMerge(
              "w-full bg-white border border-dark-600/70 p-2 text-left text-sm mb-2 rounded-md",
              className,
            )}
          >
            <div>{displayValue}</div>{" "}
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

        {error && error.message && (
          <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] before:me-1 whitespace-nowrap">
            {error.message}
          </span>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
