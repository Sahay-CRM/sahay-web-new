// hooks/useAddCompanyTaskList.ts
import { useForm } from "react-hook-form";
import { useState } from "react";

// interface FormValues {
//   projectName: string;
//   projectDescription: string;
//   projectDeadline: null;
//   taskName: string;
//   taskDescription: string;
//   taskStatusId: string;
//   coreParameter: string;
//   subParameter: never[];
//   employeeId: never[];
// }

const steps = ["Project Info", "Details & Assignment"];
export function useAddCompanyEmployee() {
  const [step, setStep] = useState(1);

  const methods = useForm({
    defaultValues: {
      projectName: "",
      projectDescription: "",
      projectDeadline: null,
      taskName: "",
      taskDescription: "",
      taskStatusId: "",
      coreParameter: "",
      subParameter: [],
      employeeId: [],
    },
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const onSubmit = () => {};

  // Static dropdown data
  const employees = [
    { label: "Alice Johnson", value: "1" },
    { label: "Bob Smith", value: "2" },
    { label: "Charlie Brown", value: "3" },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inProgress" },
    { label: "Completed", value: "completed" },
  ];

  const taskTypeOptions = [
    { label: "Design", value: "design" },
    { label: "Development", value: "development" },
    { label: "Testing", value: "testing" },
  ];

  const coreParameter = [
    { label: "Performance", value: "performance" },
    { label: "Quality", value: "quality" },
    { label: "Time", value: "time" },
  ];

  const subParameter = [
    { label: "Speed", value: "1" },
    { label: "Accuracy", value: "2" },
    { label: "Efficiency", value: "3" },
  ];

  return {
    step,
    nextStep,
    prevStep,
    steps,
    onSubmit,
    methods,
    employees,
    statusOptions,
    taskTypeOptions,
    coreParameter,
    subParameter,
  };
}
