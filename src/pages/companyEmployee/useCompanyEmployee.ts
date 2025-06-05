import { deleteEmployee, getEmployee } from "@/features/api/companyEmployee";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<EmployeeData>({} as EmployeeData);

  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const permission = useSelector(getUserPermission).EMPLOYEE;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<EmployeeData>(
    {} as EmployeeData,
  );
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const { data: employeedata, isLoading } = getEmployee({
    filter: paginationFilter,
  });

  const { mutate: deleteEmployeeById } = deleteEmployee();

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
    });
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

  const conformDelete = async () => {
    if (modalData && modalData.employeeId) {
      deleteEmployeeById(modalData.employeeId, {
        onSuccess: () => {
          closeDeleteModal();
        },
      });
    }
  };

  const openImportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(true);
  }, []);
  const openExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(false);
  }, []);

  const handleRowsModalOpen = (data: EmployeeData) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
  };
  return {
    isLoading,
    employeedata,
    closeDeleteModal,

    openModal,
    setPaginationFilter,
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
    permission,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
  };
}
