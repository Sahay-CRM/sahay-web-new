// hooks/useAddCompanyTaskList.ts
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useGetCompanyProjectAll } from "@/features/api/companyProject";
import {
  useGetAllTaskStatus,
  useAllTaskType,
  addUpdateCompanyTaskMutation,
  useGetCompanyTaskById,
} from "@/features/api/companyTask";
import { getEmployee } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";

interface FormValues {
  taskId?: string; // <-- make it optional
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  repetition: string;
  taskStatus?: TaskStatusAllRes;
  taskType?: TaskTypeData;
  assignUser: string[]; // always an array of employeeIds
  comment?: string;
}

export const useAddCompanyEmployee = () => {
  const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  const { id: taskId } = useParams();
  const { data: taskDataById } = useGetCompanyTaskById(taskId || "");

  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    defaultValues: {
      taskId: "", // <-- add this
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      repetition: "",
      taskStatus: undefined,
      taskType: undefined,
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
        taskName: taskDataById.data.taskName || "",
        taskDescription: taskDataById.data.taskDescription || "",
        taskStartDate: taskDataById.data.taskStartDate
          ? new Date(taskDataById.data.taskStartDate)
          : null,
        taskDeadline: taskDataById.data.taskDeadline
          ? new Date(taskDataById.data.taskDeadline)
          : null,
        repetition: "", // or map if available
        taskStatus:
          taskDataById.data.taskStatusId && taskDataById.data.taskStatusName
            ? {
                taskStatusId: taskDataById.data.taskStatusId,
                taskStatus: taskDataById.data.taskStatusName,
              }
            : undefined,
        taskType:
          taskDataById && taskDataById.data
            ? {
                taskTypeId: taskDataById.data.taskTypeId,
                taskTypeName: taskDataById.data.taskTypeName,
              }
            : undefined,
        assignUser: taskDataById.data.assignUsers
          ? taskDataById.data.assignUsers.map((user) => user.employeeId)
          : [],
      });
    }
  }, [taskId, taskDataById, reset]);

  const [step, setStep] = useState(1);

  const [paginationFilterTaskStatus, setPaginationFilterTaskStatus] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });
  const [paginationFilterTaskType, setPaginationFilterTaskType] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });
  const [paginationFilterEmployee, setPaginationFilterEmployee] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

  const { data: projectList } = useGetCompanyProjectAll();
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: paginationFilterTaskStatus,
  });
  const { data: taskTypeData } = useAllTaskType({
    filter: paginationFilterTaskType,
  });
  const { data: employeedata } = getEmployee({
    filter: paginationFilterEmployee,
  });

  const taskType = {
    data: Array.isArray(taskTypeData?.data) ? taskTypeData.data : [],
  };

  const projectListOption = [
    {
      label: "Please select Project",
      value: "",
      disabled: true,
    },
    ...(Array.isArray(projectList?.data)
      ? projectList.data.map((item) => ({
          label: item.projectName,
          value: item.projectId,
        }))
      : []),
  ];

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
    ? [
        "Basic Info",
        "Schedule & Repetition",
        "Task Status",
        "Task Type",
        "Assign User",
      ]
    : [
        "Basic Info",
        "Schedule & Repetition",
        "Task Status",
        "Task Type",
        "Assign User",
        "Comment",
      ];

  // Only validate relevant fields for each step
  const fieldsToValidate: Record<number, (keyof FormValues)[]> = taskId
    ? {
        1: ["project", "taskName", "taskDescription"],
        2: ["taskStartDate", "taskDeadline", "repetition"],
        3: ["taskStatus"],
        4: ["taskType"],
        5: ["assignUser"],
      }
    : {
        1: ["project", "taskName", "taskDescription"],
        2: ["taskStartDate", "taskDeadline", "repetition"],
        3: ["taskStatus"],
        4: ["taskType"],
        5: ["assignUser"],
        6: ["comment"],
      };

  const validateStep = async (): Promise<boolean> => {
    return methods.trigger(fieldsToValidate[step]);
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
          taskStatusId: data.taskStatus?.taskStatusId,
          taskTypeId: data.taskType?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId: data.project,
        }
      : {
          taskName: data.taskName,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data.taskStatus?.taskStatusId,
          taskTypeId: data.taskType?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId: data.project,
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
    projectListOption,
    repetitionOptions,
    taskStatus,
    taskType,
    employeedata,
    setPaginationFilterTaskStatus,
    setPaginationFilterTaskType,
    setPaginationFilterEmployee,
    taskId, // expose taskId for component
  };
};
