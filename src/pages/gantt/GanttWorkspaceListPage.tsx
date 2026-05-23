import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  useGanttWorkspaces,
  useDeleteGanttWorkspace,
} from "@/features/api/gantt";
import { useCreateGanttWorkspace } from "@/features/api/gantt";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  fmtDate,
  WORKSPACE_STATUS_BG,
  WORKSPACE_STATUS_OPTIONS,
} from "./utils/gantt.utils";
import type {
  CompanyGanttWorkspace,
  GanttWorkspaceStatus,
} from "@/types/gantt";
import { Controller, useForm } from "react-hook-form";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { format, differenceInCalendarDays } from "date-fns";

export default function GanttWorkspaceListPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [deleteTarget, setDeleteTarget] =
    useState<CompanyGanttWorkspace | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "" },
      { label: "Workspaces", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const { data, isLoading, refetch } = useGanttWorkspaces({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    workspaceStatus:
      statusFilter === "all"
        ? undefined
        : (statusFilter as GanttWorkspaceStatus),
  });

  const deleteMutation = useDeleteGanttWorkspace();
  const createMutation = useCreateGanttWorkspace();

  const workspaces = data?.data ?? [];
  const total = data?.totalCount ?? 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      workspaceName: "",
      workspaceDescription: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      targetEndDate: "",
    },
  });

  const handleCreate = handleSubmit(async (values) => {
    const res = await createMutation.mutateAsync({
      workspaceName: values.workspaceName,
      workspaceDescription: values.workspaceDescription,
      startDate: new Date(values.startDate).toISOString(),
      targetEndDate: values.targetEndDate
        ? new Date(values.targetEndDate).toISOString()
        : undefined,
    });
    reset();
    setCreateOpen(false);
    navigate(`/dashboard/gantt/workspaces/${res.data.ganttWorkspaceId}`);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Gantt Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Active project execution plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/gantt/templates">
            <Button variant="outline" size="sm">
              Templates
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Workspace
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {WORKSPACE_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <SpinnerIcon />
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground text-sm">No workspaces found.</p>
          <div className="flex items-center gap-2 mt-4">
            <Link to="/dashboard/gantt/templates">
              <Button variant="outline" size="sm">
                Browse Templates
              </Button>
            </Link>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Workspace
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.ganttWorkspaceId}
              workspace={ws}
              onDelete={() => setDeleteTarget(ws)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > (paginationFilter.pageSize ?? 25) && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(paginationFilter.currentPage ?? 1) === 1}
            onClick={() =>
              setPaginationFilter((p) => ({
                ...p,
                currentPage: (p.currentPage ?? 1) - 1,
              }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {paginationFilter.currentPage} · {total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              (paginationFilter.currentPage ?? 1) *
                (paginationFilter.pageSize ?? 25) >=
              total
            }
            onClick={() =>
              setPaginationFilter((p) => ({
                ...p,
                currentPage: (p.currentPage ?? 1) + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Archive &quot;{deleteTarget?.workspaceName}&quot;? All phases,
              items, and dependencies will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteMutation.mutateAsync(deleteTarget.ganttWorkspaceId);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create workspace modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
            <DialogDescription>
              Create an empty workspace. Add phases and items manually, or use a
              template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Controller
              name="workspaceName"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Workspace Name"
                  placeholder="e.g. Q4 Implementation"
                  isMandatory
                  error={errors.workspaceName}
                />
              )}
            />
            <Controller
              name="workspaceDescription"
              control={control}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Description"
                  placeholder="Optional"
                />
              )}
            />
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  type="date"
                  label="Start Date"
                  isMandatory
                  error={errors.startDate}
                />
              )}
            />
            <Controller
              name="targetEndDate"
              control={control}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  type="date"
                  label="Target End Date"
                  placeholder="Optional"
                />
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Workspace Card ─────────────────────────────────────────────────────────

interface WorkspaceCardProps {
  workspace: CompanyGanttWorkspace;
  onDelete: () => void;
}

function WorkspaceCard({ workspace, onDelete }: WorkspaceCardProps) {
  const daysLeft =
    workspace.targetEndDate && workspace.workspaceStatus === "ACTIVE"
      ? differenceInCalendarDays(new Date(workspace.targetEndDate), new Date())
      : null;

  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {workspace.workspaceName}
          </p>
          {workspace.workspaceDescription && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {workspace.workspaceDescription}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={`text-xs ${WORKSPACE_STATUS_BG[workspace.workspaceStatus]}`}
        >
          {workspace.workspaceStatus.replace("_", " ")}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground space-y-0.5">
        <div>Start: {fmtDate(workspace.startDate)}</div>
        {workspace.targetEndDate && (
          <div>
            Target: {fmtDate(workspace.targetEndDate)}
            {daysLeft !== null && (
              <span
                className={
                  daysLeft < 0 ? " text-red-500" : " text-muted-foreground"
                }
              >
                {" "}
                (
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : `${daysLeft}d left`}
                )
              </span>
            )}
          </div>
        )}
      </div>

      <Link to={`/dashboard/gantt/workspaces/${workspace.ganttWorkspaceId}`}>
        <Button variant="default" size="sm" className="w-full h-7 text-xs">
          <Eye className="h-3 w-3 mr-1" /> Open Gantt
        </Button>
      </Link>
    </Card>
  );
}
