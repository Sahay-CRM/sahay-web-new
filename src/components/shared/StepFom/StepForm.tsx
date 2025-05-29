import React, { useEffect, useRef } from "react";
import { CheckMarkIcon, SpinnerIcon } from "../Icons";

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepNames,
  isLoading = false,
  totalSteps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const currentStepElement = stepRefs.current[currentStep - 1];
    if (currentStepElement && containerRef.current) {
      currentStepElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentStep]);

  const renderStep = (step: number) => {
    const isCompleted = step < currentStep;
    const isCurrent = step === currentStep;
    const isFirstStep = step === 1;
    const isLastStep = step === totalSteps;

    return (
      <div
        key={step}
        ref={(el) => {
          stepRefs.current[step - 1] = el;
        }}
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
            <div className="animate-spin">
              <SpinnerIcon />
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div
            className={`text-center shadow-md rounded-full flex items-center justify-center ${
              isCurrent ? "font-semibold text-white bg-black" : "bg-dark-600/50"
            }`}
          >
            {isCompleted ? (
              <span className="block w-10">
                <CheckMarkIcon />
              </span>
            ) : (
              <div className="px-4 py-2 text-base">
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
    <div className="w-full px-6 py-2">
      <div className="overflow-x-auto scrollbar-hide" ref={containerRef}>
        <div className="flex mb-2 min-w-max">
          {[...Array(totalSteps)].map((_, index) => renderStep(index + 1))}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
