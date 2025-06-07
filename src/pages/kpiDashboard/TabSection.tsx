import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useKpiDashboard from "./useKpiDashboard";

export default function TabsSection({
  selectedPeriod,
  onSelectPeriod,
  selectedDate = null,
}: {
  selectedPeriod: string;
  onSelectPeriod: (selectedPeriod: string) => void;
  selectedDate?: Date | null;
}) {
  const { kpiStructure } = useKpiDashboard({ selectedPeriod, selectedDate });

  return (
    <Tabs
      value={selectedPeriod}
      onValueChange={onSelectPeriod}
      className="w-full px-4"
    >
      <TabsList className="bg-transparent h-auto p-0 flex flex-wrap items-start justify-start space-x-6 border-b border-gray-200">
        {kpiStructure?.data?.map((tab) => (
          <TabsTrigger
            key={tab.frequencyType}
            value={tab.frequencyType}
            className="rounded-none bg-white border-b-2 border-transparent p-2 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:border-b-primary data-[state=active]:text-primary"
          >
            {tab.frequencyType}{" "}
            <span className="ml-1 text-xs">({tab?.count})</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
