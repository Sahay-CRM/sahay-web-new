import { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import {
  updateRepeatTaskIdMutation,
  useDdTaskType,
} from "@/features/api/companyTask";

interface RoutineTaskDrawerProps {
  open: boolean;
  onClose: () => void;
  taskData?: RepeatTaskAllRes | null;
}

export default function RoutineTaskDrawer({
  open,
  onClose,
  taskData,
}: RoutineTaskDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isTypeSearch, setIsTypeSearch] = useState("");

  const { mutate: addUpdateTask } = updateRepeatTaskIdMutation();

  const { data: taskTypeData } = useDdTaskType({
    filter: {
      search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
    },
    enable: isTypeSearch.length >= 3,
  });

  const { data: employeeData } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });

  const taskTypesOption = taskTypeData
    ? taskTypeData.data
        .filter((type) => !!type.taskTypeId)
        .map((type) => ({
          label: type.taskTypeName ?? "",
          value: type.taskTypeId ?? "",
        }))
    : [];

  const employeeOption = employeeData
    ? employeeData.data.map((employee) => ({
        label: employee.employeeName,
        value: employee.employeeId,
      }))
    : [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<RepeatTaskAllRes>();

  useEffect(() => {
    if (open && taskData) {
      reset({
        taskId: taskData.taskId,
        taskName: taskData.taskName || "",
        taskDescription: taskData.taskDescription || "",
        taskDeadline: taskData.taskDeadline,
        taskTypeId: taskData.taskTypeId || "",
        taskStatusId: taskData.taskStatusId
          ? String(taskData.taskStatusId)
          : "",
        employeeIds: taskData.TaskEmployeeJunction
          ? taskData.TaskEmployeeJunction.map((emp) => emp.employeeId)
          : [],
        isCompleted: taskData.isCompleted,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (drawerRef.current && drawerRef.current.contains(target)) {
        return;
      }

      if (
        target.closest('[data-slot="select-content"]') ||
        target.closest('[data-slot="popover-content"]') ||
        target.closest("[data-radix-popper-content-wrapper]")
      ) {
        return;
      }

      if (
        target.closest(".react-datepicker") ||
        target.closest(".react-datepicker-popper")
      ) {
        return;
      }

      onClose();
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, open]);

  const onSubmit = (data: RepeatTaskAllRes) => {
    if (data.taskId) {
      const payload = {
        taskId: data.taskId,
        taskName: data.taskName,
        taskDescription: data.taskDescription,
        taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
        taskStatusId: data?.taskStatusId,
        taskTypeId: data?.taskTypeId,
        employeeIds: data.employeeIds,
        isCompleted: data.isCompleted,
      };
      addUpdateTask(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-50" />}
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="h-[calc(100vh-10px)] overflow-scroll">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Routine Task Drawer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            <FormInputField
              label="Task Name"
              {...register("taskName", {
                required: "Task Name is required",
              })}
              className="mt-0"
              error={errors.taskName}
            />
            <FormInputField
              label="Task Description"
              {...register("taskDescription", {
                required: "Description is required",
              })}
              className="mt-0"
              error={errors.taskDescription}
            />
            <Controller
              control={control}
              name="taskDeadline"
              render={({ field }) => {
                // const localDate = field.value
                //   ? new Date(
                //       new Date(field.value).getTime() +
                //         new Date().getTimezoneOffset() * 60000,
                //     )
                //   : null;

                return (
                  <FormDateTimePicker
                    label="Task Deadline"
                    value={field.value!}
                    labelClass="mb-2"
                    onChange={(date) => {
                      const utcDate = date
                        ? new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          )
                        : null;
                      field.onChange(utcDate);
                    }}
                    error={errors.taskDeadline}
                  />
                );
              }}
            />

            <Controller
              control={control}
              name="taskTypeId"
              render={({ field }) => (
                <SearchDropdown
                  label="Task Type"
                  placeholder="Select task type"
                  options={taskTypesOption}
                  error={errors.taskTypeId}
                  isMandatory
                  {...field}
                  labelClass="mb-2"
                  className=""
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("taskTypeId", value.value);
                  }}
                  onSearchChange={setIsTypeSearch}
                />
              )}
            />
            <Controller
              control={control}
              name="employeeIds"
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.employeeIds}
                  isMulti={true}
                  className="mb-2"
                  labelClass="mb-2"
                  placeholder="Select employees"
                />
              )}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                {...register("isCompleted")}
                className="mr-2"
              />
              <label htmlFor="isCompleted">Task Completed</label>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
