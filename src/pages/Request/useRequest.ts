import { useGetRequest } from "@/features/api/Request";
import { useState } from "react";

export default function useRequest() {
  const [isDataFilter, setIsDataFilter] = useState("PENDING");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: reqData, isLoading } = useGetRequest({
    filter: {
      ...paginationFilter,
      requestStatus: isDataFilter,
    },
    enable: !!isDataFilter,
  });

  return {
    paginationFilter,
    reqData,
    setPaginationFilter,
    isLoading,
    isDataFilter,
    setIsDataFilter,
  };
}
