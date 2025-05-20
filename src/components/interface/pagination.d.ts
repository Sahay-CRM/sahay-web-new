interface PaginationFilter {
  status?: string | number;
  currentPage?: number;
  message?: string;
  totalCount?: number;
  hasMore?: boolean;
  pageSize?: number;
  totalPage?: number;
  search?: string;
  sortBy?: string;
}
