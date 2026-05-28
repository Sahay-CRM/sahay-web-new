import { memo, useMemo } from "react";
import type {
  CompanyGanttItem,
  CompanyGanttDependency,
  CompanyGanttPhase,
  GanttFlatRow,
} from "@/types/gantt";
import {
  dateToX,
  durationToWidth,
  ITEM_STATUS_COLOR,
  computePhaseBounds,
  fmtDate,
} from "@/pages/gantt/utils/gantt.utils";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ROW_HEIGHT = 36;
const BAR_HEIGHT = 18;
const MILESTONE_SIZE = 7;

interface DepLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
}

interface Props {
  rows: GanttFlatRow[];
  dependencies: CompanyGanttDependency[];
  timelineStart: Date;
  totalDays: number;
  dayWidth: number;
  todayX: number | null;
  headerHeight: number;
  onItemClick: (item: CompanyGanttItem) => void;
  hoveredRowId: string | null;
  onHoverRow: (id: string | null) => void;
  itemsTree: CompanyGanttItem[];
  phases: CompanyGanttPhase[];
}

export const GanttTimeline = memo(function GanttTimeline({
  rows,
  dependencies,
  timelineStart,
  totalDays,
  dayWidth,
  todayX,
  headerHeight,
  onItemClick,
  hoveredRowId,
  onHoverRow,
  itemsTree,
  phases,
}: Props) {
  const totalWidth = totalDays * dayWidth;
  const totalHeight = rows.length * ROW_HEIGHT;

  // Build row index map for dependency rendering
  const rowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, i) => {
      if (row.type === "item" && row.item) {
        map.set(row.item.ganttItemId, i);
      }
    });
    return map;
  }, [rows]);

  // Compute dependency lines
  const depLines = useMemo<DepLine[]>(() => {
    const lines: DepLine[] = [];
    for (const dep of dependencies) {
      const predIdx = rowIndexMap.get(dep.predecessorItemId);
      const succIdx = rowIndexMap.get(dep.successorItemId);
      if (predIdx === undefined || succIdx === undefined) continue;

      const predRow = rows[predIdx];
      const succRow = rows[succIdx];
      if (!predRow?.item || !succRow?.item) continue;

      const predItem = predRow.item;
      const succItem = succRow.item;

      const isPredMilestone =
        predItem.itemType === "MILESTONE" || predItem.isMilestone;
      const predEndX = isPredMilestone
        ? dateToX(
            new Date(predItem.plannedStartDate),
            timelineStart,
            dayWidth,
          ) + MILESTONE_SIZE
        : dateToX(
            new Date(predItem.plannedStartDate),
            timelineStart,
            dayWidth,
          ) +
          durationToWidth(
            differenceInCalendarDays(
              startOfDay(new Date(predItem.plannedEndDate)),
              startOfDay(new Date(predItem.plannedStartDate)),
            ) + 1,
            dayWidth,
          );

      const succStartX = dateToX(
        new Date(succItem.plannedStartDate),
        timelineStart,
        dayWidth,
      );

      const predY = headerHeight + predIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
      const succY = headerHeight + succIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

      lines.push({
        id: dep.ganttDependencyId,
        x1: predEndX,
        y1: predY,
        x2: succStartX,
        y2: succY,
        type: dep.dependencyType,
      });
    }
    return lines;
  }, [dependencies, rowIndexMap, rows, timelineStart, dayWidth, headerHeight]);

  return (
    <TooltipProvider>
      <div
        className="relative select-none"
        style={{ width: totalWidth, height: headerHeight + totalHeight }}
      >
        <svg
          width={totalWidth}
          height={headerHeight + totalHeight}
          className="block bg-background"
        >
          <GanttArrowheadDefs />

          {/* Background alternating & hover rows */}
          {rows.map((row, i) => {
            const isHovered = hoveredRowId === row.id;
            return (
              <rect
                key={`bg-${row.id}`}
                x={0}
                y={headerHeight + i * ROW_HEIGHT}
                width={totalWidth}
                height={ROW_HEIGHT}
                className={`transition-colors duration-150 cursor-pointer ${
                  isHovered
                    ? "fill-slate-100/70"
                    : row.type === "phase"
                      ? "fill-slate-50/50"
                      : i % 2 === 0
                        ? "fill-none"
                        : "fill-slate-50/20"
                }`}
                onMouseEnter={() => onHoverRow(row.id)}
                onMouseLeave={() => onHoverRow(null)}
                onClick={() => {
                  if (row.type === "item" && row.item) {
                    onItemClick(row.item);
                  }
                }}
              />
            );
          })}

          {/* Vertical grid lines (weekly) */}
          {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, wi) => {
            const x = wi * 7 * dayWidth;
            return (
              <line
                key={`vgrid-${wi}`}
                x1={x}
                y1={headerHeight}
                x2={x}
                y2={headerHeight + totalHeight}
                className="stroke-slate-200/50"
                strokeWidth={0.5}
                strokeDasharray="2,3"
              />
            );
          })}

          {/* Horizontal row lines */}
          {rows.map((row, i) => (
            <line
              key={`hline-${row.id}`}
              x1={0}
              y1={headerHeight + i * ROW_HEIGHT}
              x2={totalWidth}
              y2={headerHeight + i * ROW_HEIGHT}
              className="stroke-slate-200"
              strokeWidth={0.5}
            />
          ))}
          {/* Bottom edge border */}
          <line
            x1={0}
            y1={headerHeight + totalHeight}
            x2={totalWidth}
            y2={headerHeight + totalHeight}
            className="stroke-slate-200"
            strokeWidth={0.5}
          />

          {/* Today marker (Clean, subtle vertical line) */}
          {todayX !== null && (
            <line
              x1={todayX}
              y1={headerHeight}
              x2={todayX}
              y2={headerHeight + totalHeight}
              className="stroke-rose-400/80"
              strokeWidth={1.5}
              strokeDasharray="3,3"
            />
          )}

          {/* Dependency arrows */}
          {depLines.map((line) => (
            <DependencyArrow key={line.id} {...line} />
          ))}

          {/* Bars & milestones */}
          {rows.map((row, i) => {
            if (row.type === "phase") {
              return (
                <PhaseBand
                  key={row.id}
                  row={row}
                  rowIndex={i}
                  headerHeight={headerHeight}
                  itemsTree={itemsTree}
                  timelineStart={timelineStart}
                  dayWidth={dayWidth}
                  onHover={() => onHoverRow(row.id)}
                  onLeave={() => onHoverRow(null)}
                />
              );
            }
            if (!row.item) return null;
            return (
              <GanttBar
                key={row.id}
                item={row.item}
                rowIndex={i}
                headerHeight={headerHeight}
                timelineStart={timelineStart}
                dayWidth={dayWidth}
                phases={phases}
                onClick={() => onItemClick(row.item!)}
                onHover={() => onHoverRow(row.id)}
                onLeave={() => onHoverRow(null)}
              />
            );
          })}
        </svg>
      </div>
    </TooltipProvider>
  );
});

