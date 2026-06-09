import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
import {
  CalendarDays,
  ChevronsDownUp,
  ChevronsUpDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Target,
  Search,
} from "lucide-react";

export type GanttViewMode = "Day" | "Week" | "Month" | "Year";

const VIEW_MODES: { label: string; value: GanttViewMode }[] = [
  { label: "Day", value: "Day" },
  { label: "Week", value: "Week" },
  { label: "Month", value: "Month" },
  { label: "Year", value: "Year" },
];

// dayWidth per viewMode (base — overridden when custom zoom is set)
const BASE_DAY_WIDTH: Record<GanttViewMode, number> = {
  Day: 36,
  Week: 8,
  Month: 2.5,
  Year: 1.5,
};

interface Props {
  workspaceId: string;
  workspaceStartDate: string;
  phases: CompanyGanttPhase[];
  itemsTree: CompanyGanttItem[];
  dependencies: CompanyGanttDependency[];
  selectedItem?: CompanyGanttItem | null;
  onItemClick?: (item: CompanyGanttItem) => void;
}

export default function GanttChart({
  workspaceId,
  workspaceStartDate,
  phases,
  itemsTree,
  dependencies,
  selectedItem,
  onItemClick,
}: Props) {
  const [viewMode, setViewMode] = useState<GanttViewMode>("Week");
  const [customDayWidth, setCustomDayWidth] = useState<number | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [localSelectedItem, setLocalSelectedItem] =
    useState<CompanyGanttItem | null>(null);
  const activeSelectedItem =
    selectedItem !== undefined ? selectedItem : localSelectedItem;
  const handleItemClick = onItemClick || setLocalSelectedItem;
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const expandAll = useCallback(() => {
    setCollapsedPhases(new Set());
    setCollapsedItems(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedPhases(new Set(phases.map((p) => p.ganttPhaseId)));
    setCollapsedItems(new Set());
  }, [phases]);

  // ── Date and Timeline Calculations ────────────────────────────────────────
  const { timelineStart, totalDays } = useMemo(
    () => computeTimelineBounds(workspaceStartDate, itemsTree, viewMode),
    [workspaceStartDate, itemsTree, viewMode],
  );

  const [availWidth, setAvailWidth] = useState<number>(0);

  useEffect(() => {
    const el = rightScrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAvailWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const dayWidth = customDayWidth ?? BASE_DAY_WIDTH[viewMode];

  const adjustedTotalDays = useMemo(() => {
    if (availWidth <= 0 || dayWidth <= 0) return totalDays;
    const minDays = Math.ceil(availWidth / dayWidth);
    return Math.max(totalDays, minDays);
  }, [totalDays, dayWidth, availWidth]);

  const todayX = useMemo(
    () => getTodayX(timelineStart, dayWidth),
    [timelineStart, dayWidth],
  );

  const zoomIn = () => {
    const currentW = customDayWidth ?? BASE_DAY_WIDTH[viewMode];
    const nextW = currentW * 1.45;
    if (viewMode === "Year" && nextW >= 2.0) {
      setViewMode("Month");
      setCustomDayWidth(null);
    } else if (viewMode === "Month" && nextW >= 5.0) {
      setViewMode("Week");
      setCustomDayWidth(null);
    } else if (viewMode === "Week" && nextW >= 16.0) {
      setViewMode("Day");
      setCustomDayWidth(null);
    } else if (viewMode === "Day") {
      setCustomDayWidth(Math.min(nextW, 100));
    } else {
      setCustomDayWidth(nextW);
    }
  };

  const zoomOut = () => {
    const currentW = customDayWidth ?? BASE_DAY_WIDTH[viewMode];
    const nextW = currentW / 1.45;
    if (viewMode === "Day" && nextW < 18) {
      setViewMode("Week");
      setCustomDayWidth(null);
    } else if (viewMode === "Week" && nextW < 4.5) {
      setViewMode("Month");
      setCustomDayWidth(null);
    } else if (viewMode === "Month" && nextW < 1.8) {
      setViewMode("Year");
      setCustomDayWidth(null);
    } else if (viewMode === "Year") {
      setCustomDayWidth(Math.max(nextW, 1.0));
    } else {
      setCustomDayWidth(nextW);
    }
  };
  const zoomFit = useCallback(() => {
    if (!wrapRef.current) return;
    const avail = wrapRef.current.clientWidth - LEFT_PANEL_WIDTH - 24;
    setCustomDayWidth(Math.max(avail / totalDays, 1));
  }, [totalDays]);

  // Reset custom zoom when switching view mode
  const handleViewMode = (mode: GanttViewMode) => {
    setViewMode(mode);
    setCustomDayWidth(null);
  };

  // ── Today scroll ─────────────────────────────────────────────────────────
  const scrollToToday = useCallback(() => {
    if (rightScrollRef.current && todayX !== null) {
      const containerWidth = rightScrollRef.current.clientWidth;
      rightScrollRef.current.scrollLeft = Math.max(
        0,
        todayX - containerWidth / 2,
      );
    }
  }, [todayX]);

  // ── Rows for left panel ───────────────────────────────────────────────────
  const allRows = useMemo(
    () => buildGanttRows(itemsTree, phases, collapsedPhases, collapsedItems),
    [itemsTree, phases, collapsedPhases, collapsedItems],
  );

  // Apply search filter (keep phase rows if any child matches, keep item rows that match)
  const rows = useMemo(() => {
    if (!searchQ.trim()) return allRows;
    const q = searchQ.toLowerCase();
    return allRows.filter((row) => {
      if (row.type === "phase") return true; // always show phase headers
      return row.item?.itemName?.toLowerCase().includes(q);
    });
  }, [allRows, searchQ]);

  const itemRows = rows.filter((r) => r.type === "item");
  const completedCount = itemRows.filter(
    (r) => r.item?.itemStatus === "COMPLETED",
  ).length;

  const tbBtn =
    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-colors";

  return (
    <div
      ref={wrapRef}
      className="flex flex-col h-full overflow-hidden border border-border rounded-xl bg-background shadow-sm"
    >
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/20 shrink-0 flex-wrap">
        {/* View mode */}
        <div className="flex items-center gap-1 mr-1">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleViewMode(mode.value)}
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

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Expand / Collapse */}
        <button onClick={expandAll} className={tbBtn}>
          <ChevronsDownUp className="h-3.5 w-3.5" /> Expand All
        </button>
        <button onClick={collapseAll} className={tbBtn}>
          <ChevronsUpDown className="h-3.5 w-3.5" /> Collapse All
        </button>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Zoom */}
        <button onClick={zoomIn} className={tbBtn}>
          <ZoomIn className="h-3.5 w-3.5" /> Zoom In
        </button>
        <button onClick={zoomOut} className={tbBtn}>
          <ZoomOut className="h-3.5 w-3.5" /> Zoom Out
        </button>
        <button onClick={zoomFit} className={tbBtn}>
          <Maximize2 className="h-3.5 w-3.5" /> Zoom to Fit
        </button>

        {/* Today */}
        {todayX !== null && (
          <>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button onClick={scrollToToday} className={tbBtn}>
              <Target className="h-3.5 w-3.5" /> Today
            </button>
          </>
        )}

        {/* Stats */}
        <span className="text-xs text-muted-foreground ml-1 hidden sm:block">
          {itemRows.length} tasks · {completedCount} done · {phases.length}{" "}
          phases
        </span>

        {/* Search */}
        <div className="ml-auto flex items-center gap-1.5 border rounded-md px-2 py-1 bg-background">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search tasks…"
            className="outline-none bg-transparent w-28 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
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
              onItemClick={handleItemClick}
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
          <div className="sticky top-0 z-20 min-w-full w-fit">
            <GanttTimelineHeader
              timelineStart={timelineStart}
              totalDays={adjustedTotalDays}
              dayWidth={dayWidth}
              viewMode={viewMode}
            />
          </div>

          {/* Timeline SVG drawing */}
          <div className="min-w-full w-fit">
            <GanttTimeline
              rows={rows}
              dependencies={dependencies}
              timelineStart={timelineStart}
              totalDays={adjustedTotalDays}
              dayWidth={dayWidth}
              todayX={todayX}
              headerHeight={0}
              onItemClick={handleItemClick}
              hoveredRowId={hoveredRowId}
              onHoverRow={setHoveredRowId}
              itemsTree={itemsTree}
              phases={phases}
            />
          </div>
        </div>
      </div>

      {/* ── Item detail modal ───────────────────────────────────────────── */}
      {!onItemClick && activeSelectedItem && (
        <GanttItemDetailModal
          open={!!activeSelectedItem}
          onOpenChange={(v) => {
            if (!v) setLocalSelectedItem(null);
          }}
          item={activeSelectedItem}
          workspaceId={workspaceId}
          phases={phases}
          itemsTree={itemsTree}
          dependencies={dependencies}
        />
      )}
    </div>
  );
}
