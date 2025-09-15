import { deleteRequestMutation, useGetRequest } from "@/features/api/Request";
import { useState } from "react";

export default function useRequest() {
  const [isDataFilter, setIsDataFilter] = useState("PENDING");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [isEditData, setIsEditData] = useState<CreateRequest | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: deleteReq } = deleteRequestMutation();
  const { data: reqData, isLoading } = useGetRequest({
    filter: {
      ...paginationFilter,
      requestStatus: isDataFilter,
    },
    enable: !!isDataFilter,
  });

  const handleClose = () => {
    setModalOpen(false);
    setIsEditData(null);
  };

  const onDelete = (changeRequestId: string) => {
    deleteReq(changeRequestId);
  };

  return {
    paginationFilter,
    reqData,
    setPaginationFilter,
    isLoading,
    isDataFilter,
    setIsDataFilter,
    onDelete,
    isEditData,
    isModalOpen,
    handleClose,
  };
}
