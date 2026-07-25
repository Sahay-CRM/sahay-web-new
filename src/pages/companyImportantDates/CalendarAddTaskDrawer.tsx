/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { X } from "lucide-react";

import FormSelect from "@/components/shared/Form/FormSelect";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

import {
  useGetAllTaskStatus,
  addUpdateCompanyTaskMutation,
  useDdTaskType,
} from "@/features/api/companyTask";
import { getEmployee } from "@/features/api/companyEmployee";
import { useGetCompanyProject } from "@/features/api/companyProject";
import { useGetBothCompanyMeeting } from "@/features/api/companyMeeting";

import ProjectDrawer from "@/pages/companyTask/CompanyTaskFormModal/projectDrawer";
import MeetingDrawer from "@/pages/companyTask/CompanyTaskFormModal/meetingDrawer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormValues {
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  taskStatusId: string;
  taskTypeId: string;
  meeting: string;
  assignUser: string[];
  comment: string;
}

interface CalendarAddTaskDrawerProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (task: { taskId: string; taskName: string; taskDescription: string }) => void;
}

export default function CalendarAddTaskDrawer({
  open,
  onClose,
  onTaskCreated,
}: CalendarAddTaskDrawerProps) {
  const queryClient = useQueryClient();
  const drawerRef = useRef<HTMLDivElement>(null);

  const { mutate: addUpdateTask, isPending } = addUpdateCompanyTaskMutation();

  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isStatusSearch] = useState("");
  
  const [paginationFilterEmployee] = useState({
    currentPage: 1,
    pageSize: 100,
    search: "",
  });
  const [paginationFilterProject, setPaginationFilterProject] = useState({
    currentPage: 1,
    pageSize: 100,
    search: "",
  });
  const [paginationFilterMeeting, setPaginationFilterMeeting] = useState({
    currentPage: 1,
    pageSize: 100,
    search: "",
  });

  const [isOpenProjectDrawer, setIsOpenProjectDrawer] = useState(false);
  const [isOpenMeetingDrawer, setIsOpenMeetingDrawer] = useState(false);

  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  const [savedPayload, setSavedPayload] = useState<unknown>(null);

  const methods = useForm<FormValues>({
    defaultValues: {
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      taskStatusId: "",
      taskTypeId: "",
      meeting: "",
      assignUser: [],
      comment: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = methods;

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      reset({
        project: "",
        taskName: "",
        taskDescription: "",
        taskStartDate: null,
        taskDeadline: null,
        taskStatusId: "",
        taskTypeId: "",
        meeting: "",
        assignUser: [],
        comment: "",
      });
    }
  }, [open, reset]);

  // Queries
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
      pageSize: 25,
    },
    enable: isStatusSearch.length >= 3 || open,
  });

  const { data: taskTypeData } = useDdTaskType({
    filter: {
      search: isTypeSearch,
    },
    enable: isTypeSearch.length >= 3 || open,
  });

  const { data: employeedata } = getEmployee({
    filter: { ...paginationFilterEmployee, isDeactivated: false },
    enable: open,
  });

  const { data: projectListdata } = useGetCompanyProject({
    filter: paginationFilterProject,
    enable: open,
  });

  const { data: meetingData } = useGetBothCompanyMeeting({
    filter: paginationFilterMeeting,
    enable: open,
  });

  const taskStatusOptions = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
      }))
    : [];

  const defaultTaskStatus = (taskStatus?.data || [])
    .slice()
    .sort((a, b) => (a.taskStatusOrder || 0) - (b.taskStatusOrder || 0))[0];

  useEffect(() => {
    if (open && defaultTaskStatus && !watch("taskStatusId")) {
      setValue("taskStatusId", defaultTaskStatus.taskStatusId);
    }
  }, [defaultTaskStatus, open, setValue, watch]);

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "",
      }))
    : [];

  const employeeOptions = (employeedata?.data || []).map((emp) => ({
    label: emp.employeeName || "Unnamed",
    value: emp.employeeId || "",
  }));

  const projectOptions = (projectListdata?.data || []).map((proj) => ({
    label: proj.projectName || "Unnamed",
    value: proj.projectId || "",
  }));

  const meetingOptions = (meetingData?.data || []).map((meet) => ({
    label: meet.meetingName || "Unnamed",
    value: meet.meetingId || "",
  }));

  const handleSuccess = (newTask: any) => {
    queryClient.invalidateQueries({ queryKey: ["get-all-task-dropdown"] });
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    onClose();
  };

  const onConfirmSubmit = () => {
    if (!reasons.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    const finalPayload = {
      ...(savedPayload as Record<string, unknown>),
      isForceChangeDeadline: true,
      reasons: reasons,
    };

    addUpdateTask(finalPayload as any, {
      onSuccess: (res: any) => {
        setIsConfModalOpen(false);
        handleSuccess(res?.data);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;
        toast.error(
          `Error: ${axiosError.response?.data?.message || "An error occurred"}`
        );
      },
    });
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      taskName: data.taskName,
      taskDescription: data.taskDescription,
      taskStartDate: data.taskStartDate ? new Date(data.taskStartDate) : null,
      taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
      taskStatusId: data.taskStatusId,
      taskTypeId: data.taskTypeId,
      comment: data.comment,
      employeeIds: data.assignUser,
      projectId: data.project,
      meetingId: data.meeting,
    };

    addUpdateTask(payload, {
      onSuccess: (res: any) => {
        handleSuccess(res?.data);
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
            }`
          );
        }
      },
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-[60] transition-opacity" />
      )}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Create New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
            
            {/* Task Name */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter task name..."
                {...register("taskName", { required: "Task Name is required" })}
                className="border-gray-200 focus:border-primary"
              />
              {errors.taskName && (
                <span className="text-red-500 text-xs">{errors.taskName.message}</span>
              )}
            </div>

            {/* Task Description */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Task Description <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter task description..."
                {...register("taskDescription", { required: "Task Description is required" })}
                className="border-gray-200 focus:border-primary"
              />
              {errors.taskDescription && (
                <span className="text-red-500 text-xs">{errors.taskDescription.message}</span>
              )}
            </div>

            {/* Project Selection */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-semibold text-gray-700">
                  Project <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setIsOpenProjectDrawer(true)}
                  className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                >
                  + Add Project
                </button>
              </div>
              <Controller
                name="project"
                control={control}
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <SearchDropdown
                    placeholder="Search project..."
                    options={projectOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(item) => field.onChange(item.value)}
                    onSearchChange={(val) =>
                      setPaginationFilterProject((prev) => ({ ...prev, search: val }))
                    }
                    isCrossShow={true}
                    error={errors.project}
                  />
                )}
              />
            </div>

            {/* Meeting Selection */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-semibold text-gray-700">
                  Meeting
                </Label>
                <button
                  type="button"
                  onClick={() => setIsOpenMeetingDrawer(true)}
                  className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                >
                  + Add Meeting
                </button>
              </div>
              <Controller
                name="meeting"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    placeholder="Search meeting (optional)..."
                    options={meetingOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(item) => field.onChange(item.value)}
                    onSearchChange={(val) =>
                      setPaginationFilterMeeting((prev) => ({ ...prev, search: val }))
                    }
                    isCrossShow={true}
                  />
                )}
              />
            </div>

            {/* Assign To */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Assign To <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="assignUser"
                control={control}
                rules={{ required: "Please assign at least one employee" }}
                render={({ field }) => (
                  <FormSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={employeeOptions}
                    isMulti={true}
                    placeholder="Select employees..."
                    error={errors.assignUser}
                  />
                )}
              />
            </div>

            {/* Task Deadline */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Task Deadline <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="taskDeadline"
                control={control}
                rules={{ required: "Deadline is required" }}
                render={({ field }) => (
                  <FormDateTimePicker
                    label=""
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.taskDeadline}
                    portalId=""
                  />
                )}
              />
            </div>

            {/* Task Type */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Task Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="taskTypeId"
                control={control}
                rules={{ required: "Task Type is required" }}
                render={({ field }) => (
                  <SearchDropdown
                    options={taskTypeOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(item) => field.onChange(item.value)}
                    placeholder="Select Task Type..."
                    onSearchChange={setIsTypeSearch}
                    error={errors.taskTypeId}
                  />
                )}
              />
            </div>

            {/* Task Status */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Task Status <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="taskStatusId"
                control={control}
                rules={{ required: "Task Status is required" }}
                render={({ field }) => (
                  <FormSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={taskStatusOptions}
                    placeholder="Select status..."
                    error={errors.taskStatusId}
                  />
                )}
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">Comment</Label>
              <Textarea
                placeholder="Add a starting comment..."
                {...register("comment")}
                className="border-gray-200 focus:border-primary resize-none min-h-[80px]"
              />
            </div>

          </div>

          <div className="p-4 border-t bg-gray-50 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
            >
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>

      {/* Deadline Confirmation Modal */}
      <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-lg z-[70]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800">
              Confirmation Required
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              The deadline has been changed. Please provide a reason to proceed with the update.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-2 text-left">
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reasons for deadline change..."
                value={reasons}
                onChange={(e) => setReasons(e.target.value)}
                className="border-gray-200 focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfModalOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmSubmit}
              disabled={!reasons.trim()}
              className="bg-primary text-white font-medium"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Drawers */}
      <ProjectDrawer
        open={isOpenProjectDrawer}
        onClose={() => setIsOpenProjectDrawer(false)}
        projectsFireBase={() => {}}
        onProjectCreated={(newProj) => {
          setValue("project", newProj.projectId || "");
          queryClient.invalidateQueries({ queryKey: ["get-project-list"] });
          setIsOpenProjectDrawer(false);
        }}
      />

      <MeetingDrawer
        open={isOpenMeetingDrawer}
        onClose={() => setIsOpenMeetingDrawer(false)}
        onMeetingCreated={(newMeet) => {
          setValue("meeting", newMeet.meetingId || "");
          queryClient.invalidateQueries({ queryKey: ["get-both-meeting"] });
          setIsOpenMeetingDrawer(false);
        }}
      />
    </>
  );
}
