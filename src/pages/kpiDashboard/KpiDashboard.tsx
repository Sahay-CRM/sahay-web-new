import { useState } from "react";
import KPITable from "./KpiTable";
import TabsSection from "./TabSection";

function KpiDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

  return (
    <div>
      <TabsSection
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />
      <KPITable period={selectedPeriod} />
    </div>
  );
}

export default KpiDashboard;
