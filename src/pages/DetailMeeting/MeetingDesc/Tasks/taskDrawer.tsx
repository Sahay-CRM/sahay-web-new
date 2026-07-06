import { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import {
  addUpdateCompanyTaskMutation,
  useDdTaskType,
  useGetAllTaskStatus,
} from "@/features/api/companyTask";
import { useGetCompanyProjectAll } from "@/features/api/companyProject";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import {
  addMeetingNotesMutation,
  useGetDetailMeetingAgenda,
} from "@/features/api/detailMeeting";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import ProjectDrawer from "../Projects/projectDrawer";

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
  ioId?: string;
  ioType?: string;
};
interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  taskData?: TaskGetPaging | null;
  issueId?: string;
  tasksFireBase: () => void;
  ioType?: string;
}

export default function TaskDrawer({
  open,
  onClose,
  taskData,
  issueId,
  tasksFireBase,
  ioType,
}: TaskDrawerProps) {
  const { id: meetingId } = useParams();
  const drawerRef = useRef<HTMLDivElement>(null);

  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isProjectSearch, setIsProjectSearch] = useState("");
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [defaultProjectName, setDefaultProjectName] = useState("");

  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  const { data: taskStatus } = useGetAllTaskStatus({ filter: {} });
  const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  const [savedPayload, setSavedPayload] = useState<
    Parameters<typeof addUpdateTask>[0] | null
  >(null);
  const { data: ioList } = useGetDetailMeetingAgenda({
    filter: {
      meetingId: meetingId,
    },
    enable: !!meetingId,
  });
  const { data: taskTypeData } = useDdTaskType({
    filter: {
      search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
    },
    enable: isTypeSearch.length >= 3,
  });
  const { data: employeedata } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });
  const { data: projectListdata } = useGetCompanyProjectAll({
    filter: {
      search: isProjectSearch.length >= 3 ? isProjectSearch : undefined,
    },
    enable: isProjectSearch.length >= 3 || isProjectSearch.length === 0,
  });
  const { mutate: addNote } = addMeetingNotesMutation();

  const taskTypeOption = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "", // Fallback to empty string
      }))
    : [];
  const ioOption = ioList
    ? ioList.map((item) => ({
        label: item.name,
        value: item.ioType === "ISSUE" ? item.issueId : item.objectiveId,
        ioType: item.ioType,
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

  const projectListOption = projectListdata
    ? Array.isArray(projectListdata.data)
      ? projectListdata.data
          .filter((project) => project.projectName && project.projectId)
          .map((project) => ({
            label: project.projectName!,
            value: project.projectId!,
          }))
      : []
    : [];

  const rawTaskDeadline = taskData
    ? (taskData as TaskGetPaging & { rawTaskDeadline?: string | Date | null })
        .rawTaskDeadline
    : undefined;

  const defaultTaskStatus = (taskStatus?.data || [])
    .slice()
    .sort((a, b) => (a.taskStatusOrder || 0) - (b.taskStatusOrder || 0))[0];

  const defaultValues = taskData
    ? {
        taskName: taskData.taskName || "",
        taskDescription: taskData.taskDescription || "",
        taskStatusId: taskData.taskStatusId || defaultTaskStatus?.taskStatusId || "",
        taskTypeId: taskData.taskTypeId || "",
        projectId: taskData.projectId || "",
        assignUsers: Array.isArray(taskData.assignUsers)
          ? taskData.assignUsers.map((u) => u.employeeId)
          : [],
        taskDeadline: rawTaskDeadline || taskData.taskDeadline || null,
        ioId: issueId || "",
        ioType: ioType || "",
      }
    : {
        taskName: "",
        taskDescription: "",
        taskStatusId: defaultTaskStatus?.taskStatusId || "",
        taskTypeId: "",
        projectId: "",
        assignUsers: [],
        taskStartDate: null,
        taskDeadline: null,
        ioId: issueId || "",
        ioType: ioType || "",
      };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (!taskData || !taskData.taskStatusId) {
      if (defaultTaskStatus?.taskStatusId) {
        setValue("taskStatusId", defaultTaskStatus.taskStatusId);
      }
    }
  }, [setValue, taskData, defaultTaskStatus]);

  // Reset form when taskData changes
  useEffect(() => {
    if (open && taskData) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskData]);

  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     const target = event.target as HTMLElement;
  //     if (drawerRef.current && drawerRef.current.contains(target)) {
  //       return;
  //     }
  //     if (
  //       target.closest('[data-slot="select-content"]') ||
  //       target.closest('[data-slot="popover-content"]') ||
  //       target.closest("[data-radix-popper-content-wrapper]")
  //     ) {
  //       return;
  //     }
  //     if (
  //       target.closest(".react-datepicker") ||
  //       target.closest(".react-datepicker-popper")
  //     ) {
  //       return;
  //     }
  //     onClose();
  //   }

  //   if (open) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [onClose, open]);

  const handleSuccess = () => {
    if (taskData && taskData.meetingNoteId) {
      addNote(
        {
          meetingNoteId: taskData?.meetingNoteId,
          noteType: "TASKS",
          noteTag: "Task",
        },
        {
          onSuccess: () => {
            tasksFireBase();
            onClose();
          },
        },
      );
    } else {
      tasksFireBase();
      onClose();
    }
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
        handleSuccess();
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

  const onSubmit = (data: TaskFormData) => {
    if (meetingId) {
      const {
        assignUsers,
        taskStartDate,
        taskDeadline,
        ioId,
        ioType,
        ...rest
      } = data;
      const payload: AddUpdateTask = {
        ...rest,
        employeeIds: assignUsers,
        taskId: taskData?.taskId,
        taskStartDate: taskStartDate ? new Date(taskStartDate) : null,
        taskDeadline: taskDeadline ? new Date(taskDeadline) : null,
        meetingId: meetingId,
        ...(ioType === "ISSUE"
          ? { issueId: ioId }
          : ioType === "OBJECTIVE"
            ? { objectiveId: ioId }
            : {}),

        ioType: data.ioType,
      };

      addUpdateTask(payload, {
        onSuccess: () => {
          handleSuccess();
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
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" />
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
              {taskData?.taskName ? taskData?.taskName : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 text-2xl hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            <div>
              <Controller
                control={control}
                name="ioId"
                rules={{ required: "Please select an Issue or Objective" }}
                render={({ field }) => (
                  <FormSelect
                    label="Select Issue/Objective"
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      const selected = ioOption.find(
                        (opt) => opt.value === val,
                      );
                      if (selected) {
                        setValue("ioType", selected.ioType); // 👈 also set ioType
                      }
                    }}
                    options={ioOption}
                    error={errors.ioId}
                    placeholder="Select Issue or Objective"
                    isMandatory
                  />
                )}
              />
            </div>

            <FormInputField
              label="Task Name"
              placeholder="Task Name"
              {...register("taskName", {
                required: "Task Name is required",
              })}
              error={errors.taskName}
              isMandatory
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
            <Controller
              control={control}
              name="projectId"
              rules={{ required: "Project is Required" }}
              render={({ field }) => (
                <SearchDropdown
                  options={projectListOption ?? []}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("projectId", value.value);
                  }}
                  placeholder="Select Project..."
                  label="Project"
                  error={errors.projectId}
                  isMandatory
                  onSearchChange={setIsProjectSearch}
                  onAddNew={(query) => {
                    setDefaultProjectName(query);
                    setProjectDrawerOpen(true);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="assignUsers"
              rules={{ required: "Select User is Required" }}
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
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

            <Controller
              control={control}
              name="taskDeadline"
              render={({ field }) => (
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                  disablePastDays={
                    Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                  }
                />
              )}
            />

            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              Submit
            </button>
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

      {projectDrawerOpen && (
        <ProjectDrawer
          open={projectDrawerOpen}
          onClose={() => setProjectDrawerOpen(false)}
          projectData={null}
          issueId={issueId}
          projectsFireBase={() => {}}
          ioType={ioType}
          defaultProjectName={defaultProjectName}
          onProjectCreated={(newProject) => {
            setValue("projectId", newProject.projectId!);
            setIsProjectSearch(""); // Refresh options
          }}
        />
      )}
    </>
  );
}
