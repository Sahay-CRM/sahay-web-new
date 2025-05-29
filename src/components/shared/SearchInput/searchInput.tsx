import { Input } from "@/components/ui/input";
import { SearchIcon } from "../Icons";
import useSearchInput from "./useSearchInput";
import { useState } from "react";

interface SearchInputProps {
  placeholder: string;
  setPaginationFilter?: object;
  className?: string;
  containerClass?: string;
  searchValue: string | undefined;
  error?: ErrorType;
}

interface ErrorType {
  type?: string;
  message?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  setPaginationFilter,
  className,
  containerClass,
  searchValue,
  error,
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const { onSearchChange } = useSearchInput({
    setPaginationFilter,
    setLocalSearch,
  });

  return (
    <div className={`relative h-10 w-full max-w-sm ${containerClass}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
        <SearchIcon />
      </span>
      <Input
        type="text"
        placeholder={placeholder}
        value={localSearch}
        onChange={onSearchChange}
        className={`pl-8 pr-2 w-96 h-10 py-2 text-sm ${className}`}
      />
      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] before:me-1 whitespace-nowrap">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default SearchInput;
