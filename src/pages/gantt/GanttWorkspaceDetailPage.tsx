import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGanttWorkspaceDetail } from "@/features/api/gantt";
import { useUpdateGanttWorkspace } from "@/features/api/gantt";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import GanttChart from "@/components/shared/Gantt/GanttChart";
import GanttItemFormModal from "./components/GanttItemFormModal";
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
} from "lucide-react";
import {
  fmtDate,
  WORKSPACE_STATUS_BG,
  WORKSPACE_STATUS_OPTIONS,
} from "./utils/gantt.utils";
import type { GanttWorkspaceStatus } from "@/types/gantt";
import { differenceInCalendarDays, startOfDay } from "date-fns";

export default function GanttWorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data, isLoading, isError } = useGanttWorkspaceDetail(id);
  const updateMutation = useUpdateGanttWorkspace(id ?? "");

  const [addItemOpen, setAddItemOpen] = useState(false);

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

      {/* ── Gantt Chart ─────────────────────────────────────────────────── */}
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
          <GanttChart
            workspaceId={workspace.ganttWorkspaceId}
            workspaceStartDate={workspace.startDate}
            phases={phases}
            itemsTree={itemsTree}
            dependencies={dependencies}
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
    </div>
  );
}
