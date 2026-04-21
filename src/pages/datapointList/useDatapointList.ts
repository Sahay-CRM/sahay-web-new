import {
  useDeleteDatapoint,
  useGetCompanyDatapoint,
} from "@/features/api/companyDatapoint";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import useGetDepartmentDropdown from "@/features/api/designation/useGetDepartmentDropdown";
import { updateKPISoftDeleteMutation } from "@/features/api/KpiList";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<KPIFormData>({} as KPIFormData);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditKpiId, setIsEditKpiId] = useState<string>("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const { mutate: deleteDatapoint } = useDeleteDatapoint();
  const { mutate: softDeleteRestore } = updateKPISoftDeleteMutation();
  const { data: employeeData } = useGetEmployeeDd({
    filter: {},
  });
  const { data: departmentData } = useGetDepartmentDropdown({
    filter: {},
  });

  const handleSoftDeleteRestore = (dataPointId: string, isDeleted: boolean) => {
    softDeleteRestore({ dataPointId, isDeleted });
  };

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [viewModalData, setViewModalData] = useState<KPIFormData>(
    {} as KPIFormData,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: datpointData, isLoading } = useGetCompanyDatapoint({
    filter: {
      ...paginationFilter,
      employeeId: selectedEmployees,
      departmentId: selectedDepartments,
    },
  });

  const handleAdd = () => {
    setModalData({
      kpiId: "",
      dataPointName: "",
      dataPointLabel: "",
      KPIMasterId: "",
      KPIMaster: {} as KPIMaster,
      coreParameter: {} as CoreParameter,
      unit: "",
      validationType: "",
      frequencyType: "",
      selectedType: "",
      hasData: false,
      coreParameterId: "",
      visualFrequencyTypes: "",
      employeeId: "",
      value1: "",
      value2: "",
      tag: "",
      visualFrequencyAggregate: "",
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: KPIFormData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      kpiId: "",
      dataPointName: "",
      dataPointLabel: "",
      KPIMasterId: "",
      KPIMaster: {} as KPIMaster,
      coreParameter: {} as CoreParameter,
      unit: "",
      validationType: "",
      frequencyType: "",
      selectedType: "",
      hasData: false,
      coreParameterId: "",
      visualFrequencyTypes: "",
      employeeId: "",
      value1: "",
      value2: "",
      tag: "",
      visualFrequencyAggregate: "",
    }); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
    setIsEditModalOpen(false);
  };

  const onDelete = useCallback((data: KPIFormData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData && modalData.kpiId) {
      deleteDatapoint(
        { id: modalData.kpiId, force: false },
        {
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
        },
      );
    }
  };

  const onForceSubmit = async () => {
    if (modalData && modalData.kpiId) {
      deleteDatapoint(
        { id: modalData.kpiId, force: true },
        {
          onSuccess: () => {
            closeDeleteModal();
          },
          onError: (error: Error) => {
            const axiosError = error as AxiosError<{
              message?: string;
              status: number;
            }>;
            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          },
        },
      );
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

  const handleRowsModalOpen = (data: KPIFormData) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
  };

  const departmentOptions =
    departmentData?.data?.map((item) => ({
      value: item.departmentId ?? "",
      label: item.departmentName ?? "",
    })) || [];

  const employeeOptions =
    employeeData?.data?.map((item) => ({
      value: item.employeeId ?? "",
      label: item.employeeName ?? "",
    })) || [];

  const handleEmployeeFilterChange = (selected: string[]) => {
    setSelectedEmployees(selected);
    setPaginationFilter((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDepartmentFilterChange = (selected: string[]) => {
    setSelectedDepartments(selected);
    setPaginationFilter((prev) => ({ ...prev, currentPage: 1 }));
  };

  return {
    isLoading,
    datpointData,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    conformDelete,
    onForceSubmit,
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
    isEditModalOpen,
    isEditKpiId,
    setIsEditKpiId,
    setIsEditModalOpen,
    handleSoftDeleteRestore,
    departmentOptions,
    employeeOptions,
    selectedEmployees,
    selectedDepartments,
    handleEmployeeFilterChange,
    handleDepartmentFilterChange,
  };
}
