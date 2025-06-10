import {
  ddAllEmployee,
  useGetEmployeeLog,
} from "@/features/api/companyEmployee";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function UseUserLog() {
  const [taskDateRange, setTaskDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: new Date(),
    taskDeadline: new Date(),
  });

  const [appliedDateRange, setAppliedDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: new Date(),
    taskDeadline: new Date(),
  });
  const [selectedEmployee, setSelectedEmployee] = useState<string>();

  const { data: employee } = ddAllEmployee();

  const formatDate = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const { data: employeeLog } = useGetEmployeeLog({
    filter: {
      employeeId: selectedEmployee,
      startDate: formatDate(appliedDateRange.taskStartDate),
      endDate: formatDate(appliedDateRange.taskDeadline),
    },
    enable: !!selectedEmployee,
  });

  const sortedEmployeeLog = employeeLog
    ?.filter((log) => {
      const logDate = new Date(log.updateTime).getTime();
      const startDate = taskDateRange.taskStartDate
        ? new Date(taskDateRange.taskStartDate).getTime()
        : undefined;
      const endDate = taskDateRange.taskDeadline
        ? new Date(taskDateRange.taskDeadline).getTime()
        : undefined;

      return (
        (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(),
    );

  const employeeOptions =
    employee?.map((emp) => ({
      value: emp.employeeId,
      label: emp.employeeName,
    })) || [];

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
  };

  const handleOptionChange = (value: string | string[]) => {
    if (typeof value === "string") {
      setSelectedEmployee(value);
    } else if (Array.isArray(value) && value.length > 0) {
      // Assuming you want to select the first value if it's an array
      setSelectedEmployee(value[0]);
    } else {
      setSelectedEmployee(undefined); // Or handle the empty array case as needed
    }
  };

  return {
    handleDateRangeChange,
    taskDateRange,
    handleDateRangeApply,
    selectedEmployee,
    handleOptionChange,
    employeeOptions,
    employeeLog: sortedEmployeeLog,
  };
}
