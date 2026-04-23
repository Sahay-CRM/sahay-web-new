// src/components/ui/DropdownSearchMenu.tsx

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Columns3, PlusCircle } from "lucide-react";
import clsx from "clsx";

interface DropdownSearchMenuProps {
  columns?: ColumnToggleOption[];
  onToggleColumn?: (columnKey: string) => void;
  label?: string;
  options?: { label: string; value: string; count?: number }[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  multiSelect?: boolean;
  showCount?: boolean;
  columnIcon?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  responsive?: boolean;
}

interface ColumnToggleOption {
  label: string;
  key: string;
  visible: boolean;
}

const DropdownSearchMenu = ({
  columns,
  onToggleColumn,
  label,
  options,
  selected = [],
  onChange,
  showCount,
  columnIcon,
  icon,
  iconOnly,
  responsive,
}: DropdownSearchMenuProps) => {
  const handleOptionToggle = (value: string) => {
    if (!onChange) return;
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const hasSelection = selected.length > 0;

  // Determine display text based on selection count
  let displayLabel = label;
  if (selected.length === 1) {
    const selectedOption = options?.find((opt) => opt.value === selected[0]);
    displayLabel = selectedOption ? selectedOption.label : "Filtered";
  } else if (selected.length > 1) {
    displayLabel = `Filtered (${selected.length})`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasSelection ? "default" : "outline"}
          className={clsx(
            "flex items-center justify-center relative",
            responsive
              ? "h-10 w-10 p-0 rounded-full min-[1200px]:h-10 min-[1200px]:w-auto min-[1200px]:px-4 min-[1200px]:rounded-md"
              : iconOnly
                ? "h-10 w-10 p-0 rounded-full"
                : "h-10 px-4",
            hasSelection &&
              "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100",
          )}
        >
          {responsive ? (
            <>
              {/* Icon mode for small screens */}
              <div className="flex min-[1200px]:hidden items-center justify-center relative">
                {icon}
                {hasSelection && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {selected.length}
                  </span>
                )}
              </div>
              {/* Text mode for large screens */}
              <div className="hidden min-[1200px]:flex items-center">
                {displayLabel}
                {columnIcon ? (
                  <Columns3
                    className={clsx(
                      "h-4 w-4 ml-2",
                      hasSelection && "text-blue-500",
                    )}
                  />
                ) : (
                  <PlusCircle
                    className={clsx(
                      "h-4 w-4 ml-2",
                      hasSelection && "text-blue-500",
                    )}
                  />
                )}
              </div>
            </>
          ) : iconOnly ? (
            <>
              {icon}
              {hasSelection && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {selected.length}
                </span>
              )}
            </>
          ) : (
            <>
              {displayLabel}

              {columnIcon ? (
                <Columns3
                  className={clsx(
                    "h-4 w-4 ml-2",
                    hasSelection && "text-blue-500",
                  )}
                />
              ) : (
                <PlusCircle
                  className={clsx(
                    "h-4 w-4 ml-2",
                    hasSelection && "text-blue-500",
                  )}
                />
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56"
        align={iconOnly || responsive ? "end" : "start"}
      >
        {options && options.length > 0
          ? options.map((opt, idx) => (
              <DropdownMenuCheckboxItem
                key={`${opt.value}-${idx}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={() => handleOptionToggle(opt.value)}
              >
                {opt.label}
                {showCount && opt.count !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({opt.count})
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            ))
          : columns?.map((col, idx) => (
              <DropdownMenuCheckboxItem
                key={`${col.key}-${idx}`}
                checked={col.visible}
                onCheckedChange={() => onToggleColumn?.(col.key)}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownSearchMenu;
