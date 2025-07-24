import {
  useDeleteDatapoint,
  useGetCompanyDatapoint,
} from "@/features/api/companyDatapoint";
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
  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const { mutate: deleteDatapoint } = useDeleteDatapoint();
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
    filter: paginationFilter,
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
  return {
    isLoading,
    datpointData,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    conformDelete,
    onForceSubmit, // added
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
