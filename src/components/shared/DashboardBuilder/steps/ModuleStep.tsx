import React from "react";
import {
  Registry,
  WidgetConfig,
  RegistryModule,
} from "../DashboardBuilderRegistry";
import { Check, ClipboardList } from "lucide-react";

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
    <div className="flex flex-col gap-2 max-w-2xl py-4">
      {registry.modules.map((module: RegistryModule) => {
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
            className={`flex items-center gap-4 p-4 cursor-pointer border rounded-xl transition-colors ${
              isActive
                ? "bg-gray-50 border-[#2e3090]/20"
                : "bg-white border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isActive
                  ? "bg-[#2e3090] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3
                className={`text-sm font-bold ${isActive ? "text-[#2e3090]" : "text-gray-700"}`}
              >
                {module.label}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Visualize your {module.label.toLowerCase()} data stream.
              </p>
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

export default ModuleStep;
