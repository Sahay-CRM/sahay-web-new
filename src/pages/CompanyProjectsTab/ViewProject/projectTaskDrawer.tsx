import { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

import {
  addUpdateCompanyTaskMutation,
  useDdTaskType,
  useGetAllTaskStatus,
} from "@/features/api/companyTask";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useGetBothCompanyMeeting } from "@/features/api/companyMeeting";

type TaskFormData = {
  meetingId?: string;
  taskName: string;
  taskDescription: string;
  taskStatusId: string;
  taskTypeId: string;
  assignUsers: string[];
  taskDeadline: string | Date | null;
};

interface GroupedCompanyMeetings {
  detailMeetings?: CompanyMeetingDataProps[];
  normalMeetings?: CompanyMeetingDataProps[];
}

interface ProjectTaskDrawerProps {
  open: boolean;
  onClose: () => void;
  taskData?: TaskGetPaging | null;
  projectId: string;
  onSuccess?: () => void;
}

export default function ProjectTaskDrawer({
  open,
  onClose,
  taskData,
  projectId,
  onSuccess,
}: ProjectTaskDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isMeetingSearch, setIsMeetingSearch] = useState("");
  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  const [savedPayload, setSavedPayload] = useState<
    Parameters<typeof addUpdateTask>[0] | null
  >(null);

  const { data: taskStatus } = useGetAllTaskStatus({ filter: {} });
  const { mutate: addUpdateTask, isPending } = addUpdateCompanyTaskMutation();

  const { data: taskTypeData } = useDdTaskType({
    filter: {
      search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
    },
    enable: isTypeSearch.length >= 3,
  });

  const { data: employeedata } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });

  const { data: meetingData } = useGetBothCompanyMeeting({
    filter: {
      search: isMeetingSearch,
      meetingId: taskData?.meetingId || undefined,
    },
  });

  const taskTypeOption = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "",
      }))
    : [];

  const taskStatusOption = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
        color: status.color,
      }))
    : [];

  const employeeOption = employeedata
    ? employeedata.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];

  const rawMeetingData = meetingData?.data as unknown as GroupedCompanyMeetings;

  const meetingDataOption = [
    ...(rawMeetingData?.normalMeetings?.length
      ? [{ label: "NORMAL meetings", value: "header-normal", isHeader: true }]
      : []),
    ...(rawMeetingData?.normalMeetings ?? []).map((item) => ({
      label: item.meetingName ?? "",
      value: item.meetingId ?? "",
    })),
    ...(rawMeetingData?.detailMeetings?.length
      ? [{ label: "DETAIL meetings", value: "header-detail", isHeader: true }]
      : []),
    ...(rawMeetingData?.detailMeetings ?? []).map((item) => ({
      label: item.meetingName ?? "",
      value: item.meetingId ?? "",
    })),
  ];

  const rawTaskDeadline = taskData
    ? (taskData as TaskGetPaging & { rawTaskDeadline?: string | Date | null }).rawTaskDeadline
    : undefined;

  const defaultTaskStatus = (taskStatus?.data || [])
    .slice()
    .sort((a, b) => (a.taskStatusOrder || 0) - (b.taskStatusOrder || 0))[0];

  const defaultValues = taskData
    ? {
        meetingId: taskData.meetingId || taskData.TaskMeetingJunction?.[0]?.meetingId || "",
        taskName: taskData.taskName || "",
        taskDescription: taskData.taskDescription || "",
        taskStatusId: taskData.taskStatusId || defaultTaskStatus?.taskStatusId || "",
        taskTypeId: taskData.taskTypeId || "",
        assignUsers: Array.isArray(taskData.assignUsers) && taskData.assignUsers.length > 0
          ? taskData.assignUsers.map((u) => u.employeeId)
          : Array.isArray(taskData.TaskEmployeeJunction)
            ? taskData.TaskEmployeeJunction.map((j) => j.employeeId || j.Employee?.employeeId).filter(Boolean)
            : [],
        taskDeadline: rawTaskDeadline
          ? new Date(rawTaskDeadline)
          : taskData.taskDeadline
            ? new Date(taskData.taskDeadline)
            : null,
      }
    : {
        meetingId: "",
        taskName: "",
        taskDescription: "",
        taskStatusId: defaultTaskStatus?.taskStatusId || "",
        taskTypeId: "",
        assignUsers: [],
        taskDeadline: null,
      };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    defaultValues,
  });

  const taskNameValue = watch("taskName") || "";
  const taskDescriptionValue = watch("taskDescription") || "";
  const prevTaskNameRef = useRef(taskNameValue);

  useEffect(() => {
    if (taskDescriptionValue === "" || taskDescriptionValue === prevTaskNameRef.current) {
      if (taskDescriptionValue !== taskNameValue) {
        setValue("taskDescription", taskNameValue);
      }
    }
    prevTaskNameRef.current = taskNameValue;
  }, [taskNameValue, taskDescriptionValue, setValue]);

  useEffect(() => {
    if (!taskData || !taskData.taskStatusId) {
      if (defaultTaskStatus?.taskStatusId) {
        setValue("taskStatusId", defaultTaskStatus.taskStatusId);
      }
    }
  }, [setValue, taskData, defaultTaskStatus]);

  // Reset form when taskData or taskStatus changes
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, taskData, taskStatus]);

  const onSubmit = (data: TaskFormData) => {
    const payload = {
      taskId: taskData?.taskId || undefined,
      taskName: data.taskName,
      taskDescription: data.taskDescription,
      taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
      taskStatusId: data.taskStatusId,
      employeeIds: data.assignUsers,
      projectId: projectId,
      meetingId: data.meetingId || undefined,
      taskTypeId: data.taskTypeId,
    };

    addUpdateTask(payload, {
      onSuccess: () => {
        toast.success(taskData ? "Task updated successfully" : "Task added successfully");
        if (onSuccess) onSuccess();
        onClose();
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setSavedPayload(payload);
          setReasons("");
          setIsConfModalOpen(true);
        } else {
          toast.error(
            `Error: ${
              axiosError.response?.data?.message || "An error occurred"
            }`,
          );
        }
      },
    });
  };

  const onConfirmSubmit = () => {
    if (!reasons.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    if (!savedPayload) return;

    const finalPayload = {
      ...savedPayload,
      isForceChangeDeadline: true,
      reasons: reasons,
    };

    addUpdateTask(finalPayload, {
      onSuccess: () => {
        setIsConfModalOpen(false);
        toast.success("Task updated successfully");
        if (onSuccess) onSuccess();
        onClose();
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;
        toast.error(
          `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
        );
      },
    });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={onClose} />
      )}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="h-[calc(100vh-30px)] overflow-scroll">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">
              {taskData?.taskName ? `Edit: ${taskData.taskName}` : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 text-2xl hover:text-gray-700 focus:outline-none"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Meeting */}
            <div>
              <Controller
                control={control}
                name="meetingId"
                rules={{ required: "Please select a Meeting" }}
                render={({ field }) => (
                  <SearchDropdown
                    options={meetingDataOption}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(value) => {
                      field.onChange(value.value);
                      setValue("meetingId", value.value);
                    }}
                    placeholder="Search Meeting..."
                    label="Meeting"
                    error={errors.meetingId}
                    isMandatory
                    onSearchChange={setIsMeetingSearch}
                    labelClass="mb-2"
                  />
                )}
              />
            </div>

            {/* Task Name */}
            <FormInputField
              label="Task Name"
              placeholder="Enter task name..."
              {...register("taskName", {
                required: "Task Name is required",
              })}
              error={errors.taskName}
              isMandatory
            />

            {/* Description */}
            <Controller
              control={control}
              name="taskDescription"
              rules={{ required: "Please Enter Task Description" }}
              render={({ field }) => (
                <FormInputField
                  label="Task Description"
                  placeholder="Enter task description..."
                  error={errors.taskDescription}
                  isMandatory
                  {...field}
                />
              )}
            />

            {/* Task Status */}
            <Controller
              control={control}
              name="taskStatusId"
              rules={{ required: "Task Status is Required" }}
              render={({ field }) => (
                <FormSelect
                  label="Task Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={taskStatusOption}
                  error={errors.taskStatusId}
                  placeholder="Select status"
                  isMandatory
                />
              )}
            />

            {/* Task Type */}
            <Controller
              control={control}
              name="taskTypeId"
              rules={{ required: "Please select Task Type" }}
              render={({ field }) => (
                <SearchDropdown
                  options={taskTypeOption}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("taskTypeId", value.value);
                  }}
                  placeholder="Select Task Type..."
                  label="Task Type"
                  error={errors.taskTypeId}
                  isMandatory
                  onSearchChange={setIsTypeSearch}
                />
              )}
            />

            {/* Assign Employees */}
            <Controller
              control={control}
              name="assignUsers"
              rules={{ required: "Select User is Required" }}
              render={({ field }) => (
                <FormSelect
                  label="Assign To"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.assignUsers}
                  isMulti={true}
                  placeholder="Select employees"
                  isMandatory
                />
              )}
            />

            {/* Task Deadline */}
            <Controller
              control={control}
              name="taskDeadline"
              rules={{ required: "Task Deadline is required" }}
              render={({ field }) => (
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                  isMandatory
                  disablePastDays={
                    Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                  }
                />
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-primary/80 cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmation Required</DialogTitle>
            <DialogDescription>
              The deadline has been changed. Please provide a reason to proceed
              with the update.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason
              </label>
              <Textarea
                id="reason"
                placeholder="Enter reasons for deadline change..."
                value={reasons}
                onChange={(e) => setReasons(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsConfModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirmSubmit}
              disabled={!reasons.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
