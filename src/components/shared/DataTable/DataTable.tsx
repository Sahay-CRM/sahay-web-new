import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash,
  ChevronUp,
  ChevronDown,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import Pagination from "../Pagination/Pagination";
import FormCheckbox from "../Form/FormCheckbox/FormCheckbox";

interface DetailsPermission {
  view: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface TableProps<T extends Record<string, unknown>> {
  tableData?: T[];
  columns?: Partial<Record<keyof T, string>>;
  primaryKey: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  paginationDetails?: PaginationFilter;
  setPaginationFilter?: (filter: PaginationFilter) => void;
  isLoading?: boolean;
  isActionButton?: boolean;
  additionalButton?: React.ReactNode;
  onAdditionButton?: (item: T) => void;
  permissionKey?: string | undefined;
  detailPageLink?: string;
  detailsPage?: boolean;
  detailsPermission?: DetailsPermission;
  onMoveRowUp?: (index: number) => void;
  onMoveRowDown?: (index: number) => void;
  showIndexColumn?: boolean;
  customActions?: (row: T) => React.ReactNode;
  multiSelect?: boolean;
  selectedValue?: T[] | T;
  onCheckbox?: (selectedItems: T[]) => void;
  handleChange?: (selected: T[] | T) => void;
  localStorageId?: string; // Unique identifier for localStorage
}

interface ResizableTableHeadProps {
  children: React.ReactNode;
  onResize?: (width: number) => void;
  initialWidth?: number;
  isResizable?: boolean;
  style?: React.CSSProperties;
}

const ResizableTableHead = ({
  children,
  onResize,
  initialWidth = 150,
  isResizable = true,
  style,
}: ResizableTableHeadProps) => {
  const [width, setWidth] = useState(initialWidth);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isResizable) return;

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + e.clientX - startX;
      setWidth(Math.max(50, newWidth));
      if (onResize) onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <TableHead
      style={{ width: `${width}px`, ...style }}
      className="relative select-none"
    >
      <div className="flex items-center justify-between">
        {children}
        {isResizable && (
          <div
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-200 hover:bg-blue-500 active:bg-blue-600"
            onMouseDown={handleMouseDown}
          />
        )}
      </div>
    </TableHead>
  );
};

