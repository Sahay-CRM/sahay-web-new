import React from "react";
import {
  Registry,
  WidgetConfig,
  RegistryModule,
  RegistryMetric,
} from "../DashboardBuilderRegistry";
import { Check, Activity, Zap, Server, Code } from "lucide-react";

interface MetricStepProps {
  registry: Registry;
  config: WidgetConfig;
  currentModule: RegistryModule | undefined;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const MetricStep: React.FC<MetricStepProps> = ({
  registry,
  config,
  currentModule,
  onUpdate,
}) => {
  if (!currentModule)
    return (
      <div className="text-center p-12 text-gray-400">
        Please select a module first.
      </div>
    );

  const metrics = currentModule.allowedMetrics.map((key: string) => ({
    key,
    ...registry.metrics[key],
  }));

  const getComplexityIcon = (complexity: string, isActive: boolean) => {
    const colorClass = isActive
      ? "text-white"
      : complexity === "simple"
        ? "text-emerald-500"
        : complexity === "relational"
          ? "text-blue-500"
          : "text-indigo-500";

    switch (complexity) {
      case "simple":
        return <Zap className={`w-4 h-4 ${colorClass}`} />;
      case "relational":
        return <Server className={`w-4 h-4 ${colorClass}`} />;
      case "computed":
        return <Code className={`w-4 h-4 ${colorClass}`} />;
      default:
        return <Activity className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  return (
    <div className="flex flex-col gap-2 max-w-2xl py-4">
      {metrics.map((metric: RegistryMetric & { key: string }) => {
        const isActive = config.metricKey === metric.key;
        return (
          <div
            key={metric.key}
            onClick={() =>
              onUpdate({ metricKey: metric.key, visualization: "" })
            }
            className={`flex items-center gap-4 p-4 cursor-pointer border rounded-xl transition-colors ${
              isActive
                ? "bg-gray-50 border-[#2e3090]/20"
                : "bg-white border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isActive ? "bg-[#2e3090]" : "bg-gray-50"
              }`}
            >
              {getComplexityIcon(metric.complexity, isActive)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-bold ${isActive ? "text-[#2e3090]" : "text-gray-700"}`}
                >
                  {metric.label}
                </h3>
                {metric.supportsRealtime && (
                  <div className="px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[8px] font-bold uppercase tracking-widest border border-orange-100">
                    Live
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {metric.aggregation}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    metric.complexity === "simple"
                      ? "text-emerald-600"
                      : metric.complexity === "relational"
                        ? "text-blue-600"
                        : "text-indigo-600"
                  }`}
                >
                  {metric.complexity}
                </span>
              </div>
            </div>

            {isActive && (
              <div className="w-5 h-5 rounded-full bg-[#2e3090] flex items-center justify-center">
                <Check className="w-3 h-3 text-white stroke-[3px]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricStep;
