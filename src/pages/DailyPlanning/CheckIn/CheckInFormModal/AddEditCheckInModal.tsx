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
}

export default function AddEditCheckInModal({
  open,
  onOpenChange,
  initialItem,
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
  } = useAddEditCheckInModal({ open, onOpenChange, initialItem });

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
              setSearch("");
            }}
            options={typeOptions}
            isMandatory
            placeholder="Select Type"
            disabled={!!initialItem}
          />
        </div>

        <div>
          <SearchDropdown
            options={refOptions}
            selectedValues={selectedRefId ? [selectedRefId] : []}
            onSearchChange={setSearch}
            onSelect={(item) => {
              setSelectedRefId(item.value);
              setTitle(item.label);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            label={`Select ${type === "TASK" ? "Task" : "Meeting"} `}
            isMandatory
            placeholder={
              type === "TASK"
                ? "Select or search task..."
                : "Select or search meeting..."
            }
            disabled={!!initialItem}
            error={errors.title ? { message: errors.title } : undefined}
          />
        </div>

        {/* Estimated Time (Hours & Minutes) */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            </div>
            <div>
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
          </div>
          {errors.estimatedTime && (
            <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] block mt-1">
              {errors.estimatedTime}
            </span>
          )}
        </div>

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
