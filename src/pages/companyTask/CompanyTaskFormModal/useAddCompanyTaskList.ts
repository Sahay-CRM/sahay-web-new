// hooks/useAddCompanyTaskList.ts
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useGetCompanyProjectAll } from "@/features/api/companyProject";
import {
  useGetAllTaskStatus,
  useAllTaskType,
} from "@/features/api/companyTask";

interface FormValues {
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  repetition: string;
  taskStatus?: string;
  taskType?: string;
  comment?: string;
}

const steps = [
  "Basic Info",
  "Schedule & Repetition",
  "Task Status",
  "Task Type",
  "Comment",
];

export const useAddCompanyEmployee = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      repetition: "",
      taskStatus: undefined,
      taskType: undefined,
      comment: "",
    },
    mode: "onChange",
  });

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

  const { data: projectList } = useGetCompanyProjectAll();
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: paginationFilterTaskStatus,
  });
  const { data: taskTypeData } = useAllTaskType({
    filter: paginationFilterTaskType,
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

  // Only validate relevant fields for each step
  const fieldsToValidate: Record<number, (keyof FormValues)[]> = {
    1: ["project", "taskName", "taskDescription"],
    2: ["taskStartDate", "taskDeadline", "repetition"],
    3: ["taskStatus"],
    4: ["taskType"],
    5: ["comment"],
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
    // Convert dates to UTC ISO strings if present
    const payload = {
      ...data,
      taskStartDate: data.taskStartDate
        ? new Date(data.taskStartDate).toISOString()
        : null,
      taskDeadline: data.taskDeadline
        ? new Date(data.taskDeadline).toISOString()
        : null,
    };

    console.log(payload);

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
    setPaginationFilterTaskStatus,
    setPaginationFilterTaskType,
  };
};
