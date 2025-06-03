import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface WarningDialogProps {
  open: boolean;
  onSubmit: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

const WarningDialog: React.FC<WarningDialogProps> = ({
  open,
  onSubmit,
  onDiscard,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="text-yellow-500 h-5 w-5" />
          <DialogTitle>Unsaved Changes</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-2">
          You have some unsaved changes. Do you want to submit them or discard
          them before switching?
        </p>
        <DialogFooter className="flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={onDiscard}>
            Discard
          </Button>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WarningDialog;
