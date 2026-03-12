import { useEffect, useState } from "react";
import { FormHeader } from "./components/Header";
import { QuestionsTab } from "./components/QuestionsTab";
import { ShareModal } from "./components/ShareModal";
import { FieldTypePanel } from "./components/FieldTypePanel";
import { PublishModal } from "./components/PublishModal";
import { Loader2 } from "lucide-react";
import useFormBuilder from "./hooks/useFormBuilder";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

const FormBuilderPage = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const {
    formData,
    formId,
    isFetching,
    isSaving,
    watch,
    setValue,
    onSave,
    triedSaving,
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
  const { setBreadcrumbs } = useBreadcrumbs();
  const name = watch("name") || "";
  const isActive = watch("isActive") ?? false;
  const visibility = watch("visibility") || "PUBLIC";
  const mobileNumbers = watch("mobileNumbers") || [];

  useEffect(() => {
    setBreadcrumbs([
      { label: "Forms", href: "/dashboard/forms" },
      { label: "Forms Field Manage", href: "" },
    ]);
  }, [setBreadcrumbs]);
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
          isActive={isActive}
          formId={formId || undefined}
          onToggleStatus={async () => {
            if (!isActive) {
              // Opening the publish modal when moving from Draft -> Published
              setIsPublishModalOpen(true);
            } else {
              // Directly move back to Draft if currently Published
              setValue("isActive", false);
              await onSave();
            }
          }}
        />

        <main className="flex-1 overflow-auto bg-gray-50 relative">
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            form={{ ...formData, fields }}
            onUpdateVisibility={(v) => setValue("visibility", v)}
            onUpdateMobileNumbers={(nums) => setValue("mobileNumbers", nums)}
          />

          <PublishModal
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
            expireDate={watch("expireDate")}
            onExpireDateChange={(date) => setValue("expireDate", date)}
            isPublishing={isSaving}
            onConfirm={async () => {
              setValue("isActive", true);
              await onSave();
              setIsPublishModalOpen(false);
              setIsShareModalOpen(true);
            }}
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
              triedSaving={triedSaving}
            />
          </div>
        </main>
      </div>

      {/* Right: Field Type Panel */}
      <FieldTypePanel
        onAddField={(ft) => addQuestion(undefined, ft)}
        responseMessage={watch("responseMessage")}
        onResponseMessageChange={(val) => setValue("responseMessage", val)}
      />
    </div>
  );
};

export default FormBuilderPage;
