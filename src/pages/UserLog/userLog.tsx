import DateRangePicker from "@/components/shared/DateRange";
import { Card } from "@/components/ui/card";
import UseUserLog from "./useUserLog";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

export default function useDeleteUserLog() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "User Log", href: "" }]);
  }, [setBreadcrumbs]);

  const methods = useForm();
  const {
    handleDateRangeChange,
    handleDateRangeApply,
    selectedEmployee,
    handleOptionChange,
    employeeOptions,
    employeeLog,
    taskDateRange,
  } = UseUserLog();

  const formatDateTime = (dateTime: string | Date): string => {
    const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
    const formattedDate = date.toISOString().split("T")[0];
    const formattedTime = date.toTimeString().split(" ")[0].slice(0, 5);
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <FormProvider {...methods}>
      <div className="">
        <div className="mb-10 flex gap-4 items-center">
          <div>
            <FormSelect
              value={selectedEmployee}
              onChange={(value) =>
                handleOptionChange(value as string | string[])
              }
              options={employeeOptions}
              className="h-9"
              isSearchable={true}
            />
          </div>
          {selectedEmployee && (
            <DateRangePicker
              onChange={handleDateRangeChange}
              onApply={handleDateRangeApply}
            />
          )}
        </div>
        <div className="">
          {employeeLog && employeeLog.length > 0 ? (
            employeeLog.map((log: unknown, idx: number) => {
              // Defensive: treat log as a record
              const logObj = (log as Record<string, unknown>) || {};
              const oldVal =
                typeof logObj.oldValue === "object" && logObj.oldValue !== null
                  ? (logObj.oldValue as Record<string, unknown>)
                  : {};
              const newVal =
                typeof logObj.newValue === "object" && logObj.newValue !== null
                  ? (logObj.newValue as Record<string, unknown>)
                  : {};
              // Defensive: get all keys from both old and new
              const changedFields = Object.keys({
                ...oldVal,
                ...newVal,
              }).filter((key) => oldVal[key] !== newVal[key]);
              return (
                <Card
                  key={
                    typeof logObj.id === "string" ||
                    typeof logObj.id === "number"
                      ? logObj.id
                      : typeof logObj.logTime === "string" ||
                          typeof logObj.logTime === "number"
                        ? logObj.logTime
                        : idx
                  }
                  className="mb-4 p-4 shadow-md"
                >
                  <div className="flex gap-4 items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      {logObj.logType
                        ? `${logObj.logType} Changes`
                        : "Log Changes"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(
                        typeof logObj.logTime === "string" ||
                          logObj.logTime instanceof Date
                          ? logObj.logTime
                          : typeof logObj.updateTime === "string" ||
                              logObj.updateTime instanceof Date
                            ? logObj.updateTime
                            : typeof newVal.updatedDatetime === "string" ||
                                newVal.updatedDatetime instanceof Date
                              ? newVal.updatedDatetime
                              : typeof newVal.meetingDateTime === "string" ||
                                  newVal.meetingDateTime instanceof Date
                                ? newVal.meetingDateTime
                                : new Date(),
                      )}
                    </p>
                  </div>
                  {changedFields.length > 0 ? (
                    <table className="w-full text-sm border">
                      <thead>
                        <tr>
                          <th className="text-left p-1 border">Field</th>
                          <th className="text-left p-1 border">Old Value</th>
                          <th className="text-left p-1 border">New Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {changedFields.map((field) => (
                          <tr key={field}>
                            <td className="p-1 border font-medium">{field}</td>
                            <td className="p-1 border text-red-600">
                              {String(oldVal[field])}
                            </td>
                            <td className="p-1 border text-green-600">
                              {String(newVal[field])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-gray-700">
                      <div className="font-semibold mb-1">
                        No changes detected. Showing details:
                      </div>
                      <ul className="list-disc ml-5">
                        {[
                          "meetingName",
                          "meetingDescription",
                          "meetingDateTime",
                          "employeeName",
                          "name",
                          "title",
                          "description",
                        ].map((field) =>
                          newVal[field] || oldVal[field] ? (
                            <li key={field}>
                              <span className="font-medium">{field}:</span>{" "}
                              {String(newVal[field] || oldVal[field])}
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="mb-4 p-4 shadow-md">
              <div className="flex gap-4 items-center mb-2">
                <h3 className="text-lg font-semibold">No Logs Found</h3>
                <p className="text-sm text-gray-500">
                  {selectedEmployee
                    ? `No logs for selected employee and date range.`
                    : `Please select an employee.`}
                </p>
              </div>
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Details:</div>
                <ul className="list-disc ml-5">
                  {selectedEmployee && (
                    <li>
                      <span className="font-medium">Employee:</span>{" "}
                      {employeeOptions.find((e) => e.value === selectedEmployee)
                        ?.label || selectedEmployee}
                    </li>
                  )}
                  <li>
                    <span className="font-medium">Date Range:</span>{" "}
                    {taskDateRange.taskStartDate?.toLocaleDateString()} -{" "}
                    {taskDateRange.taskDeadline?.toLocaleDateString()}
                  </li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
