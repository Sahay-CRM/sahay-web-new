import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
  name: string;
  onNameChange?: (name: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  isSavedId?: string;
  isActive?: boolean;
  onToggleStatus?: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  name,
  onSave,
  isSaving,
  isSaved,
  // isSavedId,
  isActive,
  onToggleStatus,
}) => {
  // const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 group">
            <span className="text-lg font-medium px-1 h-8 flex items-center min-w-[200px] text-gray-700 select-none">
              {name || "Untitled form"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 gap-1.5 h-8 mr-2"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button
            className={cn(
              "px-5 h-8 shadow-sm transition-all flex items-center gap-2",
              !isSaved
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isActive
                  ? "bg-white text-[#2f328e] border border-[#2f328e]/20 hover:bg-[#2f328e]/5"
                  : "bg-[#2f328e] hover:bg-[#1a1c5d] text-white",
            )}
            onClick={onToggleStatus}
            disabled={!isSaved}
            title={!isSaved ? "Save the form first before sharing" : ""}
          >
            {isActive ? (
              <>
                <FileText className="h-4 w-4" />
                Draft
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Published
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
