import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  deleteObjectiveMutation,
  useGetObjective,
} from "@/features/api/Objective";

export default function useObjectives() {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [modalData, setModalData] = useState<ObjectiveProps>(
    {} as ObjectiveProps,
  );
  const [addModal, setAddModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();

  const permission = useSelector(getUserPermission).ISSUES;

  const { data: objectiveList, isLoading } = useGetObjective({
    filter: paginationFilter,
  });

  const { mutate: deleteObjective } = deleteObjectiveMutation();

  const openModal = useCallback((data: ObjectiveProps) => {
    setModalData(data);
    setAddModal(true);
    setIsChildData("");
  }, []);

  const handleAdd = () => {
    setAddModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = (): void => {
    setModalData({
      objectiveName: "",
      objectiveId: "",
    });
    // Clear modal data
    setAddModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: ObjectiveProps) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData.objectiveId) {
      deleteObjective(modalData.objectiveId, {
        onSuccess: () => {
          closeDeleteModal();
          setIsChildData("");
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{
            message?: string;
            status: number;
          }>;

          if (axiosError.response?.data?.status === 417) {
            setIsChildData(axiosError.response?.data?.message);
          } else if (axiosError.response?.data.status !== 417) {
            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          }
        },
      });
    }
  };

  return {
    addModal,
    objectiveList,
    modalData,
    isChildData,
    isDeleteModalOpen,
    openModal,
    handleAdd,
    onDelete,
    conformDelete,
    isLoading,
    permission,
    paginationFilter,
    setPaginationFilter,
    closeDeleteModal,
  };
}
