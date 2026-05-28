/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Copy,
  Trash2,
  ChevronRight,
  Diamond,
  SquareCheck,
  GitBranch,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGanttTemplateDetail } from "@/features/api/gantt";
import {
  usePublishGanttTemplate,
  useDuplicateGanttTemplate,
  useDeleteGanttTemplate,
} from "@/features/api/gantt";
import { SpinnerIcon } from "@/components/shared/Icons";
import { fmtDate } from "./utils/gantt.utils";
import type { GanttTemplateItem, GanttTemplatePhase } from "@/types/gantt";
import GanttCreateWorkspaceModal from "./components/GanttCreateWorkspaceModal";

export default function GanttTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  const { data, isLoading, isError } = useGanttTemplateDetail(id);

  const publishMutation = usePublishGanttTemplate();
  const duplicateMutation = useDuplicateGanttTemplate();
  const deleteMutation = useDeleteGanttTemplate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "/dashboard/gantt/workspaces" },
      { label: "Templates", href: "/dashboard/gantt/templates" },
      { label: data?.template?.templateName ?? "Detail", href: "" },
    ]);
  }, [setBreadcrumbs, data?.template?.templateName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-primary">
        <SpinnerIcon />
      </div>
    );
  }

  const template =
    data?.template ?? ((data as any)?.templateName ? (data as any) : null);
  const phases = data?.phases ?? [];
  const itemsTree = data?.itemsTree ?? [];
  const dependencies = data?.dependencies ?? [];

  if (isError || !data || !template) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Template not found or could not be loaded.
        </p>
        <Link to="/dashboard/gantt/templates">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Templates
          </Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(template.ganttTemplateId);
    navigate("/dashboard/gantt/templates");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/dashboard/gantt/templates">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{template.templateName}</h1>
              <Badge
                variant="outline"
                className={
                  template.isPublished
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-slate-50 text-slate-600"
                }
              >
                {template.isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline">v{template.version}</Badge>
              <Badge variant="outline">{template.ownerType}</Badge>
            </div>
            {template.templateDescription && (
              <p className="text-sm text-muted-foreground mt-1">
                {template.templateDescription}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Created {fmtDate(template.createdDatetime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {template.isPublished && (
            <Button size="sm" onClick={() => setCreateWsOpen(true)}>
              <GitBranch className="h-4 w-4 mr-1" /> Use Template
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => publishMutation.mutate(template.ganttTemplateId)}
            disabled={publishMutation.isPending}
          >
            <Send className="h-4 w-4 mr-1" />
            {template.isPublished ? "New Version" : "Publish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateMutation.mutate(template.ganttTemplateId)}
          >
            <Copy className="h-4 w-4 mr-1" /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Phases", value: phases.length },
          { label: "Items", value: countItems(itemsTree) },
          { label: "Dependencies", value: dependencies.length },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Phases & Items */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Structure
        </h2>
        {phases.length === 0 && itemsTree.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No phases or items defined yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {[...phases]
              .sort((a, b) => a.phaseOrder - b.phaseOrder)
              .map((phase) => (
                <TemplatePhaseBlock
                  key={phase.ganttTemplatePhaseId}
                  phase={phase}
                  items={itemsTree.filter(
                    (i) =>
                      i.ganttTemplatePhaseId === phase.ganttTemplatePhaseId,
                  )}
                />
              ))}
            {/* Unphased items */}
            {itemsTree.filter((i) => !i.ganttTemplatePhaseId).length > 0 && (
              <TemplatePhaseBlock
                phase={null}
                items={itemsTree.filter((i) => !i.ganttTemplatePhaseId)}
              />
            )}
          </div>
        )}
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dependencies ({dependencies.length})
          </h2>
          <Card className="divide-y">
            {dependencies.map((dep) => {
              const pred = findItem(itemsTree, dep.predecessorItemId);
              const succ = findItem(itemsTree, dep.successorItemId);
              return (
                <div
                  key={dep.ganttTemplateDependencyId}
                  className="px-4 py-2 flex items-center gap-2 text-sm"
                >
                  <span className="font-medium truncate max-w-[180px]">
                    {pred?.itemName ?? dep.predecessorItemId}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[180px]">
                    {succ?.itemName ?? dep.successorItemId}
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto shrink-0">
                    {dep.dependencyType}
                    {dep.lagDays !== 0 &&
                      ` ${dep.lagDays > 0 ? "+" : ""}${dep.lagDays}d`}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Archive &quot;{template.templateName}&quot;? This cannot be
              undone. Existing workspaces are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create workspace from template */}
      {createWsOpen && (
        <GanttCreateWorkspaceModal
          open={createWsOpen}
          onOpenChange={setCreateWsOpen}
          templateId={template.ganttTemplateId}
          templateName={template.templateName}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function countItems(items: GanttTemplateItem[]): number {
  return items.reduce(
    (acc, item) => acc + 1 + (item.children ? countItems(item.children) : 0),
    0,
  );
}

function findItem(
  items: GanttTemplateItem[],
  id: string,
): GanttTemplateItem | undefined {
  for (const item of items) {
    if (item.ganttTemplateItemId === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// ── Phase block ───────────────────────────────────────────────────────────────

interface TemplatePhaseBlockProps {
  phase: GanttTemplatePhase | null;
  items: GanttTemplateItem[];
}

function TemplatePhaseBlock({ phase, items }: TemplatePhaseBlockProps) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ background: phase?.color ?? "#94a3b8" }}
        />
        <span className="font-medium text-sm">
          {phase?.phaseName ?? "Unassigned"}
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          ({items.length} items)
        </span>
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground ml-auto transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t divide-y">
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No items in this phase.
            </p>
          ) : (
            items.map((item) => (
              <TemplateItemRow
                key={item.ganttTemplateItemId}
                item={item}
                depth={0}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
}

interface TemplateItemRowProps {
  item: GanttTemplateItem;
  depth: number;
}

function TemplateItemRow({ item, depth }: TemplateItemRowProps) {
  return (
    <>
      <TooltipProvider>
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm"
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          {item.itemType === "MILESTONE" || item.isMilestone ? (
            <Diamond className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <SquareCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          )}
          <span className="truncate flex-1">{item.itemName}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs shrink-0">
                Day {item.relativeStartDay}
                {item.relativeDurationDays > 0
                  ? ` · ${item.relativeDurationDays}d`
                  : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Start: day {item.relativeStartDay} · Duration:{" "}
              {item.relativeDurationDays === 0
                ? "Milestone"
                : `${item.relativeDurationDays} days`}
            </TooltipContent>
          </Tooltip>
          <Badge variant="outline" className="text-xs shrink-0">
            {item.priority}
          </Badge>
        </div>
      </TooltipProvider>

      {item.children?.map((child) => (
        <TemplateItemRow
          key={child.ganttTemplateItemId}
          item={child}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
