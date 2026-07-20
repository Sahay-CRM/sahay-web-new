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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useCarryForwardDailyPlanItem from "@/features/api/dailyPlan/useCarryForwardDailyPlanItem";
import { format } from "date-fns";

interface CarryForwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DailyPlanItem | null;
}

export default function CarryForwardDialog({
  open,
  onOpenChange,
  item,
}: CarryForwardDialogProps) {
  const [targetDate, setTargetDate] = useState("");
  const [reason, setReason] = useState("");
  const { mutate: carryForward, isPending } = useCarryForwardDailyPlanItem();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTargetDate("");
      setReason("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!item || !targetDate) return;

    carryForward(
      {
        planItemId: item.planItemId,
        targetDate,
        carryForwardReason: reason || undefined,
      },
      {
        onSuccess: () => handleClose(false),
      },
    );
  };

  const minDate = format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Carry Forward Item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Target Date</Label>
            <Input
              type="date"
              min={minDate}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Carry Forward Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being forwarded?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!targetDate || isPending}>
            {isPending ? "Forwarding..." : "Carry Forward"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
