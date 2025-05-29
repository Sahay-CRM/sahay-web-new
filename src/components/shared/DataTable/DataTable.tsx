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
}
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
}: TableProps<T>) => {
  const columnKeys = Object.keys(columns ?? {});
  const showCheckboxes = multiSelect || (!!selectedValue && !!handleChange);

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
      <div className="overflow-x-auto max-h-[calc(100svh-183px)] tb:max-h-[calc(100svh-260px)]">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className=" !w-1 text-md font-semibold capitalize tracking-wider">
                  {/* Master checkbox optional */}
                </TableHead>
              )}

              {showIndexColumn && (
                <TableHead className="text-center !w-1 text-md font-semibold capitalize tracking-wider">
                  #
                </TableHead>
              )}

              {columnKeys.map((clm, index) => (
                <TableHead
                  key={clm + index}
                  className={`text-left text-md font-semibold capitalize tracking-wider ${
                    clm === "sr_no"
                      ? ""
                      : "text-left !w-1 px-6 text-md font-semibold capitalize tracking-wider"
                  }`}
                >
                  {columns[clm]}
                </TableHead>
              ))}

              <TableHead className="text-left align-middle text-md font-semibold capitalize tracking-wider p-2 tb:p-2">
                {/* {en["app.table.action"]} */}
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
                      {/* <SpinnerIcon /> */}loading...
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : tableData.length ? (
              tableData.map((item, index) => (
                <TableRow key={item[primaryKey] as React.Key}>
                  {showCheckboxes && (
                    <TableCell className="text-center h-8  p-0  whitespace-nowrap">
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
                    <TableCell className="text-center w-20 p-0">
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
                        clm === "sr_no" ? "w-10  px-0" : "px-6 "
                      }`}
                    >
                      {String(item[clm] || " - ")}
                    </TableCell>
                  ))}

                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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

                        {!isActionButton && (!canDelete || canDelete(item)) && (
                          <DropdownMenuItem onClick={() => onDelete?.(item)}>
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