// ── Phase summary bar ────────────────────────────────────────────────────────

function PhaseBand({
  row,
  rowIndex,
  headerHeight,
  itemsTree,
  timelineStart,
  dayWidth,
  onHover,
  onLeave,
}: {
  row: GanttFlatRow;
  rowIndex: number;
  headerHeight: number;
  itemsTree: CompanyGanttItem[];
  timelineStart: Date;
  dayWidth: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  const y = headerHeight + rowIndex * ROW_HEIGHT;
  const phaseColor = row.phaseColor ?? "#6366f1";

  // Calculate overall bounds of this phase's items
  const bounds = useMemo(() => {
    if (!row.phaseId) return { startDate: null, endDate: null };
    return computePhaseBounds(itemsTree, row.phaseId);
  }, [itemsTree, row.phaseId]);

  if (!bounds.startDate || !bounds.endDate) return null;

  const startX = dateToX(bounds.startDate, timelineStart, dayWidth);
  const duration =
    differenceInCalendarDays(
      startOfDay(bounds.endDate),
      startOfDay(bounds.startDate),
    ) + 1;
  const width = durationToWidth(duration, dayWidth);
  const barY = y + ROW_HEIGHT / 2 - 2;
  const barHeight = 4;

  return (
    <g className="cursor-pointer" onMouseEnter={onHover} onMouseLeave={onLeave}>
      {/* Summary Bracket Line */}
      <rect
        x={startX}
        y={barY}
        width={width}
        height={barHeight}
        fill={phaseColor}
        rx={1}
      />
      {/* Left angled end */}
      <polygon
        points={`${startX},${barY} ${startX + 5},${barY} ${startX},${barY + 7}`}
        fill={phaseColor}
      />
      {/* Right angled end */}
      <polygon
        points={`${startX + width},${barY} ${startX + width - 5},${barY} ${startX + width},${barY + 7}`}
        fill={phaseColor}
      />
      {/* Phase title adjacent text */}
      <text
        x={startX + width + 8}
        y={barY + 5}
        fontSize={10}
        fontWeight={600}
        fill={phaseColor}
        className="select-none pointer-events-none opacity-85"
      >
        {row.phaseName}
      </text>
    </g>
  );
}

// ── Individual bar ───────────────────────────────────────────────────────────

interface GanttBarProps {
  item: CompanyGanttItem;
  rowIndex: number;
  headerHeight: number;
  timelineStart: Date;
  dayWidth: number;
  phases: CompanyGanttPhase[];
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function GanttBar({
  item,
  rowIndex,
  headerHeight,
  timelineStart,
  dayWidth,
  phases,
  onClick,
  onHover,
  onLeave,
}: GanttBarProps) {
  const y = headerHeight + rowIndex * ROW_HEIGHT;
  const barY = y + (ROW_HEIGHT - BAR_HEIGHT) / 2;

  // Find phase color for beautiful color categorization
  const phase = useMemo(() => {
    return phases.find((p) => p.ganttPhaseId === item.ganttPhaseId);
  }, [phases, item.ganttPhaseId]);

  const statusColor = ITEM_STATUS_COLOR[item.itemStatus] ?? "#94a3b8";

  // Dynamic color inheritance: if task has no custom color, inherit the phase's theme color!
  const parentColor = phase?.color ?? statusColor;
  const itemColor =
    item.color && item.color.trim() !== "" ? item.color : parentColor;

  const isItemMilestone = item.itemType === "MILESTONE" || item.isMilestone;

  if (isItemMilestone) {
    const cx =
      dateToX(new Date(item.plannedStartDate), timelineStart, dayWidth) +
      dayWidth / 2;
    const cy = y + ROW_HEIGHT / 2;

    const milestoneTooltip = (
      <div className="text-xs space-y-1 text-slate-200">
        <div className="font-semibold text-slate-50">{item.itemName}</div>
        <div className="text-[11px] text-slate-400">
          Milestone • {fmtDate(item.plannedStartDate)}
        </div>
      </div>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <g
            onClick={onClick}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="cursor-pointer"
          >
            {/* Milestone diamond */}
            <polygon
              points={`${cx},${cy - MILESTONE_SIZE} ${cx + MILESTONE_SIZE},${cy} ${cx},${cy + MILESTONE_SIZE} ${cx - MILESTONE_SIZE},${cy}`}
              fill="#ec4899"
              stroke="#db2777"
              strokeWidth={1.5}
            />
            {/* Milestone label next to diamond - Background Mask */}
            <text
              x={cx + MILESTONE_SIZE + 6}
              y={cy + 3.5}
              fontSize={10}
              fontWeight={500}
              stroke="white"
              strokeWidth={4}
              strokeLinejoin="round"
              className="fill-none select-none pointer-events-none opacity-95"
            >
              {item.itemName}
            </text>
            {/* Milestone label next to diamond */}
            <text
              x={cx + MILESTONE_SIZE + 6}
              y={cy + 3.5}
              fontSize={10}
              fontWeight={500}
              className="fill-slate-500 select-none pointer-events-none"
            >
              {item.itemName}
            </text>
          </g>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="p-2.5 bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl min-w-[180px] z-50"
        >
          {milestoneTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  const durationDays = Math.max(
    differenceInCalendarDays(
      startOfDay(new Date(item.plannedEndDate)),
      startOfDay(new Date(item.plannedStartDate)),
    ) + 1,
    1,
  );

  const x = dateToX(new Date(item.plannedStartDate), timelineStart, dayWidth);
  const width = durationToWidth(durationDays, dayWidth);
  const progressWidth = (item.progressPercentage / 100) * width;

  // Dynamic text color for duration inside the bar (white if covered by progress, slate-700 if not)
  const isTextOnProgress = progressWidth >= width / 2 + 15;
  const insideTextColor = isTextOnProgress ? "fill-white" : "fill-slate-700";

  const taskTooltip = (
    <div className="text-xs space-y-1 text-slate-200">
      <div className="font-semibold text-slate-50 text-sm truncate max-w-[220px]">
        {item.itemName}
      </div>
      <div className="text-[11px] text-slate-300">
        <span className="text-slate-500 font-medium mr-1">Planned:</span>
        {fmtDate(item.plannedStartDate)} – {fmtDate(item.plannedEndDate)}
      </div>
      <div className="text-[11px] text-slate-300">
        <span className="text-slate-500 font-medium mr-1">Duration:</span>
        {durationDays} {durationDays === 1 ? "day" : "days"}
      </div>
      <div className="text-[11px] text-slate-300">
        <span className="text-slate-500 font-medium mr-1">Status:</span>
        {item.itemStatus.replace("_", " ")} ({item.progressPercentage}%)
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          className="cursor-pointer group"
        >
          {/* Background bar */}
          <rect
            x={x}
            y={barY}
            width={width}
            height={BAR_HEIGHT}
            rx={5}
            ry={5}
            fill={`${itemColor}15`}
            stroke={itemColor}
            strokeWidth={1.2}
            className="transition-all duration-150 group-hover:stroke-[1.8px]"
          />
          {/* Progress fill */}
          {progressWidth > 0 && (
            <rect
              x={x}
              y={barY}
              width={progressWidth}
              height={BAR_HEIGHT}
              rx={5}
              ry={5}
              fill={`${itemColor}a8`}
            />
          )}

          {/* Duration inside the bar (only shown if width is sufficient to prevent text overflow) */}
          {width >= 60 && (
            <text
              x={x + width / 2}
              y={barY + BAR_HEIGHT / 2 + 3}
              fontSize={9}
              fontWeight={600}
              textAnchor="middle"
              className={`${insideTextColor} select-none pointer-events-none transition-colors`}
            >
              {durationDays} {durationDays === 1 ? "day" : "days"}
            </text>
          )}

          {/* Text label showing task name and progress - Background Mask */}
          <text
            x={x + width + 8}
            y={barY + BAR_HEIGHT / 2 + 3.5}
            fontSize={10}
            fontWeight={500}
            stroke="white"
            strokeWidth={4}
            strokeLinejoin="round"
            className="fill-none select-none pointer-events-none opacity-95"
          >
            {item.itemName} ({item.progressPercentage}%)
          </text>
          {/* Text label showing task name and progress */}
          <text
            x={x + width + 8}
            y={barY + BAR_HEIGHT / 2 + 3.5}
            fontSize={10}
            fontWeight={500}
            className="fill-slate-700 select-none pointer-events-none transition-colors group-hover:fill-primary"
          >
            {item.itemName}{" "}
            <tspan className="fill-slate-400" fontSize={9}>
              ({item.progressPercentage}%)
            </tspan>
          </text>
        </g>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="p-3 bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl min-w-[220px] z-50"
      >
        {taskTooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Dependency arrow ─────────────────────────────────────────────────────────

interface DependencyArrowProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
}

function DependencyArrow({ x1, y1, x2, y2 }: DependencyArrowProps) {
  const OFFSET = 12;
  const isSufficientGap = x2 > x1 + 8;

  // Render solid elegant orthogonal elbows
  let d = "";
  if (isSufficientGap) {
    d = `M ${x1} ${y1} L ${x1 + OFFSET} ${y1} L ${x1 + OFFSET} ${y2} L ${x2} ${y2}`;
  } else {
    // If successor is behind or close to predecessor, route arrow backward with an elegant hook
    const midY = (y1 + y2) / 2;
    d = `M ${x1} ${y1} L ${x1 + OFFSET} ${y1} L ${x1 + OFFSET} ${midY} L ${x2 - OFFSET} ${midY} L ${x2 - OFFSET} ${y2} L ${x2} ${y2}`;
  }

  return (
    <g>
      <path
        d={d}
        fill="none"
        className="stroke-slate-400/90 pointer-events-none"
        strokeWidth={1.3}
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}

// Export arrowhead defs to be included in parent SVG
export function GanttArrowheadDefs() {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto"
      >
        <polygon points="0 1, 5 3, 0 5" className="fill-slate-400/90" />
      </marker>
    </defs>
  );
}
