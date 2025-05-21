import { useCallback, useState } from "react";

export default function useStateMaster() {
  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    status: 1, // Default status
    search: "",
  });
  const [modalData, setModalData] = useState<UpdateState | undefined>();
  const [deleteModalData, setDeleteModalData] = useState<
    StateDataProps | undefined
  >();
  const [addStateModal, setAddStateModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const userPermission = useSelector(getUserPermission);

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // const { mutate: deleteState } = deleteStateMutation({
  //   onSuccessCallback: () => {
  //     closeDeleteModal();
  //   },
  // });

  // const { data: stateData } = useGetState({
  //   filter: paginationFilter,
  // });

  // Add State Form Modal
  const handleAdd = () => {
    setModalData({
      countryId: "",
      stateId: "",
      stateName: "",
    });
    setAddStateModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = (): void => {
    setModalData(undefined);
    setAddStateModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  // Otherwise open modal for edit
  const openModal = useCallback((data: StateDataProps) => {
    // const stateModal = {
    //   ...data,
    //   countryId: data.country.countryId,
    // };
    setModalData(data); // Set the data for the modal
    setAddStateModal(true);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: StateDataProps) => {
    setIsDeleteModalOpen(true);
    setDeleteModalData(data);
    setIsChildData("");
  }, []);

  const handleDeleteState = () => {
    if (!deleteModalData) {
      return;
    }
    // deleteState(deleteModalData.stateId, {
    //   onSuccess: () => {
    //     closeDeleteModal();
    //     setIsChildData("");
    //   },
    //   onError: (error: Error) => {
    //     const axiosError = error as AxiosError<{
    //       message?: string;
    //       status: number;
    //     }>;

    //     if (axiosError.response?.data?.status === 417) {
    //       setIsChildData(axiosError.response?.data?.message);
    //     } else if (axiosError.response?.data.status !== 417) {
    //       showToast(
    //         `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
    //         "error"
    //       );
    //     }
    //   },
    // });
  };

  const stateData = {
    data: [],
  };

  return {
    stateData,
    setPaginationFilter,
    paginationFilter,
    handleAdd,
    modalData,
    addStateModal,
    closeDeleteModal,
    openModal,
    onDelete,
    isDeleteModalOpen,
    deleteModalData,
    handleDeleteState,
    isChildData,
  };
}