const TableData = <T extends Record<string, unknown>>({
  tableData = [],
  columns = {},
  primaryKey,
  onEdit,
  onDelete,
  canDelete,
  customActions,
  paginationDetails,
  setPaginationFilter,
  isLoading = false,
  isActionButton = false,
  onAdditionButton = () => {},
  additionalButton,
  onMoveRowUp,
  onMoveRowDown,
  showIndexColumn = false,
  multiSelect,
  selectedValue = [],
  handleChange,
  localStorageId = "defaultLocalStorageId", // Default ID for localStorage
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  const showCheckboxes = multiSelect || (!!selectedValue && !!handleChange);
  const tableRef = useRef<HTMLDivElement>(null);

  const DEFAULT_COLUMN_WIDTH = 150;

  const FIXED_WIDTHS = {
    sr_no: 80,
    action: 80,
    checkbox: 40,
    index: 80,
  };

  const DEFAULT_WIDTHS = Object.fromEntries(
    columnKeys
      .filter((key) => key !== "sr_no")
      .map((key) => [key, DEFAULT_COLUMN_WIDTH]),
  );

  // Get saved widths from localStorage or use defaults
  const getInitialWidths = () => {
    if (typeof window === "undefined") return {};

    const savedWidths = localStorage.getItem(`tableWidths_${localStorageId}`);
    if (savedWidths) {
      return JSON.parse(savedWidths);
    }
    return {};
  };

  const [columnWidths, setColumnWidths] =
    useState<Record<string, number>>(getInitialWidths());

  // Add a render key to force re-render on reset
  const [tableRenderKey, setTableRenderKey] = useState(0);

  const resetColumnWidths = useCallback(() => {
    setColumnWidths(DEFAULT_WIDTHS);

    if (typeof window !== "undefined") {
      localStorage.removeItem(`tableWidths_${localStorageId}`);
    }
    setTableRenderKey((k) => k + 1);
  }, [DEFAULT_WIDTHS, localStorageId]);

  const getCurrentWidths = () => {
    if (Object.keys(columnWidths).length === 0) {
      return DEFAULT_WIDTHS;
    }
    return columnWidths;
  };

  const currentWidths = getCurrentWidths();
  const totalWidth =
    (showCheckboxes ? FIXED_WIDTHS.checkbox : 0) +
    (showIndexColumn ? FIXED_WIDTHS.index : 0) +
    columnKeys.reduce((sum, key) => {
      return (
        sum +
        (key === "sr_no"
          ? FIXED_WIDTHS.sr_no
          : currentWidths[key] || DEFAULT_COLUMN_WIDTH)
      );
    }, 0) +
    FIXED_WIDTHS.action;

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `tableWidths_${localStorageId}`,
        JSON.stringify(columnWidths),
      );
    }
  }, [columnWidths, localStorageId]);

  const handleResize = (columnKey: string, width: number) => {
    if (columnKey === "sr_no" || columnKey === "action") return;

    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: Math.max(50, width),
    }));
  };

  const handleCheckboxChange = (item: T, isChecked: boolean) => {
    const selectedItems = Array.isArray(selectedValue) ? selectedValue : [];

    if (multiSelect) {
      const updatedSelection = isChecked
        ? [...selectedItems, item]
        : selectedItems.filter(
            (selected) => selected[primaryKey] !== item[primaryKey],
          );
      handleChange?.(updatedSelection);
    } else {
      if (isChecked) handleChange?.(item);
    }
  };

  return (
    <Card className="w-full p-2 mb-5 overflow-hidden">
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetColumnWidths}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Column Widths
        </Button>
      </div>
      <div
        key={tableRenderKey}
        className="overflow-x-auto max-h-[calc(100svh-183px)] tb:max-h-[calc(100svh-260px)]"
        ref={tableRef}
        style={{ overflowX: "auto" }}
      >
        <div style={{ width: `${totalWidth}px`, minWidth: "100%" }}>
          <Table className="w-full border-collapse table-fixed">
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead style={{ width: `${FIXED_WIDTHS.checkbox}px` }}>
                    {/* Checkbox column header */}
                  </TableHead>
                )}

                {showIndexColumn && (
                  <TableHead style={{ width: `${FIXED_WIDTHS.index}px` }}>
                    #
                  </TableHead>
                )}

                {columnKeys.map((clm, index) => (
                  <ResizableTableHead
                    key={clm + index}
                    initialWidth={
                      clm === "sr_no"
                        ? FIXED_WIDTHS.sr_no
                        : columnWidths[clm] || 150
                    }
                    onResize={(width) => handleResize(clm, width)}
                    isResizable={clm !== "sr_no"} // Make sr_no non-resizable
                    style={
                      clm === "sr_no"
                        ? { width: `${FIXED_WIDTHS.sr_no}px` }
                        : undefined
                    }
                  >
                    {columns[clm]}
                  </ResizableTableHead>
                ))}

                <TableHead style={{ width: `${FIXED_WIDTHS.action}px` }}>
                  {/* Action column header */}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columnKeys.length +
                      (showCheckboxes ? 1 : 0) +
                      (showIndexColumn ? 1 : 0) +
                      1
                    }
                    className="py-6"
                  >
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-spin">loading...</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tableData.length ? (
                tableData.map((item, index) => (
                  <TableRow key={item[primaryKey] as React.Key}>
                    {showCheckboxes && (
                      <TableCell
                        style={{ width: `${FIXED_WIDTHS.checkbox}px` }}
                        className="text-center h-8 p-0 whitespace-nowrap"
                      >
                        <FormCheckbox
                          id={`${String(item[primaryKey])}-checkbox`}
                          className="w-[19px] aspect-square tb:w-[18px]"
                          containerClass="p-2 tb:p-3 mt-0 tb:mt-0"
                          onChange={(e) =>
                            handleCheckboxChange(item, e.target.checked)
                          }
                          checked={
                            multiSelect
                              ? (selectedValue as T[]).some(
                                  (selected) =>
                                    selected[primaryKey] === item[primaryKey],
                                )
                              : (selectedValue as T)?.[primaryKey] ===
                                item[primaryKey]
                          }
                        />
                      </TableCell>
                    )}

                    {showIndexColumn && (
                      <TableCell
                        style={{ width: `${FIXED_WIDTHS.index}px` }}
                        className="text-center p-0"
                      >
                        <div className="flex flex-col items-center gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => onMoveRowUp?.(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => onMoveRowDown?.(index)}
                            disabled={index === tableData.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}

                    {columnKeys.map((clm) => (
                      <TableCell
                        key={`${item[primaryKey]}_${clm}`}
                        className={`whitespace-nowrap ${
                          clm === "sr_no" ? "px-0" : "px-6"
                        }`}
                        style={{
                          width:
                            clm === "sr_no"
                              ? `${FIXED_WIDTHS.sr_no}px`
                              : columnWidths[clm]
                                ? `${columnWidths[clm]}px`
                                : "150px",
                          maxWidth:
                            clm === "sr_no"
                              ? `${FIXED_WIDTHS.sr_no}px`
                              : columnWidths[clm]
                                ? `${columnWidths[clm]}px`
                                : "150px",
                        }}
                      >
                        {String(item[clm] || " - ")}
                      </TableCell>
                    ))}

                    <TableCell
                      style={{ width: `${FIXED_WIDTHS.action}px` }}
                      className="text-right whitespace-nowrap"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {customActions?.(item)}

                          {!isActionButton && (
                            <DropdownMenuItem onClick={() => onEdit?.(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {!isActionButton &&
                            (!canDelete || canDelete(item)) && (
                              <DropdownMenuItem
                                onClick={() => onDelete?.(item)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}

                          {additionalButton && (
                            <DropdownMenuItem
                              onClick={() => onAdditionButton(item)}
                            >
                              <span className="flex items-center">
                                <KeyRound className="mr-2 h-4 w-4" />
                                Permission
                              </span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columnKeys.length +
                      (showCheckboxes ? 1 : 0) +
                      (showIndexColumn ? 1 : 0) +
                      1
                    }
                    className="text-center"
                  >
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {paginationDetails && (
        <div className="pt-4">
          <Pagination
            paginationDetails={paginationDetails}
            setPaginationFilter={setPaginationFilter}
          />
        </div>
      )}
    </Card>
  );
};

export default TableData;
