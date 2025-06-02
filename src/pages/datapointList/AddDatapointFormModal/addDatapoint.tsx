import { Button } from "@/components/ui/button";
import AddDatapointModal from "./addDatapointModal";
import useAddDatapoint from "./useAddDatapoint";
import { FormProvider, useForm } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";

const AddDatapoint = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    Kpi,
    Frequency,
    ValidationType,
    // CoreParameter,
    AssignUser,
    GoalValue,
    trigger,
    KpiPreview,
    skipToStep,
  } = useAddDatapoint();

  // Build steps array based on showNextStep
  const steps = [
    <Kpi />,
    <Frequency />,
    <ValidationType />,
    // <CoreParameter/>,
    <AssignUser />,
    <GoalValue />,
  ];

  // If skipToStep > 0, only show steps from skipToStep onwards
  const visibleSteps = skipToStep > 0 ? steps.slice(skipToStep) : steps;
  const visibleStepNames =
    skipToStep > 0
      ? ["Goal Value"]
      : [
          "Kpi",
          "Frequency",
          "Validation Type",
          // "Core Parameter",
          "Assign User",
          "Goal Value",
        ];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(visibleSteps, trigger, skipToStep > 0 ? 0 : 0);

  const methods = useForm({
    mode: "onChange",
  });

  return (
    <FormProvider {...methods}>
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={visibleStepNames}
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
          <AddDatapointModal
            modalData={KpiPreview as KPIFormData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddDatapoint;
