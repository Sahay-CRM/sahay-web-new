import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  isSavedId?: string;
  onSend?: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  name,
  onNameChange,
  onSave,
  isSaving,
  isSaved,
  // isSavedId,
  onSend,
}) => {
  // const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 group">
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="border-transparent hover:border-gray-200 focus:border-[#2f328e] focus:ring-0 text-lg font-medium bg-transparent px-1 h-8 min-w-[200px]"
              placeholder="Form Name"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* {isSaved && isSavedId && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 gap-1.5 h-8"
                                onClick={() => navigate(`/dashboard/forms/${isSavedId}/responses`)}
                                title="View Responses"
                            >
                                <BarChart2 className="h-4 w-4" />
                                <span className="text-sm">Responses</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 gap-1.5 h-8"
                                onClick={() => navigate(`/dashboard/forms/${isSavedId}/settings`)}
                                title="Form Settings"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="text-sm">Settings</span>
                            </Button>
                            <div className="h-5 w-px bg-gray-200 mx-1" />
                        </>
                    )} */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 gap-1.5 h-8"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            className={cn(
              "px-5 h-8 shadow-sm transition-all",
              isSaved
                ? "bg-[#2f328e] hover:bg-[#1a1c5d] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
            onClick={onSend}
            disabled={!isSaved}
            title={!isSaved ? "Save the form first before sharing" : ""}
          >
            <Send className="h-4 w-4 mr-1.5" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
