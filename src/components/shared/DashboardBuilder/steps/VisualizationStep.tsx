import React from "react";
import {
  WidgetConfig,
  RegistryModule,
  RegistryMetric,
} from "../DashboardBuilderRegistry";
import {
  BarChart,
  BarChart3,
  LineChart,
  PieChart,
  Tally4,
  LayoutList,
  Timer,
  GanttChartSquare,
  Check,
  Monitor,
  AreaChart,
} from "lucide-react";

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

  const getChartIcon = (chartKey: string) => {
    const iconClass = "w-5 h-5";
    switch (chartKey) {
      case "card":
        return <Tally4 className={iconClass} />;
      case "table":
        return <LayoutList className={iconClass} />;
      case "bar":
        return <BarChart3 className={iconClass} />;
      case "stacked-bar":
        return <BarChart className={iconClass} />;
      case "line":
        return <LineChart className={iconClass} />;
      case "area":
        return <AreaChart className={iconClass} />;
      case "pie":
        return <PieChart className={iconClass} />;
      case "donut":
        return <PieChart className={`${iconClass} rotate-45`} />;
      case "gauge":
        return <Timer className={iconClass} />;
      case "gantt":
        return <GanttChartSquare className={iconClass} />;
      default:
        return <Monitor className={iconClass} />;
    }
  };

  return (
    <div className="max-w-2xl py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {commonCharts.map((chartKey: string) => {
          const isActive = config.visualization === chartKey;
          return (
            <div
              key={chartKey}
              onClick={() => onUpdate({ visualization: chartKey })}
              className={`flex flex-col items-center justify-center p-4 cursor-pointer border rounded-xl transition-colors text-center gap-2 ${
                isActive
                  ? "bg-gray-50 border-[#2e3090] text-[#2e3090]"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-[#2e3090] text-white" : "bg-gray-50"
                }`}
              >
                {getChartIcon(chartKey)}
              </div>

              <span className="text-xs font-bold capitalize">
                {chartKey.replace("-", " ")}
              </span>

              {isActive && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3 h-3 text-[#2e3090] stroke-[3px]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualizationStep;
