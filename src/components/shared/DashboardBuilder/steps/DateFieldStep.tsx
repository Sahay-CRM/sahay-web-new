/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Registry, WidgetConfig } from "../DashboardBuilderRegistry";
import { Calendar } from "lucide-react";

interface DateFieldStepProps {
  registry: Registry;
  config: WidgetConfig;
  currentModule: any;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const DateFieldStep: React.FC<DateFieldStepProps> = ({
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

  const dateFields = currentModule.dateFields.map((key: string) => ({
    key,
    ...registry.dateFields[key],
  }));

  return (
    <div className="flex flex-col gap-2 max-w-2xl py-4">
      {dateFields.map((field: any) => {
        const isActive = config.dateField === field.key;
        return (
          <div
            key={field.key}
            onClick={() => onUpdate({ dateField: field.key })}
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
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3
                className={`text-sm font-bold ${isActive ? "text-[#2e3090]" : "text-gray-700"}`}
              >
                {field.label}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                Temporal Dimension
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isActive
                  ? "border-[#2e3090] bg-[#2e3090]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DateFieldStep;
