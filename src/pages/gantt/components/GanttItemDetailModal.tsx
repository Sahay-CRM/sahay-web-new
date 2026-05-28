import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Trash2,
  TrendingUp,
  UserPlus,
  Diamond,
  SquareCheck,
  Link2,
  Plus,
  Loader2,
} from "lucide-react";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
  GanttDependencyType,
} from "@/types/gantt";
import {
  fmtDate,
  ITEM_STATUS_BG,
  PRIORITY_COLOR,
} from "@/pages/gantt/utils/gantt.utils";
import {
  useDeleteGanttItem,
  useCreateGanttDependency,
  useDeleteGanttDependency,
} from "@/features/api/gantt";
import GanttProgressModal from "./GanttProgressModal";
import GanttItemFormModal from "./GanttItemFormModal";
import GanttAssignModal from "./GanttAssignModal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CompanyGanttItem;
  workspaceId: string;
  phases: CompanyGanttPhase[];
  itemsTree?: CompanyGanttItem[];
  dependencies?: CompanyGanttDependency[];
}

function flattenItems(items: CompanyGanttItem[]): CompanyGanttItem[] {
  const result: CompanyGanttItem[] = [];
  const walk = (list: CompanyGanttItem[]) => {
    for (const item of list) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items || []);
  return result;
}

