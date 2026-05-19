import registryData from "../../../../dashboard-builder-registry.json";
import { useState, useCallback, useMemo } from "react";

export const useDashboardBuilder = (
  initialModuleKey?: string,
  initialConfig?: WidgetConfig,
) => {
  const registry = registryData as unknown as Registry;
  const [currentStep, setCurrentStep] = useState(1);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(
    initialConfig || {
      moduleKey: initialModuleKey || "",
      metricKey: "",
      filters: {},
      dateField: "",
      groupBy: "",
      visualization: "",
      widgetName: "",
    },
  );

  const steps = registry.steps;
  const totalSteps = steps.length;

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const updateConfig = useCallback((updates: Partial<WidgetConfig>) => {
    setWidgetConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const currentModule = useMemo(() => {
    return registry.modules.find((m) => m.moduleKey === widgetConfig.moduleKey);
  }, [registry.modules, widgetConfig.moduleKey]);

  const currentMetric = useMemo(() => {
    return registry.metrics[widgetConfig.metricKey];
  }, [registry.metrics, widgetConfig.metricKey]);

  const isStepValid = useMemo(() => {
    const step = steps.find((s) => s.step === currentStep);
    if (!step) return false;

    switch (step.key) {
      case "module":
        return !!widgetConfig.moduleKey;
      case "metric":
        return !!widgetConfig.metricKey;
      case "visualization":
        return !!widgetConfig.visualization;
      case "save":
        return !!widgetConfig.widgetName;
      default:
        return true; // Optional steps
    }
  }, [currentStep, steps, widgetConfig]);

  return {
    currentStep,
    totalSteps,
    steps,
    widgetConfig,
    nextStep,
    prevStep,
    updateConfig,
    currentModule,
    currentMetric,
    isStepValid,
    registry,
  };
};
