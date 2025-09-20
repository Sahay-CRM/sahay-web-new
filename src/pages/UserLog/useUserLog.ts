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

  const sortedEmployeeLog = Array.isArray(employeeLog)
    ? employeeLog
        .filter((log): log is ChangeLog<unknown> => {
          // Ensure log and log.logTime are valid before creating a Date
          if (!log || typeof log.logTime !== "string") {
            return false;
          }
          const logDate = new Date(log.logTime);
          if (isNaN(logDate.getTime())) {
            // Check if date is valid
            return false;
          }

          const logDateTime = logDate.getTime();
          // Use appliedDateRange for filtering fetched logs
          const startDate = appliedDateRange.taskStartDate
            ? new Date(appliedDateRange.taskStartDate).getTime()
            : undefined;
          const endDate = appliedDateRange.taskDeadline
            ? new Date(appliedDateRange.taskDeadline).getTime()
            : undefined;

          return (
            (!startDate || logDateTime >= startDate) &&
            (!endDate || logDateTime <= endDate)
          );
        })
        .sort((a, b) => {
          // Ensure a, b and their logTime are valid
          if (
            !a ||
            typeof a.logTime !== "string" ||
            !b ||
            typeof b.logTime !== "string"
          ) {
            return 0;
          }
          const dateA = new Date(a.logTime);
          const dateB = new Date(b.logTime);

          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // Handle invalid dates
          }
          return dateB.getTime() - dateA.getTime(); // Sort descending by logTime
        })
    : [];

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
