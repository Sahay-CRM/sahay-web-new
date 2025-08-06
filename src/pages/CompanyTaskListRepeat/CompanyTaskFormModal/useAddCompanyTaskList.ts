import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { useGetCompanyProject } from "@/features/api/companyProject";
import {
  useGetAllTaskStatus,
  useDdTaskType,
  addUpdateRepeatCompanyTaskMutation,
} from "@/features/api/companyTask";
import { getEmployee } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCompanyMeeting } from "@/features/api/companyMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import useGetRepeatCompanyTaskById from "@/features/api/companyTask/useGetRepeatCompanyTaskById";

interface FormValues {
  taskId?: string;
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  repeatType: string;
  taskStatusId?: string;
  taskTypeId?: string;
  meeting?: string;
  assignUser: string[];
  comment?: string;
}

// Renamed hook
export const useAddCompanyTask = () => {
  const { mutate: addUpdateTask, isPending } = addUpdateRepeatCompanyTaskMutation();
  const { id: repetitiveTaskId } = useParams();
  const { data: taskDataById } = useGetRepeatCompanyTaskById(repetitiveTaskId || "");
  const permission = useSelector(getUserPermission);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const methods = useForm<FormValues>({
    defaultValues: {
      taskId: "",
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      repeatType: "",
      taskStatusId: "",
      taskTypeId: "",
      assignUser: [],
      comment: "",
    },

    mode: "onChange",
  });
  const { reset, trigger, getValues } = methods;

  useEffect(() => {
    if (repetitiveTaskId && taskDataById?.data) {
      reset({
        taskId: taskDataById.data.taskId || "",
        project: taskDataById.data?.projectId || "",
        meeting: taskDataById.data?.meetingId || "",
        taskName: taskDataById.data.taskName || "",
        taskDescription: taskDataById.data.taskDescription || "",
        taskStartDate: taskDataById.data.taskStartDate
          ? new Date(taskDataById.data.taskStartDate)
          : null,
        taskDeadline: taskDataById.data.taskDeadline
          ? new Date(taskDataById.data.taskDeadline)
          : null,
        repeatType: taskDataById.data.repeatType?.toLocaleLowerCase(),
        taskStatusId: taskDataById.data.taskStatusId || "",
        taskTypeId: taskDataById.data.taskTypeId || "",
        assignUser: taskDataById.data.assignUsers
          ? taskDataById.data.assignUsers.map((user) => user.employeeId)
          : [],
      });
    }
  }, [ taskDataById, reset, repetitiveTaskId]);

  const [step, setStep] = useState(1);

  const [paginationFilterEmployee, setPaginationFilterEmployee] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
  const [paginationFilterProject, setPaginationFilterProject] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
  const [paginationFilterMeeting, setPaginationFilterMeeting] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

  const { data: taskStatus, isLoading: statusLoading } = useGetAllTaskStatus({
    filter: {},
  });
  const { data: taskTypeData, isLoading: typeLoading } = useDdTaskType();

  const { data: employeedata, isLoading: employeeLoading } = getEmployee({
    filter: { ...paginationFilterEmployee, isDeactivated: false },
  });
  const { data: projectListdata, isLoading: projectLoading } =
    useGetCompanyProject({
      filter: paginationFilterProject,
      enable: !!paginationFilterProject,
    });
  const { data: meetingData, isLoading: meetingLoading } = useGetCompanyMeeting(
    {
      filter: paginationFilterMeeting,
    }
  );

  const taskStatusOptions = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
      }))
    : [];

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName,
        value: status.taskTypeId,
      }))
    : [];

  // Repetition options
  const repetitionOptions = [
    // { value: "none", label: "No Repetition" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ];

  // Dynamically set steps based on taskId
  const steps = repetitiveTaskId
    ? ["Project", "Meeting", "Basic Info", "Assign User"]
    : ["Project", "Meeting", "Basic Info", "AssignUser", "Comment"];

  // Define required and optional fields for each step
  const stepFieldConfig: Record<
    number,
    { required: (keyof FormValues)[]; optional: (keyof FormValues)[] }
  > = repetitiveTaskId
    ? {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "repeatType",
            "taskDeadline",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate"],
        },
        // Adjusted step numbers to be contiguous for array indexing if needed,
        // but direct object key access is fine.
        // Assuming step numbers are 1, 2, 3, 4, (5 if not taskId)
        4: { required: ["assignUser"], optional: [] }, // Was 7
      }
    : {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "repeatType",
            "taskDeadline",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate"],
        },
        4: { required: ["assignUser"], optional: [] }, // Was 7
        5: { required: [], optional: ["comment"] }, // Was 8
      };

  const validateStep = async (): Promise<boolean> => {
    const currentStepConfig = stepFieldConfig[step];
    if (!currentStepConfig) return true;

    // Clear previous errors for optional fields
    currentStepConfig.optional.forEach((field) => {
      methods.clearErrors(field);
    });

    // Only validate required fields for the current step
    if (currentStepConfig.required.length === 0) {
      return true; // No required fields, step is valid
    }

    return methods.trigger(currentStepConfig.required);
  };

  const nextStep = async () => {
    if (await validateStep()) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };
  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = async (data: FormValues) => {
    // console.log(data, "datadatadata");

    const assigneeIds = data.assignUser;

    const payload = data.taskId
      ? {
          repetitiveTaskId: repetitiveTaskId,
          taskName: data.taskName,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data?.taskStatusId,
          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId: data.project,
          meetingId: data.meeting,
          repeatType: data.repeatType.toUpperCase(),
        }
      : {
          taskName: data.taskName,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data?.taskStatusId,
          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId: data.project,
          meetingId: data.meeting,
          repeatType: data.repeatType.toUpperCase(),
        };

    addUpdateTask(payload, {
      onSuccess: () => {
        navigate("/dashboard/tasksrepet");
      },
    });
  };
  const handleClose = () => setModalOpen(false);
  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    repetitionOptions,
    employeedata,
    projectListdata,
    setPaginationFilterEmployee,
    setPaginationFilterProject,
    setPaginationFilterMeeting,
    meetingData,
    repetitiveTaskId,
    taskStatusOptions,
    taskTypeOptions,
    permission,
    paginationFilterProject,
    paginationFilterEmployee,
    paginationFilterMeeting,
    isPending,
    taskDataById,
    projectLoading,
    statusLoading,
    typeLoading,
    employeeLoading,
    meetingLoading,
    onFinish,
    isModalOpen,
    handleClose,
    taskpreviewData: getValues(),
  };
};
