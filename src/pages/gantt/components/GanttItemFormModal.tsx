import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { useCreateGanttItem, useUpdateGanttItem } from "@/features/api/gantt";
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      itemName: editItem?.itemName ?? "",
      itemDescription: editItem?.itemDescription ?? "",
      itemType: editItem?.itemType ?? "TASK",
      ganttPhaseId: editItem?.ganttPhaseId ?? defaultPhaseId ?? "",
      plannedStartDate: editItem?.plannedStartDate
        ? new Date(editItem.plannedStartDate).toISOString().slice(0, 10)
        : format(new Date(), "yyyy-MM-dd"),
      plannedEndDate: editItem?.plannedEndDate
        ? new Date(editItem.plannedEndDate).toISOString().slice(0, 10)
        : format(new Date(), "yyyy-MM-dd"),
      priority: editItem?.priority ?? "MEDIUM",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit) {
      await updateMutation.mutateAsync({
        itemName: values.itemName,
        itemDescription: values.itemDescription,
        itemType: values.itemType as GanttItemType,
        priority: values.priority as CompanyGanttItem["priority"],
        ganttPhaseId: values.ganttPhaseId || null,
      });
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
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

          {!isEdit && (
            <>
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
                  />
                )}
              />
            </>
          )}

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
