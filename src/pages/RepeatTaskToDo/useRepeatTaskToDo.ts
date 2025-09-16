import {
  updateRepeatTaskIdMutation,
  useGetRepeatAllTask,
} from "@/features/api/companyTask";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";

export function useRepeatTaskToDo() {
  const today = new Date();
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

  // Load initial values from localStorage (or use defaults)
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

  const [isDateRange, setIsDateRange] = useState<{
    startDate: Date | undefined;
    deadline: Date | undefined;
  }>(loadSavedDateRange());

  const [isAppliedDateRange, setIsAppliedDateRange] = useState<{
    startDate: Date | undefined;
    deadline: Date | undefined;
  }>(loadSavedDateRange());

  // Save any changes to isAppliedDateRange in localStorage
  useEffect(() => {
    localStorage.setItem(
      "taskDateRange",
      JSON.stringify({
        startDate: isAppliedDateRange.startDate,
        deadline: isAppliedDateRange.deadline,
      }),
    );
  }, [isAppliedDateRange]);

  const { mutate: updateRepeatTask } = updateRepeatTaskIdMutation();

  const { data: companyTaskData } = useGetRepeatAllTask({
    filter: {
      startDate: toLocalISOString(isAppliedDateRange.startDate),
      endDate: toLocalISOString(isAppliedDateRange.deadline),
    },
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
        deadline: range.from,
      };
      localStorage.setItem("taskDateRange", JSON.stringify(newTaskDateRange));
      setIsDateRange(newTaskDateRange);
      setIsAppliedDateRange(newTaskDateRange);
    }
  };

  return {
    companyTaskData,
    toggleComplete,
    isDateRange,
    isAppliedDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
  };
}
