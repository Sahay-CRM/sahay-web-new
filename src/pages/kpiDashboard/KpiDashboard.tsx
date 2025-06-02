import { useState } from "react";
import KPITable from "./KpiTable";
import TabsSection from "./TabSection";
import { Button } from "@/components/ui/button";
import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";
import { EyeIcon, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function KpiDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("DAILY");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsSection
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
        />
        <div className="flex gap-4 items-center">
          <Button onClick={() => navigate("/dashboard/kpi-Visualize")}>
            <EyeIcon />
            Visualize KPI
          </Button>
          <FormDatePicker
            value={selectedDate}
            onSubmit={(date) => {
              setSelectedDate(date ?? null);
            }}
            className="w-[200px]"
            placeholder="Choose a date"
          />
          {selectedDate && (
            <Button onClick={() => setSelectedDate(null)}>
              <RefreshCcw />
              Reset Date
            </Button>
          )}
        </div>
      </div>

      <KPITable selectedPeriod={selectedPeriod} selectedDate={selectedDate} />
    </div>
  );
}

export default KpiDashboard;
