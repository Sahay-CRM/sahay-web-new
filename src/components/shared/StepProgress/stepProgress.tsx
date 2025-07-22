import { CheckMarkIcon } from "@/components/shared/Icons";
import React from "react";

interface StepProgressProps {
  currentStep: number;
  stepNames: string[];
  totalSteps: number;
  isLoading?: boolean;
  header?: React.ReactNode; // NEW optional prop
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepNames,
  isLoading = false,
  totalSteps,
  header,
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
    <div className="w-full pr-6 pl-3 py-0">
      <div className="items-center">
        {/* Fixed Height Header Container */}
        <div className="w-full h-6 flex items-center mb-1">
          {header && (
            <div className="text-lg mr-2 font-semibold text-[#2e3090] truncate">
              {header}
            </div>
          )}
        </div>

        {/* Steps Section */}
        <div className="w-full mt-3">
          <div className="flex justify-between">
            {[...Array(totalSteps)].map((_, index) => renderStep(index + 1))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
