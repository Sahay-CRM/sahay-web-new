import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import KPITable from "./KpiTable";
import { useEffect } from "react";

function KpiDashboard() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Dashboard", href: "" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-4">
      <KPITable />
    </div>
  );
}

export default KpiDashboard;
