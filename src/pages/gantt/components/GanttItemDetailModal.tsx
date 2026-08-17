/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import ModalData from "@/components/shared/Modal/ModalData";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { Label } from "@/components/ui/label";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import SearchDropdown from "@/components/shared/Form/SearchDropdown/searchDropdown";
import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { Trash2, Diamond, SquareCheck, Plus, Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
  GanttDependencyType,
  GanttItemStatus,
  GanttItemPriority,
  UpdateGanttItemRequest,
} from "@/types/gantt";
import {
  fmtDate,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  getInitials,
} from "@/pages/gantt/utils/gantt.utils";
import {
  useDeleteGanttItem,
  useCreateGanttDependency,
  useDeleteGanttDependency,
  useUpdateGanttProgress,
  useAssignGanttItem,
  useUpdateGanttItem,
  useUpdateGanttDates,
} from "@/features/api/gantt";
import { toast } from "sonner";
//

const parseAssignees = (val?: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // fallback
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CompanyGanttItem;
  workspaceId: string;
  phases: CompanyGanttPhase[];
  itemsTree?: CompanyGanttItem[];
  dependencies?: CompanyGanttDependency[];
}

interface Employee {
  employeeId: string;
  employeeName: string;
  designation?: string;
}

function flattenItems(items: CompanyGanttItem[]): CompanyGanttItem[] {
  const result: CompanyGanttItem[] = [];
  const walk = (list: CompanyGanttItem[]) => {
    for (const item of list) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items || []);
  return result;
}

