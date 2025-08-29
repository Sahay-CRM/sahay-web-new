import { CheckMarkIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/button";
import React from "react";

interface StepProgressProps {
  currentStep: number;
  stepNames: string[];
  totalSteps: number;
  isLoading?: boolean;
  header?: React.ReactNode; // NEW optional prop
  back?: () => void;
  next?: () => void;
  onFinish?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isPending?: boolean;
  isUpdate?: boolean;
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepNames,
  isLoading = false,
  totalSteps,
  header,
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
    const isFirstStep = step === 1;
    const isLastStep = step === totalSteps;

    return (
      <div
        key={step}
        className={`flex flex-shrink items-center relative ${
          isFirstStep
            ? "flex-1"
            : isLastStep
              ? "ml-auto flex justify-end"
              : "flex-1"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-dark-200 z-50 flex justify-center items-center">
            loading...
          </div>
        )}
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
              <div className="px-2 text-sm">
                <span>{step}</span>
              </div>
            )}
          </div>
          <p className="font-bold text-base">{stepNames[step - 1]}</p>
        </div>
        {!isLastStep && <div className="h-1 mx-2 flex-1 bg-gray-300"></div>}
      </div>
    );
  };

  return (
    <div className="w-full pl-3 py-0 mb-4">
      <div className="items-center">
        {header && (
          <div className="text-lg mr-2 mb-4 font-semibold text-[#2e3090] truncate w-full h-6 flex items-center">
            {header}
          </div>
        )}

        {/* Steps Section */}
        <div className="w-full flex items-center gap-5">
          <div className="w-full mt-0">
            <div className="flex justify-between">
              {[...Array(totalSteps)].map((_, index) => renderStep(index + 1))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={back} disabled={isFirstStep} className="w-fit">
              Previous
            </Button>

            <Button
              onClick={next}
              className="w-fit"
              disabled={isLastStep || isPending}
            >
              Next
            </Button>

            {/* Finish button always visible on last step */}
            {/* {isLastStep && (
              <Button onClick={onFinish} className="w-fit" disabled={isPending}>
              Finish
              </Button>
              )} */}

            {(isUpdate || isLastStep) && (
              <Button
                onClick={onFinish}
                className="w-fit"
                disabled={isPending}
                isLoading={isPending}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
