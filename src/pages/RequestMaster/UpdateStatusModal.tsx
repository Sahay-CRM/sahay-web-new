import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, status: string, remarks?: string) => void;
  data?: RequestMasterData;
}

export const UpdateStatusModal = ({
  isOpen,
  onClose,
  onSubmit,
  data,
}: UpdateStatusModalProps) => {
  const [status, setStatus] = useState(data?.status || "PENDING");
  const initialRemarks =
    data?.remarks && data.remarks.trim() !== "-" ? data.remarks : "";
  const [remarks, setRemarks] = useState(initialRemarks);

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
    if (data?.remarks && data.remarks.trim() !== "-") {
      setRemarks(data.remarks);
    } else {
      setRemarks("");
    }
  }, [data?.status, data?.remarks]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Request Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="remarks" className="text-sm font-medium">
              Remarks (Reason for Approval/Decline)
            </label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks explaining why this request is approved or declined..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit(
                data?.requestMasterId || (data as RequestMasterData)?.id,
                status as string,
                remarks,
              )
            }
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
