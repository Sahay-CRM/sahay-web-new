import { Controller, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import SearchDropdown from "@/components/shared/Form/SearchDropdown/searchDropdown";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
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

const parseAssignees = (val?: unknown): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return (val as unknown[]).map(String);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        // fallback
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

interface Employee {
  employeeId: string;
  employeeName: string;
}

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
  color: string;
  assignedToEmployeeId: string[];
  lagDays: number | string;
  bufferDays: number | string;
  cascadeDelayDays: number | string;
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
      color: editItem?.color ?? "#1e9ebe",
      assignedToEmployeeId: editItem?.assignedToEmployeeId
        ? parseAssignees(editItem.assignedToEmployeeId)
        : [],
      lagDays: editItem ? (editItem.lagDays || "") : "",
      bufferDays: editItem ? (editItem.bufferDays || "") : "",
      cascadeDelayDays: editItem ? (editItem.cascadeDelayDays || "") : "",
    },
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employee-dd-all"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: Employee[] }>({
        url: Urls.getAllEmployeeDd(),
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: open,
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
          color: values.color,
          assignedToEmployeeId: values.assignedToEmployeeId.length > 0 ? values.assignedToEmployeeId : null,
          lagDays: values.lagDays !== "" && values.lagDays !== undefined && values.lagDays !== null ? Number(values.lagDays) : undefined,
          bufferDays: values.bufferDays !== "" && values.bufferDays !== undefined && values.bufferDays !== null ? Number(values.bufferDays) : undefined,
          cascadeDelayDays: values.cascadeDelayDays !== "" && values.cascadeDelayDays !== undefined && values.cascadeDelayDays !== null ? Number(values.cascadeDelayDays) : undefined,
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
        color: values.color,
        assignedToEmployeeId: values.assignedToEmployeeId.length > 0 ? values.assignedToEmployeeId : null,
        lagDays: values.lagDays !== "" && values.lagDays !== undefined && values.lagDays !== null ? Number(values.lagDays) : undefined,
        bufferDays: values.bufferDays !== "" && values.bufferDays !== undefined && values.bufferDays !== null ? Number(values.bufferDays) : undefined,
        cascadeDelayDays: values.cascadeDelayDays !== "" && values.cascadeDelayDays !== undefined && values.cascadeDelayDays !== null ? Number(values.cascadeDelayDays) : undefined,
      });
    }
    reset();
    onOpenChange(false);
  });

  const phaseOptions = phases.map((p) => ({
    value: p.ganttPhaseId,
    label: p.phaseName,
  }));

  const selectedAssigneeIds = watch("assignedToEmployeeId") || [];
  const selectedAssignees = (employees ?? []).filter((emp) =>
    selectedAssigneeIds.includes(emp.employeeId),
  );

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
      containerClass="min-w-[40%] max-h-[85vh]"
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
        {/* Task Name & Description */}
        <div className="grid grid-cols-2 gap-4">
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
                placeholder="Optional Description"
              />
            )}
          />
        </div>

        {/* Start & End Date */}
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

        {/* Type, Priority, Phase */}
        <div className="grid grid-cols-3 gap-4">
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

          {phases.length > 0 ? (
            <Controller
              name="ganttPhaseId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Phase"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={phaseOptions}
                  placeholder="Select phase"
                />
              )}
            />
          ) : (
            <div />
          )}
        </div>

        {/* Assignees and Avatar Initials Row */}
        <div className="flex items-end gap-4 pt-1 w-full">
          <div className="w-[45%] shrink-0">
            <Controller
              name="assignedToEmployeeId"
              control={control}
              render={({ field }) => (
                <SearchDropdown
                  label="Assignees"
                  selectedValues={field.value || []}
                  onSelect={(item) => {
                    const employeeId = item.value;
                    const prev = field.value || [];
                    if (prev.includes(employeeId)) {
                      field.onChange(prev.filter((id) => id !== employeeId));
                    } else {
                      field.onChange([...prev, employeeId]);
                    }
                  }}
                  options={(employees ?? []).map((emp) => ({
                    value: emp.employeeId,
                    label: emp.employeeName,
                  }))}
                  multiSelect={true}
                  placeholder={employeesLoading ? "Loading..." : "Select employees..."}
                  isSearchable={true}
                  isCrossShow={false}
                />
              )}
            />
          </div>
          {selectedAssignees.length > 0 && (
            <TooltipProvider delayDuration={100}>
              <div className="flex-1 flex -space-x-2 overflow-hidden pb-1 items-center min-w-0">
                {selectedAssignees.length <= 10 ? (
                  selectedAssignees.map((emp) => (
                    <Tooltip key={emp.employeeId}>
                      <TooltipTrigger asChild>
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-primary text-xs font-bold ring-offset-background cursor-help shrink-0">
                          {getInitials(emp.employeeName)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-white border-slate-900 shadow-md">
                        <p className="text-xs font-medium">{emp.employeeName}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <>
                    {selectedAssignees.slice(0, 9).map((emp) => (
                      <Tooltip key={emp.employeeId}>
                        <TooltipTrigger asChild>
                          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-primary text-xs font-bold ring-offset-background cursor-help shrink-0">
                            {getInitials(emp.employeeName)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border-slate-900 shadow-md">
                          <p className="text-xs font-medium">{emp.employeeName}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 text-xs font-bold ring-offset-background cursor-help shrink-0">
                          +{selectedAssignees.length - 9}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-white border-slate-900 shadow-md p-2.5 max-h-60 overflow-y-auto z-[99999]">
                        <div className="space-y-1">
                          <p className="text-xs font-bold border-b border-slate-700/60 pb-1 mb-1">Remaining Assignees:</p>
                          {selectedAssignees.slice(9).map((emp) => (
                            <p key={emp.employeeId} className="text-xs font-medium">
                              • {emp.employeeName}
                            </p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>

        {/* Color and Lag, Buffer, Cascade Delay Days Row */}
        <div className="grid grid-cols-4 gap-4 items-end">
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full h-10 px-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none bg-white text-slate-800"
                    placeholder="#HEX"
                  />
                </div>
              </div>
            )}
          />

          <Controller
            name="lagDays"
            control={control}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="number"
                label="Lag (Days)"
                placeholder="0"
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />

          <Controller
            name="bufferDays"
            control={control}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="number"
                label="Buffer (Days)"
                placeholder="0"
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />

          <Controller
            name="cascadeDelayDays"
            control={control}
            render={({ field }) => (
              <FormInputField
                {...field}
                type="number"
                label="Cascade Delay Days"
                placeholder="0"
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </div>
      </div>
    </ModalData>
  );
}
