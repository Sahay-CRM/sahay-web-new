import { Button } from "@/components/ui/button";
import AddDatapointModal from "./addDatapointModal";
import useAddDatapoint from "./useAddDatapoint";
import { FormProvider, useForm } from "react-hook-form";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import Loader from "@/components/shared/Loader/Loader";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

const AddDatapoint = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    Kpi,
    Frequency,
    CoreParameter,
    Product,
    AssignUser,
    GoalValue,
    trigger,
    KpiPreview,
    skipToStep,
    isLoading,
    companykpimasterId,
  } = useAddDatapoint();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "KPI List", href: "/dashboard/kpi" },
      { label: companykpimasterId ? "Update KPI" : "Add KPI", href: "" },
    ]);
  }, [companykpimasterId, setBreadcrumbs]);

  const methods = useForm({ mode: "onChange" });

  const steps = [
    <Kpi />,
    <Frequency />,
    <CoreParameter />,
    <Product />,
    <AssignUser />,
    <GoalValue />,
  ];

  const visibleSteps =
    skipToStep === 5
      ? [<Frequency />, <GoalValue />]
      : skipToStep > 0
        ? steps.slice(skipToStep)
        : steps;

  const visibleStepNames =
    skipToStep === 5
      ? ["Frequency", "Goal Value"]
      : skipToStep === 1
        ? [
            "Frequency",
            "Core Parameter",
            "Product",
            "Assign User",
            "Goal Value",
          ]
        : [
            "KPI",
            "Frequency",
            "Core Parameter",
            "Product",
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
  } = useStepForm(visibleSteps, trigger);

  // Show loader while API data is being fetched
  if (isLoading) {
    return <Loader />;
  }

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
            modalData={KpiPreview}
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
