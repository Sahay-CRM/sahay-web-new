import useGetEmployee from "@/features/api/companyEmployee/useGetEmployee";
import { useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";

export interface EmployeeItem {
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

export default function useKpiPermissionList() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<EmployeeItem>>({});
  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: employeeData, isLoading } = useGetEmployee({
    filter: {
      ...paginationFilter,
      isDeactivated: false,
      employeeType: "EMPLOYEE",
    },
  });

  const closeDeleteModal = (): void => {
    setModalData(modalData); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const conformDelete = async () => {};

  const navigate = useNavigate();

  const onPermissionButton = (item: EmployeeItem) => {
    const searchParams: Record<string, string> = {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      departmentName: item.departmentName || "",
      designationName: item.designationName || "",
    };

    navigate({
      pathname: `/dashboard/roles/kpi-permission/edit/${item.employeeId}`,
      search: createSearchParams(searchParams).toString(),
    });
  };

  return {
    isLoading,
    employeeData,
    closeDeleteModal,
    onPermissionButton,
    setPaginationFilter,
    modalData,
    conformDelete,
    paginationFilter,
    isUserModalOpen,
    isDeleteModalOpen,
    isChildData,
  };
}
