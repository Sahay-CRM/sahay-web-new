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
import { getColorFromName } from "@/features/utils/formatting.utils";
import { isColorDark } from "@/features/utils/color.utils";
import { TableTooltip } from "./tableTooltip";
import { twMerge } from "tailwind-merge";

interface DetailsPermission {
  view: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface ColumnConfig {
  label: string;
  tooltipColumn?: string;
  width?: string;
}

interface TableProps<T extends Record<string, unknown>> {
  tableData?: T[];
  columns?: Partial<Record<keyof T, string | ColumnConfig>>;
  primaryKey: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  paginationDetails?: PaginationFilter & {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  };
  setPaginationFilter?: (
    filter: PaginationFilter & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      search?: string;
    },
  ) => void;
  isLoading?: boolean;
  searchValue?: string;
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
  extraColumn?: {
    label: string;
    width?: string;
    render: (item: T) => React.ReactNode;
  };
  indexColumnWidth?: string;
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
  searchValue,
  extraColumn,
  indexColumnWidth = "w-[80px]",
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  // Only show checkboxes if explicitly enabled with multiSelect OR if both selectedValue and handleChange are provided
  const showCheckboxes = multiSelect || !!onCheckbox;

  const permission = useSelector(getUserPermission)?.[moduleKey];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      handleChange?.(tableData);
      onCheckbox?.(tableData);
    } else {
      handleChange?.([]);
      onCheckbox?.([]);
    }
  };

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
      search: searchValue,
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
                <TableHead
                  className={twMerge(
                    "w-[40px] bg-transparent sticky left-0 z-20 text-center",
                  )}
                >
                  <FormCheckbox
                    checked={
                      tableData.length > 0 &&
                      (Array.isArray(selectedValue)
                        ? selectedValue.length === tableData.length
                        : false)
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
              )}

              {showIndexColumn && (
                <TableHead
                  className={twMerge(
                    "bg-transparent sticky z-20 text-center",
                    showCheckboxes ? "left-[40px]" : "left-0",
                    indexColumnWidth,
                  )}
                >
                  #
                </TableHead>
              )}

              {columnKeys.map((clm, index) => {
                const clmWidth =
                  typeof columns[clm] === "object"
                    ? (columns[clm] as ColumnConfig).width
                    : "";

                return (
                  <TableHead
                    key={clm + index}
                    className={twMerge(
                      "truncate text-left px-4",
                      clmWidth || (clm === "srNo" ? "w-[80px]" : ""),
                      sortableColumns.includes(clm)
                        ? "cursor-pointer select-none"
                        : "",
                    )}
                    onClick={() => handleSort(clm)}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <TableTooltip
                        text={String(
                          typeof columns[clm] === "object"
                            ? (columns[clm] as ColumnConfig).label
                            : (columns[clm] ?? " - "),
                        )}
                      />
                      {getSortIcon(clm)}
                    </div>
                  </TableHead>
                );
              })}

              {extraColumn && tableData.length > 0 && (
                <TableHead
                  className={twMerge(
                    "truncate text-left px-4",
                    extraColumn.width,
                  )}
                >
                  <TableTooltip text={extraColumn.label} />
                </TableHead>
              )}

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
                      className={twMerge(
                        "sticky bg-white text-center px-2",
                        showCheckboxes ? "left-[40px]" : "left-0",
                        indexColumnWidth,
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {onMoveRowUp && onMoveRowDown && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => onMoveRowUp?.(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        )}

                        {onMoveRowUp && onMoveRowDown && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => onMoveRowDown?.(index)}
                            disabled={index === tableData.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {columnKeys.map((clm) => {
                    const clmWidth =
                      typeof columns[clm] === "object"
                        ? (columns[clm] as ColumnConfig).width
                        : "";

                    return (
                      <TableCell
                        key={clm}
                        className={twMerge(
                          "truncate whitespace-nowrap px-4",
                          clmWidth,
                          dropdownColumns[clm] ? "whitespace-nowrap" : "",
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
                          (() => {
                            const columnConfig = columns[clm] as
                              | ColumnConfig
                              | undefined;
                            const cellValue = String(item[clm] ?? " - ");
                            const tooltipValue = columnConfig?.tooltipColumn
                              ? String(
                                  item[columnConfig.tooltipColumn as keyof T] ??
                                    "",
                                )
                              : cellValue;

                            if (columnConfig?.tooltipColumn) {
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`whitespace-normal break-words max-w-[230px] ${(clm === "employeeName" || clm === "createdByEmployeeName") && `w-7 min-w-[28px] flex flex-col items-center justify-center aspect-square rounded-full text-[16px] font-bold ${getColorFromName(cellValue)}`}`}
                                      >
                                        {cellValue}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {tooltipValue}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            }
                            return <TableTooltip text={cellValue} />;
                          })()
                        )}
                      </TableCell>
                    );
                  })}

                  {extraColumn && tableData.length > 0 && (
                    <TableCell
                      className={twMerge(
                        "truncate whitespace-nowrap px-4",
                        extraColumn.width,
                      )}
                    >
                      {extraColumn.render(item)}
                    </TableCell>
                  )}

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
                        {additionalButton &&
                        permission &&
                        (permission.Add ||
                          permission.Edit ||
                          permission.View) ? (
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
