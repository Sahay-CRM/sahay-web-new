import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { kpiMockData } from "./mockData";

const periods = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Yearly",
];

export default function TabsSection({
  selectedPeriod,
  onSelectPeriod,
}: {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}) {
  const periodCounts = periods.map((period) => ({
    label: period,
    count: kpiMockData.filter((item) => item.period === period).length,
  }));

  return (
    <Tabs
      value={selectedPeriod}
      onValueChange={onSelectPeriod}
      className="w-full px-4"
    >
      <TabsList className="bg-transparent p-0 flex space-x-6 border-b border-gray-200">
        {periodCounts.map((tab) => (
          <TabsTrigger
            key={tab.label}
            value={tab.label}
            className="rounded-none bg-white border-b-2 border-transparent p-2 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:border-b-primary data-[state=active]:text-primary"
          >
            {tab.label} <span className="ml-1 text-xs">({tab.count})</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
