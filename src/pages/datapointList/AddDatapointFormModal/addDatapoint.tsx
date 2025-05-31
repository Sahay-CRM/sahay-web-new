import { Button } from "@/components/ui/button";
import AddDatapointModal from "./addDatapointModal";
import useAddDatapoint from "./useAddDatapoint";
import { FormProvider, useForm } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import { KPIFormData } from "@/components/interface/common";

const AddDatapoint = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    Kpi,
    Frequency,
    ValidationType,
    AssignUser,
    GoalValue,
    trigger,
    KpiPreview,
  } = useAddDatapoint();

  // Build steps array based on showNextStep
  const steps = [
    <Kpi />,
    <Frequency />,
    <ValidationType />,
    <AssignUser />,
    <GoalValue />,
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
    "Kpi",
    "Frequency",
    "Validation Type",
    "Assign User",
    "Goal Value",
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
