interface PaginationFilter {
  status?: number;
  currentPage?: number;
  message?: string;
  totalCount?: number;
  hasMore?: boolean;
  pageSize?: number;
  totalPage?: number;
  search?: string;
  sortBy?: string;
}
