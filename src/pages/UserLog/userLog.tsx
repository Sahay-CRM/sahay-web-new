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
              onChange={handleOptionChange}
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
          {employeeLog?.map((log) => (
            <Card key={log.id} className="mb-4 p-4 shadow-md">
              <div className="flex gap-4 items-center">
                <h3 className="text-lg font-semibold">{log.updateDetail}</h3>
                <p className="text-sm text-gray-500">
                  {formatDateTime(log.updateTime)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </FormProvider>
  );
}
