import {
  useGetAllTaskStatus,
  useGetCompanyTask,
} from "@/features/api/companyTask";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { isWithinInterval, parseISO, isBefore } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";

// Accept showOverdue as a parameter
export default function useCompanyTaskList() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<TaskGetPaging>(
    {} as TaskGetPaging,
  );
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const permission = useSelector(getUserPermission).TASK;
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >({
    from: new Date(),
  });

  const [showOverdue, setShowOverdue] = useState(false);

  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    status: currentStatus,
  });

  const { data: companyTaskData } = useGetCompanyTask({
    filter: paginationFilter,
  });

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });

  const statusOptions = (taskStatus?.data ?? []).map((item) => ({
    label: item.taskStatus,
    value: item.taskStatusId,
  }));

  const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(event.target.value);
    setCurrentStatus(newStatus);

    setPaginationFilter((prevFilter) => ({
      ...prevFilter,
      status: newStatus,
      currentPage: 1, // Reset to the first page
    }));
  };

  // Ensure currentStatus is passed when updating the pagination filter
  const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
    setPaginationFilter({
      ...filter,
      status: currentStatus, // Always include the currentStatus
    });
  };
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
    setModalData(data); // Set the data for the modal
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
    }); // Clear modal data
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

  // Define filters state
  const [filters, setFilters] = useState<{ taskStatusName: string[] }>({
    taskStatusName: [],
  });

  // Move filteredTaskData above filterOptions
  const filteredTaskData = useMemo(() => {
    let filtered = companyTaskData?.data;

    // Apply overdue filter if enabled
    if (showOverdue) {
      filtered = filtered?.filter((task) => {
        if (!task.taskDeadline) return false;
        const deadlineDate = parseISO(task.taskDeadline);
        // Overdue: deadline is before today and not completed
        return (
          isBefore(deadlineDate, new Date()) && task.taskStatus !== "Completed"
        );
      });
    }

    // Apply date range filter if selected
    if (selectedDateRange?.from) {
      filtered = filtered?.filter((task) => {
        if (!task.taskDeadline) return false;

        const deadlineDate = parseISO(task.taskDeadline);
        const startDate = task.taskStartDate
          ? parseISO(task.taskStartDate)
          : null;
        const endDate = task.taskActualEndDate
          ? parseISO(task.taskActualEndDate)
          : null;

        // Check if any of the dates fall within the selected range
        const isDeadlineInRange = isWithinInterval(deadlineDate, {
          start: selectedDateRange.from!,
          end: selectedDateRange.to || selectedDateRange.from!,
        });

        const isStartDateInRange = startDate
          ? isWithinInterval(startDate, {
              start: selectedDateRange.from!,
              end: selectedDateRange.to || selectedDateRange.from!,
            })
          : false;

        const isEndDateInRange = endDate
          ? isWithinInterval(endDate, {
              start: selectedDateRange.from!,
              end: selectedDateRange.to || selectedDateRange.from!,
            })
          : false;

        return isDeadlineInRange || isStartDateInRange || isEndDateInRange;
      });
    }

    // Apply status filter if selected
    if (filters?.taskStatusName?.length) {
      filtered = filtered?.filter((task) =>
        filters.taskStatusName.includes(task.taskStatus),
      );
    }

    return filtered;
  }, [
    showOverdue,
    selectedDateRange,
    companyTaskData?.data,
    filters.taskStatusName,
  ]);

  // Move handleFilterChange above the return statement
  const handleFilterChange = (col: string, selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [col]: selected,
    }));
  };

  useEffect(() => {
    console.log(
      "Selected Date Range:",
      filters,
      "(date range is managed in hook)",
    );
  }, [filters]);

  const handleDateRangeChange: HandleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    console.log("Selected Date Range:", range);
  };

  return {
    // isLoading,
    companyTaskData,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus, // Use the updated function
    onStatusChange,
    currentStatus, // Return currentStatus state
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
    setSelectedDateRange,
    filters,
    handleFilterChange,
    handleDateRangeChange,
    filteredTaskData,
    showOverdue,
    setShowOverdue,
  };
}
