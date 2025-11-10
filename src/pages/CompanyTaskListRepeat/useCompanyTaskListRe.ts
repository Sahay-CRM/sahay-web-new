import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

import {
  deleteRepeatCompanyTaskMutation,
  useGetAllTaskStatus,
} from "@/features/api/companyTask";
import useAddUpdateRepeatCompanyTask from "@/features/api/companyTask/useAddUpdateRepeatCompanyTask";
import useGetRepeatCompanyTask from "@/features/api/companyTask/useGetRepeatCompanyTask";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function useCompanyTaskList() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<TaskGetPaging>(
    {} as TaskGetPaging,
  );
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const permission = useSelector(getUserPermission).TASK;
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<TaskGetPaging>(
    {} as TaskGetPaging,
  );

  const today = new Date();
  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

  const { mutate: updateCompanyTask } = useAddUpdateRepeatCompanyTask();
  const { mutate: deleteTaskById } = deleteRepeatCompanyTaskMutation();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const {
    data: companyTaskData,
    // refetch,
    isLoading,
  } = useGetRepeatCompanyTask({
    filter: {
      ...paginationFilter,
    },
  });

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });

  const handleAdd = () => {
    setModalData({
      taskId: "",
      employeeId: "",
      taskName: "",
      taskDescription: "",
      taskDeadline: new Date().toISOString(),
      taskActualEndDate: null,
      taskStatusId: "",
      taskStatus: "",
      taskTypeId: "",
      taskTypeName: "",
      companyId: "",
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: TaskGetPaging) => {
    setModalData(data);
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      taskId: "",
      employeeId: "",
      taskName: "",
      taskDescription: "",
      taskDeadline: new Date().toISOString(),
      taskActualEndDate: null,
      taskStatusId: "",
      taskStatus: "",
      taskTypeId: "",
      taskTypeName: "",
      companyId: "",
    });
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: TaskGetPaging) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = (isGroupDelete: boolean) => {
    if (!modalData?.repetitiveTaskId) {
      return;
    }
    const payload = {
      repetitiveTaskId: modalData.repetitiveTaskId,
      groupDelete: isGroupDelete,
    };

    deleteTaskById(payload);
    closeDeleteModal();
  };

  const openImportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(true);
  }, []);
  const openExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(false);
  }, []);

  const handleStatusChange = (data: string, row: TaskGetPaging) => {
    const payload = {
      taskStatusId: data,
      repetitiveTaskId: row?.repetitiveTaskId,
    };

    updateCompanyTask(payload);
  };

  const handleRowsModalOpen = (data: TaskGetPaging) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
  };

  const handleStopRepeat = (data: TaskGetPaging) => {
    const payload = {
      isActive: !data.isActive,
      repetitiveTaskId: data.repetitiveTaskId,
      isStatusChange: true,
    };
    updateCompanyTask(payload);
  };

  return {
    companyTaskData,
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
    handleStatusChange,
    permission,
    handleStopRepeat,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    isLoading,
    taskStatus,
  };
}
