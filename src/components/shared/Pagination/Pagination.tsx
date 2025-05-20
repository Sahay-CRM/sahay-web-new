import { Button } from "@/components/ui/button";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import React from "react";
import FormSelect from "../Form/FormSelect/FormSelect";
import usePagination from "./usePagination";

interface PaginationProps {
  paginationDetails: PaginationFilter;
  setPaginationFilter?: (paginationDetail: PaginationFilter) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  paginationDetails,
  setPaginationFilter,
}) => {
  const {
    paginationOptions,
    from,
    to,
    currentPage,
    totalCount,
    pageSize,
    totalPage,
    onPageSizeChange,
    onPageChange,
  } = usePagination({
    paginationDetail: {
      currentPage: paginationDetails?.currentPage ?? 1,
      pageSize: paginationDetails?.pageSize ?? 10,
      totalPage: paginationDetails?.totalPage ?? 1,
      totalCount: paginationDetails?.totalCount ?? 0,
      hasMore: paginationDetails?.hasMore ?? false,
      status: paginationDetails?.status ?? 1,
    },
    setPaginationFilter,
  });

  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(currentPage - 1);
  const goToNextPage = () => onPageChange(currentPage + 1);
  const goToLastPage = () => onPageChange(totalPage);

  return (
    <div className="w-full border-t pt-4 ">
      <div className="w-full max-w-screen-2xl mx-auto px-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {from} to {to} of{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          entries
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:w-auto w-full">
          <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
            <span>Rows:</span>
            <FormSelect
              id="pageSizeSelect"
              onChange={(val) => onPageSizeChange(val)}
              options={paginationOptions}
              className="text-center ps-2"
              value={pageSize?.toString() || ""}
            />
          </div>

          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium">{totalPage}</span>
          </div>

          <div className="flex items-center justify-center gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={goToFirstPage}
              disabled={currentPage === 1 || totalCount === 0}
              className="h-8 w-8"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1 || totalCount === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPage || totalCount === 0}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={goToLastPage}
              disabled={currentPage === totalPage || totalCount === 0}
              className="h-8 w-8"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
