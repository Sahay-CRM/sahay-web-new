import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/shared/Icons";
import { useGetCompanyTask } from "@/features/api/companyTask";
import { Plus } from "lucide-react";

interface TaskSearchDropdownProps {
  onAdd: (selectedTasks: TaskGetPaging[]) => void;
  filterProps?: Partial<FilterDataProps["filter"]>;
  minSearchLength?: number;
  renderTask?: (task: TaskGetPaging, checked: boolean) => React.ReactNode;
  dropdownClassName?: string;
  inputClassName?: string;
}

const TaskSearchDropdown: React.FC<TaskSearchDropdownProps> = ({
  onAdd,
  filterProps = {},
  minSearchLength = 3,
  renderTask,
  dropdownClassName = "",
  inputClassName = "",
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Only fetch when minSearchLength+ chars
  const shouldFetch = searchValue.length >= minSearchLength;
  const { data: taskData, isFetching } = useGetCompanyTask({
    filter: {
      currentPage: 1,
      pageSize: 25,
      search: searchValue,
      ...filterProps,
    },
    enable: !!shouldFetch,
  });

  // Extract tasks from API response
  const tasks: TaskGetPaging[] =
    (taskData?.data as unknown as TaskGetPaging[]) || [];

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
  const handleSelect = (task: TaskGetPaging) => {
    onAdd([task]);
    setShowDropdown(false);
    setSearchValue("");
  };

  return (
    <div className="relative w-80 z-50" ref={inputRef}>
      <div className="relative h-10 w-full max-w-sm">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
          <SearchIcon />
        </span>
        <Input
          type="text"
          placeholder="Add Task to Meeting"
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
          ) : tasks.length === 0 ? (
            <div className="p-2 text-center text-gray-500">No tasks found</div>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li
                  key={task.taskId}
                  className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(task)}
                >
                  {renderTask ? (
                    renderTask(task, false)
                  ) : (
                    <span>{task.taskName}</span>
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

export default TaskSearchDropdown;
