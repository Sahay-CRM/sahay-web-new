import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { useUpdateGanttProgress } from "@/features/api/gantt";
import type { CompanyGanttItem, GanttItemStatus } from "@/types/gantt";
import { STATUS_OPTIONS, fmtDate } from "@/pages/gantt/utils/gantt.utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CompanyGanttItem;
  workspaceId: string;
}

interface FormValues {
  progressPercentage: number;
  itemStatus: string;
}

export default function GanttProgressModal({
  open,
  onOpenChange,
  item,
  workspaceId,
}: Props) {
  const mutation = useUpdateGanttProgress(workspaceId);

  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>(
    {
      defaultValues: {
        progressPercentage: item.progressPercentage,
        itemStatus: item.itemStatus,
      },
    },
  );

  const progress = watch("progressPercentage");
  const status = watch("itemStatus");

  // Auto-set status based on progress
  useEffect(() => {
    if (progress === 100 && status !== "COMPLETED") {
      setValue("itemStatus", "COMPLETED");
    } else if (progress > 0 && progress < 100 && status === "NOT_STARTED") {
      setValue("itemStatus", "IN_PROGRESS");
    }
  }, [progress, status, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      itemId: item.ganttItemId,
      payload: {
        progressPercentage: values.progressPercentage,
        itemStatus: values.itemStatus as GanttItemStatus,
      },
    });
    onOpenChange(false);
    reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 pt-1">
          <p className="text-sm font-medium truncate">{item.itemName}</p>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {fmtDate(item.plannedStartDate)} – {fmtDate(item.plannedEndDate)}
            </Badge>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          {/* Progress slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-semibold text-primary">
                {progress}%
              </span>
            </div>
            <Controller
              name="progressPercentage"
              control={control}
              render={({ field }) => (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full h-2 accent-primary cursor-pointer"
                />
              )}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status */}
          <Controller
            name="itemStatus"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Status"
                value={field.value}
                onChange={field.onChange}
                options={STATUS_OPTIONS}
              />
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
