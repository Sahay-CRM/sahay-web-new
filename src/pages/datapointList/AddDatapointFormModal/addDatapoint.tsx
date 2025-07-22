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
    // Product,
    AssignUser,
    // GoalValue,
    trigger,
    KpiPreview,
    isLoading,
    isPending,
    companykpimasterId,
    datapointApiData,
    Details,
  } = useAddDatapoint();

  const methods = useForm({ mode: "onChange" });

  // Build steps array based on companykpimasterId and datapointApiData?.coreParameterId
  let steps = [];
  let stepNames = [];

  if (companykpimasterId) {
    // Hide KPI step
    steps = [<Details />];
    stepNames = ["Details"];
    steps.push(<AssignUser />);
    stepNames.push("Assign User");
  } else {
    // Show all steps
    steps = [<Kpi />, <Details />, <AssignUser />];
    stepNames = ["KPI", "Details", "Assign User", "Goal Value"];
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
        <div className=""></div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-5 mb-5">
          <StepProgress
            currentStep={currentStep}
            stepNames={stepNames}
            totalSteps={totalSteps}
            header={
              companykpimasterId ? datapointApiData?.KPIMaster?.KPIName : null
            }
          />

          {/* Button Group */}
          <div className="flex mt-9 items-center gap-3">
            <Button onClick={back} disabled={isFirstStep} className="w-fit">
              Previous
            </Button>

            {/* Next button stays visible but is disabled on last step */}
            <Button
              onClick={next}
              className="w-fit"
              disabled={isLastStep || isPending}
              isLoading={isPending}
            >
              Next
            </Button>

            {/* Finish button always visible on last step */}
            {isLastStep && (
              <Button onClick={onFinish} className="w-fit" disabled={isPending}>
                Finish
              </Button>
            )}

            {companykpimasterId && !isLastStep && (
              <Button onClick={onFinish} className="w-fit">
                Submit
              </Button>
            )}
          </div>
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
