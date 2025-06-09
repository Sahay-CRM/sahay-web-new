import React from "react";
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
  Pencil,
  Trash,
  ChevronUp,
  ChevronDown,
  KeyRound,
  EyeIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Pagination from "../Pagination/Pagination";
import FormCheckbox from "../Form/FormCheckbox/FormCheckbox";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { SpinnerIcon } from "../Icons";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { isColorDark } from "@/features/utils/color.utils";

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
  onRowClick?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  paginationDetails?: PaginationFilter & {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
  setPaginationFilter?: (
    filter: PaginationFilter & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ) => void;
  isLoading?: boolean;
  isActionButton?: (item: T) => boolean;
  additionalButton?: ((item: T) => boolean) | React.ReactNode;
  viewButton?: React.ReactNode;
  onAdditionButton?: (item: T) => void;
  isEditDelete?: boolean;
  onViewButton?: (item: T) => void;
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
  localStorageId?: string;
  moduleKey?: string;
  dropdownColumns?: Record<
    string,
    {
      options: { label: string; value: string; color?: string }[];
      onChange: (item: T, value: string) => void;
    }
  >;
  sortableColumns?: string[];
}

const TableData = <T extends Record<string, unknown>>({
  tableData = [],
  columns = {},
  primaryKey,
  onEdit,
  onDelete,
  onRowClick,
  canDelete,
  customActions,
  paginationDetails,
  setPaginationFilter,
  isLoading = false,
  isActionButton,
  onAdditionButton = () => {},
  onViewButton = () => {},
  additionalButton,
  viewButton,
  onMoveRowUp,
  onMoveRowDown,
  showIndexColumn = false,
  multiSelect = false,
  selectedValue = [],
  handleChange,
  onCheckbox,
  isEditDelete = true,
  moduleKey = "",
  dropdownColumns = {},
  sortableColumns = [],
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  // Only show checkboxes if explicitly enabled with multiSelect OR if both selectedValue and handleChange are provided
  const showCheckboxes =
    multiSelect || (!!selectedValue && !!handleChange && !!onCheckbox);

  const permission = useSelector(getUserPermission)?.[moduleKey];

  // Determine if the Actions column should be shown
  const showActionsColumn =
    typeof isActionButton === "function"
      ? tableData.some((item) => isActionButton(item))
      : true;

  const handleCheckboxChange = (item: T, isChecked: boolean) => {
    const selectedItems = Array.isArray(selectedValue) ? selectedValue : [];

    if (multiSelect) {
      if (isChecked) {
        // Add item to selection
        const updatedSelection = [...selectedItems, item];
        handleChange?.(updatedSelection);
        onCheckbox?.(updatedSelection);
      } else {
        // Remove item from selection - handle both string IDs and objects
        const updatedSelection = selectedItems.filter((selected) => {
          // Handle case where selected might be a string ID or an object
          const selectedId =
            typeof selected === "object" && selected !== null
              ? selected[primaryKey]
              : selected;
          const itemId = item[primaryKey];
          return selectedId !== itemId;
        });
        handleChange?.(updatedSelection);
        onCheckbox?.(updatedSelection);
      }
    } else {
      if (isChecked) {
        handleChange?.(item);
        onCheckbox?.([item]);
      } else {
        // For single select, clear selection when unchecked
        handleChange?.([] as T[]);
        onCheckbox?.([]);
      }
    }
  };

  const handleRowClickOrCheckbox = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (showCheckboxes) {
      // Toggle checkbox when row is clicked and no onRowClick is provided
      const isCurrentlySelected = multiSelect
        ? Array.isArray(selectedValue) &&
          selectedValue.some((selected) => {
            const selectedId =
              typeof selected === "object" && selected !== null
                ? selected[primaryKey]
                : selected;
            return selectedId === item[primaryKey];
          })
        : (selectedValue as T)?.[primaryKey] === item[primaryKey];

      handleCheckboxChange(item, !isCurrentlySelected);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!sortableColumns.includes(columnKey) || !setPaginationFilter) return;

    const currentSortBy = paginationDetails?.sortBy;
    const currentSortOrder = paginationDetails?.sortOrder || "asc";

    let newSortOrder: "asc" | "desc" = "asc";

    if (currentSortBy === columnKey) {
      // Toggle between asc and desc for the same column
      newSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    } else {
      // Start with asc for a new column
      newSortOrder = "asc";
    }

    setPaginationFilter({
      ...paginationDetails,
      sortBy: columnKey,
      sortOrder: newSortOrder,
      currentPage: 1, // Reset to first page when sorting
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
    <Card className="w-full p-2 mb-5">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-[40px] pl-6">
                  {/* Checkbox column header */}
                </TableHead>
              )}

              {showIndexColumn && <TableHead className="w-[80px]">#</TableHead>}

              {columnKeys.map((clm, index) => (
                <TableHead
                  key={clm + index}
                  className={`
                    ${
                      clm === "srNo"
                        ? "w-[40px] pl-6"
                        : index === 1
                          ? "min-w-[150px] pl-8"
                          : "min-w-[150px]"
                    }
                    ${sortableColumns.includes(clm) ? "cursor-pointer select-none" : ""}
                  `}
                  onClick={() => handleSort(clm)}
                >
                  <div className="flex items-center">
                    {columns[clm]}
                    {getSortIcon(clm)}
                  </div>
                </TableHead>
              ))}
              {showActionsColumn && (
                <TableHead className="w-[100px] sticky right-0 text-left pr-6 bg-primary">
                  Actions
                </TableHead>
              )}
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
                  className={`
                    ${onRowClick || showCheckboxes ? "cursor-pointer" : ""}
                    ${onRowClick ? "hover:bg-gray-100" : showCheckboxes ? "hover:bg-gray-100" : "hover:bg-gray-50"}
                    ${index % 2 === 0 ? "bg-gray-25" : "bg-white"}
                  `}
                  onClick={() => handleRowClickOrCheckbox(item)}
                >
                  {showCheckboxes && (
                    <TableCell
                      className="text-center p-0 whitespace-nowrap pl-6"
                      onClick={(e) => e.stopPropagation()}
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
                            ? Array.isArray(selectedValue) &&
                              selectedValue.some((selected) => {
                                const selectedId =
                                  typeof selected === "object" &&
                                  selected !== null
                                    ? selected[primaryKey]
                                    : selected;
                                return selectedId === item[primaryKey];
                              })
                            : (selectedValue as T)?.[primaryKey] ===
                              item[primaryKey]
                        }
                      />
                    </TableCell>
                  )}

                  {showIndexColumn && (
                    <TableCell
                      className="text-center p-0"
                      onClick={(e) => e.stopPropagation()}
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
                    <TableCell
                      key={`${item[primaryKey]}_${clm}`}
                      className={`whitespace-nowrap ${
                        clm === "srNo"
                          ? "pl-6 pr-4"
                          : index === 1
                            ? "pl-8 pr-4"
                            : "px-4"
                      }`}
                    >
                      {dropdownColumns[clm] ? (
                        <select
                          className="border rounded px-2 py-1 min-w-[100px]"
                          style={{
                            backgroundColor:
                              dropdownColumns[clm].options.find(
                                (option) => option.label === item[clm],
                              )?.color || undefined,
                            color: (() => {
                              const bg = dropdownColumns[clm].options.find(
                                (option) => option.label === item[clm],
                              )?.color;
                              if (bg) {
                                return isColorDark(bg) ? "#fff" : "#000";
                              }
                              return undefined;
                            })(),
                          }}
                          value={
                            typeof item.status === "string" ? item.status : ""
                          }
                          onChange={(e) =>
                            dropdownColumns[clm].onChange(item, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with dropdown
                        >
                          <option
                            value=""
                            style={{ backgroundColor: "white", color: "#000" }}
                            className="text-black"
                          >
                            Select
                          </option>
                          {dropdownColumns[clm].options.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              style={{
                                backgroundColor: "white",
                                color: "#000",
                              }}
                              className="text-black"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        String(item[clm] || " - ")
                      )}
                    </TableCell>
                  ))}
                  {showActionsColumn && (
                    <TableCell
                      className="text-left sticky right-0 pr-6 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 items-center justify-start">
                        {isEditDelete &&
                          isActionButton?.(item) &&
                          permission?.Edit && (
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
                        {isEditDelete &&
                          isActionButton?.(item) &&
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
                        {typeof additionalButton === "function"
                          ? additionalButton(item) &&
                            permission?.Edit && (
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
                            )
                          : additionalButton &&
                            permission?.Edit && (
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
                                onClick={() => onViewButton(item)}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  )}
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
