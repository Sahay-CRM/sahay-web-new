import { deleteStateMutation, useGetState } from "@/features/api/state";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useStateMaster() {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    status: 1,
    search: "",
  });

  const [modalData, setModalData] = useState<StateData | undefined>();
  const [addStateModal, setAddStateModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
const permission = useSelector(getUserPermission).STATE;        
  const { mutate: deleteState } = deleteStateMutation();
  const { data: stateData } = useGetState({
    filter: paginationFilter,
  });
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
  const openModal = useCallback((data: StateData) => {
    setModalData({
      ...data,
      countryId: data.countryId || "",
    });
    setAddStateModal(true);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: StateData) => {
    setIsDeleteModalOpen(true);
    setModalData({
      ...data,
      countryId: data.countryId || "",
    });
    setIsChildData("");
  }, []);

  const handleDeleteState = async () => {
    if (modalData?.stateId) {
      deleteState(
        { ...modalData, stateId: modalData.stateId as string },
        {
          onSuccess: () => {
            closeDeleteModal();
          },
        }
      );
    }
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
    handleDeleteState,
    isChildData,
    permission,
  };
}
