import {
  deleteDesignationMutation,
  getDesignationList,
} from "@/features/api/designation";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

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

  const { data: designationList } = getDesignationList({
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
    setModalData(data); // Set the data for the modal
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
    }); // Clear modal data
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
      });
    }
  };
  // const openImportModal = useCallback(() => {
  //   setIsImportExportModalOpen(true);
  //   setIsImport(true);
  // }, []);
  // const openExportModal = useCallback(() => {
  //   setIsImportExportModalOpen(true);
  //   setIsImport(false);
  // }, []);

  return {
    // isLoading,
    designationList,
    closeDeleteModal,
    setPaginationFilter, // Use the updated function
    // onStatusChange,
    // currentStatus, // Return currentStatus state
    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,
    // Removed 'control' as it is not declared or initialized
    // paginationFilter,
    addDesignationModal,
    // openImportModal,
    // openExportModal,
    isImportExportModalOpen,
    // isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
    permission,
  };
}
