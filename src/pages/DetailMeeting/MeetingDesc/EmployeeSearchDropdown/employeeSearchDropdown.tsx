import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/shared/Icons";
import { getEmployee } from "@/features/api/companyEmployee";

interface EmployeeSearchDropdownProps {
  onAdd: (selectedEmp: EmployeeDetails[]) => void;
  filterProps?: Partial<FilterDataProps["filter"]>;
  minSearchLength?: number;
  renderEmp?: (emp: EmployeeDetails, checked: boolean) => React.ReactNode;
  dropdownClassName?: string;
  inputClassName?: string;
}

const EmployeeSearchDropdown: React.FC<EmployeeSearchDropdownProps> = ({
  onAdd,
  filterProps = {},
  minSearchLength = 3,
  renderEmp,
  dropdownClassName = "",
  inputClassName = "",
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Only fetch when minSearchLength+ chars
  const shouldFetch = searchValue.length >= minSearchLength;
  const { data: employeeData, isFetching } = getEmployee({
    filter: {
      currentPage: 1,
      pageSize: 25,
      search: searchValue,
      ...filterProps,
    },
    enable: !!shouldFetch,
  });

  const employee: EmployeeDetails[] =
    (employeeData?.data as unknown as EmployeeDetails[]) || [];

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // On item click logic
  const handleSelect = (data: EmployeeDetails) => {
    onAdd([data]);
    setShowDropdown(false);
    setSearchValue("");
  };

  return (
    <div className="relative w-full z-50" ref={inputRef}>
      <div className="relative h-10 w-full max-w-sm">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
          <SearchIcon />
        </span>
        <Input
          type="text"
          placeholder="Add Employee to Meeting"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowDropdown(e.target.value.length >= minSearchLength);
          }}
          className={`pl-8 pr-2 w-full h-10 py-2 text-sm ${inputClassName}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
          <Plus className="text-gray-400 w-4" />
        </span>
      </div>
      {/* Dropdown */}
      {showDropdown && shouldFetch && (
        <div
          className={`absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {isFetching ? (
            <div className="p-2 text-center text-gray-500">Loading...</div>
          ) : employee.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              No Employees found
            </div>
          ) : (
            <ul>
              {employee.map((emp) => (
                <li
                  key={emp.employeeId}
                  className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(emp)}
                >
                  {renderEmp ? (
                    renderEmp(emp, false)
                  ) : (
                    <span>
                      {emp.employeeName} - {emp.employeeType}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearchDropdown;
