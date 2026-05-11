import React from "react";
import { useDashboardBuilder } from "./useDashboardBuilder";
import ModuleStep from "./steps/ModuleStep";
import MetricStep from "./steps/MetricStep";
import DateFieldStep from "./steps/DateFieldStep";
import GroupByStep from "./steps/GroupByStep";
import VisualizationStep from "./steps/VisualizationStep";
import FiltersStep from "./steps/FiltersStep";
import { BarChart3, CheckCircle2 } from "lucide-react";
import DashboardStepProgress from "./DashboardStepProgress";

interface DashboardBuilderProps {
  onSave?: (config: WidgetConfig) => void;
  saving?: boolean;
  initialConfig?: WidgetConfig;
}

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  onSave,
  saving,
  initialConfig,
}) => {
  const {
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
  } = useDashboardBuilder("TASK", initialConfig);

  const stepNames = steps.map((s) => s.label);

  const renderStepContent = () => {
    const stepKey = steps.find((s) => s.step === currentStep)?.key;

    switch (stepKey) {
      case "module":
        return (
          <ModuleStep
            registry={registry}
            config={widgetConfig}
            onUpdate={updateConfig}
          />
        );
      case "metric":
        return (
          <MetricStep
            registry={registry}
            config={widgetConfig}
            currentModule={currentModule}
            onUpdate={updateConfig}
          />
        );
      case "filters":
        return (
          <FiltersStep
            registry={registry}
            config={widgetConfig}
            currentModule={currentModule}
            onUpdate={updateConfig}
          />
        );
      case "dateField":
        return (
          <DateFieldStep
            registry={registry}
            config={widgetConfig}
            currentModule={currentModule}
            onUpdate={updateConfig}
          />
        );
      case "groupBy":
        return (
          <GroupByStep
            registry={registry}
            config={widgetConfig}
            currentModule={currentModule}
            onUpdate={updateConfig}
          />
        );
      case "visualization":
        return (
          <VisualizationStep
            config={widgetConfig}
            currentModule={currentModule}
            currentMetric={currentMetric}
            onUpdate={updateConfig}
          />
        );
      case "save":
        return (
          <div className="max-w-2xl py-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Ready to Publish</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Finalize Widget
                </h3>
                <p className="text-sm text-gray-500">
                  Review your configuration and give it a name.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    value={widgetConfig.widgetName}
                    onChange={(e) =>
                      updateConfig({ widgetName: e.target.value })
                    }
                    placeholder="Enter widget name..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e3090]/10 focus:border-[#2e3090] outline-none text-sm font-bold placeholder:text-gray-300 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Module
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {currentModule?.label}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Metric
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {currentMetric?.label}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Timeline
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {registry.dateFields[widgetConfig.dateField || ""]
                        ?.label || "All Time"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Dimension
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {registry.groupBy[widgetConfig.groupBy || ""]?.label ||
                        "Consolidated"}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-[#2e3090] text-white flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                        Visualization
                      </span>
                      <p className="text-sm font-bold capitalize">
                        {widgetConfig.visualization.replace("-", " ")}
                      </p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Progress & Navigation */}
      <DashboardStepProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepNames={stepNames}
        back={prevStep}
        next={nextStep}
        onFinish={() => onSave?.(widgetConfig)}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === totalSteps}
        isPending={!isStepValid || (currentStep === totalSteps && saving)}
        isUpdate={!!initialConfig}
      />

      {/* Content Area */}
      <div className="flex-1 min-h-0 px-6 py-2">
        <div className="h-full">{renderStepContent()}</div>
      </div>
    </div>
  );
};

export default DashboardBuilder;
