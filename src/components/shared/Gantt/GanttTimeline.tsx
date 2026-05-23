import { memo, useMemo } from "react";
import type {
  CompanyGanttItem,
  CompanyGanttDependency,
  GanttFlatRow,
} from "@/types/gantt";
import {
  dateToX,
  durationToWidth,
  ITEM_STATUS_COLOR,
} from "@/pages/gantt/utils/gantt.utils";
import { differenceInCalendarDays, startOfDay } from "date-fns";

const ROW_HEIGHT = 36;
const BAR_HEIGHT = 18;
const MILESTONE_SIZE = 10;

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

      const predEndX = predItem.isMilestone
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
            ),
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
    <svg
      width={totalWidth}
      height={headerHeight + totalHeight}
      className="block"
      style={{ minHeight: "100%" }}
    >
      {/* Background alternating rows */}
      {rows.map((row, i) => (
        <rect
          key={`bg-${row.id}`}
          x={0}
          y={headerHeight + i * ROW_HEIGHT}
          width={totalWidth}
          height={ROW_HEIGHT}
          fill={
            row.type === "phase"
              ? "hsl(var(--muted) / 0.4)"
              : i % 2 === 0
                ? "transparent"
                : "hsl(var(--muted) / 0.15)"
          }
        />
      ))}

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
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            strokeDasharray="2,4"
          />
        );
      })}

      {/* Horizontal row lines */}
      {rows.map((row, i) => (
        <line
          key={`hline-${row.id}`}
          x1={0}
          y1={headerHeight + (i + 1) * ROW_HEIGHT}
          x2={totalWidth}
          y2={headerHeight + (i + 1) * ROW_HEIGHT}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
        />
      ))}

      {/* Today marker */}
      {todayX !== null && (
        <g>
          <line
            x1={todayX}
            y1={headerHeight}
            x2={todayX}
            y2={headerHeight + totalHeight}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <text
            x={todayX + 3}
            y={headerHeight + 12}
            fontSize={9}
            fill="#ef4444"
            className="select-none"
            fontWeight={600}
          >
            Today
          </text>
        </g>
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
              totalWidth={totalWidth}
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
            onClick={() => onItemClick(row.item!)}
          />
        );
      })}
    </svg>
  );
});

// ── Phase band label ────────────────────────────────────────────────────────

function PhaseBand({
  row,
  rowIndex,
  headerHeight,
  totalWidth,
}: {
  row: GanttFlatRow;
  rowIndex: number;
  headerHeight: number;
  totalWidth: number;
}) {
  const y = headerHeight + rowIndex * ROW_HEIGHT;
  return (
    <g>
      <rect
        x={0}
        y={y}
        width={totalWidth}
        height={ROW_HEIGHT}
        fill={`${row.phaseColor}22`}
      />
      <line
        x1={0}
        y1={y}
        x2={totalWidth}
        y2={y}
        stroke={row.phaseColor ?? "#6366f1"}
        strokeWidth={1.5}
      />
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
  onClick: () => void;
}

function GanttBar({
  item,
  rowIndex,
  headerHeight,
  timelineStart,
  dayWidth,
  onClick,
}: GanttBarProps) {
  const y = headerHeight + rowIndex * ROW_HEIGHT;
  const barY = y + (ROW_HEIGHT - BAR_HEIGHT) / 2;
  const statusColor = ITEM_STATUS_COLOR[item.itemStatus] ?? "#94a3b8";
  const itemColor = item.color ?? statusColor;

  if (item.isMilestone) {
    const cx =
      dateToX(new Date(item.plannedStartDate), timelineStart, dayWidth) +
      dayWidth / 2;
    const cy = y + ROW_HEIGHT / 2;
    return (
      <g onClick={onClick} className="cursor-pointer">
        <polygon
          points={`${cx},${cy - MILESTONE_SIZE} ${cx + MILESTONE_SIZE},${cy} ${cx},${cy + MILESTONE_SIZE} ${cx - MILESTONE_SIZE},${cy}`}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={1.5}
        />
        <polygon
          points={`${cx},${cy - MILESTONE_SIZE} ${cx + MILESTONE_SIZE},${cy} ${cx},${cy + MILESTONE_SIZE} ${cx - MILESTONE_SIZE},${cy}`}
          fill="transparent"
          stroke="transparent"
          strokeWidth={8}
          className="cursor-pointer"
        />
      </g>
    );
  }

  const durationDays = Math.max(
    differenceInCalendarDays(
      startOfDay(new Date(item.plannedEndDate)),
      startOfDay(new Date(item.plannedStartDate)),
    ),
    1,
  );

  const x = dateToX(new Date(item.plannedStartDate), timelineStart, dayWidth);
  const width = durationToWidth(durationDays, dayWidth);
  const progressWidth = (item.progressPercentage / 100) * width;

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Background bar */}
      <rect
        x={x}
        y={barY}
        width={width}
        height={BAR_HEIGHT}
        rx={3}
        ry={3}
        fill={`${itemColor}33`}
        stroke={itemColor}
        strokeWidth={1}
      />
      {/* Progress fill */}
      {progressWidth > 0 && (
        <rect
          x={x}
          y={barY}
          width={progressWidth}
          height={BAR_HEIGHT}
          rx={3}
          ry={3}
          fill={`${itemColor}99`}
        />
      )}
      {/* Hit area */}
      <rect
        x={x}
        y={y}
        width={width}
        height={ROW_HEIGHT}
        fill="transparent"
        className="cursor-pointer"
      />
    </g>
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
  const OFFSET = 8;
  const midX = (x1 + x2) / 2;

  // L-shaped connector with elbow
  const d =
    x2 > x1 + 4
      ? `M ${x1} ${y1} L ${x1 + OFFSET} ${y1} L ${x1 + OFFSET} ${y2} L ${x2} ${y2}`
      : `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.2}
        strokeDasharray="4,2"
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
        markerWidth="8"
        markerHeight="6"
        refX="8"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
      </marker>
    </defs>
  );
}
