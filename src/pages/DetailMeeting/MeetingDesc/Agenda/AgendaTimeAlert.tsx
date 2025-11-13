import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlarmClock } from "lucide-react";

interface AgendaTimeAlertProps {
  open: boolean;
  onClose: () => void;
}

const AgendaTimeAlert: React.FC<AgendaTimeAlertProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center gap-2">
          <AlarmClock className="text-primary h-5 w-5" />
          <DialogTitle> Time Alert</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mt-2">
          You’ve spent over <strong>40% of the allocated time</strong> on this
          agenda. Consider wrapping up or moving to the next point to stay on
          schedule.
        </p>

        <DialogFooter className="flex justify-end space-x-3 mt-4">
          <Button onClick={onClose}>ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaTimeAlert;
