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
import { ChevronDown } from "lucide-react";

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

  // Autofocus search box when dropdown opens
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

      {/* Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full font-extralight hover:bg-white justify-between text-left text-black "
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="absolute right-3  text-gray-500" />
          </Button>
        </PopoverTrigger>

        {/* Dropdown */}
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
        >
          {/* Search box */}
          <div className="p-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9"
            />
          </div>

          {/* Options list */}
          <div
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <div
                  key={item.value}
                  className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onSelect(item);
                    setQuery(""); // reset search
                    setOpen(false); // close dropdown
                  }}
                >
                  {item.label}
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

      {/* Error */}
      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default SearchDropdown;
