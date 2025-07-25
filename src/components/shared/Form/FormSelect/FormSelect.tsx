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
import { CheckIcon } from "lucide-react";

interface Option {
  id?: string | number;
  value?: string | number | boolean;
  label?: string | number | boolean;
  color?: string;
}

interface FormSelectProps {
  id?: string;
  label?: string;
  value?: string | string[] | boolean;
  onChange: (value: string | string[] | boolean) => void;
  options: Option[];
  disabled?: boolean;
  error?: { message?: string };
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
  isMandatory?: boolean;
  isSearchable?: boolean;
  triggerClassName?: string;
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
}: FormSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = isSearchable
    ? options.filter((opt) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  const displayValue = () => {
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

  return (
    <div className={className}>
      {label && (
        <FormLabel className="mb-4" htmlFor={id}>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}

      {!isMulti && (
        <Select
          value={String(value)}
          onValueChange={(val) => {
            // Try to convert to boolean if possible
            if (val === "true") onChange(true);
            else if (val === "false") onChange(false);
            else onChange(val);
          }}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger
              className={`w-full mb-1 py-5 custom-select-trigger text-black ${triggerClassName}`}
              id={id}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>

          <SelectContent className="w-full max-h-60 overflow-auto ">
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
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
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
              className="w-full border rounded-md px-3 text-left text-sm py-2"
            >
              {displayValue()}
            </button>
          </PopoverTrigger>
          {/* <PopoverContent className="w-full p-2"> */}
          <PopoverContent
            className="p-2 text-sm"
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
            <div className="max-h-60 overflow-auto">
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
        <span className="text-red-600 text-sm">{error.message}</span>
      )}
    </div>
  );
}
