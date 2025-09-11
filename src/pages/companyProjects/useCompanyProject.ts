import {
  useAddUpdateCompanyProject,
  useDeleteCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProject,
} from "@/features/api/companyProject";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function useAdminUser() {
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const permission = useSelector(getUserPermission).PROJECT_LIST;
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [filters, setFilters] = useState<{ selected?: string[] }>({});

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: projectlistdata, isLoading } = useGetCompanyProject({
    filter: { ...paginationFilter, statusArray: filters.selected },
    enable: !!paginationFilter,
  });

  const { mutate: deleteProjectById } = useDeleteCompanyProject();
  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {},
  });

  const statusOptions = Array.isArray(projectStatusList?.data)
    ? projectStatusList.data.map((item: ProjectStatusRes) => ({
        label: item.projectStatus,
        value: item.projectStatusId,
        color: item.color || "#2e3195",
      }))
    : [];

  const { mutate: addProject } = useAddUpdateCompanyProject();

  const handleAdd = () => {
    setModalData(modalData); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: IProjectFormData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(modalData); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: IProjectFormData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData && modalData.projectId) {
      deleteProjectById(modalData.projectId, {
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

  const handleStatusChange = (data: string, row: CompanyProjectDataProps) => {
    const payload = {
      projectStatusId: data,
      projectId: row?.projectId,
    };
    addProject(payload, {
      onSuccess: () => {
        navigate("/dashboard/projects");
      },
    });
  };

  const handleFilterChange = (selected: string[]) => {
    setFilters({
      selected,
    });
  };
  const handleRowsModalOpen = (data: IProjectFormData) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
    // setIsRowModal(true); // REMOVE this line if your view modal does not depend on isRowModal
  };
  return {
    projectlistdata,
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
    statusOptions,
    handleStatusChange,
    permission,
    handleFilterChange,
    filters,
    isLoading,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    projectStatusList,
  };
}
