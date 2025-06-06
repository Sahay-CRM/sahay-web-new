import React, { useState, useRef, useEffect } from "react";
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
  Trash,
  ChevronUp,
  ChevronDown,
  KeyRound,
  EyeIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Pencil,
} from "lucide-react";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import FormCheckbox from "../../Form/FormCheckbox/FormCheckbox";
import Pagination from "../../Pagination/Pagination";
import FormSelect from "../../Form/FormSelect";
import { SpinnerIcon } from "../../Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  isActionButton?: (item: T) => boolean;
  additionalButton?: React.ReactNode;
  viewButton?: React.ReactNode;
  onAdditionButton?: (item: T) => void;
  onViewButton?: (item: T) => void;
  permissionKey?: string | undefined;
  detailPageLink?: string;
  detailsPage?: boolean;
  detailsPermission?: DetailsPermission;
  onMoveRowUp?: (index: number) => void;
  onMoveRowDown?: (index: number) => void;
  showIndexColumn?: boolean;
  showDropdown?: boolean;
  customActions?: (row: T) => React.ReactNode;
  multiSelect?: boolean;
  selectedValue?: T[] | T;
  statusOptions?: { label: string; value: string }[];
  handleStatusChange?: (selectedStatus: string, item: T) => void;
  onCheckbox?: (selectedItems: T[]) => void;
  handleChange?: (selected: T[] | T) => void;
  localStorageId?: string; // Unique identifier for localStorage
  moduleKey?: string;
  onRowClick?: (item: T) => void;
  sortableColumns?: string[];
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

const TableWithDropdown = <T extends Record<string, unknown>>({
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
  isActionButton,
  onAdditionButton = () => {},
  handleStatusChange = () => {},
  statusOptions = [],
  onViewButton = () => {},
  additionalButton,
  viewButton,
  onMoveRowUp,
  onMoveRowDown,
  showIndexColumn = false,
  multiSelect,
  selectedValue = [],
  handleChange,
  localStorageId = "defaultLocalStorageId",
  moduleKey = "",
  showDropdown = false,
  onRowClick,
  sortableColumns = [],
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  const showCheckboxes = multiSelect || (!!selectedValue && !!handleChange);
  // console.log(tableData);

  const tableRef = useRef<HTMLDivElement>(null);
  const permission = useSelector(getUserPermission)?.[moduleKey];
  const DEFAULT_COLUMN_WIDTH = 150;

  const FIXED_WIDTHS = {
    srNo: 40,
    action: 40,
    checkbox: 40,
    index: 80,
  };

  const DEFAULT_WIDTHS = Object.fromEntries(
    columnKeys
      .filter((key) => key !== "srNo")
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
        (key === "srNo"
          ? FIXED_WIDTHS.srNo
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
    if (columnKey === "srNo" || columnKey === "action") return;

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

  // Sorting logic
  const handleSort = (columnKey: string) => {
    if (!sortableColumns.includes(columnKey) || !setPaginationFilter) return;
    const currentSortBy = paginationDetails?.sortBy;
    const currentSortOrder = paginationDetails?.sortOrder || "asc";
    let newSortOrder: "asc" | "desc" = "asc";
    if (currentSortBy === columnKey) {
      newSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    } else {
      newSortOrder = "asc";
    }
    setPaginationFilter({
      ...paginationDetails,
      sortBy: columnKey,
      sortOrder: newSortOrder,
      currentPage: 1,
    });
  };
  const getSortIcon = (columnKey: string) => {
    if (!sortableColumns.includes(columnKey)) return null;
    const currentSortBy = paginationDetails?.sortBy;
    const currentSortOrder = paginationDetails?.sortOrder;
    if (currentSortBy === columnKey) {
      return currentSortOrder === "asc" ? (
        <ArrowUp className="w-4 h-4 ml-1" />
      ) : (
        <ArrowDown className="w-4 h-4 ml-1" />
      );
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
  };

  return (
    <Card className="w-full p-2 mb-5 overflow-hidden">
      <div
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
                      clm === "srNo"
                        ? FIXED_WIDTHS.srNo
                        : columnWidths[clm] || 150
                    }
                    onResize={(width) => handleResize(clm, width)}
                    isResizable={clm !== "srNo"}
                    style={
                      clm === "srNo"
                        ? { width: `${FIXED_WIDTHS.srNo}px` }
                        : undefined
                    }
                  >
                    <div
                      className={`flex items-center ${
                        sortableColumns.includes(clm)
                          ? "cursor-pointer select-none"
                          : ""
                      }`}
                      onClick={() => handleSort(clm)}
                    >
                      {columns[clm]}
                      {getSortIcon(clm)}
                    </div>
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
                      <div className="animate-spin">
                        <SpinnerIcon />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tableData.length ? (
                tableData.map((item, index) => (
                  <TableRow
                    key={item[primaryKey] as React.Key}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                    }
                    onClick={() => onRowClick?.(item)}
                  >
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

                    {columnKeys.map((clm, index) => (
                      <React.Fragment
                        key={`${item[primaryKey]}_${clm}_${index}`}
                      >
                        {clm == "status" && showDropdown ? (
                          <TableCell
                            className={`break-words overflow-wrap-anywhere ${"px-6"} text-red-600`}
                            style={{
                              width: columnWidths[clm]
                                ? `${columnWidths[clm]}px`
                                : "150px",
                              maxWidth: columnWidths[clm]
                                ? `${columnWidths[clm]}px`
                                : "150px",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <FormSelect
                              id={String(item?.status)}
                              options={statusOptions}
                              value={item?.status as string}
                              onChange={(selectedStatus) => {
                                // console.log(selectedStatus, item);

                                handleStatusChange(
                                  selectedStatus as string,
                                  item,
                                );
                              }}
                              className="mt-0 w-full"
                            />
                          </TableCell>
                        ) : (
                          <TableCell
                            className={`break-words overflow-wrap-anywhere ${
                              clm === "srNo" ? "pl-4 pr-0" : "px-6"
                            }`}
                            style={{
                              width:
                                clm === "srNo"
                                  ? `${FIXED_WIDTHS.srNo}px`
                                  : columnWidths[clm]
                                    ? `${columnWidths[clm]}px`
                                    : "150px",
                              maxWidth:
                                clm === "srNo"
                                  ? `${FIXED_WIDTHS.srNo}px`
                                  : columnWidths[clm]
                                    ? `${columnWidths[clm]}px`
                                    : "150px",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            {String(item[clm] || " - ")}
                          </TableCell>
                        )}
                      </React.Fragment>
                    ))}

                    <TableCell
                      style={{ width: `${FIXED_WIDTHS.action}px` }}
                      className="text-left sticky right-0 pr-6 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 items-center justify-start">
                        {isActionButton?.(item) && permission?.Edit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onEdit?.(item)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}
                        {isActionButton?.(item) &&
                          permission?.Delete &&
                          (!canDelete || canDelete(item)) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => onDelete?.(item)}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          )}
                        {customActions?.(item)}
                        {additionalButton && permission?.Edit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onAdditionButton(item)}
                              >
                                <KeyRound className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Permission</TooltipContent>
                          </Tooltip>
                        )}
                        {viewButton && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onViewButton?.(item)}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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

export default TableWithDropdown;
