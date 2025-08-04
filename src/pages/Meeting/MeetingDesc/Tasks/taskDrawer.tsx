import { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import {
  addUpdateCompanyTaskMutation,
  useDdTaskType,
  useGetAllTaskStatus,
} from "@/features/api/companyTask";
import { useGetCompanyProjectAll } from "@/features/api/companyProject";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useParams } from "react-router-dom";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  taskData?: TaskGetPaging | null; // Use your TaskGetPaging type if available
  detailMeetingAgendaIssueId?: string;
  detailMeetingId?: string;
}

type TaskFormData = {
  taskName: string;
  taskDescription: string;
  taskStatusId: string;
  taskTypeId: string;
  projectId: string;
  assignUsers: string[];
  taskStartDate?: string | Date | null;
  taskDeadline?: string | Date | null;
  repetition?: string;
};

export default function TaskDrawer({
  open,
  onClose,
  taskData,
  detailMeetingAgendaIssueId,
  detailMeetingId,
}: TaskDrawerProps) {
  const { id: meetingId } = useParams();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  const { data: taskStatus } = useGetAllTaskStatus({ filter: {} });
  const { data: taskTypeData } = useDdTaskType();
  const { data: employeedata } = useGetEmployeeDd();
  const { data: projectListdata } = useGetCompanyProjectAll();

  // Prepare options
  const taskTypeOption = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName,
        value: status.taskTypeId,
      }))
    : [];
  const taskStatusOption = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
      }))
    : [];
  const employeeOption = employeedata
    ? employeedata.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];
  const projectListOption = projectListdata
    ? Array.isArray(projectListdata.data)
      ? projectListdata.data.map((project) => ({
          label: project.projectName,
          value: project.projectId,
        }))
      : []
    : [];

  // Default values from taskData
  const defaultValues = taskData
    ? {
        taskName: taskData.taskName || "",
        taskDescription: taskData.taskDescription || "",
        taskStatusId: taskData.taskStatusId || "",
        taskTypeId: taskData.taskTypeId || "",
        projectId: taskData.projectId || "",
        assignUsers: Array.isArray(taskData.assignUsers)
          ? taskData.assignUsers.map((u) => u.employeeId)
          : [],
        taskStartDate: taskData.taskStartDate || null,
        taskDeadline: taskData.taskDeadline || null,
        repetition: taskData.repetition || "",
      }
    : {
        taskName: "",
        taskDescription: "",
        taskStatusId: "",
        taskTypeId: "",
        projectId: "",
        assignUsers: [],
        taskStartDate: null,
        taskDeadline: null,
        repetition: "",
      };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues,
  });

  const repetitionOptions = [
    { value: "none", label: "No Repetition" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ];

  // Reset form when taskData changes
  useEffect(() => {
    if (open && taskData) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If click is inside the drawer, do nothing
      if (
        drawerRef.current &&
        drawerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      // If click is inside a select or popover menu, do nothing
      if (
        (event.target as HTMLElement).closest('[data-slot="select-content"]') ||
        (event.target as HTMLElement).closest(
          '[data-slot="popover-content"]',
        ) ||
        (event.target as HTMLElement).closest(
          "[data-radix-popper-content-wrapper]",
        )
      ) {
        return;
      }
      // Otherwise, close the drawer
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

  const onSubmit = (data: TaskFormData) => {
    if (meetingId && detailMeetingAgendaIssueId && detailMeetingId) {
      const { assignUsers, taskStartDate, taskDeadline, ...rest } = data;
      const payload: AddUpdateTask = {
        ...rest,
        employeeIds: assignUsers,
        taskId: taskData?.taskId,
        taskStartDate: taskStartDate ? new Date(taskStartDate) : null,
        taskDeadline: taskDeadline ? new Date(taskDeadline) : null,
        meetingId: meetingId,
        detailMeetingAgendaIssueId: detailMeetingAgendaIssueId,
        detailMeetingId: detailMeetingId,
      };
      addUpdateTask(payload);
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0  bg-black/60 z-50 transition-opacity" />
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
            <h2 className="text-lg font-semibold">{taskData?.taskName}</h2>
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
              error={errors.taskName}
            />
            <Controller
              control={control}
              name="taskDescription"
              render={({ field }) => (
                <FormInputField label="Description" {...field} />
              )}
            />
            <Controller
              control={control}
              name="taskStatusId"
              render={({ field }) => (
                <FormSelect
                  label="Task Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={taskStatusOption}
                  error={errors.taskStatusId}
                  placeholder="Select status"
                />
              )}
            />
            <Controller
              control={control}
              name="taskTypeId"
              render={({ field }) => (
                <FormSelect
                  label="Task Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={taskTypeOption}
                  error={errors.taskTypeId}
                  placeholder="Select type"
                />
              )}
            />
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <FormSelect
                  label="Project"
                  value={field.value}
                  onChange={field.onChange}
                  options={projectListOption}
                  error={errors.projectId}
                  placeholder="Select project"
                />
              )}
            />
            <Controller
              control={control}
              name="assignUsers"
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.assignUsers}
                  isMulti={true}
                  placeholder="Select employees"
                />
              )}
            />

            <Controller
              control={control}
              name="taskDeadline"
              render={({ field }) => (
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                />
              )}
            />

            <Controller
              control={control}
              name="repetition"
              render={({ field }) => (
                <FormSelect
                  label="Repetition"
                  value={field.value}
                  onChange={field.onChange}
                  options={repetitionOptions}
                  placeholder="Select repetition"
                />
              )}
            />
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
