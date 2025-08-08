import { deleteIssueMutation, useGetIssues } from "@/features/api/Issues";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function useIssues() {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [modalData, setModalData] = useState<IssuesProps>({} as IssuesProps);
  const [addModal, setAddModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();

  const permission = useSelector(getUserPermission).ISSUES;

  const { data: issueList, isLoading } = useGetIssues({
    filter: paginationFilter,
  });

  const { mutate: deleteIssue } = deleteIssueMutation();

  const openModal = useCallback((data: IssuesProps) => {
    setModalData(data);
    setAddModal(true);
    setIsChildData("");
  }, []);

  const handleAdd = () => {
    setAddModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = (): void => {
    setModalData({
      issueName: "",
      issueId: "",
    });
    // Clear modal data
    setAddModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: IssuesProps) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData.issueId) {
      deleteIssue(modalData.issueId, {
        onSuccess: () => {
          closeDeleteModal();
          setIsChildData("");
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

  return {
    addModal,
    issueList,
    modalData,
    isChildData,
    isDeleteModalOpen,
    openModal,
    handleAdd,
    onDelete,
    conformDelete,
    isLoading,
    permission,
    paginationFilter,
    setPaginationFilter,
    closeDeleteModal,
  };
}
