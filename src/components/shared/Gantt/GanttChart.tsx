import { useCallback, useRef, useState, useMemo, UIEvent } from "react";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
} from "@/types/gantt";
import { GanttLeftPanel, LEFT_PANEL_WIDTH } from "./GanttLeftPanel";
import { GanttTimeline, GanttArrowheadDefs } from "./GanttTimeline";
import {
  GanttTimelineHeader,
  TIMELINE_HEADER_HEIGHT,
} from "./GanttTimelineHeader";
import {
  buildGanttRows,
  computeTimelineBounds,
  getTodayX,
} from "@/pages/gantt/utils/gantt.utils";
import GanttItemDetailModal from "@/pages/gantt/components/GanttItemDetailModal";

// Day width in pixels — can be zoomed
const DEFAULT_DAY_WIDTH = 24;

interface Props {
  workspaceId: string;
  workspaceStartDate: string;
  phases: CompanyGanttPhase[];
  itemsTree: CompanyGanttItem[];
  dependencies: CompanyGanttDependency[];
}

export default function GanttChart({
  workspaceId,
  workspaceStartDate,
  phases,
  itemsTree,
  dependencies,
}: Props) {
  // ── Collapse state ────────────────────────────────────────────────────────
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);

  // ── Selected item ─────────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<CompanyGanttItem | null>(
    null,
  );

  // ── Synced scroll refs ────────────────────────────────────────────────────
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncingLeft = useRef(false);
  const syncingRight = useRef(false);

  const handleLeftScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (syncingRight.current) return;
    syncingLeft.current = true;
    if (rightRef.current)
      rightRef.current.scrollTop = e.currentTarget.scrollTop;
    syncingLeft.current = false;
  }, []);

  const handleRightScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (syncingLeft.current) return;
    syncingRight.current = true;
    if (leftRef.current) leftRef.current.scrollTop = e.currentTarget.scrollTop;
    syncingRight.current = false;
  }, []);

  // ── Build rows ────────────────────────────────────────────────────────────
  const rows = useMemo(
    () => buildGanttRows(itemsTree, phases, collapsedPhases, collapsedItems),
    [itemsTree, phases, collapsedPhases, collapsedItems],
  );

  // ── Timeline bounds ───────────────────────────────────────────────────────
  const { timelineStart, totalDays } = useMemo(
    () => computeTimelineBounds(workspaceStartDate, itemsTree),
    [workspaceStartDate, itemsTree],
  );

  const todayX = useMemo(
    () => getTodayX(timelineStart, dayWidth),
    [timelineStart, dayWidth],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const togglePhase = useCallback((phaseId: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const totalTimelineWidth = totalDays * dayWidth;

  return (
    <div className="flex flex-col h-full overflow-hidden border border-border rounded-md bg-background">
      {/* ── Zoom toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 shrink-0 text-xs text-muted-foreground">
        <span>Zoom:</span>
        <button
          type="button"
          onClick={() => setDayWidth((w) => Math.max(10, w - 4))}
          className="h-6 w-6 rounded border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
        >
          −
        </button>
        <span className="w-14 text-center">{dayWidth}px/day</span>
        <button
          type="button"
          onClick={() => setDayWidth((w) => Math.min(64, w + 4))}
          className="h-6 w-6 rounded border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setDayWidth(DEFAULT_DAY_WIDTH)}
          className="ml-1 text-xs underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Reset
        </button>
        <span className="ml-auto">
          {rows.length} rows · {totalDays} days
        </span>
      </div>

      {/* ── Main split ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: header (sticky) + scrollable rows */}
        <div
          style={{ width: LEFT_PANEL_WIDTH, flexShrink: 0 }}
          className="flex flex-col border-r border-border"
        >
          {/* Left header (sticky, aligned with timeline header) */}
          <div
            style={{
              height: TIMELINE_HEADER_HEIGHT,
              minHeight: TIMELINE_HEADER_HEIGHT,
            }}
            className="border-b border-border bg-muted/30 flex items-end px-3 pb-1 shrink-0"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Task
            </span>
          </div>
          {/* Scrollable rows (synced with right panel) */}
          <div
            ref={leftRef}
            onScroll={handleLeftScroll}
            className="overflow-y-auto overflow-x-hidden flex-1"
          >
            <GanttLeftPanel
              rows={rows}
              headerHeight={0}
              onTogglePhase={togglePhase}
              onToggleItem={toggleItem}
              onItemClick={setSelectedItem}
            />
          </div>
        </div>

        {/* Right: header (sticky) + scrollable timeline (x+y) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline header row (not scrollable vertically, but scroll position tied horizontally) */}
          <div
            className="overflow-x-auto shrink-0 border-b border-border"
            style={{ scrollbarWidth: "none" }}
            ref={(el) => {
              // Mirror horizontal scroll from right body to this header
              if (el) {
                el.dataset.headerEl = "true";
              }
            }}
          >
            <div style={{ width: totalTimelineWidth }}>
              <GanttTimelineHeader
                phases={phases}
                timelineStart={timelineStart}
                totalDays={totalDays}
                dayWidth={dayWidth}
              />
            </div>
          </div>

          {/* Main scrollable area (both axes) */}
          <div
            ref={rightRef}
            onScroll={handleRightScroll}
            className="flex-1 overflow-auto"
          >
            {/* Arrowhead defs for dependency arrows */}
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
              <GanttArrowheadDefs />
            </svg>

            <div
              style={{
                width: totalTimelineWidth,
                minWidth: totalTimelineWidth,
              }}
            >
              <GanttTimeline
                rows={rows}
                dependencies={dependencies}
                timelineStart={timelineStart}
                totalDays={totalDays}
                dayWidth={dayWidth}
                todayX={todayX}
                headerHeight={0}
                onItemClick={setSelectedItem}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Item detail modal ─────────────────────────────────────────────── */}
      {selectedItem && (
        <GanttItemDetailModal
          open={!!selectedItem}
          onOpenChange={(v) => {
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          workspaceId={workspaceId}
          phases={phases}
        />
      )}
    </div>
  );
}
