import {
  useDeleteDatapoint,
  useAddUpdateDatapoint,
  useUpdateKPIFocus,
} from "@/features/api/companyDatapoint";
import useDdAllKpiList from "@/features/api/KpiList/useDdAllKpiList";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import useGetDepartmentDropdown from "@/features/api/designation/useGetDepartmentDropdown";
import { updateKPISoftDeleteMutation } from "@/features/api/KpiList";
import { useGetCoreParameterDropdown } from "@/features/api/Business";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { queryClient } from "@/queryClient";

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
  const [selectedBusinessFunctions, setSelectedBusinessFunctions] = useState<
    string[]
  >([]);

  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const { mutate: deleteDatapoint } = useDeleteDatapoint();
  const { mutate: softDeleteRestore } = updateKPISoftDeleteMutation();
  const { data: employeeData } = useGetEmployeeDd({
    filter: {},
  });
  const { data: departmentData } = useGetDepartmentDropdown({
    filter: {},
  });

  const { mutate: updateKPIFocus } = useUpdateKPIFocus();

  const handleSoftDeleteRestore = (dataPointId: string, isDeleted: boolean) => {
    softDeleteRestore({ dataPointId, isDeleted });
  };

  const handleToggleFocus = (data: KPIFormData, isFocus: boolean) => {
    if (!data.kpiId) return;
    updateKPIFocus({
      kpiId: data.kpiId,
      isFocus,
    });
  };

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [viewModalData, setViewModalData] = useState<KPIFormData>(
    {} as KPIFormData,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    // isPaging: false,
    search: "",
  });
  const { data: datpointData, isLoading } = useDdAllKpiList({
    filter: {
      ...paginationFilter,
      employeeId: selectedEmployees,
      departmentId: selectedDepartments,
      coreParameterId: selectedBusinessFunctions,
    },
    enable: true,
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
            queryClient.invalidateQueries({ queryKey: ["kpi-list-dd-all"] });
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
            queryClient.invalidateQueries({ queryKey: ["kpi-list-dd-all"] });
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
    setPaginationFilter((prev) => ({ ...prev }));
  };

  const handleDepartmentFilterChange = (selected: string[]) => {
    setSelectedDepartments(selected);
    setPaginationFilter((prev) => ({ ...prev }));
  };

  const { data: coreParams } = useGetCoreParameterDropdown({
    filter: {},
  });

  const bussinessFunctOptions = Array.isArray(coreParams?.data)
    ? coreParams.data.map((item: CoreParameterDataProps) => ({
        label: item.coreParameterName,
        value: item.coreParameterId,
      }))
    : [];

  const handleBusinessFunctionFilterChange = (selected: string[]) => {
    setSelectedBusinessFunctions(selected);
    setPaginationFilter((prev) => ({ ...prev }));
  };

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateKpiData, setDuplicateKpiData] = useState<KPIFormData | null>(
    null,
  );
  const { mutate: duplicateKPI, isPending: isDuplicatePending } =
    useAddUpdateDatapoint();

  const handleDuplicate = (data: KPIFormData) => {
    // Fetch original unmutated data to ensure validationType and frequencyType have backend-compatible values
    const originalData = datpointData?.data?.find(
      (item) => item.kpiId === data.kpiId,
    );
    setDuplicateKpiData(originalData || data);
    setIsDuplicateModalOpen(true);
  };

  const confirmDuplicate = (employeeId: string) => {
    if (!duplicateKpiData) return;

    const visualFrequencyTypesStr = Array.isArray(
      duplicateKpiData.visualFrequencyTypes,
    )
      ? duplicateKpiData.visualFrequencyTypes.join(",")
      : duplicateKpiData.visualFrequencyTypes;

    const newKpiData: Partial<KPIFormData> = {
      KPIMasterId: duplicateKpiData.KPIMasterId,
      employeeId: employeeId,
      tag: duplicateKpiData.tag,
      unit: duplicateKpiData.unit,
      validationType: duplicateKpiData.validationType,
      value1: duplicateKpiData.value1,
      frequencyType: duplicateKpiData.frequencyType,
      visualFrequencyTypes: visualFrequencyTypesStr,
      visualFrequencyAggregate: duplicateKpiData.visualFrequencyAggregate,
    };

    if (duplicateKpiData.coreParameterId) {
      newKpiData.coreParameterId = duplicateKpiData.coreParameterId;
    }

    if (duplicateKpiData.value2) {
      newKpiData.value2 = duplicateKpiData.value2;
    }

    duplicateKPI(newKpiData as KPIFormData, {
      onSuccess: () => {
        setIsDuplicateModalOpen(false);
        setDuplicateKpiData(null);
        queryClient.invalidateQueries({ queryKey: ["kpi-list-dd-all"] });
      },
    });
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
    selectedBusinessFunctions,
    bussinessFunctOptions,
    handleEmployeeFilterChange,
    handleDepartmentFilterChange,
    handleBusinessFunctionFilterChange,
    handleToggleFocus,
    isDuplicateModalOpen,
    setIsDuplicateModalOpen,
    handleDuplicate,
    confirmDuplicate,
    duplicateKpiData,
    isDuplicatePending,
  };
}
