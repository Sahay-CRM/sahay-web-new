import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import { useGanttTemplates } from "@/features/api/gantt";
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

  // ── "Use Template" modal state ─────────────────────────────────────────────
  const [useTemplateTarget, setUseTemplateTarget] =
    useState<GanttTemplate | null>(null);

  const openUseModal = (template: GanttTemplate) =>
    setUseTemplateTarget(template);
  const closeUseModal = () => setUseTemplateTarget(null);

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
  const { data, isLoading } = useGanttTemplates({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    search: paginationFilter.search || undefined,
    ownerType:
      ownerTypeFilter === "all"
        ? undefined
        : (ownerTypeFilter as GanttTemplateOwnerType),
  });

  const templates = (data?.data ?? [])
    .filter((item) => item.isPublished)
    .map((item, index) => ({
      ...item,
      srNo: ((data?.currentPage || 1) - 1) * (data?.pageSize || 25) + index + 1,
      industryName: item.industryName || "—",
      status: item.isPublished ? "published" : "draft",
      createdDatetime: fmtDate(item.createdDatetime),
    }));

  const paginationDetails = mapPaginationDetails(data);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRowClick = (row: { ganttTemplateId: string }) => {
    navigate(`/dashboard/gantt/templates/${row.ganttTemplateId}`);
  };

  return {
    // data
    templates,
    paginationDetails,
    isLoading,

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

    // use template modal
    useTemplateTarget,
    openUseModal,
    closeUseModal,

    // actions
    handleRowClick,
  };
}
