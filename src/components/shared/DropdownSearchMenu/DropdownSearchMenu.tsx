// src/components/ui/DropdownSearchMenu.tsx

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Columns3, PlusCircle } from "lucide-react";

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
}: DropdownSearchMenuProps) => {
  // Handler for filter option selection
  const handleOptionToggle = (value: string) => {
    if (!onChange) return;
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-4">
          {label}
          {columnIcon ? (
            <Columns3 className="h-4 w-4 ml-2" />
          ) : (
            <PlusCircle className="h-4 w-4 ml-2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* Render filter options if provided */}
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
          : // Otherwise, render columns for toggling
            columns?.map((col, idx) => (
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
