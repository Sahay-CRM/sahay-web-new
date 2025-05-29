import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormLabel, FormControl } from "@/components/ui/form";

interface Option {
  id?: string | number;
  value?: string | number;
  label?: string | number;
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
  isMulti?: boolean; // NEW prop for multi-select support
}

export default function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  className,
  placeholder = "Select an option",
  isMulti = false,
}: FormSelectProps) {
  // Helper to toggle selection for multi-select
  const toggleValue = (val: string) => {
    if (!Array.isArray(value)) {
      onChange([val]);
    } else {
      if (value.includes(val)) {
        onChange(value.filter((v) => v !== val));
      } else {
        onChange([...value, val]);
      }
    }
  };

  // Display string for selected values
  const displayValue = () => {
    if (isMulti) {
      if (Array.isArray(value) && value.length > 0) {
        // Show labels of selected values joined by commas
        const selectedLabels = options
          .filter((opt) => value.includes(String(opt.value)))
          .map((opt) => opt.label)
          .join(", ");
        return selectedLabels || placeholder;
      }
      return placeholder;
    } else {
      // Single select
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(value),
      );
      return selectedOption?.label ?? placeholder;
    }
  };

  return (
    <div className={className}>
      {label && (
        <FormLabel className="mb-2" htmlFor={id}>
          {label}
        </FormLabel>
      )}

      <Select
        value={isMulti ? undefined : (value as string | undefined)}
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
          <SelectTrigger className="w-full mb-1" id={id}>
            <SelectValue placeholder={placeholder}>
              {/* For multi-select, override default display with custom */}
              {isMulti ? displayValue() : undefined}
            </SelectValue>
          </SelectTrigger>
        </FormControl>

        <SelectContent className="w-full max-h-60 overflow-auto">
          {options
            .filter((opt) => opt.value !== undefined && opt.value !== "")
            .map((opt) => {
              const stringVal = String(opt.value);
              const checked = isMulti
                ? Array.isArray(value) && value.includes(stringVal)
                : false;
              return (
                <SelectItem key={stringVal} value={stringVal}>
                  {/* Show checkbox in multi-select */}
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2"
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
