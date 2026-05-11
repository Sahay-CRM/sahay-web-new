import { CheckMarkIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/button";
import React from "react";

interface DashboardStepProgressProps {
  currentStep: number;
  stepNames: string[];
  totalSteps: number;
  isLoading?: boolean;
  back?: () => void;
  next?: () => void;
  onFinish?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isPending?: boolean;
  isUpdate?: boolean;
}

const DashboardStepProgress: React.FC<DashboardStepProgressProps> = ({
  currentStep,
  stepNames,
  isLoading = false,
  totalSteps,
  back,
  isFirstStep,
  next,
  isLastStep,
  isPending,
  onFinish,
  isUpdate,
}) => {
  const renderStep = (step: number) => {
    const isCompleted = step < currentStep;
    const isCurrent = step === currentStep;
    const isFirstStepItem = step === 1;
    const isLastStepItem = step === totalSteps;

    return (
      <div
        key={step}
        className={`flex flex-shrink items-center relative ${
          isFirstStepItem
            ? "flex-1"
            : isLastStepItem
              ? "ml-auto flex justify-end"
              : "flex-1"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`text-center shadow-md rounded-full flex items-center justify-center ${
              isCurrent
                ? "font-semibold text-white bg-black"
                : "bg-dark-600/50 border shadow-2xl"
            }`}
          >
            {isCompleted ? (
              <span className="block w-5">
                <CheckMarkIcon />
              </span>
            ) : (
              <div className="px-2 text-sm h-6 flex items-center">
                <span>{step}</span>
              </div>
            )}
          </div>
          <p className="font-bold text-base whitespace-nowrap">
            {stepNames[step - 1]}
          </p>
        </div>
        {!isLastStepItem && <div className="h-1 mx-2 flex-1 bg-gray-300"></div>}
      </div>
    );
  };

  return (
    <div className="w-full pl-3 py-4 px-2">
      <div className="items-center">
        {/* Steps Section */}
        <div className="w-full flex items-center gap-10">
          <div className="flex-1 mt-0">
            <div className="flex justify-between">
              {[...Array(totalSteps)].map((_, index) => renderStep(index + 1))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={back} disabled={isFirstStep} className="w-fit">
              Previous
            </Button>

            {!isLastStep ? (
              <Button onClick={next} className="w-fit" disabled={isPending}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={onFinish}
                className="w-fit"
                disabled={isPending}
                isLoading={isPending}
              >
                {isUpdate ? "Save Changes" : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-50 flex justify-center items-center">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-black animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardStepProgress;
