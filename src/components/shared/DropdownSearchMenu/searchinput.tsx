// src/components/ui/SearchInput.tsx
import React from "react";
import { Input } from "@/components/ui/input"; // Adjust the path if necessary
// import {setPaginationFilter} from "../../Pages/AdminTools/Department/useDepartment"

interface SearchInputProps {
  placeholder: string;
  searchValue: string;
  setPaginationFilter: React.Dispatch<React.SetStateAction<PaginationFilter>>;
}

const SearchInput = ({
  placeholder,
  searchValue,
  setPaginationFilter,
}: SearchInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaginationFilter((prevFilter) => ({
      ...prevFilter,
      search: e.target.value,
    }));
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchValue}
      onChange={handleChange}
      className="w-full p-2 border rounded-md"
    />
  );
};

export default SearchInput;
