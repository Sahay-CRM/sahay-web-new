import {
  useDeleteImportantDates,
  useGetImportantDatesPagination,
} from "@/features/api/importantDates";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ImportantDatesDataProps>(
    {} as ImportantDatesDataProps,
  );
  const [addImportantDate, setAddImportantDateModal] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const permission = useSelector(getUserPermission).IMPORTANT_DATE;

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { mutate: deleteImportantDate } = useDeleteImportantDates();
  const { data: importantDatesList, isLoading } =
    useGetImportantDatesPagination({
      filter: paginationFilter,
    });
  const openModal = useCallback(
    (data: ImportantDatesDataProps) => {
      const impDate = importantDatesList?.data.find(
        (item) => item.importantDateId === data.importantDateId,
      );

      setModalData(impDate!);
      setAddImportantDateModal(true);
    },
    [importantDatesList?.data],
  );

  const onDelete = useCallback((data: ImportantDatesDataProps) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setAddImportantDateModal(false);
    // setIsChildData("");
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      importantDateName: "",
      importantDate: "",
      importantDateRemarks: "",
    });
    setAddImportantDateModal(false);
    setIsDeleteModalOpen(false);
    // setIsChildData("");
  };
  const handleAddModal = () => {
    setModalData({
      importantDateName: "",
      importantDate: "",
      importantDateRemarks: "",
    });
    setAddImportantDateModal(true);
  };
  const handleCloseModal = () => {
    setAddImportantDateModal(false);
  };
  const closeModal = () => {
    setAddImportantDateModal(false);

    setModalData({} as ImportantDatesDataProps);
  };

  const conformDelete = async () => {
    if (modalData && modalData.importantDateId) {
      deleteImportantDate(modalData, {
        onSuccess: () => {
          closeDeleteModal();
        },
        // onError: (error: Error) => {
        //   const axiosError = error as AxiosError<{
        //     message?: string;
        //     status: number;
        //   }>;

        //   if (axiosError.response?.data?.status === 417) {
        //     setIsChildData(axiosError.response?.data?.message);
        //   } else if (axiosError.response?.data.status !== 417) {
        //     toast.error(
        //       `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
        //     );
        //   }
        // },
      });
    }
  };
  return {
    isLoading,
    importantDatesList,
    addImportantDate,
    setPaginationFilter,
    handleAddModal,
    handleCloseModal,
    closeModal,
    modalData,
    openModal,
    onDelete,
    paginationFilter,
    isImportExportModalOpen,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    setIsDeleteModalOpen,
    closeDeleteModal,
    conformDelete,
    permission,
  };
}
