import { Button } from "@/components/ui/button";
import AddDatapointModal from "./addDatapointModal";
import useAddDatapoint from "./useAddDatapoint";
import { FormProvider, useForm } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import Loader from "@/components/shared/Loader/Loader";

const AddDatapoint = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    Kpi,
    Frequency,
    // Product,
    AssignUser,
    // GoalValue,
    trigger,
    KpiPreview,
    isLoading,
    isPending,
    companykpimasterId,
  } = useAddDatapoint();

  const methods = useForm({ mode: "onChange" });

  // Build steps array based on companykpimasterId and datapointApiData?.coreParameterId
  let steps = [];
  let stepNames = [];

  if (companykpimasterId) {
    // Hide KPI step
    steps = [<Frequency />];
    stepNames = ["Frequency"];
    steps.push(<AssignUser />);
    stepNames.push("Assign User");
  } else {
    // Show all steps
    steps = [<Kpi />, <Frequency />, <AssignUser />];
    stepNames = ["KPI", "Frequency", "Assign User", "Goal Value"];
  }

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger);

  // Show loader while API data is being fetched
  if (isLoading) {
    return <Loader />;
  }

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
          <Button
            onClick={isLastStep ? onFinish : next}
            className="w-fit"
            disabled={isPending}
            isLoading={isPending}
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>

        {/* Step Content */}
        <div className="step-content w-full">{stepContent}</div>

        {/* Modal Component */}
        {isModalOpen && (
          <AddDatapointModal
            modalData={KpiPreview}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
            isLoading={isPending}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddDatapoint;
