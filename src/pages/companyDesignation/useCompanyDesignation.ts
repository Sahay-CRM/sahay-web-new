import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [addDesignationModal, setaddDesignationModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DesignationData>(
    {} as DesignationData,
  );
  // const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  // const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [designationData, _setdesignationData] = useState({
    success: true,
    status: 200,
    message: "Designations fetched successfully",
    currentPage: 1,
    totalCount: 3,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "designationName",
    sortOrder: "asc",
    data: [
      {
        designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
        designationName: "Des",
        isSuperAdmin: false,
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
        department: {
          departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
          departmentName: "Marketing",
        },
        company: {
          companyName: "Userex Consulting Private Limited",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
      },
    ],
  });

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  //   const { data: user, isLoading } = useGetUser({
  //     filter: paginationFilter,
  //   });isLoading

  // const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newStatus = Number(event.target.value);
  //   setCurrentStatus(newStatus); // Update currentStatus state

  // Update pagination filter to include the selected status
  //   setPaginationFilter((prevFilter) => ({
  //     ...prevFilter,
  //     status: newStatus,
  //     currentPage: 1, // Reset to the first page
  //   }));
  // };

  // Ensure currentStatus is passed when updating the pagination filter
  // const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
  //   setPaginationFilter({
  //     ...filter,
  //     status: currentStatus, // Always include the currentStatus
  //   });
  // };
  const handleAdd = () => {
    setModalData({
      designationId: "",
      designationName: "",
      companyId: "",
      departmentId: "",
      department: {
        departmentId: "",
        departmentName: "",
      },
      company: {
        companyId: "",
        companyName: "",
      },
    });
    setaddDesignationModal(true);
  };

  const openModal = useCallback((data: DesignationData) => {
    setModalData(data); // Set the data for the modal
    setaddDesignationModal(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      designationId: "",
      designationName: "",
      companyId: "",
      departmentId: "",
      department: {
        departmentId: "",
        departmentName: "",
      },
      company: {
        companyId: "",
        companyName: "",
      },
    }); // Clear modal data
    setaddDesignationModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: DesignationData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setaddDesignationModal(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {};

  // const openImportModal = useCallback(() => {
  //   setIsImportExportModalOpen(true);
  //   setIsImport(true);
  // }, []);
  // const openExportModal = useCallback(() => {
  //   setIsImportExportModalOpen(true);
  //   setIsImport(false);
  // }, []);

  return {
    // isLoading,
    designationData,
    closeDeleteModal,
    setPaginationFilter, // Use the updated function
    // onStatusChange,
    // currentStatus, // Return currentStatus state
    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,
    // Removed 'control' as it is not declared or initialized
    // paginationFilter,
    addDesignationModal,
    // openImportModal,
    // openExportModal,
    isImportExportModalOpen,
    // isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
  };
}
