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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { TableTooltip } from "./tableTooltip";
import { twMerge } from "tailwind-merge";

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
  isEditDelete?: (item: T) => boolean;

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
  onToggleActive?: (item: T) => void;
  showActiveToggle?: boolean;
  activeToggleKey?: string;
  isEditDeleteShow?: boolean;
  showActionsColumn?: boolean;
  actionColumnWidth?: string;
  isPermissionIcon?: (item: T) => boolean;
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
  // isEditDelete,
  moduleKey = "",
  dropdownColumns = {},
  sortableColumns = [],
  onToggleActive,
  showActiveToggle = false,
  activeToggleKey,
  isEditDeleteShow = false,
  showActionsColumn = true,
  actionColumnWidth,
  isPermissionIcon,
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  // Only show checkboxes if explicitly enabled with multiSelect OR if both selectedValue and handleChange are provided
  const showCheckboxes =
    multiSelect || (!!selectedValue && !!handleChange && !!onCheckbox);

  const permission = useSelector(getUserPermission)?.[moduleKey];

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

  const getActiveState = (item: T) => {
    return activeToggleKey ? item[activeToggleKey] : undefined;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin">
          <SpinnerIcon />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-0 gap-0">
      <div className="flex h-[calc(100vh-350px)] flex-col overflow-hidden">
        <Table className="min-w-full h-full table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-primary shadow-sm">
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-[40px] bg-transparent sticky left-0 z-40 pl-6">
                  {/* Checkbox Header */}
                </TableHead>
              )}

              {showIndexColumn && (
                <TableHead className="w-[80px] bg-transparent sticky left-[40px] z-20 text-center">
                  #
                </TableHead>
              )}

              {columnKeys.map((clm, index) => (
                <TableHead
                  key={clm + index}
                  className={`
                truncate text-left px-4
                ${clm === "srNo" ? "w-[80px]" : ""}
                ${sortableColumns.includes(clm) ? "cursor-pointer select-none" : ""}
                ${showActionsColumn === false && "bg-primary"}
              `}
                  onClick={() => handleSort(clm)}
                >
                  <div className="flex items-center gap-1 truncate">
                    <TableTooltip text={String(columns[clm] ?? " - ")} />
                    {getSortIcon(clm)}
                  </div>
                </TableHead>
              ))}

              {showActionsColumn ? (
                <TableHead
                  className={`w-fit sticky right-0 z-50 bg-transparent text-left pr-2 ${actionColumnWidth}`}
                >
                  Actions
                </TableHead>
              ) : (
                <TableHead className="w-1" />
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableData.length ? (
              tableData.map((item, index) => (
                <TableRow
                  key={item[primaryKey] as React.Key}
                  className={`${
                    (item as { isDisabled?: boolean }).isDisabled
                      ? "bg-gray-200 opacity-60 pointer-events-none select-none"
                      : index % 2 === 0
                        ? "bg-gray-25"
                        : "bg-white"
                  } hover:bg-gray-100`}
                  onClick={() =>
                    !(item as { isDisabled?: boolean }).isDisabled &&
                    handleRowClickOrCheckbox(item)
                  }
                >
                  {showCheckboxes && (
                    <TableCell
                      className="sticky left-0  bg-inherit text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FormCheckbox
                        id={`${String(item[primaryKey])}-checkbox`}
                        className="w-[16px] h-[16px]"
                        containerClass="p-0 ml-1"
                        onChange={(e) =>
                          handleCheckboxChange(item, e.target.checked)
                        }
                        checked={
                          multiSelect
                            ? Array.isArray(selectedValue) &&
                              selectedValue.some((selected) => {
                                const selectedId =
                                  typeof selected === "object"
                                    ? selected[primaryKey]
                                    : selected;
                                return selectedId === item[primaryKey];
                              })
                            : (selectedValue as T)?.[primaryKey] ===
                              item[primaryKey]
                        }
                        disabled={(item as { isDisabled?: boolean }).isDisabled}
                      />
                    </TableCell>
                  )}

                  {showIndexColumn && (
                    <TableCell
                      className="sticky left-[40px] bg-white text-center"
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

                  {columnKeys.map((clm) => (
                    <TableCell
                      key={`${item[primaryKey]}_${clm}`}
                      className={
                        dropdownColumns[clm]
                          ? "whitespace-nowrap px-4"
                          : "truncate whitespace-nowrap px-4"
                      }
                      onClick={
                        dropdownColumns[clm]
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {dropdownColumns[clm] ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[100px] justify-between"
                              style={{
                                backgroundColor:
                                  dropdownColumns[clm].options.find(
                                    (option) => option.label === item[clm],
                                  )?.color || undefined,
                                color: (() => {
                                  const bg = dropdownColumns[clm].options.find(
                                    (option) => option.label === item[clm],
                                  )?.color;
                                  return bg
                                    ? isColorDark(bg)
                                      ? "#fff"
                                      : "#000"
                                    : undefined;
                                })(),
                              }}
                            >
                              {String(item[clm] || "Select")}
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {dropdownColumns[clm].options.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  dropdownColumns[clm].onChange(
                                    item,
                                    option.value,
                                  )
                                }
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <>
                          {/* {clm === "srNo" ? (
                            <div className="truncate">
                              {String(item[clm] ?? " - ")}
                            </div>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {String(item[clm] ?? " - ")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {String(item[clm] ?? " - ")}
                              </TooltipContent>
                            </Tooltip>
                          )} */}
                          <TableTooltip text={String(item[clm] ?? " - ")} />
                        </>
                      )}
                    </TableCell>
                  ))}

                  {showActionsColumn && (
                    <TableCell
                      className={twMerge(
                        "sticky w-fit right-0 bg-white text-right pr-2",
                        actionColumnWidth,
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 justify-end items-end">
                        {customActions?.(item)}
                        {additionalButton ? (
                          <div>
                            {isPermissionIcon?.(item) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      !(item as { isDisabled?: boolean })
                                        .isDisabled && onAdditionButton(item)
                                    }
                                    disabled={
                                      (item as { isDisabled?: boolean })
                                        .isDisabled
                                    }
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Permission</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        ) : (
                          <>
                            {isEditDeleteShow ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      !(item as { isDisabled?: boolean })
                                        .isDisabled && onEdit?.(item)
                                    }
                                    disabled={
                                      (item as { isDisabled?: boolean })
                                        .isDisabled
                                    }
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            ) : (
                              isActionButton?.(item) &&
                              permission?.Edit && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        !(item as { isDisabled?: boolean })
                                          .isDisabled && onEdit?.(item)
                                      }
                                      disabled={
                                        (item as { isDisabled?: boolean })
                                          .isDisabled
                                      }
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              )
                            )}

                            {isEditDeleteShow ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600"
                                    onClick={() =>
                                      !(item as { isDisabled?: boolean })
                                        .isDisabled && onDelete?.(item)
                                    }
                                    disabled={
                                      (item as { isDisabled?: boolean })
                                        .isDisabled
                                    }
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            ) : (
                              isActionButton?.(item) &&
                              permission?.Delete &&
                              (!canDelete || canDelete(item)) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600"
                                      onClick={() =>
                                        !(item as { isDisabled?: boolean })
                                          .isDisabled && onDelete?.(item)
                                      }
                                      disabled={
                                        (item as { isDisabled?: boolean })
                                          .isDisabled
                                      }
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              )
                            )}

                            {permission?.Delete &&
                              showActiveToggle &&
                              isActionButton?.(item) &&
                              (!canDelete || canDelete(item)) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className={`h-8 w-auto px-2 ${
                                        getActiveState(item)
                                          ? "bg-primary hover:bg-primary"
                                          : "bg-red-700/80 hover:bg-red-700"
                                      }`}
                                      onClick={() =>
                                        !(item as { isDisabled?: boolean })
                                          .isDisabled && onToggleActive?.(item)
                                      }
                                      disabled={
                                        (item as { isDisabled?: boolean })
                                          .isDisabled
                                      }
                                    >
                                      {getActiveState(item)
                                        ? "Active"
                                        : "Inactive"}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {getActiveState(item)
                                      ? "Set Inactive"
                                      : "Set Active"}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                          </>
                        )}

                        {viewButton && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  !(item as { isDisabled?: boolean })
                                    .isDisabled && onViewButton(item)
                                }
                                disabled={
                                  (item as { isDisabled?: boolean }).isDisabled
                                }
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
