import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUpdateDailyPlanItem from "@/features/api/dailyPlan/useUpdateDailyPlanItem";

interface CompleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DailyPlanItem | null;
}

export default function CompleteItemDialog({
  open,
  onOpenChange,
  item,
}: CompleteItemDialogProps) {
  const [actualTime, setActualTime] = useState("");
  const { mutate: updateItem, isPending } = useUpdateDailyPlanItem();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setActualTime("");
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!item || !actualTime) return;

    updateItem(
      {
        planItemId: item.planItemId,
        status: "COMPLETED",
        actualTime: Number(actualTime),
        completionTime: new Date().toISOString(),
      },
      {
        onSuccess: () => handleClose(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <Label>Actual Time Spent (mins)</Label>
          <Input
            type="number"
            min={1}
            value={actualTime}
            onChange={(e) => setActualTime(e.target.value)}
            placeholder="e.g. 45"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!actualTime || isPending}>
            {isPending ? "Saving..." : "Mark Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
