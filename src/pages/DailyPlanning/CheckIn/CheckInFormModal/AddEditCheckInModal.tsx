import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import useAddEditCheckInModal from "./useAddEditCheckInModal";

interface AddEditCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: DailyPlanItem | null;
  onAddTaskClick?: () => void;
  onAddMeetingClick?: () => void;
  items: DailyPlanItem[];
  companyWorkingMinutes: number;
}

export default function AddEditCheckInModal({
  open,
  onOpenChange,
  initialItem,
  onAddTaskClick,
  onAddMeetingClick,
  items,
  companyWorkingMinutes,
}: AddEditCheckInModalProps) {
  const {
    type,
    setType,
    setTitle,
    setSearch,
    selectedRefId,
    setSelectedRefId,
    estimatedHours,
    setEstimatedHours,
    estimatedMinutes,
    setEstimatedMinutes,
    remarks,
    setRemarks,
    errors,
    setErrors,
    refOptions,
    typeOptions,
    handleSubmit,
    handleModalClose,
    isPending,
    isInputOvertime,
  } = useAddEditCheckInModal({
    open,
    onOpenChange,
    initialItem,
    items,
    companyWorkingMinutes,
  });

  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <ModalData
      isModalOpen={open}
      modalTitle={initialItem ? "Edit Planning Item" : "Add Planning Item"}
      modalClose={handleModalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss:
            "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50",
          btnClick: handleModalClose,
        },
        {
          btnText: initialItem ? "Update" : "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit,
          isLoading: isPending,
        },
      ]}
    >
      <div className="space-y-4">
        {/* Type Select */}
        <div>
          <FormSelect
            label="Type"
            value={type}
            onChange={(val) => {
              setType((Array.isArray(val) ? val[0] : val) as DailyPlanItemType);
              setSelectedRefId("");
              setTitle("");
              setSearch("");
            }}
            options={typeOptions}
            isMandatory
            placeholder="Select Type"
            disabled={!!initialItem}
          />
        </div>

        {/* Select Task or Meeting Field */}
        <div>
          <div className="flex justify-between items-center w-full mb-1.5">
           
            <FormLabel>
              Select {type === "TASK" ? "Task" : "Meeting"} <span className="text-red-500">*</span>
              </FormLabel>
            {!initialItem && (
              type === "TASK" ? (
                <button
                  type="button"
                  onClick={onAddTaskClick}
                  className="text-xs font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
                >
                  + Add Task
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onAddMeetingClick}
                  className="text-xs font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
                >
                  + Add Meeting
                </button>
              )
            )}
          </div>
          <SearchDropdown
            options={refOptions}
            selectedValues={selectedRefId ? [selectedRefId] : []}
            onSearchChange={setSearch}
            onSelect={(item) => {
              setSelectedRefId(item.value);
              setTitle(item.label);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder={
              type === "TASK"
                ? "Select or search task..."
                : "Select or search meeting..."
            }
            disabled={!!initialItem}
            error={errors.title ? { message: errors.title } : undefined}
          />
        </div>
        {errors.title && (
          <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] block mt-1">
            {errors.title}
          </span>
        )}

 

        {/* Estimated Time (Hours & Minutes inline) */}
        <div className="space-y-1">
         
          <div className="grid grid-cols-2 gap-4 mt-1">
            <FormInputField
              id="estimatedHours"
              type="number"
              min={0}
              value={estimatedHours}
              onChange={(e) => {
                setEstimatedHours(e.target.value);
                setErrors((prev) => ({ ...prev, estimatedTime: undefined }));
              }}
              label="Estimated Hours"
              placeholder="0"
            />
            <FormInputField
              id="estimatedMinutes"
              type="number"
              min={0}
              max={59}
              value={estimatedMinutes}
              onChange={(e) => {
                setEstimatedMinutes(e.target.value);
                setErrors((prev) => ({ ...prev, estimatedTime: undefined }));
              }}
              label="Estimated Minutes"
              placeholder="0"
            />
          </div>
          {errors.estimatedTime && (
            <span className="text-red-600 text-[calc(1em-1px)] block mt-1">
              {errors.estimatedTime}
            </span>
          )}
        </div>

        {isInputOvertime && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2.5 shadow-2xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Overtime Warning:</strong> Your total planned time exceeds the company's working hours. You are planning overtime.
            </span>
          </div>
        )}

        {/* Remarks */}
        <FormItem>
          <FormLabel>Remarks</FormLabel>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add optional remarks..."
            rows={3}
            className="text-sm resize-none mt-1"
          />
        </FormItem>
      </div>
    </ModalData>
  );
}
