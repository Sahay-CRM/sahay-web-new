import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isColorDark } from "@/features/utils/color.utils";
import { useState } from "react";

interface Option {
  id?: string | number;
  value?: string | number;
  label?: string | number;
  color?: string;
}

interface FormSelectProps {
  id?: string;
  label?: string;
  value?: string | string[]; // support string or string[]
  onChange: (value: string | string[]) => void;
  options: Option[];
  disabled?: boolean;
  error?: { message?: string };
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
  isMandatory?: boolean;
  isSearchable?: boolean; // Add isSearchable prop
}

export default function FormSelect({
  id,
  label,
  value = "", // Default value to prevent uncontrolled behavior
  onChange,
  options,
  disabled = false,
  error,
  className,
  placeholder = "Select an option",
  isMulti = false,
  isMandatory = false,
  isSearchable = false, // Default to false
}: FormSelectProps) {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const filteredOptions = isSearchable
    ? options.filter((opt) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  // Helper to toggle selection for multi-select
  const toggleValue = (val: string) => {
    if (!Array.isArray(value)) {
      // Initialize as array if not already
      onChange([val]);
    } else {
      if (value.includes(val)) {
        // Remove if already selected
        onChange(value.filter((v) => v !== val));
      } else {
        // Add if not selected
        onChange([...value, val]);
      }
    }
  };

  const displayValue = () => {
    if (isMulti) {
      if (Array.isArray(value) && value.length > 0) {
        const selectedLabels = options
          .filter((opt) => value.includes(String(opt.value)))
          .map((opt) => opt.label)
          .join(", ");
        return selectedLabels || placeholder;
      }
      return placeholder;
    } else {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(value),
      );
      return selectedOption?.label ?? placeholder;
    }
  };

  let selectedColor: string | undefined = undefined;
  let selectedTextColor: string | undefined = undefined;
  if (!isMulti && value) {
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(value),
    );
    selectedColor = selectedOption?.color;
    if (selectedColor) {
      selectedTextColor = isColorDark(selectedColor) ? "#fff" : "#000";
    }
  }

  return (
    <div className={className}>
      {label && (
        <FormLabel className="mb-2" htmlFor={id}>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}

      <Select
        value={isMulti ? "" : (value as string | undefined)} // Ensure value is always a string or undefined
        onValueChange={(val) => {
          if (isMulti) {
            toggleValue(val);
          } else {
            onChange(val);
          }
        }}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger
            className={`w-full mb-1 py-5 custom-select-trigger ${
              selectedColor
                ? selectedTextColor === "#fff"
                  ? "text-white"
                  : "text-black"
                : "text-black"
            }`}
            id={id}
            style={
              selectedColor
                ? {
                    backgroundColor: selectedColor,
                    color: selectedTextColor,
                  }
                : undefined
            }
          >
            {isMulti ? (
              <div className="w-full text-left">{displayValue()}</div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
        </FormControl>

        <SelectContent className="w-full max-h-60 overflow-auto">
          {isSearchable && (
            <div className="p-2">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Keep dropdown open while typing
                className="mb-2"
              />
            </div>
          )}
          {filteredOptions
            .filter((opt) => opt.value !== undefined && opt.value !== "")
            .map((opt) => {
              const stringVal = String(opt.value);
              const checked = isMulti
                ? Array.isArray(value) && value.includes(stringVal)
                : false;
              return (
                <SelectItem
                  key={stringVal}
                  value={stringVal}
                  className={checked ? "bg-blue-50" : ""}
                >
                  {/* Show checkbox in multi-select */}
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}} // Prevent direct interaction
                      className="mr-2 text-sm pointer-events-none"
                    />
                  )}
                  {opt.label}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>

      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
}
