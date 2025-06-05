import {
  useAddUpdateCompanyProject,
  useDeleteCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProject,
} from "@/features/api/companyProject";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function useAdminUser() {
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const permission = useSelector(getUserPermission).PROJECT_LIST;
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [filters, setFilters] = useState<{ selected?: string[] }>({});

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    status: currentStatus, // Use currentStatus state
  });

  const { data: projectlistdata } = useGetCompanyProject({
    filter: { ...paginationFilter, statusArray: filters.selected },
  });
  const { mutate: deleteProjectById } = useDeleteCompanyProject();
  const { data: projectStatusList } = useGetAllProjectStatus();
  const statusOptions = Array.isArray(projectStatusList?.data)
    ? projectStatusList.data.map((item: ProjectStatusRes) => ({
        label: item.projectStatus,
        value: item.projectStatusId,
        color: item.color || "#2e3195",
      }))
    : [];
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
  const { mutate: addProject } = useAddUpdateCompanyProject();

  // Ensure currentStatus is passed when updating the pagination filter
  const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
    setPaginationFilter({
      ...filter,
      status: currentStatus, // Always include the currentStatus
    });
  };
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

  return {
    projectlistdata,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus,
    onStatusChange,
    currentStatus,
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
  };
}
