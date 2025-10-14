import { useEffect } from "react";

import useStepForm from "@/components/shared/StepProgress/useStepForm";
import useAddEmployee from "./useAddEmployee";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import AddEmployeeModal from "./addEmployeeModal";
import StepProgress from "@/components/shared/StepProgress";

export default function AddEmployee() {
  const {
    companyEmployeeId,
    employeeData,
    showNextStep,
    EmployeeStatus,
    DepartmentSelect,
    Designation,
    ReportingManage,
    isPending,
    onFinish,
    trigger,
    isModalOpen,
    employeePreview,
    handleClose,
    onSubmit,
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
      ...(companyEmployeeId
        ? [
            {
              label: `${
                employeeData?.data?.employeeName
                  ? employeeData?.data?.employeeName
                  : ""
              }`,
              href: `/dashboard/kpi/${companyEmployeeId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, companyEmployeeId, employeeData?.data?.employeeName]);

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

  return (
    <div>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
          back={back}
          isFirstStep={isFirstStep}
          next={next}
          isLastStep={isLastStep}
          isPending={isPending}
          onFinish={onFinish}
          isUpdate={!!companyEmployeeId}
        />

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddEmployeeModal
            modalData={employeePreview as EmployeeData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}
