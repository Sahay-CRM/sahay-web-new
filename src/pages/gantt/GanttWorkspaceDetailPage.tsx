import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGanttWorkspaceDetail,
  useDeleteGanttItem,
} from "@/features/api/gantt";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import GanttChart from "@/components/shared/Gantt/GanttChart";
import GanttItemFormModal from "./components/GanttItemFormModal";
import GanttItemDetailModal from "./components/GanttItemDetailModal";
import GanttPhaseManageModal from "./components/GanttPhaseManageModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpinnerIcon } from "@/components/shared/Icons";
import { ChevronLeft, Plus, Calendar, AlertCircle } from "lucide-react";
import { fmtDate, WORKSPACE_STATUS_BG } from "./utils/gantt.utils";
import type { CompanyGanttItem, CompanyGanttPhase } from "@/types/gantt";
import { differenceInCalendarDays, startOfDay } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function GanttWorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data, isLoading, isError } = useGanttWorkspaceDetail(id);

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [selectedPhaseForEdit, setSelectedPhaseForEdit] = useState<CompanyGanttPhase | null>(null);
  const [selectedItem, setSelectedItem] = useState<CompanyGanttItem | null>(
    null,
  );
  const [deleteItemTarget, setDeleteItemTarget] =
    useState<CompanyGanttItem | null>(null);
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] px-4 pb-4 gap-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-3 pb-2 border-b shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate("/dashboard/gantt/workspaces")}
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

      {/* ── Content View ─────────────────────────────────────────────────── */}
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
          <GanttChart
            workspaceId={workspace.ganttWorkspaceId}
            workspaceStartDate={workspace.startDate}
            phases={phases}
            itemsTree={itemsTree}
            dependencies={dependencies}
            selectedItem={selectedItem}
            onItemClick={setSelectedItem}
            onPhaseClick={(phaseId) => {
              const phase = phases.find((p) => p.ganttPhaseId === phaseId);
              if (phase) {
                setSelectedPhaseForEdit(phase);
                setPhaseFormOpen(true);
              }
            }}
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
