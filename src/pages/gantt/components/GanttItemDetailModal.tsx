import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { SpinnerIcon } from "@/components/shared/Icons";
import { useQuery } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { Trash2, Diamond, SquareCheck, Plus, Loader2 } from "lucide-react";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
  GanttDependencyType,
  GanttItemStatus,
  GanttItemPriority,
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
//

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
  itemsTree = [],
  dependencies = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "general" | "progress" | "dependency" | "assign"
  >("general");
  //
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Inline forms state
  const [progressVal, setProgressVal] = useState(item.progressPercentage);
  const [statusVal, setStatusVal] = useState(item.itemStatus);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(
    item.assignedToEmployeeId ?? "",
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

  // Sync state when item or open state changes
  useEffect(() => {
    setProgressVal(item.progressPercentage);
    setStatusVal(item.itemStatus);
    setSelectedAssigneeId(item.assignedToEmployeeId ?? "");
    setNameVal(item.itemName);
    setDescVal(item.itemDescription ?? "");

    const currentStart = item.actualStartDate || item.plannedStartDate;
    setStartDateVal(
      currentStart ? format(new Date(currentStart), "yyyy-MM-dd") : "",
    );

    const currentEnd = item.actualEndDate || item.plannedEndDate;
    setEndDateVal(currentEnd ? format(new Date(currentEnd), "yyyy-MM-dd") : "");

    setPriorityVal(item.priority);
  }, [item.ganttItemId, open]);

  // Dependency states – multi-row pending
  interface PendingDep {
    id: string;
    predId: string;
    depType: GanttDependencyType;
    lagDays: number;
  }
  const [pendingDeps, setPendingDeps] = useState<PendingDep[]>([
    { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
  ]);

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
      await Promise.all([
        updateMutation.mutateAsync({
          itemName: nameVal,
          itemDescription: descVal || undefined,
          priority: priorityVal,
        }),
        updateDatesMutation.mutateAsync({
          itemId: item.ganttItemId,
          payload: {
            // plannedStartDate: item.plannedStartDate,
            // plannedEndDate: item.plannedEndDate,
            actualStartDate: new Date(startDateVal).toISOString(),
            actualEndDate: new Date(endDateVal).toISOString(),
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

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await progressMutation.mutateAsync({
        itemId: item.ganttItemId,
        payload: {
          progressPercentage: progressVal,
          itemStatus: statusVal as GanttItemStatus,
        },
      });
      onOpenChange(false);
    } catch {
      // Handled by mutation hook toasts
    }
  };

  const handleAssign = async (employeeId: string | null) => {
    try {
      await assignMutation.mutateAsync({
        itemId: item.ganttItemId,
        payload: { assignedToEmployeeId: employeeId },
      });
      onOpenChange(false);
    } catch {
      // Handled by toast inside mutation hook
    }
  };

  const handleAddDependencies = async () => {
    const validRows = pendingDeps.filter((r) => r.predId);
    if (!validRows.length) return;
    try {
      await Promise.all(
        validRows.map((row) =>
          createDepMutation.mutateAsync({
            ganttWorkspaceId: workspaceId,
            predecessorItemId: row.predId,
            successorItemId: item.ganttItemId,
            dependencyType: row.depType,
            lagDays: Number(row.lagDays) || 0,
          }),
        ),
      );
      // reset to one empty row
      setPendingDeps([
        { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
      ]);
      onOpenChange(false);
    } catch {
      // Handled by toast inside mutation hook
    }
  };

  const updatePendingRow = (id: string, patch: Partial<PendingDep>) => {
    setPendingDeps((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const addPendingRow = () => {
    setPendingDeps((prev) => [
      ...prev,
      { id: generateUUID(), predId: "", depType: "FS", lagDays: 0 },
    ]);
  };

  const removePendingRow = (id: string) => {
    setPendingDeps((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  };

  const handleDeleteDependency = async (depId: string) => {
    try {
      await deleteDepMutation.mutateAsync(depId);
    } catch {
      // Handled by toast inside mutation hook
    }
  };

  const isMilestone = item.itemType === "MILESTONE" || item.isMilestone;

  // Process dependencies
  const flatItems = flattenItems(itemsTree);
  const itemMap = new Map(flatItems.map((i) => [i.ganttItemId, i]));

  const predecessors = dependencies.filter(
    (d) => d.successorItemId === item.ganttItemId,
  );
  const successors = dependencies.filter(
    (d) => d.predecessorItemId === item.ganttItemId,
  );

  // Candidate predecessors: not current task, not already predecessor or successor
  const candidates = flatItems.filter(
    (i) =>
      i.ganttItemId !== item.ganttItemId &&
      !predecessors.some((p) => p.predecessorItemId === i.ganttItemId) &&
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

  return (
    <>
      <ModalData
        isModalOpen={open}
        modalTitle={item.itemName}
        modalClose={() => onOpenChange(false)}
        containerClass="max-w-xl w-[560px]"
      >
        <div className="flex-1 flex flex-col">
          {/* Subtitle / Header details */}
          <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium">
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
              { id: "progress" as const, label: "Progress" },
              { id: "dependency" as const, label: "Dependency" },
              { id: "assign" as const, label: "Assign Employee" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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
          <div className="flex-1 min-h-[300px] overflow-y-auto pr-0.5">
            {/* ── GENERAL TAB ── */}
            {activeTab === "general" && (
              <form
                id="general-form"
                onSubmit={handleGeneralSubmit}
                className="space-y-4 pt-1"
              >
                {/* Task Name */}
                <div className="space-y-1">
                  <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                    Task Name
                  </Label>
                  <Input
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Task Name"
                    className="h-10 text-md border border-slate-200 rounded-lg focus-visible:ring-primary focus-visible:border-primary w-full"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                    Description
                  </Label>
                  <Input
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    placeholder="Optional Description"
                    className="h-10 text-md border border-slate-200 rounded-lg focus-visible:ring-primary focus-visible:border-primary w-full"
                  />
                </div>

                {/* Start & End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDateVal}
                      onChange={(e) => setStartDateVal(e.target.value)}
                      className="h-10 text-md border border-slate-200 rounded-lg focus-visible:ring-primary focus-visible:border-primary w-full"
                      required
                      min={minStartDate}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={endDateVal}
                      onChange={(e) => setEndDateVal(e.target.value)}
                      className="h-10 text-md border border-slate-200 rounded-lg focus-visible:ring-primary focus-visible:border-primary w-full"
                      required
                      min={startDateVal || minStartDate}
                    />
                  </div>
                </div>

                {/* Priority */}
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
                  />
                </div>
              </form>
            )}

            {/* ── PROGRESS TAB ── */}
            {activeTab === "progress" && (
              <form
                id="progress-form"
                onSubmit={handleProgressSubmit}
                className="space-y-6"
              >
                {/* Progress slider */}
                {!isMilestone ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-md font-semibold text-slate-800">
                        Progress Percentage
                      </Label>
                      <span className="text-sm font-bold text-primary font-mono">
                        {progressVal}%
                      </span>
                    </div>
                    <div className="pt-1">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={progressVal}
                        onChange={(e) =>
                          handleProgressChange(Number(e.target.value))
                        }
                        className="w-full h-1.5 accent-primary cursor-pointer rounded-lg appearance-none bg-slate-200"
                      />
                      <div className="flex justify-between text-md text-primary font-semibold font-mono mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed pl-3 border-l-2 border-amber-300">
                    Milestones represent key targets and do not have numerical
                    progress. You can mark them completed by changing the status
                    below.
                  </p>
                )}

                {/* Status Dropdown */}
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
                    labelClass="text-md font-semibold text-slate-800 mb-1.5 block"
                    triggerClassName="!py-0 h-10 rounded-lg border-slate-200 text-md"
                  />
                </div>
              </form>
            )}

            {/* ── DEPENDENCY TAB ── */}
            {activeTab === "dependency" && (
              <div className="space-y-5">
                {/* Existing dependencies */}
                {predecessors.length > 0 || successors.length > 0 ? (
                  <div className="divide-y divide-slate-105/60 max-h-[200px] overflow-y-auto pr-1">
                    {predecessors.map((dep) => {
                      const pred = itemMap.get(dep.predecessorItemId);
                      const typeLabel =
                        dep.dependencyType === "FS"
                          ? "Starts after finishes"
                          : dep.dependencyType === "SS"
                            ? "Starts in parallel"
                            : dep.dependencyType === "FF"
                              ? "Finishes in parallel"
                              : "Finishes after starts";
                      return (
                        <div
                          key={dep.ganttDependencyId}
                          className="flex items-center justify-between py-3 text-xs"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-sm text-slate-800 truncate">
                              {pred?.itemName ?? "Unknown Task"}
                            </span>
                            <span className="text-slate-400 text-sm">
                              {typeLabel}{" "}
                              {dep.lagDays > 0 && `(Lag: +${dep.lagDays}d)`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-primary uppercase">
                              {dep.dependencyType}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-red-650 hover:bg-red-50/50 rounded-lg transition-colors"
                              onClick={() =>
                                handleDeleteDependency(dep.ganttDependencyId)
                              }
                              disabled={deleteDepMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {successors.map((dep) => {
                      const succ = itemMap.get(dep.successorItemId);
                      const typeLabel =
                        dep.dependencyType === "FS"
                          ? "Starts after this finishes"
                          : dep.dependencyType === "SS"
                            ? "Starts in parallel with this"
                            : dep.dependencyType === "FF"
                              ? "Finishes in parallel with this"
                              : "Finishes after this starts";
                      return (
                        <div
                          key={dep.ganttDependencyId}
                          className="flex items-center justify-between py-3 text-xs"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-slate-800 truncate">
                              {succ?.itemName ?? "Unknown Task"}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {typeLabel}{" "}
                              {dep.lagDays > 0 && `(Lag: +${dep.lagDays}d)`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {dep.dependencyType} (Succ)
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-red-650 hover:bg-red-50/50 rounded-lg transition-colors"
                              onClick={() =>
                                handleDeleteDependency(dep.ganttDependencyId)
                              }
                              disabled={deleteDepMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic py-4 text-center">
                    No task dependencies linked yet.
                  </p>
                )}

                {/* Add dependency rows */}
                {candidates.length > 0 ? (
                  <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                    <Label className="text-md font-bold text-slate-800 block">
                      Add New Relation Links
                    </Label>

                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-5 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Depends On
                      </span>
                      <span className="col-span-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Relation Type
                      </span>
                      <span className="col-span-2 text-sm font-semibold text-slate-500 uppercase tracking-wide text-center">
                        Lag (d)
                      </span>
                      <span className="col-span-1" />
                    </div>

                    {pendingDeps.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-5">
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
                          />
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
                              { value: "FS", label: "FS: Finish-to-Start" },
                              { value: "SS", label: "SS: Start-to-Start" },
                              { value: "FF", label: "FF: Finish-to-Finish" },
                              { value: "SF", label: "SF: Start-to-Finish" },
                            ]}
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            value={row.lagDays}
                            onChange={(e) =>
                              updatePendingRow(row.id, {
                                lagDays: Number(e.target.value),
                              })
                            }
                            className="w-full h-9 text-sm border border-slate-200 rounded-lg bg-white px-2 shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-center"
                          />
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removePendingRow(row.id)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add another row */}
                    <button
                      type="button"
                      onClick={addPendingRow}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors mt-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Another
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center py-2">
                    No other tasks available for linking relationship.
                  </p>
                )}
              </div>
            )}

            {/* ── ASSIGN EMPLOYEE TAB ── */}
            {activeTab === "assign" && (
              <div className="space-y-4">
                {item.assignedEmployee?.employeeName ? (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div className="min-w-0">
                      <Label className="text-md font-semibold text-slate-800 mb-1.5 block">
                        Current Assignee
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                          {getInitials(item.assignedEmployee.employeeName)}
                        </div>
                        <span className="text-xs font-bold text-slate-850">
                          {item.assignedEmployee.employeeName}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-slate-500 hover:text-red-650 hover:bg-red-50/50 border border-slate-200 rounded-lg shadow-sm"
                      onClick={() => handleAssign(null)}
                      disabled={assignMutation.isPending}
                    >
                      {assignMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Unassign
                    </Button>
                  </div>
                ) : (
                  <div className="py-2.5">
                    <p className="text-sm text-slate-400 italic">
                      Currently unassigned. Select an employee below to assign
                      this task.
                    </p>
                  </div>
                )}

                {employeesLoading ? (
                  <div className="flex justify-center py-8 text-primary">
                    <SpinnerIcon />
                  </div>
                ) : (
                  <FormSelect
                    label="Select Assignee"
                    value={selectedAssigneeId}
                    onChange={(val) =>
                      setSelectedAssigneeId(Array.isArray(val) ? val[0] : val)
                    }
                    options={(employees ?? []).map((emp) => ({
                      value: emp.employeeId,
                      label: emp.employeeName,
                    }))}
                    placeholder="Select employee..."
                    labelClass="text-md font-semibold text-slate-800 mb-1.5 block"
                    triggerClassName="h-10 rounded-lg border-slate-200 text-md"
                  />
                )}
              </div>
            )}
          </div>

          {/* ── Unified Footer ── */}
          {(activeTab === "general" ||
            activeTab === "progress" ||
            activeTab === "dependency" ||
            activeTab === "assign") && (
            <div className="flex gap-2 pt-4 mt-2 border-t border-slate-100 items-center">
              {activeTab === "general" && (
                <Button
                  type="button"
                  variant="outline"
                  className=" bg-red-700 text-white transition-colors rounded-lg mr-auto"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Task
                </Button>
              )}
              {activeTab === "dependency" ? (
                <Button
                  type="button"
                  onClick={handleAddDependencies}
                  disabled={
                    createDepMutation.isPending ||
                    !pendingDeps.some((r) => r.predId)
                  }
                  className=" ml-auto"
                >
                  {createDepMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Add Dependencies"
                  )}
                </Button>
              ) : activeTab === "assign" ? (
                <Button
                  type="button"
                  onClick={() => handleAssign(selectedAssigneeId)}
                  disabled={assignMutation.isPending || !selectedAssigneeId}
                  className=" ml-auto"
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Assignee"
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  form={
                    activeTab === "general" ? "general-form" : "progress-form"
                  }
                  disabled={
                    activeTab === "general"
                      ? updateMutation.isPending ||
                        updateDatesMutation.isPending
                      : progressMutation.isPending
                  }
                  className=" ml-auto"
                >
                  {activeTab === "general"
                    ? updateMutation.isPending || updateDatesMutation.isPending
                      ? "Saving..."
                      : "Save Details"
                    : progressMutation.isPending
                      ? "Saving..."
                      : "Save Progress"}
                </Button>
              )}
            </div>
          )}
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
