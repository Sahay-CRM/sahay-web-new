import StepProgress from "../../../components/shared/StepProgress";
import useStepForm from "../../../components/shared/StepProgress/useStepForm";
import { Button } from "@/components/ui/button";
import AddEmployeeModal from "./addEmployeeModal";
import useAddEmployee from "./useAddEmployee";
import { FormProvider, useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

const AddEmployee = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    DepartmentSelect,
    EmployeeStatus,
    Designation,
    ReportingManage,
    trigger,
    employeePreview,
    showNextStep,
    companyEmployeeId,
  } = useAddEmployee();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Employee", href: "/dashboard/company-employee" },
      {
        label: companyEmployeeId
          ? "Company Employee Update"
          : "Company Employee Add",
        href: "",
      },
    ]);
  }, [setBreadcrumbs, companyEmployeeId]);

  // Build steps array based on showNextStep
  const steps = showNextStep
    ? [
        <EmployeeStatus />,
        <DepartmentSelect />,
        <Designation />,
        <ReportingManage />,
      ]
    : [<EmployeeStatus />];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger);

  const stepNames = [
    "Basic Info",
    "Department",
    "Designation",
    "Reporting Manager",
  ];

  const methods = useForm({
    mode: "onChange",
  });

  return (
    <FormProvider {...methods}>
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-5 mb-5 ">
          <Button onClick={back} disabled={isFirstStep} className="w-fit">
            Previous
          </Button>
          <Button onClick={isLastStep ? onFinish : next} className="w-fit">
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>

        {/* Step Content */}
        <div className="step-content w-full">{stepContent}</div>

        {/* Modal Component */}
        {isModalOpen && (
          <AddEmployeeModal
            modalData={employeePreview as EmployeeData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddEmployee;
