import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGanttWorkspaceDetail,
  useUpdateGanttWorkspace,
  useDeleteGanttItem,
} from "@/features/api/gantt";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import GanttChart from "@/components/shared/Gantt/GanttChart";
import GanttItemFormModal from "./components/GanttItemFormModal";
import GanttItemDetailModal from "./components/GanttItemDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  ChevronLeft,
  Plus,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  GanttChartSquare,
  Columns3,
  Clock,
  Eye,
  Trash,
} from "lucide-react";
import {
  fmtDate,
  getInitials,
  WORKSPACE_STATUS_BG,
  WORKSPACE_STATUS_OPTIONS,
} from "./utils/gantt.utils";
import type {
  GanttWorkspaceStatus,
  CompanyGanttItem,
  CompanyGanttPhase,
} from "@/types/gantt";
import { differenceInCalendarDays, startOfDay, format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// ── Kanban Column config ─────────────────────────────────────────────────────
const STATUS_COLUMNS = [
  { id: "NOT_STARTED", name: "Yet to start", color: "#94a3b8" },
  { id: "IN_PROGRESS", name: "In Progress", color: "#3b82f6" },
  { id: "ON_HOLD", name: "On Hold", color: "#f59e0b" },
  { id: "COMPLETED", name: "Completed", color: "#22c55e" },
  { id: "CANCELLED", name: "Cancelled", color: "#ef4444" },
];

export default function GanttWorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data, isLoading, isError } = useGanttWorkspaceDetail(id);
  const updateMutation = useUpdateGanttWorkspace(id ?? "");

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CompanyGanttItem | null>(
    null,
  );
  const [deleteItemTarget, setDeleteItemTarget] =
    useState<CompanyGanttItem | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "board">("timeline");
  const deleteItemMutation = useDeleteGanttItem(id ?? "");

  // Breadcrumbs
  useEffect(() => {
    if (data?.workspace) {
      setBreadcrumbs([
        { label: "Gantt", href: "/dashboard/gantt/workspaces" },
        { label: "Workspaces", href: "/dashboard/gantt/workspaces" },
        {
          label: data.workspace.workspaceName,
          href: `/dashboard/gantt/workspaces/${id}`,
        },
      ]);
    }
  }, [data?.workspace, id, setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-primary">
        <SpinnerIcon />
      </div>
    );
  }

  if (isError || !data?.workspace) {
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

  const { workspace, phases, itemsTree, dependencies } = data;

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

  // ── Computed stats ──────────────────────────────────────────────────────
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

  const handleStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({
      workspaceStatus: status as GanttWorkspaceStatus,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] px-4 pb-4 gap-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 pt-2 shrink-0">
        <div className="flex items-start gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 mt-0.5"
            onClick={() => navigate("/dashboard/gantt/workspaces")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {workspace.workspaceName}
            </h1>
            {workspace.workspaceDescription && (
              <p className="text-xs text-muted-foreground truncate">
                {workspace.workspaceDescription}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-1.5 items-center">
              <Badge className={`text-xs ${statusBg}`}>
                {workspace.workspaceStatus.replace("_", " ")}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {fmtDate(workspace.startDate)} →{" "}
                {fmtDate(workspace.targetEndDate)}
              </span>
              {workspace.workspaceStatus !== "COMPLETED" && (
                <span
                  className={`text-xs font-medium ${
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(daysLeft)}d overdue`
                    : `${daysLeft}d left`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => setAddItemOpen(true)}
            className="h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <p className="text-xs text-muted-foreground px-2 pt-1 pb-0.5">
                Change Status
              </p>
              {WORKSPACE_STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={
                    updateMutation.isPending ||
                    workspace.workspaceStatus === opt.value
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Stats & View Switcher Row ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap border-b pb-2 bg-background z-10">
        {/* Stats bar */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-3 px-1 shrink-0 flex-wrap">
            {[
              { label: "Tasks", value: totalTasks },
              { label: "Done", value: completedTasks, color: "text-green-600" },
              { label: "Phases", value: phases.length },
              { label: "Deps", value: dependencies.length },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1 text-xs">
                <span className={`font-semibold ${s.color ?? ""}`}>
                  {s.value}
                </span>
                <span className="text-muted-foreground">{s.label}</span>
              </div>
            ))}
            {/* Overall progress bar */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs font-semibold text-muted-foreground">
                {overallPct}%
              </span>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border ml-auto">
          {(
            [
              {
                mode: "timeline" as const,
                icon: GanttChartSquare,
                label: "Timeline",
              },
              { mode: "board" as const, icon: Columns3, label: "Board" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={
                viewMode === mode
                  ? {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content View ─────────────────────────────────────────────────── */}
      {itemsTree.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-md text-center gap-2">
          <p className="text-sm font-medium">No items yet</p>
          <p className="text-xs text-muted-foreground">
            Add your first task or milestone to get started.
          </p>
          <Button size="sm" onClick={() => setAddItemOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {viewMode === "timeline" && (
            <GanttChart
              workspaceId={workspace.ganttWorkspaceId}
              workspaceStartDate={workspace.startDate}
              phases={phases}
              itemsTree={itemsTree}
              dependencies={dependencies}
              selectedItem={selectedItem}
              onItemClick={setSelectedItem}
            />
          )}

          {viewMode === "board" && (
            <WorkspaceBoardView
              phases={phases}
              itemsTree={itemsTree}
              onItemClick={setSelectedItem}
              onDeleteClick={setDeleteItemTarget}
            />
          )}
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

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE VIEW 2 — KANBAN BOARD (one column per task execution status)
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_BADGE_STYLE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  NOT_STARTED: {
    bg: "bg-[#ffe600]/15",
    text: "text-[#8a7300]",
    label: "Yet to start",
  },
  IN_PROGRESS: {
    bg: "bg-[#00f2fe]/10",
    text: "text-[#008080]",
    label: "In Progress",
  },
  ON_HOLD: { bg: "bg-amber-100", text: "text-amber-800", label: "On Hold" },
  COMPLETED: { bg: "bg-green-15", text: "text-green-800", label: "Completed" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
};

function WorkspaceBoardView({
  phases,
  itemsTree,
  onItemClick,
  onDeleteClick,
}: {
  phases: CompanyGanttPhase[];
  itemsTree: CompanyGanttItem[];
  onItemClick: (item: CompanyGanttItem) => void;
  onDeleteClick: (item: CompanyGanttItem) => void;
}) {
  // Flatten all items recursively
  const allItems = useMemo(() => {
    const res: CompanyGanttItem[] = [];
    const walk = (list: CompanyGanttItem[]) => {
      for (const i of list) {
        res.push(i);
        if (i.children?.length) walk(i.children);
      }
    };
    walk(itemsTree);
    return res;
  }, [itemsTree]);

  const columns = useMemo(() => {
    return STATUS_COLUMNS.map((col) => ({
      ...col,
      items: allItems.filter((item) => item.itemStatus === col.id),
    }));
  }, [allItems]);

  return (
    <div className="overflow-x-auto pb-4 h-full">
      <div className="flex gap-4 items-start min-w-[1200px] h-full pr-2 pt-1">
        {columns.map((col) => (
          <WorkspaceKanbanColumn
            key={col.id}
            col={col}
            phases={phases}
            onItemClick={onItemClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>
    </div>
  );
}

function WorkspaceKanbanColumn({
  col,
  phases,
  onItemClick,
  onDeleteClick,
}: {
  col: { id: string; name: string; color: string; items: CompanyGanttItem[] };
  phases: CompanyGanttPhase[];
  onItemClick: (item: CompanyGanttItem) => void;
  onDeleteClick: (item: CompanyGanttItem) => void;
}) {
  return (
    <div className="flex flex-col w-72 shrink-0 rounded-xl border border-slate-200 bg-[#f8f9fa] overflow-hidden h-full max-h-[calc(100vh-220px)]">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-805 leading-none">
            {col.name}
          </span>
          <span className="text-[10px] font-bold h-5 w-5 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
            {col.items.length}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 overflow-y-auto min-h-[300px]">
        {col.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-xl border border-dashed border-slate-200 bg-white text-center my-auto mx-1">
            <span className="text-xs text-slate-400 font-medium">
              No tasks here
            </span>
          </div>
        ) : (
          col.items.map((item) => (
            <WorkspaceKanbanCard
              key={item.ganttItemId}
              item={item}
              phases={phases}
              statusColor={col.color}
              onItemClick={onItemClick}
              onDeleteClick={onDeleteClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WorkspaceKanbanCard({
  item,
  onItemClick,
  onDeleteClick,
}: {
  item: CompanyGanttItem;
  phases: CompanyGanttPhase[];
  statusColor: string;
  onItemClick: (item: CompanyGanttItem) => void;
  onDeleteClick: (item: CompanyGanttItem) => void;
}) {
  const durationDays = Math.max(
    differenceInCalendarDays(
      startOfDay(new Date(item.actualEndDate || item.plannedEndDate)),
      startOfDay(new Date(item.actualStartDate || item.plannedStartDate)),
    ) + 1,
    1,
  );

  const statusBadge = STATUS_BADGE_STYLE[item.itemStatus] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: item.itemStatus.replace("_", " "),
  };

  const deadlineDate = item.actualEndDate || item.plannedEndDate;

  return (
    <div
      onClick={() => onItemClick(item)}
      className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5 group relative"
    >
      {/* Title & Actions */}
      <div className="flex items-start gap-2 justify-between">
        <span className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {item.itemName}
        </span>
        <div
          className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="View Details"
            onClick={() => onItemClick(item)}
            className="h-7 w-7 flex items-center justify-center rounded text-slate-400 hover:text-primary hover:bg-slate-50 transition-all cursor-pointer border-0 bg-transparent"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Delete Task"
            onClick={() => onDeleteClick(item)}
            className="h-7 w-7 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Assignee line */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <span className="font-medium text-slate-400">Assignees:</span>
        {item.assignedEmployee?.employeeName ? (
          <div className="flex items-center gap-1">
            <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-250 text-[8px] font-bold flex items-center justify-center text-slate-600 shadow-sm shrink-0">
              {getInitials(item.assignedEmployee.employeeName)}
            </div>
            <span className="text-[11px] text-slate-700 font-medium truncate max-w-[120px]">
              {item.assignedEmployee.employeeName}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
        )}
      </div>

      {/* Deadline line */}
      <div className="text-xs text-slate-500">
        <span className="font-medium text-slate-450">Deadline:</span>{" "}
        <span className="text-[11px] text-slate-700 font-semibold">
          {deadlineDate ? format(new Date(deadlineDate), "dd/MM/yyyy") : "—"}
        </span>
      </div>

      {/* Footer line */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-0.5">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </span>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-transparent ${statusBadge.bg} ${statusBadge.text}`}
        >
          {statusBadge.label}
        </span>
      </div>
    </div>
  );
}
