import { useEffect, useState } from "react";

interface UsePaginationProps {
  paginationDetail?: PaginationFilter;
  setPaginationFilter?: (paginationDetail: PaginationFilter) => void;
}

const paginationOptions = [
  { id: "1000", label: "10", value: 10 },
  { id: "1001", label: "25", value: 25 },
  { id: "1002", label: "50", value: 50 },
  { id: "1003", label: "100", value: 100 },
  { id: "1004", label: "500", value: 500 },
  { id: "1005", label: "1000", value: 1000 },
];

export default function usePagination({
  paginationDetail = {
    currentPage: 1,
    pageSize: 10,
    totalPage: 1,
    totalCount: 0,
    hasMore: false,
    status: 1,
  },
  setPaginationFilter,
}: UsePaginationProps) {
  const totalCount = paginationDetail.totalCount ?? 0;
  const pageSize = paginationDetail.pageSize ?? 10;
  const totalPage = paginationDetail.totalPage ?? 1;
  const hasMore = paginationDetail.hasMore ?? false;
  const currentStatus = paginationDetail.status ?? 1;

  const [currentPage, setCurrentPage] = useState<number>(
    paginationDetail.currentPage ?? 1,
  );
  const activeCurrentPage = paginationDetail.currentPage ?? 1;

  useEffect(() => {
    setCurrentPage(paginationDetail.currentPage ?? 1);
  }, [paginationDetail.currentPage]);

  // Calculate 'from' and 'to' with safe defaults
  const from = (activeCurrentPage - 1) * pageSize + 1;
  const to = Math.min(activeCurrentPage * pageSize, totalCount);

  // Handle changes
  const handleSetCurrentPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCurrentPage(Number(event.target.value) || 1);
  };

  const onPageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value) || 10;
    const newPage =
      Math.floor(((currentPage - 1) * pageSize + 1) / newPageSize) + 1;

    setPaginationFilter?.({
      ...paginationDetail,
      currentPage: newPage,
      pageSize: newPageSize,
      status: currentStatus,
    });
  };

  const onPageChange = (pageNumber: number) => {
    setPaginationFilter?.({ ...paginationDetail, currentPage: pageNumber });
  };

  const onBlurPageInput = () => {
    setCurrentPage(activeCurrentPage);
  };

  return {
    paginationOptions,
    from,
    to,
    currentPage,
    totalCount,
    pageSize,
    totalPage,
    hasMore,
    onPageSizeChange,
    onPageChange,
    handleSetCurrentPageChange,
    activeCurrentPage,
    onBlurPageInput,
  };
}
