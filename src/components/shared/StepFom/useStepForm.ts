/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactElement, useCallback, useState } from "react";

export default function useStepForm(steps: ReactElement[], trigger: any) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const next = useCallback(async () => {
    const isValid = await trigger();

    if (isValid) {
      setCurrentStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
    }
  }, [steps.length, trigger]);

  const back = () => {
    setCurrentStepIndex((i) => (i > 0 ? i - 1 : i));
  };

  const goTo = (index: number) => {
    setCurrentStepIndex(index);
  };

  return {
    currentStepIndex,
    stepContent: steps[currentStepIndex],
    totalSteps: steps.length,
    goTo,
    next,
    back,
    steps,
    isFirstStep: currentStepIndex === 0,
    isSecondStep: currentStepIndex === 1,
    isLastStep: currentStepIndex === steps.length - 1,
    currentStep: currentStepIndex + 1,
  };
}
