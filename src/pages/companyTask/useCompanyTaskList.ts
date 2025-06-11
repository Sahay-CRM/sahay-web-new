import {
  useGetAllTaskStatus,
  useGetCompanyTask,
} from "@/features/api/companyTask";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";

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

  // Calculate default 30-day range: 15 days before and after today
  const today = new Date();
  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

  const [taskDateRange, setTaskDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: before14,
    taskDeadline: after14,
  });

  const [appliedDateRange, setAppliedDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: before14,
    taskDeadline: after14,
  });

  const [showOverdue, setShowOverdue] = useState(false);

  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const [filters, setFilters] = useState<{ taskStatusName: string[] }>({
    taskStatusName: [],
  });

  // Helper function to convert date to YYYY-MM-DD format
  const toLocalISOString = (date: Date | undefined) => {
    if (!date) return undefined;

    // Use local date methods to avoid timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const {
    data: companyTaskData,
    refetch,
    isLoading,
  } = useGetCompanyTask({
    filter: {
      ...paginationFilter,
      statusArray: filters.taskStatusName,
      ...(showOverdue
        ? {}
        : {
            startDate: toLocalISOString(appliedDateRange.taskStartDate),
            endDate: toLocalISOString(appliedDateRange.taskDeadline),
          }),
      overDue: showOverdue,
    },
  });

  // Force refetch when overdue state changes
  useEffect(() => {
    refetch();
  }, [showOverdue, refetch]);

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });

  // Filter status options based on showOverdue and winLostTask
  const statusOptions = (taskStatus?.data ?? [])
    .filter((item) => {
      if (showOverdue) {
        // Exclude items where winLostTask is "0" or "1"
        return item.winLostTask !== 0 && item.winLostTask !== 1;
      }
      return true;
    })
    .map((item) => ({
      label: item.taskStatus,
      value: item.taskStatusId,
      color: item.color || "#2e3195",
    }));

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

  const conformDelete = async () => {};

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
      taskId: row?.taskId,
    };

    updateCompanyTask(payload);
  };

  // Move handleFilterChange above the return statement
  const handleFilterChange = (col: string, selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [col]: selected,
    }));
  };

  const handleDateRangeChange: HandleDateRangeChange = (range) => {
    // Update taskDateRange for preview
    if (range?.from && !range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.from,
      };
      setTaskDateRange(newTaskDateRange);
    } else if (range?.from && range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.to,
      };
      setTaskDateRange(newTaskDateRange);
    } else {
      const newTaskDateRange = {
        taskStartDate: undefined,
        taskDeadline: undefined,
      };
      setTaskDateRange(newTaskDateRange);
    }
  };

  const handleDateRangeApply = (range: DateRange | undefined) => {
    // This is called when Apply button is clicked
    if (range?.from && !range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.from,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    } else if (range?.from && range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.to,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    } else {
      const newTaskDateRange = {
        taskStartDate: undefined,
        taskDeadline: undefined,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    }

    // Reset pagination to first page
    setPaginationFilter((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handleOverdueToggle = () => {
    const newOverdueState = !showOverdue;
    // Reset date range when toggling overdue
    if (newOverdueState) {
      setAppliedDateRange({
        taskStartDate: new Date(),
        taskDeadline: new Date(),
      });
      setTaskDateRange({
        taskStartDate: new Date(),
        taskDeadline: new Date(),
      });
    }

    setShowOverdue(newOverdueState);
  };

  const handleRowsModalOpen = (data: TaskGetPaging) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
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
    statusOptions,
    handleStatusChange,
    permission,
    filters,
    handleFilterChange,
    handleDateRangeChange,
    showOverdue,
    setShowOverdue,
    taskDateRange,
    setTaskDateRange,
    appliedDateRange,
    handleDateRangeApply,
    handleOverdueToggle,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    isLoading,
    taskStatus,
  };
}
