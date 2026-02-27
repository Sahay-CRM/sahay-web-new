import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormDetails;
  onUpdateVisibility: (visibility: FormDetails["visibility"]) => void;
  onUpdateMobileNumbers: (numbers: string[]) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  form,
}) => {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/form/${form.id}`;
  const isPrivate = form.visibility === "PRIVATE";
  const isDraft = !form.isActive;

  const handleCopy = () => {
    if (isDraft) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link Copied Successfully");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#2f328e]" />
            Share Form
          </DialogTitle>
          <DialogDescription>
            {isDraft
              ? "This form is in draft. Publish the form to share the link."
              : isPrivate
                ? "This form is private. Anyone with the link can view it (OTP verification may be required)."
                : "Anyone with the link can view and respond to this form."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Link to share
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicUrl}
                className={cn(
                  "bg-gray-50 border-gray-200 h-10 focus-visible:ring-0 text-sm",
                  isDraft && "text-gray-300 select-none",
                )}
              />
              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0",
                  isDraft
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                    : "bg-[#2f328e] hover:bg-[#1a1c5d]",
                )}
                onClick={!isDraft ? handleCopy : undefined}
                disabled={isDraft}
                title={isDraft ? "Publish form to share" : "Copy link"}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          {/* <Button variant="ghost" onClick={onClose}>Close</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
