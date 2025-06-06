import {
  deleteDesignationMutation,
  getDesignationList,
} from "@/features/api/designation";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function useAdminUser() {
  const [addDesignationModal, setaddDesignationModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DesignationData>(
    {} as DesignationData,
  );
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const permission = useSelector(getUserPermission).DESIGNATION;

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const { mutate: deleteDesignation } = deleteDesignationMutation();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const { data: designationList, isLoading } = getDesignationList({
    filter: paginationFilter,
  });

  const handleAdd = () => {
    setModalData({
      designationId: "",
      designationName: "",
      parentId: null,
      companyId: "",
      departmentId: "",
      departmentName: "",
      companyName: "",
    });
    setaddDesignationModal(true);
  };

  const openModal = useCallback((data: DesignationData) => {
    setModalData(data);
    setaddDesignationModal(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      designationId: "",
      designationName: "",
      parentId: null,
      companyId: "",
      departmentId: "",
      departmentName: "",
      companyName: "",
    });
    setaddDesignationModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: DesignationData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setaddDesignationModal(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData && modalData.designationId) {
      deleteDesignation(modalData.designationId, {
        onSuccess: () => {
          closeDeleteModal();
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
    isLoading,
    designationList,
    closeDeleteModal,
    setPaginationFilter,

    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,

    addDesignationModal,

    paginationFilter,
    isImportExportModalOpen,

    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
    permission,
  };
}
