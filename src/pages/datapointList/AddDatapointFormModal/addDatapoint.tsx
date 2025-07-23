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

  let steps = [];
  let stepNames = [];

  if (companykpimasterId) {
    // Hide KPI step
    steps = [<Details />];
    stepNames = ["Details"];
    steps.push(<AssignUser />);
    stepNames.push("Assign User");
  } else {
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <div>
        <div className="flex items-center gap-5 mb-3">
          <StepProgress
            currentStep={currentStep}
            stepNames={stepNames}
            totalSteps={totalSteps}
            header={
              companykpimasterId ? datapointApiData?.KPIMaster?.KPIName : null
            }
            back={back}
            isFirstStep={isFirstStep}
            next={next}
            isLastStep={isLastStep}
            isPending={isPending}
            onFinish={onFinish}
            isUpdate={!!companykpimasterId}
          />
        </div>

        <div className="step-content w-full">{stepContent}</div>

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
