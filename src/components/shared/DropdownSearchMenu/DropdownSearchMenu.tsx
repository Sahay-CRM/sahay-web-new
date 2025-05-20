// src/components/ui/DropdownSearchMenu.tsx

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DropdownSearchMenuProps {
  columns: ColumnToggleOption[];
  onToggleColumn: (columnKey: string) => void;
}
interface ColumnToggleOption {
  label: string;
  key: string;
  visible: boolean;
}

const DropdownSearchMenu = ({
  columns,
  onToggleColumn,
}: DropdownSearchMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-4">
          Toggle Visible Columns
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={col.visible}
            onCheckedChange={() => onToggleColumn(col.key)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownSearchMenu;
