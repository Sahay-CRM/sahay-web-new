import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/shared/Icons";
import { useGetCompanyProject } from "@/features/api/companyProject";

interface ProjectSearchDropdownProps {
  onAdd: (selectedTasks: IProjectFormData[]) => void;
  filterProps?: Partial<FilterDataProps["filter"]>;
  minSearchLength?: number;
  renderData?: (task: IProjectFormData, checked: boolean) => React.ReactNode;
  dropdownClassName?: string;
  inputClassName?: string;
}

export default function ProjectSearchDropdown({
  onAdd,
  filterProps = {},
  minSearchLength = 3,
  renderData,
  dropdownClassName = "",
  inputClassName = "",
}: ProjectSearchDropdownProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<IProjectFormData[]>(
    [],
  );
  const inputRef = useRef<HTMLDivElement>(null);

  const shouldFetch = searchValue.length >= minSearchLength;
  const { data: projectData, isFetching } = useGetCompanyProject({
    filter: {
      currentPage: 1,
      pageSize: 25,
      search: searchValue,
      ...filterProps,
    },
    enable: shouldFetch,
  });

  const project: IProjectFormData[] =
    (projectData?.data as unknown as IProjectFormData[]) || [];

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

  // Checkbox logic
  const handleCheckboxChange = (data: IProjectFormData, checked: boolean) => {
    setSelectedProjects((prev) => {
      if (checked) {
        return [...prev, data];
      } else {
        return prev.filter((t) => t.projectId !== data.projectId);
      }
    });
  };

  // Add button logic
  const handleAdd = () => {
    onAdd(selectedProjects);
    setShowDropdown(false);
    setSelectedProjects([]);
    setSearchValue("");
  };

  return (
    <div className="relative w-80" ref={inputRef}>
      <div className="relative h-10 w-full max-w-sm">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
          <SearchIcon />
        </span>
        <Input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowDropdown(e.target.value.length >= minSearchLength);
          }}
          className={`pl-8 pr-2 w-96 h-10 py-2 text-sm ${inputClassName}`}
        />
      </div>
      {/* Dropdown */}
      {showDropdown && shouldFetch && (
        <div
          className={`absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {isFetching ? (
            <div className="p-2 text-center text-gray-500">Loading...</div>
          ) : project.length === 0 ? (
            <div className="p-2 text-center text-gray-500">No tasks found</div>
          ) : (
            <ul>
              {project.map((item) => {
                const checked = !!selectedProjects.find(
                  (t) => t.projectId === item.projectId,
                );
                return (
                  <li
                    key={item.projectId}
                    className="flex items-center px-2 py-1 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleCheckboxChange(item, e.target.checked)
                      }
                      className="mr-2"
                    />
                    {renderData ? (
                      renderData(item, checked)
                    ) : (
                      <span>{item.projectName}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {selectedProjects.length > 0 && (
            <div className="p-2 border-t flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
