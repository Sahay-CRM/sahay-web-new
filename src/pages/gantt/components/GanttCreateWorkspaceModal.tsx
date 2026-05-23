import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useCreateWorkspaceFromTemplate } from "@/features/api/gantt";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templateId: string;
  templateName: string;
}

interface FormValues {
  workspaceName: string;
  workspaceDescription?: string;
  startDate: string;
  targetEndDate?: string;
}

export default function GanttCreateWorkspaceModal({
  open,
  onOpenChange,
  templateId,
  templateName,
}: Props) {
  const navigate = useNavigate();
  const mutation = useCreateWorkspaceFromTemplate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      workspaceName: "",
      workspaceDescription: "",
      startDate: new Date().toISOString().slice(0, 10),
      targetEndDate: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await mutation.mutateAsync({
      templateId,
      workspaceName: values.workspaceName,
      workspaceDescription: values.workspaceDescription,
      startDate: new Date(values.startDate).toISOString(),
      targetEndDate: values.targetEndDate
        ? new Date(values.targetEndDate).toISOString()
        : undefined,
    });
    reset();
    onOpenChange(false);
    navigate(`/dashboard/gantt/workspaces/${res.data.ganttWorkspaceId}`);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Workspace from Template</DialogTitle>
          <DialogDescription>
            Generating workspace from &quot;{templateName}&quot;. All phases,
            items and dependencies will be copied with real calendar dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Controller
            name="workspaceName"
            control={control}
            rules={{ required: "Workspace name is required" }}
            render={({ field }) => (
              <FormInputField
                {...field}
                label="Workspace Name"
                placeholder="e.g. Q3 Consulting Engagement"
                isMandatory
                error={errors.workspaceName}
              />
            )}
          />

          <Controller
            name="workspaceDescription"
            control={control}
            render={({ field }) => (
              <FormInputField
                {...field}
                label="Description"
                placeholder="Optional description"
              />
            )}
          />

          <Controller
            name="startDate"
            control={control}
            rules={{ required: "Start date is required" }}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="date"
                label="Start Date"
                isMandatory
                error={errors.startDate}
              />
            )}
          />

          <Controller
            name="targetEndDate"
            control={control}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="date"
                label="Target End Date"
                placeholder="Optional"
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Generating..." : "Generate Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
