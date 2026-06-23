// src/components/ui/DropdownSearchMenu.tsx

import { useState, useEffect } from "react";
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
  multiSelect = false,
  showCount,
  columnIcon,
  icon,
  iconOnly,
  responsive,
}: DropdownSearchMenuProps) => {
  const [open, setOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  // Synchronize when the dropdown opens
  useEffect(() => {
    if (open) {
      setLocalSelected(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOptionToggle = (value: string) => {
    if (multiSelect) {
      if (localSelected.includes(value)) {
        setLocalSelected(localSelected.filter((v) => v !== value));
      } else {
        setLocalSelected([...localSelected, value]);
      }
    } else {
      onChange?.([value]);
      setOpen(false);
    }
  };

  const displaySelected = multiSelect && open ? localSelected : selected;
  const hasSelection = displaySelected.length > 0;

  // Determine display text based on selection count
  let displayLabel = label;
  if (multiSelect) {
    if (displaySelected.length > 0) {
      displayLabel = `Filtered (${displaySelected.length})`;
    }
  } else {
    if (displaySelected.length === 1) {
      const selectedOption = options?.find(
        (opt) => opt.value === displaySelected[0],
      );
      displayLabel = selectedOption ? selectedOption.label : "Filtered";
    } else if (displaySelected.length > 1) {
      displayLabel = `Filtered (${displaySelected.length})`;
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasSelection ? "default" : "outline"}
          className={clsx(
            "flex items-center justify-center relative",
            responsive
              ? "h-10 w-10 p-0 rounded-full min-[1200px]:h-11 min-[1200px]:w-auto min-[1200px]:px-4 min-[1200px]:rounded-md"
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
                    {displaySelected.length}
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
                  {displaySelected.length}
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
        className="w-56 max-h-[400px] flex flex-col overflow-y-hidden p-1"
        align={iconOnly || responsive ? "end" : "start"}
      >
        {multiSelect && options && options.length > 0 && (
          <DropdownMenuCheckboxItem
            checked={localSelected.length === 0}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => setLocalSelected([])}
          >
            All
          </DropdownMenuCheckboxItem>
        )}
        <div className="flex-1 overflow-y-auto min-h-0">
          {options && options.length > 0
            ? options.map((opt, idx) => (
                <DropdownMenuCheckboxItem
                  key={`${opt.value}-${idx}`}
                  checked={localSelected.includes(opt.value)}
                  onSelect={(e) => e.preventDefault()}
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
        </div>
        {multiSelect && options && options.length > 0 && (
          <div className="p-2 border-t flex gap-2 justify-end bg-white z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLocalSelected([]);
                onChange?.([]);
                setOpen(false);
              }}
              className="text-xs h-8 cursor-pointer"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onChange?.(localSelected);
                setOpen(false);
              }}
              className="text-xs h-8 cursor-pointer bg-primary text-white hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownSearchMenu;
