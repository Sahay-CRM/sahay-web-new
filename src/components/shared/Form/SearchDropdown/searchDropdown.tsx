import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

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
}

const SearchDropdown = ({
  options,
  selectedValues,
  onSelect,
  placeholder = "Search...",
  className = "",
}: SearchDropdownProps) => {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);

  useEffect(() => {
    const filtered = options.filter(
      (opt) =>
        !selectedValues.includes(opt.value) &&
        opt.label.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [query, options, selectedValues]);

  return (
    <div className={`relative ${className}`}>
      <Input
        value={query}
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      {showList && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border bg-white rounded shadow max-h-60 overflow-y-auto">
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
    </div>
  );
};

export default SearchDropdown;
