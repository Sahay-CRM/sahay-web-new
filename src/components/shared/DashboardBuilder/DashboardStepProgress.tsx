import { CheckMarkIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/button";
import React from "react";
import { twMerge } from "tailwind-merge";

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
    const isLastItem = step === totalSteps;

    return (
      <React.Fragment key={step}>
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={twMerge(
              "w-7 h-7 rounded-full flex items-center justify-center border",
              isCurrent
                ? "bg-black text-white border-black"
                : isCompleted
                  ? "bg-gray-100 border-gray-100 text-gray-500"
                  : "bg-white border-gray-200 text-gray-400",
            )}
          >
            {isCompleted ? (
              <span className="w-3.5 h-3.5">
                <CheckMarkIcon />
              </span>
            ) : (
              <span className="text-[10px] font-bold">{step}</span>
            )}
          </div>
          <span
            className={twMerge(
              "text-xs font-bold whitespace-nowrap",
              isCurrent ? "text-black" : "text-gray-400",
            )}
          >
            {stepNames[step - 1]}
          </span>
        </div>

        {!isLastItem && (
          <div className="flex-1 mx-4 min-w-[10px]">
            <div
              className={twMerge(
                "h-[1px] w-full",
                isCompleted ? "bg-gray-200" : "bg-gray-100",
              )}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full flex items-center justify-between gap-6 py-6 border-b border-gray-50">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-50 flex justify-center items-center">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-black animate-spin"></div>
        </div>
      )}

      {/* Steps List */}
      <div className="flex-1 flex items-center min-w-0">
        {stepNames.map((_, index) => renderStep(index + 1))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {!isFirstStep && (
          <Button
            onClick={back}
            disabled={isPending}
            variant="ghost"
            className="px-4 h-9 text-gray-400 hover:text-gray-900 font-bold rounded-lg text-xs"
          >
            Back
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={next}
            disabled={isPending}
            className="px-6 h-9 bg-[#2e3090] hover:bg-[#2e3090]/90 text-white rounded-lg font-bold text-xs shadow-none transition-none"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={onFinish}
            disabled={isPending}
            isLoading={isPending}
            className="px-8 h-9 bg-black hover:bg-black/90 text-white rounded-lg font-bold text-xs shadow-none transition-none"
          >
            {isUpdate ? "Save Changes" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardStepProgress;
