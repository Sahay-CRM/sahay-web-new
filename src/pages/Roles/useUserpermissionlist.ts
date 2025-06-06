import useGetEmployee from "@/features/api/companyEmployee/useGetEmployee";
import { useCallback, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<RolePermission>(
    {} as RolePermission,
  );
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const { data: employeeData, isLoading } = useGetEmployee({
    filter: paginationFilter,
  });

  const handleAdd = () => {
    setModalData(modalData); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: RolePermission) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(modalData); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: RolePermission) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {};

  const openImportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(true);
  }, []);
  const openExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(false);
  }, []);
  const navigate = useNavigate();

  interface EmployeeItem {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeeMobile: string;
    companyId: string;
    employeeType: string;
    departmentId: string | null;
    designationId: string | null;
    isSuperAdmin: boolean;
    departmentName?: string | null;
    designationName?: string | null;
  }

  const onPermissionButton = (item: EmployeeItem) => {
    // Prepare static data or use item as needed
    const searchParams: Record<string, string> = {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      departmentName: item.departmentName || "",
      designationName: item.designationName || "",
      // add more fields as needed
    };

    navigate({
      pathname: "/dashboard/roles/userpermissionlist/edit",
      search: createSearchParams(searchParams).toString(),
    });
  };

  return {
    isLoading,
    employeeData,
    closeDeleteModal,
    onPermissionButton,
    setPaginationFilter,

    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,

    paginationFilter,
    isUserModalOpen,
    openImportModal,
    openExportModal,
    isImportExportModalOpen,
    isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
  };
}
