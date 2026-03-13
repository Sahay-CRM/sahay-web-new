import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { AlertCircle } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  expireDate: string | undefined;
  onExpireDateChange: (date: string | undefined) => void;
  onConfirm: () => void;
  isPublishing: boolean;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  expireDate,
  onExpireDateChange,
  onConfirm,
  isPublishing,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#2f328e] flex items-center gap-2">
            Publish Form
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Expiration Date
            </label>
            <input
              type="date"
              value={expireDate ? expireDate.split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value;
                onExpireDateChange(
                  val ? new Date(val).toISOString() : undefined,
                );
              }}
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split("T")[0];
              })()}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2f328e] focus:border-[#2f328e]"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              If you do not provide an expiry date, then it will remain valid
              until you mark it as draft.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isPublishing}
            className="bg-[#2f328e] hover:bg-[#1a1c5d] text-white"
          >
            Confirm & Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
