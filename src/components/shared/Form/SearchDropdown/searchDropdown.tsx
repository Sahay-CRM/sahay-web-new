import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { twMerge } from "tailwind-merge";

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
  placeholder = "Search...",
  className = "",
  label,
  labelClass,
  isMandatory,
  error,
}: SearchDropdownProps) => {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);

  // Compute the selected label(s) from selectedValues and options
  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    const selectedOption = options.find((opt) =>
      selectedValues.includes(opt.value),
    );
    return selectedOption ? selectedOption.label : placeholder;
  };

  useEffect(() => {
    const filtered = options.filter(
      (opt) =>
        Array.isArray(selectedValues) &&
        !selectedValues.includes(opt.value) &&
        opt.label.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [query, options, selectedValues]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <FormLabel className={twMerge("mb-4", labelClass)}>
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}
      <Input
        value={query}
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getSelectedLabel()} // Show selected label or default placeholder
        className=" placeholder:text-black"
      />
      {showList && filteredOptions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full border bg-white rounded shadow max-h-60 overflow-y-auto">
          {filteredOptions.map((item) => (
            <li
              key={item.value}
              className="cursor-pointer px-3 py-2 hover:bg-muted"
              onClick={() => {
                onSelect(item);
                setQuery("");
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default SearchDropdown;
