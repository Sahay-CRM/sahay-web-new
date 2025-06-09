import {
  useDeleteDatapoint,
  useGetCompanyDatapoint,
} from "@/features/api/companyDatapoint";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<KPIFormData>({} as KPIFormData);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const { mutate: deleteDatapointById } = useDeleteDatapoint();
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [viewModalData, setViewModalData] = useState<KPIFormData>(
    {} as KPIFormData,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const { data: datpointData, isLoading } = useGetCompanyDatapoint({
    filter: paginationFilter,
  });

  const handleAdd = () => {
    setModalData({
      companykpimasterId: "",
      dataPointId: "",
      dataPointName: "",
      dataPointLabel: "",
      KPIMasterId: "",
      KPIMaster: "",
      coreParameter: undefined as unknown as CoreParameter,
      unit: "",
      validationType: "",
      frequencyType: "",
      selectedType: "",
      dataPointEmployeeJunction: [],
      DataPointProductJunction: [],
      productIds: [],
      assignUser: [],
      hasData: false,
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: KPIFormData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      companykpimasterId: "",
      dataPointId: "",
      dataPointName: "",
      dataPointLabel: "",
      KPIMasterId: "",
      KPIMaster: "",
      coreParameter: undefined as unknown as CoreParameter,
      unit: "",
      validationType: "",
      frequencyType: "",
      selectedType: "",
      dataPointEmployeeJunction: [],
      DataPointProductJunction: [],
      productIds: [],
      assignUser: [],
      hasData: false,
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
    if (modalData && modalData.dataPointId) {
      deleteDatapointById(modalData.dataPointId, {
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
