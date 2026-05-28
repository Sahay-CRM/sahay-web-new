import { useEffect, useRef, memo } from "react";
import Gantt from "frappe-gantt";
import "./frappe-gantt-theme.css"; // also imports frappe-gantt base CSS via @import
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
} from "@/types/gantt";
import { ITEM_STATUS_COLOR } from "@/pages/gantt/utils/gantt.utils";
import {
  format,
  startOfDay,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

// ── Types ────────────────────────────────────────────────────────────────────

export type FrappeViewMode = "Day" | "Week" | "Month" | "Year";

interface FrappeTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
  color?: string;
  [key: string]: unknown;
}

interface Props {
  workspaceStartDate: string;
  phases: CompanyGanttPhase[];
  itemsTree: CompanyGanttItem[];
  dependencies: CompanyGanttDependency[];
  viewMode: FrappeViewMode;
  onItemClick: (item: CompanyGanttItem) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Flatten nested items tree into a flat list (depth-first) */
function flattenItems(items: CompanyGanttItem[]): CompanyGanttItem[] {
  const result: CompanyGanttItem[] = [];
  const walk = (list: CompanyGanttItem[]) => {
    for (const item of list) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return result;
}

/** Format Date → "YYYY-MM-DD" for frappe-gantt */
function fmtFrappe(d: Date | string): string {
  return format(new Date(d), "yyyy-MM-dd");
}

/** Ensure end >= start + 1 day (frappe-gantt doesn't allow zero-width bars) */
function safeEnd(start: string, end: string): string {
  const s = startOfDay(new Date(start));
  const e = startOfDay(new Date(end));
  if (differenceInCalendarDays(e, s) < 1) {
    return fmtFrappe(addDays(s, 1));
  }
  return fmtFrappe(e);
}

/** Convert our items + dependencies to frappe-gantt task format */
function toFrappeTasks(
  items: CompanyGanttItem[],
  deps: CompanyGanttDependency[],
): FrappeTask[] {
  // Build predecessor map: itemId → predecessorIds[]
  const predMap = new Map<string, string[]>();
  for (const dep of deps) {
    if (!predMap.has(dep.successorItemId)) predMap.set(dep.successorItemId, []);
    predMap.get(dep.successorItemId)!.push(dep.predecessorItemId);
  }

  return items.map((item) => {
    const statusColor = ITEM_STATUS_COLOR[item.itemStatus] ?? "#94a3b8";
    const barColor = item.color ?? statusColor;
    const preds = predMap.get(item.ganttItemId) ?? [];

    return {
      id: item.ganttItemId,
      name: item.itemName,
      start: fmtFrappe(item.plannedStartDate),
      end: safeEnd(item.plannedStartDate, item.plannedEndDate),
      progress: Math.min(100, Math.max(0, item.progressPercentage)),
      dependencies: preds.join(", "),
      color: barColor,
      custom_class:
        item.itemType === "MILESTONE" || item.isMilestone
          ? "gantt-milestone-bar"
          : undefined,
    };
  });
}

// ── Component ────────────────────────────────────────────────────────────────

const FrappeGanttChart = memo(function FrappeGanttChart({
  workspaceStartDate,
  itemsTree,
  dependencies,
  viewMode,
  onItemClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ganttRef = useRef<any>(null);

  // Keep a stable ref to the latest onItemClick (avoid re-instantiating gantt on callback change)
  const onItemClickRef = useRef(onItemClick);
  onItemClickRef.current = onItemClick;

  // Keep a stable ref to the flat items list (for click lookup)
  const flatItemsRef = useRef<CompanyGanttItem[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const flat = flattenItems(itemsTree);
    flatItemsRef.current = flat;

    if (flat.length === 0) return;

    const tasks = toFrappeTasks(flat, dependencies);

    // Build item lookup map for click handler
    const itemMap = new Map<string, CompanyGanttItem>();
    flat.forEach((item) => itemMap.set(item.ganttItemId, item));

    const options = {
      view_mode: viewMode,
      date_format: "YYYY-MM-DD",
      scroll_to: "today" as const,
      bar_height: 24,
      bar_corner_radius: 4,
      padding: 12,
      arrow_curve: 5,
      today_button: false,
      view_mode_select: false,
      infinite_padding: true,
      readonly_dates: true,
      readonly_progress: true,
      popup: false as unknown as undefined,
      on_click: (task: FrappeTask) => {
        const item = itemMap.get(task.id);
        if (item) onItemClickRef.current(item);
      },
    };

    // Always destroy + re-create for reliability (frappe-gantt refresh can be fragile)
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    ganttRef.current = null;

    ganttRef.current = new Gantt(containerRef.current, tasks, options);

    // Apply per-bar colors via SVG fill after render
    const raf = requestAnimationFrame(() => {
      applyBarColors(containerRef.current, tasks);
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [itemsTree, dependencies, viewMode, workspaceStartDate]);

  return (
    <div className="frappe-gantt-wrapper w-full h-full overflow-auto">
      <div ref={containerRef} className="w-full" />
    </div>
  );
});

export default FrappeGanttChart;

// ── Per-bar color injection ───────────────────────────────────────────────────

/**
 * frappe-gantt doesn't natively support per-bar colors via data properties,
 * so we manually apply fill colors after render using SVG DOM manipulation.
 */
function applyBarColors(container: HTMLDivElement | null, tasks: FrappeTask[]) {
  if (!container) return;
  tasks.forEach((task) => {
    if (!task.color) return;

    // frappe-gantt wraps each bar in a <g class="bar-wrapper" data-id="...">
    const wrapper = container.querySelector(
      `.bar-wrapper[data-id="${CSS.escape(task.id)}"]`,
    );
    if (!wrapper) return;

    const bar = wrapper.querySelector<SVGRectElement>(".bar");
    if (bar) {
      bar.style.fill = `${task.color}33`; // 20% opacity fill
      bar.style.stroke = task.color;
      bar.style.strokeWidth = "1.5";
    }

    const progress = wrapper.querySelector<SVGRectElement>(".bar-progress");
    if (progress) {
      progress.style.fill = `${task.color}aa`; // 67% opacity for progress
    }
  });
}
