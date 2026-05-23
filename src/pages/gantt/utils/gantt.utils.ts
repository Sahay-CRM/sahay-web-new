import {
  addDays,
  differenceInCalendarDays,
  format,
  isToday,
  startOfDay,
} from "date-fns";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
  GanttFlatRow,
  GanttItemStatus,
  GanttItemPriority,
  GanttWorkspaceStatus,
} from "@/types/gantt";

// ── Timeline date helpers ────────────────────────────────────────────────────

/** Returns array of Date objects for each day in [start, end] inclusive */
export function buildDateRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = startOfDay(start);
  const last = startOfDay(end);
  while (cur <= last) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

/** Returns number of pixels from timeline left edge to a given date */
export function dateToX(
  date: Date,
  timelineStart: Date,
  dayWidth: number,
): number {
  const diff = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(timelineStart),
  );
  return diff * dayWidth;
}

/** Returns width in pixels for a duration in days */
export function durationToWidth(
  durationDays: number,
  dayWidth: number,
): number {
  return Math.max(durationDays * dayWidth, dayWidth);
}

/** Format date for display */
export function fmtDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function fmtDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM d");
  } catch {
    return "—";
  }
}

// ── Tree flattening ──────────────────────────────────────────────────────────

/** Recursively flatten itemsTree into ordered flat rows, respecting collapsed state */
export function flattenItemTree(
  items: CompanyGanttItem[],
  phases: CompanyGanttPhase[],
  collapsedPhases: Set<string>,
  collapsedItems: Set<string>,
  depth = 0,
  parentPhaseId?: string,
): GanttFlatRow[] {
  const rows: GanttFlatRow[] = [];

  for (const item of items) {
    const phaseId = item.ganttPhaseId ?? parentPhaseId;

    // Skip items whose parent phase is collapsed
    if (phaseId && collapsedPhases.has(phaseId)) continue;

    const hasChildren = !!(item.children && item.children.length > 0);
    const isCollapsed = collapsedItems.has(item.ganttItemId);

    rows.push({
      id: item.ganttItemId,
      type: "item",
      depth,
      phaseId,
      item,
      hasChildren,
      isCollapsed,
      isVisible: true,
    });

    if (hasChildren && !isCollapsed) {
      const childRows = flattenItemTree(
        item.children!,
        phases,
        collapsedPhases,
        collapsedItems,
        depth + 1,
        phaseId,
      );
      rows.push(...childRows);
    }
  }

  return rows;
}

/** Build ordered rows with phase header rows interspersed */
export function buildGanttRows(
  itemsTree: CompanyGanttItem[],
  phases: CompanyGanttPhase[],
  collapsedPhases: Set<string>,
  collapsedItems: Set<string>,
): GanttFlatRow[] {
  const rows: GanttFlatRow[] = [];

  // Sort phases by phaseOrder
  const sortedPhases = [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder);

  // Group root items by phase
  const itemsByPhase = new Map<string | null, CompanyGanttItem[]>();
  const unassigned: CompanyGanttItem[] = [];

  for (const item of itemsTree) {
    const pid = item.ganttPhaseId ?? null;
    if (pid) {
      if (!itemsByPhase.has(pid)) itemsByPhase.set(pid, []);
      itemsByPhase.get(pid)!.push(item);
    } else {
      unassigned.push(item);
    }
  }

  // Emit phase header + its items
  for (const phase of sortedPhases) {
    rows.push({
      id: `phase-${phase.ganttPhaseId}`,
      type: "phase",
      depth: 0,
      phaseId: phase.ganttPhaseId,
      phaseName: phase.phaseName,
      phaseColor: phase.color ?? "#6366f1",
      isCollapsed: collapsedPhases.has(phase.ganttPhaseId),
    });

    if (!collapsedPhases.has(phase.ganttPhaseId)) {
      const phaseItems = itemsByPhase.get(phase.ganttPhaseId) ?? [];
      const itemRows = flattenItemTree(
        phaseItems,
        phases,
        collapsedPhases,
        collapsedItems,
        1,
        phase.ganttPhaseId,
      );
      rows.push(...itemRows);
    }
  }

  // Emit unassigned items at depth 0
  if (unassigned.length > 0) {
    const unassignedRows = flattenItemTree(
      unassigned,
      phases,
      collapsedPhases,
      collapsedItems,
      0,
    );
    rows.push(...unassignedRows);
  }

  return rows;
}

