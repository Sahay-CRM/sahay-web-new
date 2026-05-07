import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRange";
import { DateRange } from "react-day-picker";

interface DownloadDateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (range: DateRange | undefined) => void;
  currentDate: Date | null;
  defaultRange?: DateRange;
}

const DownloadDateModal: React.FC<DownloadDateModalProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
  defaultRange,
}) => {
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    defaultRange || {
      from: currentDate || undefined,
      to: currentDate || undefined,
    },
  );

  React.useEffect(() => {
    if (open) {
      setTempRange(
        defaultRange || {
          from: currentDate || undefined,
          to: currentDate || undefined,
        },
      );
    }
  }, [open, currentDate, defaultRange]);

  const handleConfirm = () => {
    onConfirm(tempRange);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <DialogTitle>Select Export Range</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the date range for which you want to export the KPI data to
            Excel.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              value={tempRange}
              onChange={(range) => setTempRange(range)}
              onApply={(range) => setTempRange(range)}
              onSaveApply={(range) => setTempRange(range)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!tempRange?.from}>
            Confirm & Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDateModal;
