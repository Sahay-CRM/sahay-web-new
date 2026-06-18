import { Controller, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import {
  useCreateGanttItem,
  useUpdateGanttItem,
  useUpdateGanttDates,
} from "@/features/api/gantt";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  GanttItemType,
} from "@/types/gantt";
import { PRIORITY_OPTIONS } from "@/pages/gantt/utils/gantt.utils";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  phases: CompanyGanttPhase[];
  parentItemId?: string;
  defaultPhaseId?: string;
  editItem?: CompanyGanttItem;
}

interface FormValues {
  itemName: string;
  itemDescription?: string;
  itemType: string;
  ganttPhaseId?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  priority: string;
}

export default function GanttItemFormModal({
  open,
  onOpenChange,
  workspaceId,
  phases,
  parentItemId,
  defaultPhaseId,
  editItem,
}: Props) {
  const isEdit = !!editItem;
  const createMutation = useCreateGanttItem(workspaceId);
  const updateMutation = useUpdateGanttItem(
    workspaceId,
    editItem?.ganttItemId ?? "",
  );
  const updateDatesMutation = useUpdateGanttDates(workspaceId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      itemName: editItem?.itemName ?? "",
      itemDescription: editItem?.itemDescription ?? "",
      itemType: editItem?.itemType ?? "TASK",
      ganttPhaseId: editItem?.ganttPhaseId ?? defaultPhaseId ?? "",
      plannedStartDate: editItem
        ? format(
            new Date(editItem.actualStartDate || editItem.plannedStartDate),
            "yyyy-MM-dd",
          )
        : format(new Date(), "yyyy-MM-dd"),
      plannedEndDate: editItem
        ? format(
            new Date(editItem.actualEndDate || editItem.plannedEndDate),
            "yyyy-MM-dd",
          )
        : format(new Date(), "yyyy-MM-dd"),
      priority: editItem?.priority ?? "MEDIUM",
    },
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const originalStartStr = editItem
    ? format(
        new Date(editItem.actualStartDate || editItem.plannedStartDate),
        "yyyy-MM-dd",
      )
    : "";
  const minStartDate =
    originalStartStr && originalStartStr < todayStr
      ? originalStartStr
      : todayStr;

  const selectedStartDate = watch("plannedStartDate");

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit) {
      await Promise.all([
        updateMutation.mutateAsync({
          itemName: values.itemName,
          itemDescription: values.itemDescription,
          itemType: values.itemType as GanttItemType,
          priority: values.priority as CompanyGanttItem["priority"],
          ganttPhaseId: values.ganttPhaseId || null,
        }),
        updateDatesMutation.mutateAsync({
          itemId: editItem.ganttItemId,
          payload: {
            plannedStartDate: new Date(values.plannedStartDate).toISOString(),
            plannedEndDate: new Date(values.plannedEndDate).toISOString(),
          },
        }),
      ]);
    } else {
      await createMutation.mutateAsync({
        ganttWorkspaceId: workspaceId,
        ganttPhaseId: values.ganttPhaseId || null,
        parentItemId: parentItemId ?? null,
        itemName: values.itemName,
        itemDescription: values.itemDescription,
        itemType: values.itemType as GanttItemType,
        plannedStartDate: new Date(values.plannedStartDate).toISOString(),
        plannedEndDate: new Date(values.plannedEndDate).toISOString(),
        priority: values.priority as CompanyGanttItem["priority"],
      });
    }
    reset();
    onOpenChange(false);
  });

  const phaseOptions = phases.map((p) => ({
    value: p.ganttPhaseId,
    label: p.phaseName,
  }));

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateDatesMutation.isPending;

  return (
    <ModalData
      isModalOpen={open}
      modalTitle={isEdit ? "Edit Item" : "Add Item"}
      modalClose={() => {
        reset();
        onOpenChange(false);
      }}
      containerClass="max-w-md"
      buttons={[
        {
          btnText: "Cancel",
          buttonCss:
            "py-1.5 px-5 bg-white border border-slate-200 text-black font-semibold hover:bg-slate-50 rounded-lg transition-colors",
          btnClick: () => {
            reset();
            onOpenChange(false);
          },
        },
        {
          btnText: isEdit ? "Update" : "Add Item",
          btnClick: onSubmit,
          isLoading: isPending,
        },
      ]}
    >
      <div className="space-y-4 pt-1">
        <Controller
          name="itemName"
          control={control}
          rules={{ required: "Item name is required" }}
          render={({ field }) => (
            <FormInputField
              {...field}
              label="Item Name"
              placeholder="e.g. Data Gathering"
              isMandatory
              error={errors.itemName}
            />
          )}
        />

        <Controller
          name="itemDescription"
          control={control}
          render={({ field }) => (
            <FormInputField
              {...field}
              label="Description"
              placeholder="Optional"
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="itemType"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Type"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "TASK", label: "Task" },
                  { value: "MILESTONE", label: "Milestone" },
                ]}
              />
            )}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Priority"
                value={field.value}
                onChange={field.onChange}
                options={PRIORITY_OPTIONS}
              />
            )}
          />
        </div>

        {phases.length > 0 && (
          <Controller
            name="ganttPhaseId"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Phase"
                value={field.value ?? ""}
                onChange={field.onChange}
                options={phaseOptions}
                placeholder="Select phase (optional)"
              />
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="plannedStartDate"
            control={control}
            rules={{ required: "Start date is required" }}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="date"
                label="Planned Start"
                isMandatory
                error={errors.plannedStartDate}
                min={minStartDate}
              />
            )}
          />

          <Controller
            name="plannedEndDate"
            control={control}
            rules={{ required: "End date is required" }}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="date"
                label="Planned End"
                isMandatory
                error={errors.plannedEndDate}
                min={selectedStartDate || minStartDate}
              />
            )}
          />
        </div>
      </div>
    </ModalData>
  );
}
