import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGanttWorkspaceDetail,
  useDeleteGanttItem,
} from "@/features/api/gantt";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import GanttItemFormModal from "./components/GanttItemFormModal";
import GanttItemDetailModal from "./components/GanttItemDetailModal";
import GanttPhaseManageModal from "./components/GanttPhaseManageModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  ChevronLeft,
  Plus,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  GanttChartSquare,
  Search,
} from "lucide-react";
import { fmtDate, WORKSPACE_STATUS_BG } from "./utils/gantt.utils";
import type { CompanyGanttItem, CompanyGanttPhase } from "@/types/gantt";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import TableDataKpi from "@/components/shared/DataTable/DataTableKpi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";




export default function GanttWorkspaceTablePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data, isLoading, isError } = useGanttWorkspaceDetail(id);

  const workspace = data?.workspace;
  const phases = data?.phases ?? [];
  const itemsTree = data?.itemsTree ?? [];
  const dependencies = data?.dependencies ?? [];

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [selectedPhaseForEdit, setSelectedPhaseForEdit] = useState<CompanyGanttPhase | null>(null);
  const [selectedItem, setSelectedItem] = useState<CompanyGanttItem | null>(null);
  // const [itemToEdit, setItemToEdit] = useState<CompanyGanttItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<CompanyGanttItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const deleteItemMutation = useDeleteGanttItem(id ?? "");

  // Breadcrumbs
  useEffect(() => {
    if (workspace) {
      setBreadcrumbs([
        { label: "Gantt", href: "/dashboard/gantt/workspaces" },
        { label: "Workspaces", href: "/dashboard/gantt/workspaces" },
        {
          label: workspace.workspaceName,
          href: `/dashboard/gantt/workspaces/${id}`,
        },
        {
          label: "Table View",
          href: `/dashboard/gantt/workspaces/${id}/table`,
        },
      ]);
    }
  }, [workspace, id, setBreadcrumbs]);

  // Flat helper for stats
  function flattenAll(items: typeof itemsTree): typeof itemsTree {
    const res: typeof itemsTree = [];
    const walk = (list: typeof itemsTree) => {
      for (const i of list) {
        res.push(i);
        if (i.children?.length) walk(i.children);
      }
    };
    walk(items);
    return res;
  }
  const allItems = flattenAll(itemsTree);
  const totalTasks = allItems.length;
  const completedTasks = allItems.filter(
    (i) => i.itemStatus === "COMPLETED",
  ).length;
  const overallPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Flatten tree for list rendering with depth info
  function flattenTreeWithDepth(
    items: CompanyGanttItem[],
    depth = 0
  ): Array<CompanyGanttItem & { depth: number }> {
    const result: Array<CompanyGanttItem & { depth: number }> = [];
    const walk = (list: CompanyGanttItem[], currDepth: number) => {
      for (const item of list) {
        result.push({ ...item, depth: currDepth });
        if (item.children && item.children.length > 0) {
          walk(item.children, currDepth + 1);
        }
      }
    };
    walk(items, depth);
    return result;
  }

  const tableData = useMemo(() => {
    const result: Array<
      CompanyGanttItem & { depth: number; phaseName: string; phaseColor: string }
    > = [];

    const sortedPhases = [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder);

    for (const phase of sortedPhases) {
      const phaseItems = itemsTree.filter(
        (item) => item.ganttPhaseId === phase.ganttPhaseId
      );
      const flatItems = flattenTreeWithDepth(phaseItems);
      for (const item of flatItems) {
        result.push({
          ...item,
          phaseName: phase.phaseName,
          phaseColor: phase.color ?? "#6366f1",
        });
      }
    }

    return result;
  }, [phases, itemsTree]);

  const filteredTableData = useMemo(() => {
    if (!searchQuery) return tableData;
    return tableData.filter((item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-primary">
        <SpinnerIcon />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Failed to load workspace. It may not exist or an error occurred.
        </p>
        <Button variant="outline" asChild>
          <Link to="/dashboard/gantt/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    );
  }

  const daysLeft = workspace.targetEndDate
    ? differenceInCalendarDays(
        startOfDay(new Date(workspace.targetEndDate)),
        startOfDay(new Date()),
      )
    : 0;

  const isOverdue = daysLeft < 0;
  const statusBg =
    WORKSPACE_STATUS_BG[workspace.workspaceStatus] ??
    "bg-muted text-muted-foreground";

  const getDurationDays = (start?: string | null, end?: string | null) => {
    if (!start || !end) return 0;
    try {
      const s = startOfDay(new Date(start));
      const e = startOfDay(new Date(end));
      return Math.max(0, differenceInCalendarDays(e, s)) + 1;
    } catch {
      return 0;
    }
  };

  const getActualDays = (start?: string | null, end?: string | null) => {
    if (!start) return 0;
    try {
      const s = startOfDay(new Date(start));
      const e = end ? startOfDay(new Date(end)) : startOfDay(new Date());
      return Math.max(0, differenceInCalendarDays(e, s)) + 1;
    } catch {
      return 0;
    }
  };

  const extraColumns = [
    {
      label: "Item Name",
      width: "w-[30%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem & { depth: number };
        return (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${row.depth * 20}px` }}
          >
            <span className="font-medium text-slate-800">
              {row.itemName}
            </span>
          </div>
        );
      },
    },
    {
      label: "Start Date",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        return (
          <span className="text-slate-500 font-medium">
            {fmtDate(row.plannedStartDate)}
          </span>
        );
      },
    },
    {
      label: "End Date",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        return (
          <span className="text-slate-500 font-medium">
            {fmtDate(row.plannedEndDate)}
          </span>
        );
      },
    },
    {
      label: "Plan Days",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        const days = getDurationDays(row.plannedStartDate, row.plannedEndDate);
        return (
          <span className="text-slate-700 font-semibold">
            {days} {days === 1 ? "day" : "days"}
          </span>
        );
      },
    },
    {
      label: "Days Actual",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        const days = row.actualStartDate
          ? getActualDays(row.actualStartDate, row.actualEndDate)
          : getDurationDays(row.plannedStartDate, row.plannedEndDate);
        return (
          <span className="text-slate-700 font-medium">
            {days} {days === 1 ? "day" : "days"}
          </span>
        );
      },
    },
    {
      label: "Task Delay",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        const plan = getDurationDays(row.plannedStartDate, row.plannedEndDate);
        const actual = row.actualStartDate
          ? getActualDays(row.actualStartDate, row.actualEndDate)
          : plan;
        const delay = actual - plan;
        if (delay > 0) {
          return (
            <span className="text-red-600 font-semibold">
              {delay} {delay === 1 ? "day" : "days"}
            </span>
          );
        }
        return <span className="text-slate-400 font-medium">0 days</span>;
      },
    },
    {
      label: "Cascade Delay",
      width: "w-[10%]",
      render: () => (
        <span className="text-slate-500 font-medium">-</span>
      ),
    },
    {
      label: "Overall Delay",
      width: "w-[10%]",
      render: (item: Record<string, unknown>) => {
        const row = item as unknown as CompanyGanttItem;
        const plan = getDurationDays(row.plannedStartDate, row.plannedEndDate);
        const actual = row.actualStartDate
          ? getActualDays(row.actualStartDate, row.actualEndDate)
          : plan;
        const delay = actual - plan;
        if (delay > 0) {
          return (
            <span className="text-red-700 font-bold">
              {delay} {delay === 1 ? "day" : "days"}
            </span>
          );
        }
        return <span className="text-slate-500 font-medium">0 days</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] px-4 pb-4 gap-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-3 pb-2 border-b shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate(`/dashboard/gantt/workspaces/${id}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {workspace.workspaceName}
            </h1>
            <Badge
              className={`text-xs ${statusBg} font-semibold px-2.5 py-0.5`}
            >
              {workspace.workspaceStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Compact Metadata Summary and Actions */}
        <div className="flex items-center gap-4 ml-auto shrink-0 flex-wrap">
          {totalTasks > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mr-1">
              {/* Dates */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground/80" />
                <span className="font-semibold text-foreground">
                  {fmtDate(workspace.startDate)} –{" "}
                  {fmtDate(workspace.targetEndDate)}
                </span>
                {workspace.workspaceStatus !== "COMPLETED" && (
                  <span
                    className={`text-xs font-semibold ${
                      isOverdue ? "text-destructive" : "text-primary"
                    }`}
                  >
                    (
                    {isOverdue
                      ? `${Math.abs(daysLeft)}d overdue`
                      : `${daysLeft}d left`}
                    )
                  </span>
                )}
              </div>

              <div className="h-4 w-px bg-border hidden sm:block" />

              {/* Stats */}
              <div className="items-center gap-2 hidden sm:flex text-sm">
                <span className="font-semibold text-foreground">
                  {totalTasks}
                </span>{" "}
                tasks
                <span className="text-muted-foreground/60">•</span>
                <span className="font-semibold text-green-600">
                  {completedTasks}
                </span>{" "}
                done
                <span className="text-muted-foreground/60">•</span>
                <span className="font-semibold text-foreground">
                  {phases.length}
                </span>{" "}
                phases
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Progress */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {overallPct}%
                </span>
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/gantt/workspaces/${id}`)}
              className="h-9 px-4 text-sm font-semibold flex items-center gap-1.5"
            >
              <GanttChartSquare className="h-4 w-4" /> Gantt View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPhaseForEdit(null);
                setPhaseFormOpen(true);
              }}
              className="h-9 px-4 text-sm font-semibold flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Phase
            </Button>
            <Button
              size="sm"
              onClick={() => setAddItemOpen(true)}
              className="h-9 px-4 text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* ── Toolbar / Search ────────────────────────────────────────────── */}
      {/* <div className="flex items-center justify-between px-1 py-1 shrink-0 bg-slate-50/50 border rounded-lg"> */}
        <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background w-80 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name..."
            className="outline-none bg-transparent text-sm w-full h-7 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      {/* </div> */}

      {/* ── Content View / Table ─────────────────────────────────────────── */}
      {itemsTree.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-center gap-2">
          <p className="text-sm font-semibold">No items yet</p>
          <p className="text-xs text-muted-foreground">
            Add your first task or milestone to get started.
          </p>
          <Button size="sm" onClick={() => setAddItemOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Item
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <TableDataKpi
            tableData={filteredTableData as unknown as Record<string, unknown>[]}
            primaryKey="ganttItemId"
            groupBy="phaseName"
            extraColumns={extraColumns}
            showActionsColumn={true}
            customActions={(item) => (
              <div className="flex items-center justify-end gap-2 pr-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-blue-100 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-0"
                  onClick={() => setSelectedItem(item as unknown as CompanyGanttItem)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {/* <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-800 hover:bg-slate-50 p-0"
                  onClick={() => setItemToEdit(item as unknown as CompanyGanttItem)}
                >
                  <Pencil className="h-4 w-4" />
                </Button> */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-red-150 text-red-500 hover:text-red-700 hover:bg-red-50 p-0"
                  onClick={() => setDeleteItemTarget(item as unknown as CompanyGanttItem)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            onGroupEdit={(groupValue) => {
              const phase = phases.find((p) => p.phaseName === groupValue);
              if (phase) {
                setSelectedPhaseForEdit(phase);
                setPhaseFormOpen(true);
              }
            }}
            isLoading={false}
            tableHeightClass="h-[calc(100vh-220px)] overflow-y-auto"
          />
        </div>
      )}

      {/* Add item modal */}
      {addItemOpen && (
        <GanttItemFormModal
          open={addItemOpen}
          onOpenChange={setAddItemOpen}
          workspaceId={workspace.ganttWorkspaceId}
          phases={phases}
        />
      )}

      {/* Edit item modal */}
      {/* {itemToEdit && (
        <GanttItemFormModal
          open={!!itemToEdit}
          onOpenChange={(v) => {
            if (!v) setItemToEdit(null);
          }}
          workspaceId={workspace.ganttWorkspaceId}
          phases={phases}
          editItem={itemToEdit}
        />
      )} */}

      {/* Manage Phases modal */}
      {phaseFormOpen && (
        <GanttPhaseManageModal
          open={phaseFormOpen}
          onOpenChange={setPhaseFormOpen}
          workspaceId={workspace.ganttWorkspaceId}
          phases={phases}
          editPhase={selectedPhaseForEdit}
        />
      )}

      {/* Item detail modal */}
      {selectedItem && (
        <GanttItemDetailModal
          open={!!selectedItem}
          onOpenChange={(v) => {
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          workspaceId={workspace.ganttWorkspaceId}
          phases={phases}
          itemsTree={itemsTree}
          dependencies={dependencies}
        />
      )}

      {/* Delete Item Confirmation Dialog */}
      <Dialog
        open={!!deleteItemTarget}
        onOpenChange={() => setDeleteItemTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteItemTarget?.itemName}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItemTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteItemMutation.isPending}
              onClick={async () => {
                if (deleteItemTarget) {
                  await deleteItemMutation.mutateAsync(
                    deleteItemTarget.ganttItemId,
                  );
                  setDeleteItemTarget(null);
                }
              }}
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
