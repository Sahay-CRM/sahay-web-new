interface PaginationFilter {
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
  hasMore?: boolean;
  status?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  message?: string;
  search?: string;
}
