import { Button } from "@/components/ui/button";
import { FormProvider } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import useAddProject from "./useAddProject";
import AddProjectModal from "./addProjectModal";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

const AddProject = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    ProjectInfo,
    ProjectStatus,
    CoreParameter,
    SubParameter,
    Employees,
    trigger,
    meetingPreview,
    companyProjectId,
    methods, // Get form methods from the hook
  } = useAddProject();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Employee", href: "/dashboard/company-employee" },
      {
        label: companyProjectId
          ? "Update Company Project"
          : "Add Company Project",
        href: "",
      },
    ]);
  }, [setBreadcrumbs, companyProjectId]);

  // Build steps array based on showNextStep
  const steps = [
    <ProjectInfo />,
    <ProjectStatus />,
    <CoreParameter />,
    <SubParameter />,
    <Employees />,
  ];

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
    "Project Info",
    "Project Status",
    "Core Parameter",
    "Sub Parameter",
    "Employees",
  ];

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
          <AddProjectModal
            modalData={meetingPreview as CompanyProjectDataProps}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddProject;
