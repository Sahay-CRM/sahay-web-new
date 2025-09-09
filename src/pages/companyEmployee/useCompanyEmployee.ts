import { deleteEmployee, getEmployee } from "@/features/api/companyEmployee";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  const [currentStatus, setCurrentStatus] = useState<boolean>(false);

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: employeeData, isLoading } = getEmployee({
    filter: { ...paginationFilter },
  });

  const { mutate: addEmployee } = useAddOrUpdateEmployee();

  const { mutate: deleteEmployeeById } = deleteEmployee();

  const onStatusChange = (val: boolean) => {
    setCurrentStatus(val);
    setPaginationFilter((prev) => ({
      ...prev,
      isDeactivated: val,
      currentPage: 1,
    }));
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

  const handleInactive = useCallback(
    (data: EmployeeDetails) => {
      if (data.employeeId && data.employeeId) {
        addEmployee({
          employeeId: data.employeeId,
          isDeactivated: !data.isDeactivated,
          employeeMobile: data.employeeMobile,
        });
      }
    },
    [addEmployee],
  );

  return {
    isLoading,
    employeeData,
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
    handleInactive,
    onStatusChange,
    currentStatus,
  };
}
