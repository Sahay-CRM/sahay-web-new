import { useState, useCallback, useMemo, useRef } from "react";
import type {
  CompanyGanttItem,
  CompanyGanttPhase,
  CompanyGanttDependency,
} from "@/types/gantt";
import { LEFT_PANEL_WIDTH, GanttLeftPanel } from "./GanttLeftPanel";
import { GanttTimeline } from "./GanttTimeline";
import { GanttTimelineHeader } from "./GanttTimelineHeader";
import {
  buildGanttRows,
  computeTimelineBounds,
  getTodayX,
} from "@/pages/gantt/utils/gantt.utils";
import GanttItemDetailModal from "@/pages/gantt/components/GanttItemDetailModal";
import { CalendarDays } from "lucide-react";

export type GanttViewMode = "Day" | "Week" | "Month" | "Year";

const VIEW_MODES: { label: string; value: GanttViewMode }[] = [
  { label: "Day", value: "Day" },
  { label: "Week", value: "Week" },
  { label: "Month", value: "Month" },
  { label: "Year", value: "Year" },
];

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
  const [viewMode, setViewMode] = useState<GanttViewMode>("Day");
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<CompanyGanttItem | null>(
    null,
  );
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // ── Scroll Synchronization ──────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (rightScrollRef.current && leftScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
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

  // ── Date and Timeline Calculations ────────────────────────────────────────
  const dayWidth = useMemo(() => {
    switch (viewMode) {
      case "Day":
        return 36;
      case "Week":
        return 8;
      case "Month":
        return 2.5;
      case "Year":
        return 1.5;
      default:
        return 36;
    }
  }, [viewMode]);

  const { timelineStart, totalDays } = useMemo(
    () => computeTimelineBounds(workspaceStartDate, itemsTree, viewMode),
    [workspaceStartDate, itemsTree, viewMode],
  );

  const todayX = useMemo(
    () => getTodayX(timelineStart, dayWidth),
    [timelineStart, dayWidth],
  );

  // ── Rows for left panel ───────────────────────────────────────────────────
  const rows = useMemo(
    () => buildGanttRows(itemsTree, phases, collapsedPhases, collapsedItems),
    [itemsTree, phases, collapsedPhases, collapsedItems],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden border border-border rounded-md bg-background shadow-sm">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 shrink-0">
        {/* View mode switcher */}
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setViewMode(mode.value)}
              className={`h-6 px-2.5 rounded text-xs font-medium transition-colors ${
                viewMode === mode.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.filter((r) => r.type === "item").length} tasks · {phases.length}{" "}
          phases
        </span>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel (task list) ──────────────────────────────────── */}
        <div
          style={{ width: LEFT_PANEL_WIDTH, flexShrink: 0 }}
          className="flex flex-col border-r border-border overflow-hidden bg-background"
        >
          {/* Column header - height matched to timeline header (50px) */}
          <div className="h-[50px] min-h-[50px] shrink-0 border-b border-border bg-muted/30 flex items-center px-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Task / Phase
            </span>
          </div>

          {/* Scrollable list container */}
          <div ref={leftScrollRef} className="flex-1 overflow-y-hidden">
            <GanttLeftPanel
              rows={rows}
              headerHeight={0}
              onTogglePhase={togglePhase}
              onToggleItem={toggleItem}
              onItemClick={setSelectedItem}
              hoveredRowId={hoveredRowId}
              onHoverRow={setHoveredRowId}
            />
          </div>
        </div>

        {/* ── Custom Timeline ─────────────────────────────────────────── */}
        <div
          ref={rightScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto bg-background"
        >
          {/* Timeline Header (sticky top-0 z-20) */}
          <div className="sticky top-0 z-20 w-fit">
            <GanttTimelineHeader
              timelineStart={timelineStart}
              totalDays={totalDays}
              dayWidth={dayWidth}
              viewMode={viewMode}
            />
          </div>

          {/* Timeline SVG drawing */}
          <div className="w-fit">
            <GanttTimeline
              rows={rows}
              dependencies={dependencies}
              timelineStart={timelineStart}
              totalDays={totalDays}
              dayWidth={dayWidth}
              todayX={todayX}
              headerHeight={0}
              onItemClick={setSelectedItem}
              hoveredRowId={hoveredRowId}
              onHoverRow={setHoveredRowId}
              itemsTree={itemsTree}
              phases={phases}
            />
          </div>
        </div>
      </div>

      {/* ── Item detail modal ───────────────────────────────────────────── */}
      {selectedItem && (
        <GanttItemDetailModal
          open={!!selectedItem}
          onOpenChange={(v) => {
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          workspaceId={workspaceId}
          phases={phases}
          itemsTree={itemsTree}
          dependencies={dependencies}
        />
      )}
    </div>
  );
}
