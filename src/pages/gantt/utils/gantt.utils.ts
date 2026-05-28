import {
  addDays,
  differenceInCalendarDays,
  format,
  isToday,
  startOfDay,
  endOfMonth,
  endOfYear,
  endOfQuarter,
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
  viewMode: "Day" | "Week" | "Month" | "Year" = "Day",
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

  // Set padding and minimum duration based on view mode
  let paddingDays = 7;
  let minDurationDays = 30;

  if (viewMode === "Week") {
    paddingDays = 14;
    minDurationDays = 90;
  } else if (viewMode === "Month") {
    paddingDays = 30;
    minDurationDays = 365;
  } else if (viewMode === "Year") {
    paddingDays = 90;
    minDurationDays = 365 * 3;
  }

  const timelineStart = addDays(startOfDay(minDate), -paddingDays);
  let timelineEnd = addDays(startOfDay(maxDate), paddingDays);

  const curDuration = differenceInCalendarDays(timelineEnd, timelineStart) + 1;
  if (curDuration < minDurationDays) {
    timelineEnd = addDays(timelineStart, minDurationDays - 1);
  }

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

/** Compute overall planned start/end dates for a phase */
export interface PhaseDateBounds {
  startDate: Date | null;
  endDate: Date | null;
}

export function computePhaseBounds(
  itemsTree: CompanyGanttItem[],
  phaseId: string,
): PhaseDateBounds {
  let minStart: Date | null = null;
  let maxEnd: Date | null = null;

  const walk = (list: CompanyGanttItem[]) => {
    for (const item of list) {
      if (item.ganttPhaseId === phaseId) {
        const s = new Date(item.plannedStartDate);
        const e = new Date(item.plannedEndDate);
        if (!minStart || s < minStart) minStart = s;
        if (!maxEnd || e > maxEnd) maxEnd = e;
      }
      if (item.children?.length) walk(item.children);
    }
  };

  walk(itemsTree);
  return { startDate: minStart, endDate: maxEnd };
}

export interface TimelineHeaderCell {
  label: string;
  x: number;
  width: number;
  isToday?: boolean;
}

/** Build high-fidelity dynamic timeline headers for different view modes */
export function buildTimelineHeaders(
  timelineStart: Date,
  totalDays: number,
  dayWidth: number,
  viewMode: "Day" | "Week" | "Month" | "Year",
): { topHeaders: TimelineHeaderCell[]; bottomHeaders: TimelineHeaderCell[] } {
  const topHeaders: TimelineHeaderCell[] = [];
  const bottomHeaders: TimelineHeaderCell[] = [];
  const timelineEnd = addDays(timelineStart, totalDays - 1);

  if (viewMode === "Day") {
    // Top headers: Month Year
    let cur = startOfDay(timelineStart);
    while (cur <= timelineEnd) {
      const monthStart = cur;
      const monthEnd = endOfMonth(cur);
      const segStart = monthStart;
      const segEnd = monthEnd > timelineEnd ? timelineEnd : monthEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;

      topHeaders.push({
        label: format(segStart, "MMMM yyyy"),
        x,
        width,
      });
      cur = addDays(monthEnd, 1);
    }

    // Bottom headers: Day number
    for (let i = 0; i < totalDays; i++) {
      const day = addDays(timelineStart, i);
      bottomHeaders.push({
        label: format(day, "d"),
        x: i * dayWidth,
        width: dayWidth,
        isToday: isToday(day),
      });
    }
  } else if (viewMode === "Week") {
    // Top headers: Month Year
    let cur = startOfDay(timelineStart);
    while (cur <= timelineEnd) {
      const monthStart = cur;
      const monthEnd = endOfMonth(cur);
      const segStart = monthStart;
      const segEnd = monthEnd > timelineEnd ? timelineEnd : monthEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;

      topHeaders.push({
        label: format(segStart, "MMMM yyyy"),
        x,
        width,
      });
      cur = addDays(monthEnd, 1);
    }

    // Bottom headers: Week start date
    for (let i = 0; i < totalDays; i += 7) {
      const weekStart = addDays(timelineStart, i);
      const weekEnd =
        addDays(weekStart, 6) > timelineEnd
          ? timelineEnd
          : addDays(weekStart, 6);
      const segmentDays = differenceInCalendarDays(weekEnd, weekStart) + 1;
      const hasToday = isTodayInRange(weekStart, weekEnd);

      bottomHeaders.push({
        label: format(weekStart, "MMM d"),
        x: i * dayWidth,
        width: segmentDays * dayWidth,
        isToday: hasToday,
      });
    }
  } else if (viewMode === "Month") {
    // Top headers: Year
    let cur = startOfDay(timelineStart);
    while (cur <= timelineEnd) {
      const yearStart = cur;
      const yearEnd = endOfYear(cur);
      const segStart = yearStart;
      const segEnd = yearEnd > timelineEnd ? timelineEnd : yearEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;

      topHeaders.push({
        label: format(segStart, "yyyy"),
        x,
        width,
      });
      cur = addDays(yearEnd, 1);
    }

    // Bottom headers: Month abbreviation
    let monthCur = startOfDay(timelineStart);
    while (monthCur <= timelineEnd) {
      const monthStart = monthCur;
      const monthEnd = endOfMonth(monthCur);
      const segStart = monthStart;
      const segEnd = monthEnd > timelineEnd ? timelineEnd : monthEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;
      const hasToday = isTodayInRange(segStart, segEnd);

      bottomHeaders.push({
        label: format(segStart, "MMM"),
        x,
        width,
        isToday: hasToday,
      });
      monthCur = addDays(monthEnd, 1);
    }
  } else if (viewMode === "Year") {
    // Top headers: Year
    let cur = startOfDay(timelineStart);
    while (cur <= timelineEnd) {
      const yearStart = cur;
      const yearEnd = endOfYear(cur);
      const segStart = yearStart;
      const segEnd = yearEnd > timelineEnd ? timelineEnd : yearEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;

      topHeaders.push({
        label: format(segStart, "yyyy"),
        x,
        width,
      });
      cur = addDays(yearEnd, 1);
    }

    // Bottom headers: Quarters
    let qCur = startOfDay(timelineStart);
    while (qCur <= timelineEnd) {
      const qStart = qCur;
      const qEnd = endOfQuarter(qCur);
      const segStart = qStart;
      const segEnd = qEnd > timelineEnd ? timelineEnd : qEnd;

      const segmentDays = differenceInCalendarDays(segEnd, segStart) + 1;
      const x = differenceInCalendarDays(segStart, timelineStart) * dayWidth;
      const width = segmentDays * dayWidth;
      const hasToday = isTodayInRange(segStart, segEnd);
      const qNum = Math.floor(segStart.getMonth() / 3) + 1;

      bottomHeaders.push({
        label: `Q${qNum}`,
        x,
        width,
        isToday: hasToday,
      });
      qCur = addDays(qEnd, 1);
    }
  }

  return { topHeaders, bottomHeaders };
}

function isTodayInRange(start: Date, end: Date): boolean {
  const today = startOfDay(new Date());
  return today >= startOfDay(start) && today <= startOfDay(end);
}

/** Keep backwards-compatible legacy stubs for header building to avoid breaking compilation */
export function buildMonthLabels(
  timelineStart: Date,
  totalDays: number,
  dayWidth: number,
): Array<{ label: string; x: number; width: number }> {
  return buildTimelineHeaders(timelineStart, totalDays, dayWidth, "Day")
    .topHeaders;
}

export function buildWeekLabels(
  timelineStart: Date,
  totalDays: number,
  dayWidth: number,
): Array<{ label: string; x: number; width: number; isToday?: boolean }> {
  return buildTimelineHeaders(timelineStart, totalDays, dayWidth, "Day")
    .bottomHeaders;
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
