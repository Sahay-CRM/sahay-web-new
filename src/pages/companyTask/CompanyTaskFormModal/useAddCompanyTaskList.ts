// hooks/useAddCompanyTaskList.ts
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useGetCompanyProject } from "@/features/api/companyProject";
import {
  useGetAllTaskStatus,
  addUpdateCompanyTaskMutation,
  useGetCompanyTaskById,
  useDdTaskType,
} from "@/features/api/companyTask";
import { getEmployee } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCompanyMeeting } from "@/features/api/companyMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";

interface FormValues {
  taskId?: string; // <-- make it optional
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  repetition: string;
  taskStatusId?: string;
  taskTypeId?: string;
  meeting?: string; // <-- add this line for meeting field
  assignUser: string[]; // always an array of employeeIds
  comment?: string;
}

export const useAddCompanyEmployee = () => {
  const { mutate: addUpdateTask, isPending } = addUpdateCompanyTaskMutation();
  const { id: taskId } = useParams();
  const { data: taskDataById } = useGetCompanyTaskById(taskId || "");
  const permission = useSelector(getUserPermission);
  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    defaultValues: {
      taskId: "", // <-- add this
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      repetition: "none", // Default to "No Repetition"
      taskStatusId: "",
      taskTypeId: "",
      assignUser: [], // always an array
      comment: "",
    },
    mode: "onChange",
  });
  const { reset } = methods;

  // Set form values when editing (taskId present and data loaded)
  useEffect(() => {
    if (taskId && taskDataById?.data) {
      reset({
        taskId: taskDataById.data.taskId || "", // <-- add this
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
        repetition: "", // or map if available
        taskStatusId: taskDataById.data.taskStatusId || "",
        taskTypeId: taskDataById.data.taskTypeId || "",
        assignUser: taskDataById.data.assignUsers
          ? taskDataById.data.assignUsers.map((user) => user.employeeId)
          : [],
      });
    }
  }, [taskId, taskDataById, reset]);

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

  //const { data: projectList } = useGetCompanyProjectAll();
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });
  const { data: taskTypeData } = useDdTaskType();

  const { data: employeedata } = getEmployee({
    filter: paginationFilterEmployee,
  });
  const { data: projectListdata } = useGetCompanyProject({
    filter: paginationFilterProject,
  });
  const { data: meetingData } = useGetCompanyMeeting({
    filter: paginationFilterMeeting,
  });

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
    { value: "none", label: "No Repetition" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ];

  // Dynamically set steps based on taskId
  const steps = taskId
    ? ["Project", "Meeting", "Basic Info", "Assign User"]
    : ["Project", "Meeting", "Basic Info", "Assign User", "Comment"];

  // Define required and optional fields for each step
  const stepFieldConfig: Record<
    number,
    { required: (keyof FormValues)[]; optional: (keyof FormValues)[] }
  > = taskId
    ? {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "taskDeadline",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate", "repetition"],
        },
        7: { required: ["assignUser"], optional: [] },
      }
    : {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "taskDeadline",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate", "repetition"],
        },
        7: { required: ["assignUser"], optional: [] },
        8: { required: [], optional: ["comment"] },
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

  const onSubmit = async (data: FormValues) => {
    // assignUser is always string[]
    const assigneeIds = data.assignUser;

    const payload = data.taskId
      ? {
          taskId: taskId,
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
        };

    addUpdateTask(payload, {
      onSuccess: () => {
        navigate("/dashboard/tasks");
      },
    });
    // handle payload
  };

  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    // projectListOption,
    repetitionOptions,
    employeedata,
    projectListdata,
    setPaginationFilterEmployee,
    setPaginationFilterProject,
    setPaginationFilterMeeting,
    meetingData,
    taskId,
    taskStatusOptions,
    taskTypeOptions,
    permission,
    paginationFilterProject,
    paginationFilterEmployee,
    paginationFilterMeeting,
    isPending,
  };
};
