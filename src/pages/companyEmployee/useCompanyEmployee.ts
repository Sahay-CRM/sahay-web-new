import { getEmployee } from "@/features/api/companyEmployee";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<EmployeeData>({} as EmployeeData);
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const permission = useSelector(getUserPermission).EMPLOYEE;
  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    status: currentStatus, // Use currentStatus state
  });

  const { data: employeedata } = getEmployee({
    filter: paginationFilter,
  });

  const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(event.target.value);
    setCurrentStatus(newStatus); // Update currentStatus state

    // Update pagination filter to include the selected status
    setPaginationFilter((prevFilter) => ({
      ...prevFilter,
      status: newStatus,
      currentPage: 1, // Reset to the first page
    }));
  };

  // Ensure currentStatus is passed when updating the pagination filter
  const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
    setPaginationFilter({
      ...filter,
      status: currentStatus, // Always include the currentStatus
    });
  };
  const handleAdd = () => {
    setModalData({
      employeeId: "",
      employeeName: "",
      employeeEmail: "",
      employeeMobile: "",
      companyId: "",
      employeeType: "",
      departmentId: null,
      designationId: null,
      isSuperAdmin: false,
      sahayEmId: null,
      reportingManagerId: null,
      company: {
        companyAdminName: "",
        companyId: "",
        consultantId: "",
        companyName: "",
      },
      reportingManager: null,
      departmentName: null,
      designationName: null,
    }); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: EmployeeData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      employeeId: "",
      employeeName: "",
      employeeEmail: "",
      employeeMobile: "",
      companyId: "",
      employeeType: "",
      departmentId: null,
      designationId: null,
      isSuperAdmin: false,
      sahayEmId: null,
      reportingManagerId: null,
      company: {
        companyAdminName: "",
        companyId: "",
        consultantId: "",
        companyName: "",
      },
      reportingManager: null,
      departmentName: null,
      designationName: null,
    }); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: EmployeeData) => {
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

  return {
    // isLoading,
    employeedata,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus, // Use the updated function
    onStatusChange,
    currentStatus, // Return currentStatus state
    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,
    // Removed 'control' as it is not declared or initialized
    paginationFilter,
    isUserModalOpen,
    openImportModal,
    openExportModal,
    isImportExportModalOpen,
    isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
    permission,
  };
}
