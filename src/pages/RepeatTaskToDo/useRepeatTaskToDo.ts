import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import {
  deleteCompanyTaskMutation,
  updateRepeatTaskIdMutation,
  useGetRepeatAllTask,
} from "@/features/api/companyTask";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import {
  getISTNow,
  isAfterEndOfTodayIST,
  isSameDay,
} from "@/features/utils/app.utils";

export function useRepeatTaskToDo() {
  const permission = useSelector(getUserPermission).ROUTINE_TASK;

  const userData = useSelector(getUserDetail);
  const userid = userData.employeeId;

  const today = useMemo(() => new Date(), []);

  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<RepeatTaskAllRes | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

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

  // const todayStr = toLocalISOString(today);
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

  const employeeIds = useMemo(() => {
    if (isEmployeeId === "ALL") {
      return employeeList?.data
        ?.map((emp) => emp.employeeId)
        .filter(Boolean)
        .join(","); // "id1,id2,id3"
    }

    return isEmployeeId;
  }, [isEmployeeId, employeeList]);

  const { data: companyTaskData, isLoading } = useGetRepeatAllTask({
    filter: {
      employeeIds: shouldUseSelectedRange ? employeeIds : userid,
      startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      endDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
    },
    enable: !!isEmployeeId || !!selectedDate,
  });

  const toggleComplete = (taskId: string, isCompleted: boolean) => {
    updateRepeatTask({ taskId, isCompleted });
  };

  const employeeOption = [
    {
      label: "All",
      value: "ALL",
    },
    ...(employeeList?.data
      ? employeeList.data.map((emp) => ({
          label: emp.employeeName || "Unnamed",
          value: emp.employeeId || "",
        }))
      : []),
  ];

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

  const shouldDisableCheckbox = (task: RepeatTaskAllRes) => {
    if (userData.employeeType !== "EMPLOYEE") return false;

    const istNow = getISTNow();
    const todayIST = new Date(
      istNow.getFullYear(),
      istNow.getMonth(),
      istNow.getDate(),
    );

    const taskDeadline = new Date(task.taskDeadline!);

    const isTaskDeadlineToday = isSameDay(taskDeadline, todayIST);
    const isSelectedDateNotToday = !isSameDay(selectedDate!, todayIST);
    const isAfterTodayEnd = isAfterEndOfTodayIST();

    return isTaskDeadlineToday && isSelectedDateNotToday && isAfterTodayEnd;
  };

  return {
    companyTaskData,
    toggleComplete,
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
    setSelectedDate,
    selectedDate,
    today,
    userData,
    shouldDisableCheckbox,
  };
}
