import React from "react";
import { Check } from "lucide-react";

interface ModuleStepProps {
  registry: Registry;
  config: WidgetConfig;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const ModuleStep: React.FC<ModuleStepProps> = ({
  registry,
  config,
  onUpdate,
}) => {
  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-[#2e3090] px-4 py-2 flex items-center">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider w-1/3">
          Module Name
        </div>
        <div className="text-[11px] font-bold text-white uppercase tracking-wider flex-1">
          Description
        </div>
        <div className="w-10"></div>
      </div>
      <div className="divide-y divide-gray-50">
        {registry.modules.map((module: RegistryModule, index: number) => {
          const isActive = config.moduleKey === module.moduleKey;
          return (
            <div
              key={module.moduleKey}
              onClick={() =>
                onUpdate({
                  moduleKey: module.moduleKey,
                  metricKey: "",
                  visualization: "",
                })
              }
              className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-50/40"
                  : index % 2 === 0
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-25 hover:bg-gray-50"
              }`}
            >
              <div className="w-1/3 pr-4">
                <h3
                  className={`text-sm font-bold truncate ${
                    isActive ? "text-[#2e3090]" : "text-gray-900"
                  }`}
                >
                  {module.label}
                </h3>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate italic opacity-70">
                  Visualize your {module.label.toLowerCase()} data stream.
                </p>
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

export default ModuleStep;
