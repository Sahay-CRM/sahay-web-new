import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardBuilder from "@/components/shared/DashboardBuilder";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useCreateDashboardRegistryReport } from "@/features/api/DashboardRegistry/useCreateDashboardRegistryReport";
import { useUpdateDashboardRegistryReport } from "@/features/api/DashboardRegistry/useUpdateDashboardRegistryReport";
import { useGetDashboardRegistryReportById } from "@/features/api/DashboardRegistry/useGetDashboardRegistryReportById";
import { WidgetConfig } from "@/components/shared/DashboardBuilder/DashboardBuilderRegistry";

const DashboardBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data: reportResponse, isLoading: isFetching } =
    useGetDashboardRegistryReportById(id);
  const { mutate: createReport, isPending: isCreating } =
    useCreateDashboardRegistryReport();
  const { mutate: updateReport, isPending: isUpdating } =
    useUpdateDashboardRegistryReport();

  const editingReport = reportResponse?.data;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard Report", href: "/dashboard/report-builder" },
      { label: id ? "Edit Widget" : "Add Widget", href: "" },
    ]);
  }, [setBreadcrumbs, id]);

  const handleSaveWidget = (config: WidgetConfig) => {
    if (id) {
      updateReport(
        { id, config },
        {
          onSuccess: () => navigate("/dashboard/report-builder"),
        },
      );
    } else {
      createReport(config, {
        onSuccess: () => navigate("/dashboard/report-builder"),
      });
    }
  };

  const initialConfig: WidgetConfig | undefined = editingReport
    ? {
        moduleKey: editingReport.module || "TASK",
        metricKey: editingReport.metric || "",
        filters:
          typeof editingReport.filters === "string"
            ? JSON.parse(editingReport.filters)
            : editingReport.filters || {},
        dateField: editingReport.dateField || "",
        groupBy: editingReport.groupBy || "",
        visualization: editingReport.visualization || "",
        widgetName: editingReport.report_name || editingReport.widgetName || "",
      }
    : undefined;

  return (
    <div className="w-full h-full bg-[#f8f9fa] overflow-y-auto px-4 py-8">
      {isFetching ? (
        <div className="flex-1 h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
          <div className="w-10 h-10 rounded-full border-4 border-[#2e3090]/10 border-t-[#2e3090] animate-spin"></div>
          <p className="text-sm font-medium">Fetching configuration...</p>
        </div>
      ) : (
        <DashboardBuilder
          onSave={handleSaveWidget}
          saving={isCreating || isUpdating}
          initialConfig={initialConfig}
        />
      )}
    </div>
  );
};

export default DashboardBuilderPage;
