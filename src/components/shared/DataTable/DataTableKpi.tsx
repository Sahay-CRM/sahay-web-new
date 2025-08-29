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
  TooltipProvider,
} from "@/components/ui/tooltip";
import { isColorDark } from "@/features/utils/color.utils";
import { twMerge } from "tailwind-merge";
import { TableTooltip } from "./tableTooltip";

interface DetailsPermission {
  view: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface ColumnConfig {
  label: string;
  tooltipColumn?: string;
}

interface TableProps<T extends Record<string, unknown>> {
  tableData?: T[];
  columns?: Partial<Record<keyof T, ColumnConfig>>;
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
}

const TableDataKpi = <T extends Record<string, unknown>>({
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
  isEditDelete,
  moduleKey = "",
  dropdownColumns = {},
  sortableColumns = [],
  onToggleActive,
  showActiveToggle = false,
  activeToggleKey,
  isEditDeleteShow = true,
  showActionsColumn = true,
  actionColumnWidth,
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  const showCheckboxes =
    multiSelect || (!!selectedValue && !!handleChange && !!onCheckbox);

  const permission = useSelector(getUserPermission)?.[moduleKey];

  const handleCheckboxChange = (item: T, isChecked: boolean) => {
    const selectedItems = Array.isArray(selectedValue) ? selectedValue : [];

    if (multiSelect) {
      if (isChecked) {
        const updatedSelection = [...selectedItems, item];
        handleChange?.(updatedSelection);
        onCheckbox?.(updatedSelection);
      } else {
        const updatedSelection = selectedItems.filter((selected) => {
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
        handleChange?.([] as T[]);
        onCheckbox?.([]);
      }
    }
  };

  const handleRowClickOrCheckbox = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (showCheckboxes) {
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

  const getActiveState = (item: T) => {
    return activeToggleKey ? item[activeToggleKey] : undefined;
  };

  return (
    <Card className="p-0 gap-0">
      <div className="flex h-[calc(100vh-350px)] flex-col overflow-auto">
        <Table className="min-w-full table-auto">
          <TableHeader className="sticky top-0 z-10 bg-primary shadow-sm">
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-[40px] sticky left-0 z-40 bg-primary pl-6">
                  {/* Checkbox Header */}
                </TableHead>
              )}

              {showIndexColumn && (
                <TableHead className="w-[80px] sticky z-20 bg-primary text-center">
                  #
                </TableHead>
              )}

              {columnKeys.map((clm, index) => (
                <TableHead
                  key={clm + index}
                  className={twMerge(
                    "text-left px-4 min-w-[50px]",
                    clm === "srNo" && "w-[80px]",
                    sortableColumns.includes(clm) &&
                      "cursor-pointer select-none",
                    showActionsColumn === false && "bg-primary",
                  )}
                  onClick={() => handleSort(clm)}
                >
                  <div className="flex max-w-[200px] items-center gap-1">
                    <TableTooltip text={String(columns[clm]?.label ?? " - ")} />
                    {getSortIcon(clm)}
                  </div>
                </TableHead>
              ))}

              {showActionsColumn && (
                <TableHead
                  className={twMerge(
                    `w-fit sticky right-0 z-50 text-right bg-primary pr-2 ${actionColumnWidth}`,
                  )}
                >
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
                  className="py-6 w-full"
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
                      className="sticky left-0 bg-inherit text-center"
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

                  {columnKeys.map((clm) => {
                    const columnConfig = columns[clm];
                    const cellValue = String(item[clm] ?? " - ");
                    const tooltipValue = columnConfig?.tooltipColumn
                      ? String(item[columnConfig.tooltipColumn] ?? " - ")
                      : cellValue;

                    return (
                      <TableCell
                        key={`${item[primaryKey]}_${clm}`}
                        className={twMerge(
                          "px-4",
                          dropdownColumns[clm]
                            ? "whitespace-nowrap"
                            : "whitespace-normal break-words",
                        )}
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
                                    const bg = dropdownColumns[
                                      clm
                                    ].options.find(
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
                            {columnConfig?.tooltipColumn ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="whitespace-normal break-words max-w-[230px]">
                                      {cellValue}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {tooltipValue}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="whitespace-normal break-words max-w-[230px]">
                                {cellValue}
                              </div>
                            )}
                          </>
                        )}
                      </TableCell>
                    );
                  })}

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
                                  (item as { isDisabled?: boolean }).isDisabled
                                }
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        ) : (
                          isEditDelete &&
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
                                  (item as { isDisabled?: boolean }).isDisabled
                                }
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        ) : (
                          isEditDelete &&
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
                                  {getActiveState(item) ? "Active" : "Inactive"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {getActiveState(item)
                                  ? "Set Inactive"
                                  : "Set Active"}
                              </TooltipContent>
                            </Tooltip>
                          )}

                        {typeof additionalButton === "function"
                          ? additionalButton(item) &&
                            permission?.Edit && (
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
                            )
                          : additionalButton &&
                            permission?.Edit && (
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

export default TableDataKpi;
