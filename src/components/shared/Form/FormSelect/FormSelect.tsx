import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CheckIcon, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { isColorDark } from "@/features/utils/color.utils";

interface Option {
  id?: string | number;
  value?: string | number;
  label?: string | number;
  color?: string;
}

interface FormSelectProps {
  id?: string;
  label?: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  options: Option[];
  disabled?: boolean;
  error?: { message?: string };
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
  isMandatory?: boolean;
  isSearchable?: boolean;
  triggerClassName?: string;
  placeclassName?: string;
  labelClass?: string;
  isClear?: boolean;
  alwaysShowPlaceholder?: boolean;
}

export default function FormSelect({
  id,
  label,
  value = "",
  onChange,
  options,
  disabled = false,
  error,
  className,
  placeholder = "Select an option",
  isMulti = false,
  isMandatory = false,
  isSearchable = false,
  triggerClassName = "",
  placeclassName = "",
  isClear = false,
  labelClass,
  alwaysShowPlaceholder = false,
}: FormSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = isSearchable
    ? options.filter((opt) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  const displayValue = () => {
    if (alwaysShowPlaceholder) {
      return placeholder;
    }
    if (isMulti) {
      const selected = Array.isArray(value) ? value : [];
      if (selected.length > 0) {
        return options
          .filter((opt) => selected.includes(String(opt.value)))
          .map((opt) => opt.label)
          .join(", ");
      }
      return placeholder;
    } else {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(value),
      );
      return selectedOption?.label ?? placeholder;
    }
  };

  const handleMultiChange = (val: string) => {
    const selected = Array.isArray(value) ? value : [];
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );
  const bg = selectedOption?.color;
  const textColor = bg ? (isColorDark(bg) ? "#fff" : "#000") : undefined;

  return (
    <div className={className}>
      {label && (
        <FormLabel className={twMerge("mb-4", labelClass)} htmlFor={id}>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}

      {!isMulti && (
        <Select
          value={value as string}
          onValueChange={(val) => onChange(val)}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger
              className={`w-full mb-1 py-5 custom-select-trigger text-black ${triggerClassName}`}
              id={id}
              style={{
                background: bg,
                borderColor: bg,
                color: textColor,
              }}
            >
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder={placeholder} />

                {isClear && value && (
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onChange("");
                    }}
                    className="ml-2 z-20 cursor-pointer text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4 hover:text-red-500" />
                  </button>
                )}
              </div>
            </SelectTrigger>
          </FormControl>

          <SelectContent className="w-full max-h-60 overflow-auto z-[9999]">
            {isSearchable && (
              <div className="p-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
              </div>
            )}
            {filteredOptions.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isMulti && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={`w-full border rounded-md px-3 text-left text-sm py-2 ${placeclassName} 
    ${disabled ? " text-gray-400" : "bg-white text-black"}
  `}
            >
              {displayValue()}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-2 text-sm z-[9999]"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            {isSearchable && (
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            )}
            <div
              className="max-h-60 overflow-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {filteredOptions.map((opt) => {
                const stringVal = String(opt.value);
                const selected = Array.isArray(value)
                  ? value.includes(stringVal)
                  : false;
                return (
                  <div
                    key={stringVal}
                    className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleMultiChange(stringVal)}
                  >
                    <input type="checkbox" checked={selected} readOnly />
                    <span>{opt.label}</span>
                    {selected && (
                      <CheckIcon className="ml-auto text-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {error?.message && (
        <span className="text-red-600 text-[calc(1em-3px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
}
