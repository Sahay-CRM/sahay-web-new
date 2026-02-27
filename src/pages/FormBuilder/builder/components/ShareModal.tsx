import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Link2, Copy, Check, Globe, Lock } from "lucide-react";
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
  const navigate = useNavigate();

  const publicUrl = `${window.location.origin}/form/${form.id}`;
  const isPrivate = form.visibility === "PRIVATE";

  const handleCopy = () => {
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
            {isPrivate
              ? "This form is private. Change visibility in Settings to share."
              : "Anyone with the link can view and respond to this form."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Visibility Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Form Visibility
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Public tab — disabled if form is PRIVATE */}
              <Button
                variant="outline"
                disabled={isPrivate}
                className={cn(
                  "border",
                  !isPrivate
                    ? "bg-[#2f328e]/10 text-[#2f328e] border-[#2f328e]/30"
                    : "text-gray-400 opacity-50 cursor-not-allowed",
                )}
              >
                <Globe className="h-4 w-4 mr-2" />
                Public
              </Button>
              {/* Private tab — disabled if form is PUBLIC */}
              <Button
                variant="outline"
                disabled={!isPrivate}
                className={cn(
                  "border",
                  isPrivate
                    ? "bg-[#2f328e]/10 text-[#2f328e] border-[#2f328e]/30"
                    : "text-gray-400 opacity-50 cursor-not-allowed",
                )}
              >
                <Lock className="h-4 w-4 mr-2" />
                Private
              </Button>
            </div>
            {isPrivate ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-1 flex-wrap">
                <span>Form is private.</span>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/dashboard/forms/${form.id}/settings`);
                  }}
                  className="underline font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap"
                >
                  Go to Settings
                </button>

                <span>to change visibility and share.</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/dashboard/forms/${form.id}/settings`);
                  }}
                  className="underline hover:text-gray-600"
                >
                  Change visibility in Settings
                </button>
              </p>
            )}
          </div>

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
                  isPrivate && "text-gray-300 select-none",
                )}
              />
              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0",
                  isPrivate
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                    : "bg-[#2f328e] hover:bg-[#1a1c5d]",
                )}
                onClick={!isPrivate ? handleCopy : undefined}
                disabled={isPrivate}
                title={isPrivate ? "Form must be public to share" : "Copy link"}
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
