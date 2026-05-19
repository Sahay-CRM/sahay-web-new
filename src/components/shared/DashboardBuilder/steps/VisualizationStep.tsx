import React from "react";
import { Check } from "lucide-react";

interface VisualizationStepProps {
  config: WidgetConfig;
  currentModule: RegistryModule | undefined;
  currentMetric: RegistryMetric | undefined;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const VisualizationStep: React.FC<VisualizationStepProps> = ({
  config,
  currentModule,
  currentMetric,
  onUpdate,
}) => {
  if (!currentModule || !currentMetric)
    return (
      <div className="text-center p-12 text-gray-400">
        Please select module and metric first.
      </div>
    );

  const commonCharts = currentModule.supportedCharts.filter((chart: string) =>
    currentMetric.supportedCharts.includes(chart),
  );

  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-[#2e3090] px-4 py-2 flex items-center">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider flex-1">
          Visualization Type
        </div>
        <div className="text-[11px] font-bold text-white uppercase tracking-wider w-1/4">
          Format
        </div>
        <div className="w-10"></div>
      </div>
      <div className="divide-y divide-gray-50">
        {commonCharts.map((chartKey: string, index: number) => {
          const isActive = config.visualization === chartKey;
          return (
            <div
              key={chartKey}
              onClick={() => onUpdate({ visualization: chartKey })}
              className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-50/40"
                  : index % 2 === 0
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-25 hover:bg-gray-50"
              }`}
            >
              <div className="flex-1 pr-4">
                <h3
                  className={`text-sm font-bold capitalize truncate ${
                    isActive ? "text-[#2e3090]" : "text-gray-900"
                  }`}
                >
                  {chartKey.replace("-", " ")}
                </h3>
              </div>
              <div className="w-1/4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded italic">
                  {chartKey === "card" || chartKey === "table"
                    ? "Data"
                    : "Chart"}
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
        })}
      </div>
    </div>
  );
};

export default VisualizationStep;