function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export default function GanttItemDetailModal({
  open,
  onOpenChange,
  item,
  workspaceId,
  phases = [],
  itemsTree = [],
  dependencies = [],
}: Props) {
  const userData = useSelector(getUserDetail);
  const isEmployee = userData?.employeeType === "EMPLOYEE";
  const assignedIds = parseAssignees(item.assignedToEmployeeId);
  const isAssignedToMe = assignedIds.includes(userData?.employeeId ?? "");
  const canEdit = !isEmployee || isAssignedToMe;

  const [activeTab, setActiveTab] = useState<
    "general" | "progress" | "dependency" | "assign"
  >("general");
  //
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Inline forms state
  const [progressVal, setProgressVal] = useState(item.progressPercentage);
  const [statusVal, setStatusVal] = useState(item.itemStatus);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(() =>
    parseAssignees(item.assignedToEmployeeId)
  );

  // General tab edit state
  const [nameVal, setNameVal] = useState(item.itemName);
  const [descVal, setDescVal] = useState(item.itemDescription ?? "");
  const [startDateVal, setStartDateVal] = useState(() => {
    const currentStart = item.actualStartDate || item.plannedStartDate;
    return currentStart ? format(new Date(currentStart), "yyyy-MM-dd") : "";
  });
  const [endDateVal, setEndDateVal] = useState(() => {
    const currentEnd = item.actualEndDate || item.plannedEndDate;
    return currentEnd ? format(new Date(currentEnd), "yyyy-MM-dd") : "";
  });
  const [priorityVal, setPriorityVal] = useState(item.priority);
  const [colorVal, setColorVal] = useState(item.color ?? "#1e9ebe");
  const [phaseIdVal, setPhaseIdVal] = useState(item.ganttPhaseId ?? "");
  const [lagDaysVal, setLagDaysVal] = useState<string | number>(item.lagDays || "");
  const [bufferDaysVal, setBufferDaysVal] = useState<string | number>(item.bufferDays || "");
  const [cascadeDelayDaysVal, setCascadeDelayDaysVal] = useState<string | number>(item.cascadeDelayDays || "");

  // Sync state when item or open state changes
  useEffect(() => {
    setProgressVal(item.progressPercentage);
    setStatusVal(item.itemStatus);
    setSelectedAssigneeIds(parseAssignees(item.assignedToEmployeeId));
    setNameVal(item.itemName);
    setDescVal(item.itemDescription ?? "");

    const currentStart = item.actualStartDate || item.plannedStartDate;
    setStartDateVal(
      currentStart ? format(new Date(currentStart), "yyyy-MM-dd") : "",
    );

    const currentEnd = item.actualEndDate || item.plannedEndDate;
    setEndDateVal(currentEnd ? format(new Date(currentEnd), "yyyy-MM-dd") : "");

    setPriorityVal(item.priority);
    setColorVal(item.color ?? "#1e9ebe");
    setPhaseIdVal(item.ganttPhaseId ?? "");
    setLagDaysVal(item.lagDays || "");
    setBufferDaysVal(item.bufferDays || "");
    setCascadeDelayDaysVal(item.cascadeDelayDays || "");
    setHasInitializedDeps(false);
    setValidationErrors([]);
  }, [item.actualEndDate, item.actualStartDate, item.assignedToEmployeeId, item.color, item.ganttItemId, item.ganttPhaseId, item.itemDescription, item.itemName, item.itemStatus, item.plannedEndDate, item.plannedStartDate, item.priority, item.progressPercentage, item.lagDays, item.bufferDays, item.cascadeDelayDays, open]);

  // Dependency states – multi-row pending
  interface PendingDep {
    id: string;
    predId: string;
    depType: GanttDependencyType;
    lagDays: number;
    isExisting?: boolean;
  }
  const [pendingDeps, setPendingDeps] = useState<PendingDep[]>([
    { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
  ]);
  const [initialDeps, setInitialDeps] = useState<PendingDep[]>([]);
  const [hasInitializedDeps, setHasInitializedDeps] = useState(false);
  const [isSavingDeps, setIsSavingDeps] = useState(false);
  // State for storing API validation errors
  const [validationErrors, setValidationErrors] = useState<Array<{
    dependencyId?: string;
    predecessorTaskId?: string;
    successorTaskId?: string;
    dependencyType?: string;
    errorCode?: string;
    message?: string;
    expectedDate?: string;
    actualDate?: string;
  }>>([]);

  useEffect(() => {
    if (open && activeTab === "dependency" && !hasInitializedDeps) {
      const preds = dependencies.filter((d) => d.successorItemId === item.ganttItemId);
      const initial = preds.map((dep) => ({
        id: dep.ganttDependencyId,
        predId: dep.predecessorItemId,
        depType: dep.dependencyType,
        lagDays: dep.lagDays || 0,
        isExisting: true,
      }));
      setInitialDeps(initial);
      if (initial.length > 0) {
        setPendingDeps(initial);
      } else {
        setPendingDeps([
          { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
        ]);
      }
      setHasInitializedDeps(true);
    }
  }, [open, activeTab, dependencies, item.ganttItemId, hasInitializedDeps]);

  const deleteMutation = useDeleteGanttItem(workspaceId);
  const createDepMutation = useCreateGanttDependency(workspaceId);
  const deleteDepMutation = useDeleteGanttDependency(workspaceId);
  const progressMutation = useUpdateGanttProgress(workspaceId);
  const assignMutation = useAssignGanttItem(workspaceId);
  const updateMutation = useUpdateGanttItem(workspaceId, item.ganttItemId);
  const updateDatesMutation = useUpdateGanttDates(workspaceId);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialStart = item.actualStartDate || item.plannedStartDate;
      const initialStartStr = initialStart ? format(new Date(initialStart), "yyyy-MM-dd") : "";

      const initialEnd = item.actualEndDate || item.plannedEndDate;
      const initialEndStr = initialEnd ? format(new Date(initialEnd), "yyyy-MM-dd") : "";

      const payload: UpdateGanttItemRequest = {
        itemName: nameVal,
        itemDescription: descVal || undefined,
        priority: priorityVal,
        color: colorVal,
        ganttPhaseId: phaseIdVal || null,
        lagDays: lagDaysVal !== "" && lagDaysVal !== undefined && lagDaysVal !== null ? Number(lagDaysVal) : undefined,
        bufferDays: bufferDaysVal !== "" && bufferDaysVal !== undefined && bufferDaysVal !== null ? Number(bufferDaysVal) : undefined,
        cascadeDelayDays: cascadeDelayDaysVal !== "" && cascadeDelayDaysVal !== undefined && cascadeDelayDaysVal !== null ? Number(cascadeDelayDaysVal) : undefined,
      };

      if (startDateVal !== initialStartStr) {
        payload.actualStartDate = new Date(startDateVal).toISOString();
      }
      if (endDateVal !== initialEndStr) {
        payload.actualEndDate = new Date(endDateVal).toISOString();
      }

      await Promise.all([
        updateMutation.mutateAsync(payload),
        progressMutation.mutateAsync({
          itemId: item.ganttItemId,
          payload: {
            progressPercentage: progressVal,
            itemStatus: statusVal,
          },
        }),
        assignMutation.mutateAsync({
          itemId: item.ganttItemId,
          payload: {
            assignedToEmployeeId: selectedAssigneeIds.length > 0 ? selectedAssigneeIds : null,
          },
        }),
      ]);
      onOpenChange(false);
    } catch {
      // Handled by mutation hook toasts
    }
  };

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

  const selectedAssignees = selectedAssigneeIds.map((id) => {
    const foundInDd = (employees ?? []).find((e) => e.employeeId === id);
    if (foundInDd) return foundInDd;

    const assignedArray = Array.isArray(item.assignedEmployee)
      ? item.assignedEmployee
      : item.assignedEmployee
        ? [item.assignedEmployee]
        : [];
    const foundInItem = assignedArray.find((e) => e?.employeeId === id);
    if (foundInItem) {
      return {
        employeeId: foundInItem.employeeId,
        employeeName: foundInItem.employeeName ?? "Unknown",
      };
    }

    return {
      employeeId: id,
      employeeName: "Loading...",
    };
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(item.ganttItemId);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const handleProgressChange = (newVal: number) => {
    setProgressVal(newVal);
    if (newVal === 100 && statusVal !== "COMPLETED") {
      setStatusVal("COMPLETED");
    } else if (newVal > 0 && newVal < 100 && statusVal === "NOT_STARTED") {
      setStatusVal("IN_PROGRESS");
    }
  };

  const handleStatusChange = (newVal: GanttItemStatus) => {
    setStatusVal(newVal);
    if (newVal === "COMPLETED") {
      setProgressVal(100);
    } else if (newVal === "NOT_STARTED") {
      setProgressVal(0);
    }
  };

  const handleAddDependencies = async () => {
    try {
      setIsSavingDeps(true);

      const flatItems = flattenItems(itemsTree);
      const tasksPayload = flatItems.map((i) => ({
        ganttItemId: i.ganttItemId,
      }));

      const otherDeps = (dependencies || [])
        .filter((d) => d.successorItemId !== item.ganttItemId)
        .map((d) => ({
          ganttDependencyId: d.ganttDependencyId,
          predecessorItemId: d.predecessorItemId,
          successorItemId: d.successorItemId,
          dependencyType: d.dependencyType,
          lagDays: Number(d.lagDays) || 0,
          bufferDays: Number(d.bufferDays) || 0,
        }));

      const modalProposedDeps = pendingDeps
        .filter((p) => p.predId)
        .map((p) => ({
          ganttDependencyId: p.id,
          predecessorItemId: p.predId,
          successorItemId: item.ganttItemId,
          dependencyType: p.depType,
          lagDays: Number(p.lagDays) || 0,
          bufferDays: 0,
        }));

      const proposedDependencies = [...otherDeps, ...modalProposedDeps];

      const valResponse = await Api.post<{
        success: boolean;
        message?: string;
        data?: {
          valid: boolean;
          validations: Array<{
            dependencyId?: string;
            predecessorTaskId?: string;
            successorTaskId?: string;
            dependencyType?: string;
            errorCode?: string;
            message?: string;
            expectedDate?: string;
            actualDate?: string;
          }>;
        };
      }>({
        url: Urls.ganttDependencyValidate(),
        data: {
          ganttWorkspaceId: workspaceId,
          tasks: tasksPayload,
          dependencies: proposedDependencies,
        },
      });

      if (valResponse.data?.data && !valResponse.data.data.valid) {
        const errors = valResponse.data.data.validations || [];
        setValidationErrors(errors);
        if (errors.length > 0) {
          toast.error("Dependency validation failed. Please resolve conflicts.");
        } else {
          toast.error(valResponse.data.message || "Dependency validation failed.");
        }
        setIsSavingDeps(false);
        return;
      }

      // 1. Identify modified rows
      const modifiedDeps = pendingDeps.filter((curr) => {
        if (!curr.isExisting) return false;
        const init = initialDeps.find((i) => i.id === curr.id);
        if (!init) return false;
        return (
          curr.predId !== init.predId ||
          curr.depType !== init.depType ||
          curr.lagDays !== init.lagDays
        );
      });

      // 2. For modified existing rows, delete the old ones
      const modifiedDeletePromises = modifiedDeps.map((curr) =>
        deleteDepMutation.mutateAsync(curr.id)
      );

      // 3. Create new rows and recreated modified rows
      const newCreatePromises = pendingDeps
        .filter((r) => r.predId && (!r.isExisting || modifiedDeps.some((m) => m.id === r.id)))
        .map((r) =>
          createDepMutation.mutateAsync({
            ganttWorkspaceId: workspaceId,
            predecessorItemId: r.predId,
            successorItemId: item.ganttItemId,
            dependencyType: r.depType,
            lagDays: Number(r.lagDays) || 0,
          })
        );

      await Promise.all([
        ...modifiedDeletePromises,
        ...newCreatePromises,
      ]);

      setIsSavingDeps(false);
      onOpenChange(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to validate dependencies.";
      toast.error(errMsg);
      setIsSavingDeps(false);
    }
  };

  const updatePendingRow = (id: string, patch: Partial<PendingDep>) => {
    setPendingDeps((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
    setValidationErrors([]);
  };

  const addPendingRow = () => {
    setPendingDeps((prev) => [
      ...prev,
      { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
    ]);
    setValidationErrors([]);
  };

  const removePendingRow = (id: string) => {
    setPendingDeps((prev) => prev.filter((r) => r.id !== id));
    setValidationErrors([]);
  };

  const isMilestone = item.itemType === "MILESTONE" || item.isMilestone;

  // Process dependencies
  const flatItems = flattenItems(itemsTree);

  const successors = dependencies.filter(
    (d) => d.predecessorItemId === item.ganttItemId,
  );

  // Candidate predecessors: not current task, not already a successor
  const candidates = flatItems.filter(
    (i) =>
      i.ganttItemId !== item.ganttItemId &&
      !successors.some((s) => s.successorItemId === i.ganttItemId),
  );

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const originalStart = item.actualStartDate || item.plannedStartDate;
  const originalStartStr = originalStart
    ? format(new Date(originalStart), "yyyy-MM-dd")
    : "";
  const minStartDate =
    originalStartStr && originalStartStr < todayStr
      ? originalStartStr
      : todayStr;

  const modalButtons: any[] = [];
  if (canEdit) {
    if (activeTab === "general") {
      modalButtons.push(
        {
          btnText: "Delete Task",
          btnClick: () => setConfirmDelete(true),
          buttonCss: "mr-auto bg-red-700 border-red-700 text-white hover:bg-red-650 hover:bg-red-600/90",
        },
        {
          btnText: "Save Details",
          btnClick: () => {
            const form = document.getElementById("general-form") as HTMLFormElement;
            if (form) {
              form.requestSubmit();
            }
          },
          isLoading:
            updateMutation.isPending ||
            updateDatesMutation.isPending ||
            progressMutation.isPending ||
            assignMutation.isPending,
        }
      );
    } else if (activeTab === "dependency") {
      modalButtons.push({
        btnText: "Save Dependencies",
        btnClick: () => {
          handleAddDependencies();
        },
        isLoading: isSavingDeps || createDepMutation.isPending,
        buttonCss: isSavingDeps ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
      });
    }
  }

  return (
    <>
      <ModalData
        isModalOpen={open}
        modalTitle={item.itemName}
        modalClose={() => onOpenChange(false)}
        containerClass="min-w-[40%] h-[880px] max-h-[85vh]"
        buttons={modalButtons}
      >
        <div className="flex-1 flex flex-col">
          {/* Subtitle / Header details */}
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 font-medium">
            {isMilestone ? (
              <span className="flex items-center gap-1 text-pink-600 font-semibold">
                <Diamond className="h-3.5 w-3.5 shrink-0" />
                Milestone
              </span>
            ) : (
              <span className="flex items-center gap-1 text-primary font-semibold">
                <SquareCheck className="h-3.5 w-3.5 shrink-0" />
                Standard Task
              </span>
            )}
            <span className="text-slate-350 font-light">•</span>
            <span className="text-slate-500">
              Planned: {fmtDate(item.plannedStartDate)} –{" "}
              {fmtDate(item.plannedEndDate)}
            </span>
          </div>

          {/* Tab switcher buttons - minimalist line style */}
          <div className="flex border-b border-slate-100 mb-6 gap-8">
            {[
              { id: "general" as const, label: "General" },
              { id: "dependency" as const, label: "Dependency" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setValidationErrors([]);
                  }}
                  className={`pb-3 text-[14px] font-semibold relative transition-all duration-200 border-b-2 -mb-[2px] ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto pr-0.5">
            {/* ── GENERAL TAB ── */}
            {activeTab === "general" && (
              <form
                id="general-form"
                onSubmit={handleGeneralSubmit}
                className="space-y-4 pt-1"
              >
                {/* Task Name & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInputField
                    label="Task Name"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Task Name"
                    required
                    disabled={!canEdit}
                  />

                  <FormInputField
                    label="Description"
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    placeholder="Optional Description"
                    disabled={!canEdit}
                  />
                </div>

                {/* Start & End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInputField
                    type="date"
                    label="Start Date"
                    value={startDateVal}
                    onChange={(e) => setStartDateVal(e.target.value)}
                    required
                    min={minStartDate}
                    disabled={!canEdit}
                  />
                  <FormInputField
                    type="date"
                    label="End Date"
                    value={endDateVal}
                    onChange={(e) => setEndDateVal(e.target.value)}
                    required
                    min={startDateVal || minStartDate}
                    disabled={!canEdit}
                  />
                </div>
                             {/* Phase Selection, Priority, and Color Picker */}
                <div className="grid grid-cols-3 gap-4 items-end">
                  {phases.length > 0 ? (
                    <div className="space-y-1">
                      <FormSelect
                        label="Phase"
                        value={phaseIdVal}
                        onChange={(val) =>
                          setPhaseIdVal(
                            (Array.isArray(val) ? val[0] : val) ?? ""
                          )
                        }
                        options={phases.map((p) => ({
                          value: p.ganttPhaseId,
                          label: p.phaseName,
                        }))}
                        placeholder="Select phase"
                        labelClass="text-md font-semibold text-slate-800 mb-1.5 block"
                        triggerClassName="h-10 rounded-lg border-slate-200 text-md"
                        disabled={!canEdit}
                      />
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="space-y-1">
                    <FormSelect
                      label="Priority"
                      value={priorityVal}
                      onChange={(val) =>
                        setPriorityVal(
                          (Array.isArray(val)
                            ? val[0]
                            : val) as GanttItemPriority,
                        )
                      }
                      options={PRIORITY_OPTIONS}
                      labelClass="text-md font-semibold text-slate-800 mb-1.5 block"
                      triggerClassName="h-10 rounded-lg border-slate-200 text-md"
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                      Color
                    </Label>
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="color"
                        value={colorVal}
                        onChange={(e) => setColorVal(e.target.value)}
                        className="w-10 h-10 p-0 border border-slate-300 rounded-lg cursor-pointer overflow-hidden shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                        disabled={!canEdit}
                      />
                      <input
                        type="text"
                        value={colorVal}
                        onChange={(e) => setColorVal(e.target.value)}
                        className="w-24 h-10 px-2.5 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-slate-800"
                        disabled={!canEdit}
                        placeholder="#HEX"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignees and Avatar Initials Row */}
                <div className="flex items-end gap-4 pt-1 w-full">
                  <div className="w-[45%] shrink-0">
                    {canEdit && (
                      employeesLoading ? (
                        <div className="flex justify-center py-2 text-primary">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <SearchDropdown
                          label="Assignees"
                          selectedValues={selectedAssigneeIds}
                          onSelect={(item) => {
                            const employeeId = item.value;
                            if (selectedAssigneeIds.includes(employeeId)) {
                              setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== employeeId));
                            } else {
                              setSelectedAssigneeIds([...selectedAssigneeIds, employeeId]);
                            }
                          }}
                          options={(employees ?? []).map((emp) => ({
                            value: emp.employeeId,
                            label: emp.employeeName,
                          }))}
                          multiSelect={true}
                          placeholder="Select employees..."
                          isSearchable={true}
                          isCrossShow={false}
                         />
                      )
                    )}
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

                {/* Progress and Status Row */}
                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  {!isMilestone ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <Label className="text-md font-semibold text-slate-800">
                          Progress Percentage ({progressVal}%)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleProgressChange(Math.max(0, progressVal - 1))}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold shrink-0 transition-colors animate-none"
                          disabled={!canEdit}
                        >
                          –
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={progressVal}
                          onChange={(e) => handleProgressChange(Number(e.target.value))}
                          className="flex-1 h-1.5 accent-primary cursor-pointer rounded-lg appearance-none bg-slate-200"
                          disabled={!canEdit}
                        />
                        <button
                          type="button"
                          onClick={() => handleProgressChange(Math.min(100, progressVal + 1))}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold shrink-0 transition-colors animate-none"
                          disabled={!canEdit}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      Milestone (no progress slider)
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <FormSelect
                      label="Execution Status"
                      value={statusVal}
                      onChange={(val) =>
                        handleStatusChange(
                          (Array.isArray(val) ? val[0] : val) as GanttItemStatus,
                        )
                      }
                      options={STATUS_OPTIONS}
                      labelClass="text-md font-semibold text-slate-800 mb-1 block"
                      triggerClassName="h-10 rounded-lg border-slate-200 text-md"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                {/* Advanced Scheduling & Buffer Controls */}
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <FormInputField
                    label="Lag (Days)"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={lagDaysVal}
                    onChange={(e) => setLagDaysVal(e.target.value)}
                    disabled={!canEdit}
                  />

                  <FormInputField
                    label="Buffer (Days)"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={bufferDaysVal}
                    onChange={(e) => setBufferDaysVal(e.target.value)}
                    disabled={!canEdit}
                  />

                  <FormInputField
                    label="Cascade Delay Days"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cascadeDelayDaysVal}
                    onChange={(e) => setCascadeDelayDaysVal(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </form>
            )}

            {/* ── DEPENDENCY TAB ── */}
            {activeTab === "dependency" && (
              <div className="space-y-4">
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50/70 border border-red-200/80 rounded-xl space-y-2 text-sm text-red-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-950 text-[14px]">Dependency Validation Failed</p>
                        <p className="text-xs text-red-700/90 font-medium">Please resolve the date conflicts below before saving.</p>
                      </div>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-xs font-medium text-red-900/90">
                      {validationErrors.map((err, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {err.message}
                          {err.expectedDate && err.actualDate && (
                            <span className="block mt-0.5 text-[11px] text-red-700/80 font-semibold">
                              Expected: {err.expectedDate} | Actual: {err.actualDate}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pendingDeps.length > 0 ? (
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 space-y-3">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 items-center px-1 mb-1">
                      <span className="col-span-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Task Name
                      </span>
                      <span className="col-span-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Relation
                      </span>
                      <span className="col-span-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Depends On Task
                      </span>
                      <span className="col-span-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                        Lag (Days)
                      </span>
                      <span className="col-span-0.5" />
                    </div>

                    {pendingDeps.map((row) => {
                      const hasError = validationErrors.some(
                        (err) => err.predecessorTaskId === row.predId
                      );
                      const rowError = validationErrors.find(
                        (err) => err.predecessorTaskId === row.predId
                      );

                      return (
                        <div
                          key={row.id}
                          className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-lg border transition-all duration-200 ${
                            hasError
                              ? "bg-red-50/40 border-red-200 shadow-sm shadow-red-100"
                              : "border-transparent"
                          }`}
                        >
                          <div className="col-span-3 font-semibold text-slate-700 truncate pr-2 text-sm" title={item.itemName}>
                            {item.itemName}
                          </div>

                          <div className="col-span-4">
                            <FormSelect
                              value={row.depType}
                              onChange={(val) =>
                                updatePendingRow(row.id, {
                                  depType: (Array.isArray(val)
                                    ? val[0]
                                    : val) as GanttDependencyType,
                                })
                              }
                              options={[
                                { value: "FS", label: "Start with End of" },
                                { value: "SS", label: "Start with" },
                                { value: "FF", label: "Ends with" },
                                { value: "SF", label: "End Before start of" },
                              ]}
                              disabled={!canEdit}
                            />
                          </div>

                          <div className="col-span-3">
                            <FormSelect
                              value={row.predId}
                              onChange={(val) =>
                                updatePendingRow(row.id, {
                                  predId: Array.isArray(val) ? val[0] : val,
                                })
                              }
                              options={candidates
                                .filter(
                                  (c) =>
                                    !pendingDeps.some(
                                      (r) =>
                                        r.id !== row.id &&
                                        r.predId === c.ganttItemId,
                                    ),
                                )
                                .map((c) => ({
                                  value: c.ganttItemId,
                                  label: c.itemName,
                                }))}
                              placeholder="Select task..."
                              disabled={!canEdit}
                              error={
                                hasError
                                  ? { message: rowError?.errorCode === "DATE_CONSTRAINT_VIOLATION" ? "Date conflict" : "Conflict" }
                                  : undefined
                              }
                            />
                          </div>

                          <div className="col-span-1.5">
                            <FormInputField
                              type="number"
                              min="0"
                              value={row.lagDays}
                              onChange={(e) =>
                                updatePendingRow(row.id, {
                                  lagDays: Number(e.target.value),
                                })
                              }
                              className="text-center h-9 text-sm border border-slate-200 rounded-lg !mt-0"
                              containerClass="!space-y-0"
                              disabled={!canEdit}
                              error={hasError ? { message: "" } : undefined}
                            />
                          </div>

                          <div className="col-span-0.5 flex justify-center">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (row.isExisting) {
                                    try {
                                      await deleteDepMutation.mutateAsync(row.id);
                                    } catch {
                                      // Error is already handled by mutation toast
                                      return;
                                    }
                                  }
                                  removePendingRow(row.id);
                                }}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add another row */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={addPendingRow}
                        className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:text-primary/80 transition-colors mt-1 pl-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Another
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm italic">No predecessor dependencies linked yet.</p>
                    {canEdit && (
                      <Button
                        type="button"
                        onClick={addPendingRow}
                        className="mt-4"
                      >
                        Add Dependency Relation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}


          </div>


        </div>
      </ModalData>

      {/* Edit modal inline */}

      {/* Delete confirm */}
      <ModalData
        isModalOpen={confirmDelete}
        modalTitle="Delete Item"
        modalClose={() => setConfirmDelete(false)}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss:
              "py-1.5 px-5 bg-white border border-slate-200 text-black font-semibold hover:bg-slate-50 rounded-lg transition-colors",
            btnClick: () => setConfirmDelete(false),
          },
          {
            btnText: "Delete",
            buttonCss:
              "py-1.5 px-5 bg-red-600 text-white hover:bg-red-500 border border-red-600 rounded-lg transition-colors",
            btnClick: handleDelete,
            isLoading: deleteMutation.isPending,
          },
        ]}
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Delete &quot;{item.itemName}&quot; and all its sub-items? This cannot
          be undone.
        </p>
      </ModalData>
    </>
  );
}
