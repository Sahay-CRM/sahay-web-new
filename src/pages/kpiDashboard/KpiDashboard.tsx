import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import KPITable from "./KpiTable";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../PageNoAccess";

function KpiDashboard() {
  const permission = useSelector(getUserPermission).DATAPOINT_TABLE;
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Dashboard", href: "" }]);
  }, [setBreadcrumbs]);

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }
  return (
    <div className="space-y-4">
      <KPITable />
    </div>
  );
}

export default KpiDashboard;
