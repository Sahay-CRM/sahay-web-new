import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import {
  deleteCompanyTaskMutation,
  updateRepeatTaskIdMutation,
  useGetRepeatAllTask,
} from "@/features/api/companyTask";
import {
  getUserId,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";

export function useRepeatTaskToDo() {
  const permission = useSelector(getUserPermission).ROUTINE_TASK;
  const userid = useSelector(getUserId);

  const today = useMemo(() => new Date(), []);

  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

  const toLocalISOString = (date: Date | undefined) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadSavedDateRange = () => {
    const saved = localStorage.getItem("taskDateRange");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        startDate: parsed.startDate ? new Date(parsed.startDate) : before14,
        deadline: parsed.deadline ? new Date(parsed.deadline) : after14,
      };
    } else {
      return {
        startDate: before14,
        deadline: after14,
      };
    }
  };

  const [isEmployeeId, setIsEmployeeId] = useState("");
  const [isEmpSearch, setIsEmpSearch] = useState("");
  const [isDateRange, setIsDateRange] = useState<{
    startDate: Date | undefined;
    deadline: Date | undefined;
  }>(loadSavedDateRange());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<RepeatTaskAllRes | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isPastDate, setIsPastDate] = useState(false);

  const [isAppliedDateRange, setIsAppliedDateRange] = useState<{
    startDate: Date | undefined;
    deadline: Date | undefined;
  }>(loadSavedDateRange());

  useEffect(() => {
    localStorage.setItem(
      "taskDateRange",
      JSON.stringify({
        startDate: isAppliedDateRange.startDate,
        deadline: isAppliedDateRange.deadline,
      }),
    );
  }, [isAppliedDateRange]);

  const todayStr = toLocalISOString(today);
  const shouldUseSelectedRange = permission.Add || permission.Edit;

  const { mutate: updateRepeatTask } = updateRepeatTaskIdMutation();
  const { mutate: deleteTaskById } = deleteCompanyTaskMutation();

  const { data: employeeList } = useGetEmployeeDd({
    filter: {
      search: isEmpSearch,
    },
    enable: isEmpSearch.trim().length >= 3,
  });

  useEffect(() => {
    if (!isEmployeeId) {
      setIsEmployeeId(userid);
    }
  }, [isEmployeeId, userid]);

  useEffect(() => {
    if (!permission.Add && !permission.Edit) {
      const { startDate, deadline } = isAppliedDateRange;
      if (startDate && deadline) {
        const isSameDate =
          startDate.getFullYear() === deadline.getFullYear() &&
          startDate.getMonth() === deadline.getMonth() &&
          startDate.getDate() === deadline.getDate();

        const isStartToday =
          startDate.getFullYear() === today.getFullYear() &&
          startDate.getMonth() === today.getMonth() &&
          startDate.getDate() === today.getDate();

        const isDeadlineToday =
          deadline.getFullYear() === today.getFullYear() &&
          deadline.getMonth() === today.getMonth() &&
          deadline.getDate() === today.getDate();

        // If start and deadline are same but not today
        if (isSameDate && (!isStartToday || !isDeadlineToday)) {
          setIsPastDate(true);
        } else {
          setIsPastDate(false);
        }
      }
    }
  }, [permission, isAppliedDateRange, today]);

  useEffect(() => {
    if (!permission.Add && !permission.Edit) {
      const today = new Date();
      setIsAppliedDateRange({
        startDate: today,
        deadline: today,
      });
    }
  }, [permission]);

  const { data: companyTaskData, isLoading } = useGetRepeatAllTask({
    filter: {
      employeeId: shouldUseSelectedRange ? isEmployeeId : userid,
      startDate: shouldUseSelectedRange
        ? toLocalISOString(isAppliedDateRange.startDate)
        : todayStr,
      endDate: shouldUseSelectedRange
        ? toLocalISOString(isAppliedDateRange.deadline)
        : todayStr,
    },
    enable: !!isEmployeeId || !!isAppliedDateRange,
  });

  const toggleComplete = (taskId: string, isCompleted: boolean) => {
    updateRepeatTask({ taskId, isCompleted });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && !range?.to) {
      setIsDateRange({ startDate: range.from, deadline: range.from });
    } else if (range?.from && range?.to) {
      setIsDateRange({ startDate: range.from, deadline: range.to });
    } else {
      setIsDateRange({ startDate: undefined, deadline: undefined });
    }
  };

  const handleDateRangeApply = (range: DateRange | undefined) => {
    if (range?.from && !range?.to) {
      const newRange = { startDate: range.from, deadline: range.from };
      setIsDateRange(newRange);
      setIsAppliedDateRange(newRange);
    } else if (range?.from && range?.to) {
      const newRange = { startDate: range.from, deadline: range.to };
      setIsDateRange(newRange);
      setIsAppliedDateRange(newRange);
    } else {
      const newRange = { startDate: undefined, deadline: undefined };
      setIsDateRange(newRange);
      setIsAppliedDateRange(newRange);
    }
  };

  const handleDateRangeSaveApply = (range: DateRange | undefined) => {
    if (range) {
      const newTaskDateRange = {
        startDate: range.from,
        deadline: range.to,
      };
      localStorage.setItem("taskDateRange", JSON.stringify(newTaskDateRange));
      setIsDateRange(newTaskDateRange);
      setIsAppliedDateRange(newTaskDateRange);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("taskDateRange");

    const defaultRange = {
      startDate: before14,
      deadline: after14,
    };

    setIsDateRange(defaultRange);
    setIsAppliedDateRange(defaultRange);
  };

  const employeeOption = employeeList?.data
    ? employeeList.data.map((status) => ({
        label: status.employeeName || "Unnamed",
        value: status.employeeId || "",
      }))
    : [];

  const handleEditTask = (data: RepeatTaskAllRes) => {
    setIsModalOpen(true);
    setModalData(data);
    setIsViewModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalData(null);
    setIsViewModalOpen(false);
  };

  const handleViewTask = (data: RepeatTaskAllRes) => {
    setIsViewModalOpen(true);
    setModalData(data);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskById(taskId);
  };

  return {
    companyTaskData,
    toggleComplete,
    isDateRange,
    isAppliedDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
    handleClear,
    setIsEmployeeId,
    employeeOption,
    isEmployeeId,
    setIsEmpSearch,
    permission,
    handleEditTask,
    modalData,
    isModalOpen,
    handleClose,
    handleViewTask,
    isViewModalOpen,
    handleDeleteTask,
    isLoading,
    isPastDate,
    userid,
  };
}
