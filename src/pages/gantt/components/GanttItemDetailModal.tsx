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
} from "lucide-react";
import type { CompanyGanttItem, CompanyGanttPhase } from "@/types/gantt";
import {
  fmtDate,
  ITEM_STATUS_BG,
  PRIORITY_COLOR,
} from "@/pages/gantt/utils/gantt.utils";
import { useDeleteGanttItem } from "@/features/api/gantt";
import GanttProgressModal from "./GanttProgressModal";
import GanttItemFormModal from "./GanttItemFormModal";
import GanttAssignModal from "./GanttAssignModal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CompanyGanttItem;
  workspaceId: string;
  phases: CompanyGanttPhase[];
}

export default function GanttItemDetailModal({
  open,
  onOpenChange,
  item,
  workspaceId,
  phases,
}: Props) {
  const [progressOpen, setProgressOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useDeleteGanttItem(workspaceId);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(item.ganttItemId);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const statusBg = ITEM_STATUS_BG[item.itemStatus];
  const priorityColor = PRIORITY_COLOR[item.priority];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {item.isMilestone ? (
                <Diamond className="h-4 w-4 text-amber-500" />
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
              {item.isMilestone && (
                <Badge
                  variant="outline"
                  className="text-xs bg-amber-50 text-amber-700 border-amber-200"
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
            {!item.isMilestone && (
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
