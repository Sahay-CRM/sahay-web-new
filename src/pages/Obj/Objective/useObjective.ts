import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  addUpdateObjective,
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [isDataFilter, setIsDataFilter] = useState("false");

  const permission = useSelector(getUserPermission).ISSUES;

  const { data: objectiveList, isLoading } = useGetObjective({
    filter: { ...paginationFilter, isDelete: isDataFilter },
  });
  const { mutate: addObjective } = addUpdateObjective();
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
    setIsDeleteOpen(false);
  };

  const onDelete = useCallback((data: ObjectiveProps) => {
    if (data.isDelete === true) {
      setIsDeleteOpen(true);
      setModalData(data);
      setIsDeleteModalOpen(false);
    } else {
      setIsDeleteModalOpen(true);
      setModalData(data);
      setIsChildData("");
      setIsDeleteOpen(false);
    }
  }, []);

  const conformDelete = async (isSoft?: boolean) => {
    if (modalData.objectiveId) {
      const payload = {
        objectiveId: modalData.objectiveId,
        isForce: isSoft ? false : isDataFilter === "false" ? false : true,
      };

      deleteObjective(payload, {
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

  const conformForceDelete = async () => {
    if (modalData.objectiveId) {
      const payload = {
        objectiveId: modalData.objectiveId,
        isForce: true,
      };
      deleteObjective(payload, {
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

  const handleRestoreObj = (data: ObjectiveProps) => {
    const payload = {
      objectiveId: data.objectiveId,
      isDelete: !data.isDelete,
      objectiveName: data.objectiveName,
    };
    addObjective(payload);
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
    conformForceDelete,
    isDataFilter,
    setIsDataFilter,
    handleRestoreObj,
    isDeleteOpen,
  };
}
