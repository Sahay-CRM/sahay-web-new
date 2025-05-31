import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import useAddProject from "./useAddProject";
import AddProjectModal from "./addProjectModal";

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
  } = useAddProject();

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
          <AddProjectModal
            modalData={meetingPreview as MeetingData}
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
