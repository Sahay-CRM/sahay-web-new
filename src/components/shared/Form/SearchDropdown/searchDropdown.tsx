import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

interface SearchDropdownProps {
  options: Option[];
  selectedValues: string[];
  onSelect: (item: Option) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  labelClass?: string;
  isMandatory?: boolean;
  error?: { message?: string };
}

const SearchDropdown = ({
  options,
  selectedValues = [],
  onSelect,
  placeholder = "Select...",
  className = "",
  label,
  labelClass,
  isMandatory,
  error,
}: SearchDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValues[0]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className={twMerge("relative w-full", className)}>
      {label && (
        <FormLabel className={twMerge("mb-4 block", labelClass)}>
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </FormLabel>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={twMerge(
              "w-full font-extralight hover:bg-white justify-between text-left text-black overflow-hidden whitespace-nowrap text-ellipsis",
              className,
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="absolute right-3 text-gray-500" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
        >
          <div className="p-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9"
            />
          </div>

          <div
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <div
                  key={item.value}
                  className="px-2 py-1"
                  onClick={() => {
                    onSelect(item);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <div
                    className={twMerge(
                      "cursor-pointer text-sm py-1 flex items-center justify-between rounded-sm transition-colors duration-200",
                      selectedValues.includes(item.value)
                        ? "bg-gray-100 px-2 text-gray-900"
                        : "hover:bg-gray-100 px-2 hover:text-gray-900",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {selectedValues.includes(item.value) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default SearchDropdown;
