import { FormProvider, useForm } from "react-hook-form";

import AddDatapointModal from "./addDatapointModal";
import useAddDatapoint from "./useAddDatapoint";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import PageNotAccess from "@/pages/PageNoAccess";

const AddDatapoint = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    Kpi,
    // Product,
    // AssignUser,
    // GoalValue,
    trigger,
    KpiPreview,
    isPending,
    Details,
    permission,
  } = useAddDatapoint();

  const methods = useForm({ mode: "onChange" });

  let stepNames = [];

  const steps = [<Kpi />, <Details />];
  stepNames = ["KPI", "Details", "Assign User", "Goal Value"];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger);

  if (permission && permission.Add === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex items-center gap-5 mb-3">
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
