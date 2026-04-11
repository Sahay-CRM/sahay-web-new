import { useState } from "react";
import {
  useGetRequestMaster,
  useCancelRequestMasterMutation,
  useDeleteRequestMasterMutation,
  useUpdateRequestMasterMutation,
} from "@/features/api/RequestMaster";

export const useRequestMasterList = () => {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestMasterData | null>(null);

  const [filters, setFilters] = useState({
    status: ["PENDING"] as string[],
    type: [] as string[],
  });

  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Declined", value: "DECLINED" },
  ];

  const typeOptions = [
    { label: "Task", value: "TASK" },
    { label: "Project", value: "PROJECT" },
  ];

  const handleFilterChange = (key: string, value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPaginationFilter((prev) => ({ ...prev, currentPage: 1 }));
  };

  const { data: requestData, isLoading } = useGetRequestMaster({
    filter: {
      ...paginationFilter,
      ...filters,
    },
  });

  const { mutate: cancelRequest } = useCancelRequestMasterMutation();
  const { mutate: deleteRequest } = useDeleteRequestMasterMutation();
  const { mutate: updateRequest } = useUpdateRequestMasterMutation();

  const onCancel = (id: string) => {
    cancelRequest(id);
  };

  const onDelete = (id: string) => {
    deleteRequest(id);
  };

  const onUpdateStatus = (id: string, status: string) => {
    updateRequest(
      { id, data: { status } },
      {
        onSuccess: () => {
          setIsUpdateModalOpen(false);
          setSelectedRequest(null);
        },
      },
    );
  };

  return {
    requestData,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    onCancel,
    onDelete,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedRequest,
    setSelectedRequest,
    onUpdateStatus,
    filters,
    handleFilterChange,
    statusOptions,
    typeOptions,
  };
};
