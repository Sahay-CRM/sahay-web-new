// hooks/useAddCompanyTaskList.ts
import { useForm } from "react-hook-form";
import { useState } from "react";

interface FormValues {
  project: string;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  taskStatusId: string;
  taskTypeId: string;
  meeting?: string;
  assignees: string[]; // assuming it's a multi-select
  comment?: string;
}

const steps = ["Basic Info", "Details & Assignment"];

export const useAddCompanyEmployee = () => {
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
      assignees: [],
      comment: "",
    },
    mode: "onChange",
  });

  const [step, setStep] = useState(1);

  const employees = [
    { value: "emp1", label: "John Doe" },
    { value: "emp2", label: "Jane Smith" },
  ];

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  const taskTypeOptions = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "improvement", label: "Improvement" },
  ];

  const fieldsToValidate: Record<number, (keyof FormValues)[]> = {
    1: [
      "project",
      "taskName",
      "taskDescription",
      "taskStartDate",
      "taskDeadline",
    ],
    2: ["taskStatusId", "taskTypeId", "assignees"],
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

  const onSubmit = async (data: FormValues, id?: string) => {
    if (await validateStep()) {
      if (id) {
        console.log("Updating meeting:", id, data);
        // Update logic here
      } else {
        console.log("Creating meeting:", data);
        // Create logic here
      }
    }
  };

  const fetchEmployeeById = async (
    id: string,
  ): Promise<FormValues & { countryCode?: string }> => {
    console.log("Fetching meeting by ID:", id);
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          project: "Apollo",
          taskName: "Kickoff Call",
          taskDescription: "Initial project kickoff with stakeholders",
          taskStartDate: new Date(),
          taskDeadline: new Date(),
          taskStatusId: "in_progress",
          taskTypeId: "feature",
          meeting: "Zoom Link",
          assignees: ["emp1", "emp2"],
          comment: "Ensure all teams are present",
          countryCode: "+91",
        });
      }, 300),
    );
  };

  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    employees,
    statusOptions,
    taskTypeOptions,
    fetchEmployeeById,
  };
};