export default function GanttItemDetailModal({
  open,
  onOpenChange,
  item,
  workspaceId,
  phases,
  itemsTree = [],
  dependencies = [],
}: Props) {
  const [progressOpen, setProgressOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Dependency states
  const [newPredId, setNewPredId] = useState("");
  const [newDepType, setNewDepType] = useState<GanttDependencyType>("FS");
  const [newLagDays, setNewLagDays] = useState(0);

  const deleteMutation = useDeleteGanttItem(workspaceId);
  const createDepMutation = useCreateGanttDependency(workspaceId);
  const deleteDepMutation = useDeleteGanttDependency(workspaceId);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(item.ganttItemId);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const handleAddDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPredId) return;
    try {
      await createDepMutation.mutateAsync({
        ganttWorkspaceId: workspaceId,
        predecessorItemId: newPredId,
        successorItemId: item.ganttItemId,
        dependencyType: newDepType,
        lagDays: Number(newLagDays) || 0,
      });
      setNewPredId("");
      setNewLagDays(0);
    } catch {
      // Handled by toast inside mutation hook
    }
  };

  const handleDeleteDependency = async (depId: string) => {
    try {
      await deleteDepMutation.mutateAsync(depId);
    } catch {
      // Handled by toast inside mutation hook
    }
  };

  const statusBg = ITEM_STATUS_BG[item.itemStatus];
  const priorityColor = PRIORITY_COLOR[item.priority];
  const isMilestone = item.itemType === "MILESTONE" || item.isMilestone;

  // Process dependencies
  const flatItems = flattenItems(itemsTree);
  const itemMap = new Map(flatItems.map((i) => [i.ganttItemId, i]));

  const predecessors = dependencies.filter(
    (d) => d.successorItemId === item.ganttItemId,
  );
  const successors = dependencies.filter(
    (d) => d.predecessorItemId === item.ganttItemId,
  );

  // Candidate predecessors: not current task, not already predecessor or successor
  const candidates = flatItems.filter(
    (i) =>
      i.ganttItemId !== item.ganttItemId &&
      !predecessors.some((p) => p.predecessorItemId === i.ganttItemId) &&
      !successors.some((s) => s.successorItemId === i.ganttItemId),
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isMilestone ? (
                <Diamond className="h-4 w-4 text-pink-500" />
              ) : (
                <SquareCheck className="h-4 w-4 text-blue-500" />
              )}
              <span className="truncate">{item.itemName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Status & priority badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={`text-xs ${statusBg}`}>
                {item.itemStatus.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className={`text-xs ${priorityColor}`}>
                {item.priority}
              </Badge>
              {isMilestone && (
                <Badge
                  variant="outline"
                  className="text-xs bg-pink-50 text-pink-700 border-pink-200"
                >
                  Milestone
                </Badge>
              )}
            </div>

            {/* Description */}
            {item.itemDescription && (
              <p className="text-sm text-muted-foreground">
                {item.itemDescription}
              </p>
            )}

            <Separator />

            {/* Progress */}
            {!isMilestone && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {item.progressPercentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${item.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Planned Start
                </p>
                <p className="font-medium">{fmtDate(item.plannedStartDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Planned End
                </p>
                <p className="font-medium">{fmtDate(item.plannedEndDate)}</p>
              </div>
              {item.actualStartDate && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">
                    Actual Start
                  </p>
                  <p className="font-medium">{fmtDate(item.actualStartDate)}</p>
                </div>
              )}
              {item.actualEndDate && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">
                    Actual End
                  </p>
                  <p className="font-medium">{fmtDate(item.actualEndDate)}</p>
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-0.5">
                Assigned To
              </p>
              <p className="font-medium">
                {item.assignedEmployee?.employeeName ?? "Unassigned"}
              </p>
            </div>

            <Separator />

            {/* Task Correlations & Dependencies */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Link2 className="h-4 w-4 text-primary" />
                <span>Task Correlations & Dependencies</span>
              </div>
              <div className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-dashed flex justify-between">
                <span>Debug flatItems: {flatItems.length}</span>
                <span>predecessors: {predecessors.length}</span>
                <span>successors: {successors.length}</span>
                <span>candidates: {candidates.length}</span>
              </div>

              {/* Existing dependencies */}
              {predecessors.length > 0 || successors.length > 0 ? (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {predecessors.map((dep) => {
                    const pred = itemMap.get(dep.predecessorItemId);
                    const typeLabel =
                      dep.dependencyType === "FS"
                        ? "Starts after finishes"
                        : dep.dependencyType === "SS"
                          ? "Starts in parallel"
                          : dep.dependencyType === "FF"
                            ? "Finishes in parallel"
                            : "Finishes after starts";
                    const badgeVariant =
                      dep.dependencyType === "SS" ? "secondary" : "outline";
                    return (
                      <div
                        key={dep.ganttDependencyId}
                        className="flex items-center justify-between text-xs p-2 rounded border bg-muted/20"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-medium text-foreground truncate">
                            {pred?.itemName ?? "Unknown Task"}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {typeLabel}{" "}
                            {dep.lagDays > 0 && `(Lag: +${dep.lagDays}d)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={badgeVariant}
                            className="text-[10px] uppercase font-semibold"
                          >
                            {dep.dependencyType}
                          </Badge>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleDeleteDependency(dep.ganttDependencyId)
                            }
                            disabled={deleteDepMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {successors.map((dep) => {
                    const succ = itemMap.get(dep.successorItemId);
                    const typeLabel =
                      dep.dependencyType === "FS"
                        ? "Starts after this finishes"
                        : dep.dependencyType === "SS"
                          ? "Starts in parallel with this"
                          : dep.dependencyType === "FF"
                            ? "Finishes in parallel with this"
                            : "Finishes after this starts";
                    return (
                      <div
                        key={dep.ganttDependencyId}
                        className="flex items-center justify-between text-xs p-2 rounded border bg-muted/20"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-medium text-foreground truncate">
                            {succ?.itemName ?? "Unknown Task"}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {typeLabel}{" "}
                            {dep.lagDays > 0 && `(Lag: +${dep.lagDays}d)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-semibold"
                          >
                            {dep.dependencyType} (Successor)
                          </Badge>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleDeleteDependency(dep.ganttDependencyId)
                            }
                            disabled={deleteDepMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No correlations or dependencies defined yet.
                </p>
              )}

              {/* Add dependency form */}
              {candidates.length > 0 && (
                <form
                  onSubmit={handleAddDependency}
                  className="space-y-2 pt-2 border-t border-dashed"
                >
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Add New Relation / Link
                  </p>
                  <div className="grid grid-cols-12 gap-1.5 items-end">
                    {/* Predecessor task selection */}
                    <div className="col-span-5 space-y-1">
                      <label className="text-[10px] text-muted-foreground block font-medium">
                        Depends On
                      </label>
                      <select
                        value={newPredId}
                        onChange={(e) => setNewPredId(e.target.value)}
                        className="w-full h-8 text-xs border border-input rounded bg-background px-2 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                      >
                        <option value="">Select task...</option>
                        {candidates.map((c) => (
                          <option key={c.ganttItemId} value={c.ganttItemId}>
                            {c.itemName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Relationship type */}
                    <div className="col-span-4 space-y-1">
                      <label className="text-[10px] text-muted-foreground block font-medium">
                        Relationship Type
                      </label>
                      <select
                        value={newDepType}
                        onChange={(e) =>
                          setNewDepType(e.target.value as GanttDependencyType)
                        }
                        className="w-full h-8 text-xs border border-input rounded bg-background px-2 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="FS">FS: Finish-to-Start</option>
                        <option value="SS">
                          SS: Start-to-Start (Parallel)
                        </option>
                        <option value="FF">FF: Finish-to-Finish</option>
                        <option value="SF">SF: Start-to-Finish</option>
                      </select>
                    </div>

                    {/* Lag days */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-muted-foreground block font-medium">
                        Lag (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newLagDays}
                        onChange={(e) => setNewLagDays(Number(e.target.value))}
                        className="w-full h-8 text-xs border border-input rounded bg-background px-2 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-center"
                      />
                    </div>

                    {/* Submit button */}
                    <div className="col-span-1">
                      <Button
                        type="submit"
                        size="icon"
                        className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground"
                        disabled={createDepMutation.isPending || !newPredId}
                      >
                        {createDepMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgressOpen(true)}
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1" /> Update Progress
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive ml-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress modal */}
      {progressOpen && (
        <GanttProgressModal
          open={progressOpen}
          onOpenChange={setProgressOpen}
          item={item}
          workspaceId={workspaceId}
        />
      )}

      {/* Edit modal */}
      {editOpen && (
        <GanttItemFormModal
          open={editOpen}
          onOpenChange={setEditOpen}
          workspaceId={workspaceId}
          phases={phases}
          editItem={item}
        />
      )}

      {/* Assign modal */}
      {assignOpen && (
        <GanttAssignModal
          open={assignOpen}
          onOpenChange={setAssignOpen}
          item={item}
          workspaceId={workspaceId}
        />
      )}

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete &quot;{item.itemName}&quot; and all its sub-items? This
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
