import React from "react";
import { Check } from "lucide-react";

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

  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-[#2e3090] px-4 py-2 flex items-center">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider w-1/4">
          Metric Name
        </div>
        <div className="text-[11px] font-bold text-white uppercase tracking-wider w-1/4">
          Aggregation
        </div>
        <div className="text-[11px] font-bold text-white uppercase tracking-wider flex-1">
          Complexity
        </div>
        <div className="w-10"></div>
      </div>
      <div className="divide-y divide-gray-50">
        {metrics.map(
          (metric: RegistryMetric & { key: string }, index: number) => {
            const isActive = config.metricKey === metric.key;
            return (
              <div
                key={metric.key}
                onClick={() =>
                  onUpdate({ metricKey: metric.key, visualization: "" })
                }
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-50/40"
                    : index % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-25 hover:bg-gray-50"
                }`}
              >
                <div className="w-1/4 pr-4">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isActive ? "text-[#2e3090]" : "text-gray-900"
                      }`}
                    >
                      {metric.label}
                    </h3>
                    {metric.supportsRealtime && (
                      <div className="px-1 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[7px] font-bold uppercase tracking-widest border border-orange-100">
                        Live
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded">
                    {metric.aggregation}
                  </span>
                </div>
                <div className="flex-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      metric.complexity === "simple"
                        ? "text-emerald-600 bg-emerald-50/50"
                        : metric.complexity === "relational"
                          ? "text-blue-600 bg-blue-50/50"
                          : "text-indigo-600 bg-indigo-50/50"
                    }`}
                  >
                    {metric.complexity}
                  </span>
                </div>
                <div className="w-10 flex justify-end">
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-[#2e3090] flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in-50">
                      <Check className="w-3 h-3 text-white stroke-[4px]" />
                    </div>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default MetricStep;
