import { memo } from "react";
import type { CompanyGanttPhase } from "@/types/gantt";
import {
  buildMonthLabels,
  buildWeekLabels,
} from "@/pages/gantt/utils/gantt.utils";

const ROW_HEIGHT = 36;
const HEADER_MONTH_H = 28;
const HEADER_WEEK_H = 22;

interface Props {
  phases: CompanyGanttPhase[];
  timelineStart: Date;
  totalDays: number;
  dayWidth: number;
}

export const GanttTimelineHeader = memo(function GanttTimelineHeader({
  timelineStart,
  totalDays,
  dayWidth,
}: Props) {
  const totalWidth = totalDays * dayWidth;
  const monthLabels = buildMonthLabels(timelineStart, totalDays, dayWidth);
  const weekLabels = buildWeekLabels(timelineStart, totalDays, dayWidth);

  return (
    <svg
      width={totalWidth}
      height={HEADER_MONTH_H + HEADER_WEEK_H}
      className="block"
    >
      {/* Month row */}
      {monthLabels.map((m) => (
        <g key={`month-${m.x}`}>
          <rect
            x={m.x}
            y={0}
            width={m.width}
            height={HEADER_MONTH_H}
            fill="transparent"
          />
          <line
            x1={m.x}
            y1={0}
            x2={m.x}
            y2={HEADER_MONTH_H + HEADER_WEEK_H}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={m.x + m.width / 2}
            y={HEADER_MONTH_H - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="hsl(var(--muted-foreground))"
            className="select-none"
          >
            {m.label}
          </text>
        </g>
      ))}

      {/* Week row */}
      {weekLabels.map((w) => (
        <g key={`week-${w.x}`}>
          <rect
            x={w.x}
            y={HEADER_MONTH_H}
            width={w.width}
            height={HEADER_WEEK_H}
            fill={w.isToday ? "hsl(var(--primary) / 0.05)" : "transparent"}
          />
          <line
            x1={w.x}
            y1={HEADER_MONTH_H}
            x2={w.x}
            y2={HEADER_MONTH_H + HEADER_WEEK_H}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={w.x + 4}
            y={HEADER_MONTH_H + HEADER_WEEK_H - 6}
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
            className="select-none"
          >
            {w.label}
          </text>
        </g>
      ))}

      {/* Bottom border */}
      <line
        x1={0}
        y1={HEADER_MONTH_H + HEADER_WEEK_H}
        x2={totalWidth}
        y2={HEADER_MONTH_H + HEADER_WEEK_H}
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
    </svg>
  );
});

export const TIMELINE_HEADER_HEIGHT = HEADER_MONTH_H + HEADER_WEEK_H;
export { ROW_HEIGHT };
