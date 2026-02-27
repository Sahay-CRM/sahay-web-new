import { useState } from "react";
import { FormHeader } from "./components/Header";
import { QuestionsTab } from "./components/QuestionsTab";
import { ShareModal } from "./components/ShareModal";
import { FieldTypePanel } from "./components/FieldTypePanel";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import useFormBuilder from "./hooks/useFormBuilder";

const FormBuilderPage = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const {
    formData,
    formId,
    isFetching,
    isSaving,
    watch,
    setValue,
    onSave,
    fields,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    addOption,
    updateOption,
    deleteOption,
  } = useFormBuilder();

  const name = watch("name") || "";
  const isActive = watch("isActive") ?? false;
  const visibility = watch("visibility") || "PUBLIC";
  const mobileNumbers = watch("mobileNumbers") || [];
  return (
    <div className="flex h-full  overflow-hidden">
      {/* Form Builder Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <FormHeader
          name={name}
          onNameChange={(val) => setValue("name", val)}
          onSave={onSave}
          isSaving={isSaving}
          isSaved={!!formId}
          isSavedId={formId || undefined}
          onSend={() => setIsShareModalOpen(true)}
        />

        {/* Status bar */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3">
          <Label className="text-xs text-gray-500 font-medium">Status</Label>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <span
              className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}
            >
              {isActive ? "Published" : "Draft"}
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
            />
            <Switch
              checked={isActive}
              onCheckedChange={(val) => setValue("isActive", val)}
              className="data-[state=checked]:bg-[#2f328e] h-4 w-7"
            />
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-gray-50 relative">
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            form={{ ...formData, fields }}
            onUpdateVisibility={(v) => setValue("visibility", v)}
            onUpdateMobileNumbers={(nums) => setValue("mobileNumbers", nums)}
          />

          {isFetching && (
            <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#2f328e]" />
                <span className="text-sm font-medium text-gray-600">
                  Loading form...
                </span>
              </div>
            </div>
          )}

          <div className="pb-20">
            <QuestionsTab
              form={{ ...formData, visibility, mobileNumbers, fields }}
              updateName={(val) => setValue("name", val)}
              updateDescription={(val) => setValue("description", val)}
              updateQuestion={updateQuestion}
              deleteQuestion={deleteQuestion}
              duplicateQuestion={duplicateQuestion}
              moveQuestion={moveQuestion}
              addOption={addOption}
              updateOption={updateOption}
              deleteOption={deleteOption}
            />
          </div>
        </main>
      </div>

      {/* Right: Field Type Panel */}
      <FieldTypePanel onAddField={(ft) => addQuestion(undefined, ft)} />
    </div>
  );
};

export default FormBuilderPage;
