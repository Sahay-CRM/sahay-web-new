/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetDashboardRegistryReports } from "@/features/api/DashboardRegistry/useGetDashboardRegistryReports";
import { useDeleteDashboardRegistryReport } from "@/features/api/DashboardRegistry/useDeleteDashboardRegistryReport";
import { WidgetConfig } from "@/components/shared/DashboardBuilder/DashboardBuilderRegistry";

export default function useDashboardRegistry() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>({});

  // Permission handling (assuming DASHBOARD_REPORT module key)
  const permission = useSelector(getUserPermission).DASHBOARD_REPORT || {
    View: true,
    Add: true,
    Edit: true,
    Delete: true,
  };

  const [paginationFilter, setPaginationFilter] = useState<any>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: reports, isLoading } = useGetDashboardRegistryReports();
  const { mutate: deleteReport } = useDeleteDashboardRegistryReport();

  const handleAdd = () => {
    setModalData({});
    setIsBuilderOpen(true);
  };

  const openModal = useCallback((data: any) => {
    // Map report data back to WidgetConfig
    const config: WidgetConfig = {
      moduleKey: data.module || "TASK",
      metricKey: data.metric || "",
      filters:
        typeof data.filters === "string"
          ? JSON.parse(data.filters)
          : data.filters || {},
      dateField: data.dateField || "",
      groupBy: data.groupBy || "",
      visualization: data.visualization || "",
      widgetName: data.report_name || data.widgetName || "",
    };
    setModalData({ id: data.id, config });
    setIsBuilderOpen(true);
  }, []);

  const closeModal = () => {
    setIsBuilderOpen(false);
    setIsDeleteModalOpen(false);
    setModalData({});
  };

  const onDelete = useCallback((data: any) => {
    setModalData(data);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (modalData && modalData.id) {
      deleteReport(modalData.id, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  return {
    isLoading,
    reports,
    closeModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    confirmDelete,
    handleAdd,
    isBuilderOpen,
    isDeleteModalOpen,
    paginationFilter,
    permission,
  };
}
