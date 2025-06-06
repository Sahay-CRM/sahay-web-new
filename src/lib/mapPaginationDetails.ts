export function mapPaginationDetails<
  T extends {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
    hasMore: boolean;
    status: number;
    sortBy?: string;
    sortOrder?: string;
    message?: string;
  },
>(
  res: T | undefined,
):
  | (PaginationFilter & { sortBy?: string; sortOrder?: "asc" | "desc" })
  | undefined {
  if (!res) return undefined;
  return {
    currentPage: res.currentPage,
    pageSize: res.pageSize,
    totalCount: res.totalCount,
    totalPage: res.totalPage,
    hasMore: res.hasMore,
    status: res.status,
    sortBy: typeof res.sortBy === "string" ? res.sortBy : undefined,
    sortOrder:
      res.sortOrder === "asc" || res.sortOrder === "desc"
        ? res.sortOrder
        : "asc",
    message: res.message,
  };
}
