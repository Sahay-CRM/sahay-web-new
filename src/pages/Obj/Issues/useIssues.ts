import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  addUpdateIssues,
  deleteIssueMutation,
  useGetIssues,
} from "@/features/api/Issues";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function useIssues() {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [modalData, setModalData] = useState<IssuesProps>({} as IssuesProps);
  const [addModal, setAddModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();

  const [isDataFilter, setIsDataFilter] = useState("false");

  const permission = useSelector(getUserPermission).ISSUES;

  const { data: issueList, isLoading } = useGetIssues({
    filter: { ...paginationFilter, isDelete: isDataFilter },
  });
  const { mutate: addIssue } = addUpdateIssues();
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
    setIsDeleteOpen(false);
  };

  const onDelete = useCallback((data: IssuesProps) => {
    if (data.isDelete === true) {
      setIsDeleteOpen(true);
      setModalData(data);
    } else {
      setIsDeleteModalOpen(true);
      setModalData(data);
      setIsChildData("");
      setIsDeleteOpen(false);
    }
  }, []);

  const conformDelete = async (isSoft?: boolean) => {
    if (modalData.issueId) {
      const payload = {
        issueId: modalData.issueId,
        isForce: isSoft ? false : isDataFilter === "false" ? false : true,
      };
      deleteIssue(payload, {
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

  const conformForceDelete = async () => {
    if (modalData.issueId) {
      const payload = {
        issueId: modalData.issueId,
        isForce: true,
      };
      deleteIssue(payload, {
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

  const handleRestoreIssue = (data: IssuesProps) => {
    const payload = {
      issueId: data.issueId,
      isDelete: !data.isDelete,
      issueName: data.issueName,
    };
    addIssue(payload);
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
    conformForceDelete,
    isDataFilter,
    setIsDataFilter,
    handleRestoreIssue,
    isDeleteOpen,
  };
}