// ── Dependency map ───────────────────────────────────────────────────────────

/** Build map: successorItemId → predecessorItemId[] */
export function buildDependencyMap(
  deps: CompanyGanttDependency[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const dep of deps) {
    if (!map.has(dep.successorItemId)) map.set(dep.successorItemId, []);
    map.get(dep.successorItemId)!.push(dep.predecessorItemId);
  }
  return map;
}

// ── Status colors ────────────────────────────────────────────────────────────

export const ITEM_STATUS_COLOR: Record<GanttItemStatus, string> = {
  NOT_STARTED: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  ON_HOLD: "#f59e0b",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

export const ITEM_STATUS_BG: Record<GanttItemStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const WORKSPACE_STATUS_BG: Record<GanttWorkspaceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const PRIORITY_COLOR: Record<GanttItemPriority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-amber-500",
  CRITICAL: "text-red-600",
};

// ── Timeline bounds ──────────────────────────────────────────────────────────

/** Compute timeline start/end from workspace + items */
export function computeTimelineBounds(
  workspaceStartDate: string,
  items: CompanyGanttItem[],
  paddingDays = 7,
): { timelineStart: Date; timelineEnd: Date; totalDays: number } {
  let minDate = new Date(workspaceStartDate);
  let maxDate = addDays(minDate, 30); // fallback 30 days

  const walkItems = (items: CompanyGanttItem[]) => {
    for (const item of items) {
      const start = new Date(item.plannedStartDate);
      const end = new Date(item.plannedEndDate);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
      if (item.children?.length) walkItems(item.children);
    }
  };
  if (items.length) walkItems(items);

  const timelineStart = addDays(startOfDay(minDate), -paddingDays);
  const timelineEnd = addDays(startOfDay(maxDate), paddingDays);
  const totalDays = differenceInCalendarDays(timelineEnd, timelineStart) + 1;

  return { timelineStart, timelineEnd, totalDays };
}

/** Get today's X position on the timeline */
export function getTodayX(
  timelineStart: Date,
  dayWidth: number,
): number | null {
  const diff = differenceInCalendarDays(
    startOfDay(new Date()),
    startOfDay(timelineStart),
  );
  if (diff < 0) return null;
  return diff * dayWidth;
}

/** Check if two date ranges overlap */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  return start1 <= end2 && end1 >= start2;
}

/** Build month-grouping labels for timeline header */
export function buildMonthLabels(
  timelineStart: Date,
  totalDays: number,
  dayWidth: number,
): Array<{ label: string; x: number; width: number }> {
  const labels: Array<{ label: string; x: number; width: number }> = [];
  let cur = startOfDay(timelineStart);

  while (differenceInCalendarDays(cur, timelineStart) < totalDays) {
    const monthStart = cur;
    const monthLabel = format(cur, "MMMM yyyy");
    // Advance to first day of next month
    let next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    // Clamp to timeline end
    const timelineEnd = addDays(timelineStart, totalDays - 1);
    if (next > timelineEnd) next = addDays(timelineEnd, 1);

    const daysInSegment = differenceInCalendarDays(next, monthStart);
    const x = dateToX(monthStart, timelineStart, dayWidth);
    const width = daysInSegment * dayWidth;
    labels.push({ label: monthLabel, x, width });
    cur = next;
  }

  return labels;
}

/** Build week labels for timeline sub-header */
export function buildWeekLabels(
  timelineStart: Date,
  totalDays: number,
  dayWidth: number,
): Array<{ label: string; x: number; width: number; isToday?: boolean }> {
  const labels: Array<{
    label: string;
    x: number;
    width: number;
    isToday?: boolean;
  }> = [];

  for (let i = 0; i < totalDays; i += 7) {
    const day = addDays(timelineStart, i);
    const x = i * dayWidth;
    const daysLeft = Math.min(7, totalDays - i);
    labels.push({
      label: format(day, "MMM d"),
      x,
      width: daysLeft * dayWidth,
      isToday: isToday(day),
    });
  }

  return labels;
}

// ── Misc ─────────────────────────────────────────────────────────────────────

export const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const WORKSPACE_STATUS_OPTIONS: Array<{ value: string; label: string }> =
  [
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

export const PRIORITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export function getInitials(name: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}
