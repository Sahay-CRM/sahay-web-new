import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  useGanttTemplates,
  useDeleteGanttTemplate,
} from "@/features/api/gantt";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import type { GanttTemplate, GanttTemplateOwnerType } from "@/types/gantt";
import { fmtDate } from "./utils/gantt.utils";

export default function useGanttTemplate() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  // ── Breadcrumbs ────────────────────────────────────────────────────────────
  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "/dashboard/gantt/workspaces" },
      { label: "Templates", href: "" },
    ]);
  }, [setBreadcrumbs]);

  // ── Filters & pagination ───────────────────────────────────────────────────
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>("all");

  const handleOwnerTypeChange = (val: string) => {
    setOwnerTypeFilter(val);
    setPaginationFilter((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ── Modal states ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<GanttTemplate | null>(null);
  const [editTarget, setEditTarget] = useState<GanttTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);
  const openEdit = (row: GanttTemplate) => setEditTarget(row);
  const openDelete = (row: GanttTemplate) => setDeleteTarget(row);

  const closeFormModal = () => {
    setCreateOpen(false);
    setEditTarget(null);
  };

  const closeDeleteModal = () => setDeleteTarget(null);

  // ── Column toggle ──────────────────────────────────────────────────────────
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "templateName", label: "Template Name", visible: true },
    { key: "templateDescription", label: "Description", visible: true },
    { key: "industryName", label: "Industry", visible: true },
    { key: "version", label: "Version", visible: true },
    { key: "ownerType", label: "Owner Type", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "createdDatetime", label: "Created At", visible: true },
  ]);

  const textColumnKeys = [
    "srNo",
    "templateName",
    "templateDescription",
    "industryName",
    "version",
    "ownerType",
    "status",
    "createdDatetime",
  ];

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible && textColumnKeys.includes(col.key))
        acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const canToggleColumns = columnToggleOptions.length > 3;

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useGanttTemplates({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    search: paginationFilter.search || undefined,
    ownerType:
      ownerTypeFilter === "all"
        ? undefined
        : (ownerTypeFilter as GanttTemplateOwnerType),
  });

  const deleteMutation = useDeleteGanttTemplate();

  const templates = (data?.data ?? []).map((item, index) => ({
    ...item,
    srNo: ((data?.currentPage || 1) - 1) * (data?.pageSize || 25) + index + 1,
    industryName: item.industryName || "—",
    status: item.isPublished ? "published" : "draft",
    createdDatetime: fmtDate(item.createdDatetime),
  }));

  const paginationDetails = mapPaginationDetails(data);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleActive = async (template: GanttTemplate) => {
    try {
      await Api.put({
        url: Urls.ganttTemplateUpdate(template.ganttTemplateId),
        data: { isActive: !template.isActive },
      });
      toast.success("Template status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["gantt-templates"] });
    } catch {
      toast.error("Failed to update template status");
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.ganttTemplateId);
      closeDeleteModal();
    } catch {
      // Error handled by mutation
    }
  };

  const handleRowClick = (row: { ganttTemplateId: string }) => {
    navigate(`/dashboard/gantt/templates/${row.ganttTemplateId}`);
  };

  return {
    // data
    templates,
    paginationDetails,
    isLoading,
    refetch,

    // filters
    paginationFilter,
    setPaginationFilter,
    ownerTypeFilter,
    handleOwnerTypeChange,

    // columns
    columnToggleOptions,
    visibleColumns,
    onToggleColumn,
    canToggleColumns,

    // modals
    deleteTarget,
    editTarget,
    createOpen,
    openCreate,
    openEdit,
    openDelete,
    closeFormModal,
    closeDeleteModal,

    // actions
    handleToggleActive,
    handleDeleteTemplate,
    handleRowClick,
    deleteMutation,
  };
}
