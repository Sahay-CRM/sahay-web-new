import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFrequencyType } from "@/features/utils/app.utils";

export default function TabsSection({
  selectedPeriod,
  onSelectPeriod,
  kpiStructure,
  isDataFilter,
}: {
  selectedPeriod: string;
  onSelectPeriod: (selectedPeriod: string) => void;
  kpiStructure?: BaseResponse<FrequencyData> | null;
  isDataFilter: string;
}) {
  return (
    <Tabs
      value={selectedPeriod}
      onValueChange={onSelectPeriod}
      className="w-full px-4"
    >
      <TabsList className="bg-transparent h-auto p-0 flex flex-wrap items-start justify-start space-x-6 border-b border-gray-200">
        {kpiStructure?.data?.map((tab) => {
          const canEdit = tab.kpis?.reduce(
            (acc: number, coreParam: CoreParameterGroup) => {
              const innerCount =
                coreParam.kpis?.filter((kpi: Kpi) => kpi.isVisualized === false)
                  ?.length || 0;
              return acc + innerCount;
            },
            0,
          );

          const isDailyTab = tab.frequencyType === "DAILY";
          const showCanEdit =
            !isDailyTab &&
            isDataFilter === "default" &&
            selectedPeriod !== "DAILY";

          return (
            <TabsTrigger
              key={tab.frequencyType}
              value={tab.frequencyType}
              className="rounded-none bg-white border-b-2 border-transparent p-2 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {formatFrequencyType(tab.frequencyType)}{" "}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs text-gray-500 cursor-pointer">
                      (
                      {showCanEdit && canEdit > 0
                        ? `${canEdit} / ${tab.count - canEdit}`
                        : tab.count}
                      )
                    </span>
                  </TooltipTrigger>

                  <TooltipContent side="top" className="p-2">
                    <ul className="text-xs text-gray-700">
                      <li className="flex justify-between gap-2 border-b border-gray-200 pb-1 mb-1 font-medium">
                        <span className="w-5 text-center text-white">All</span>
                        <span className="w-5 text-center text-white">Edit</span>
                        <span className="w-10 text-center text-white">
                          Auto
                        </span>
                      </li>
                      <li className="flex justify-between gap-2 text-center font-semibold text-white">
                        <span className="w-5">{tab.count}</span>
                        <span className="w-5">{canEdit}</span>
                        <span className="w-10">{tab.count - canEdit}</span>
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
