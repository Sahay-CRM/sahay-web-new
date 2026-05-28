import { memo } from "react";
import type { CompanyGanttPhase } from "@/types/gantt";
import { buildTimelineHeaders } from "@/pages/gantt/utils/gantt.utils";

const HEADER_MONTH_H = 28;
const HEADER_WEEK_H = 22;

interface Props {
  phases?: CompanyGanttPhase[];
  timelineStart: Date;
  totalDays: number;
  dayWidth: number;
  viewMode: "Day" | "Week" | "Month" | "Year";
}

export const GanttTimelineHeader = memo(function GanttTimelineHeader({
  timelineStart,
  totalDays,
  dayWidth,
  viewMode,
}: Props) {
  const totalWidth = totalDays * dayWidth;
  const { topHeaders, bottomHeaders } = buildTimelineHeaders(
    timelineStart,
    totalDays,
    dayWidth,
    viewMode,
  );

  return (
    <svg
      width={totalWidth}
      height={HEADER_MONTH_H + HEADER_WEEK_H}
      className="block bg-muted/20"
    >
      {/* Top Header Row (e.g. Month Year or Year) */}
      {topHeaders.map((m, idx) => (
        <g key={`top-${idx}-${m.x}`}>
          <rect
            x={m.x}
            y={0}
            width={m.width}
            height={HEADER_MONTH_H}
            className="fill-none"
          />
          <line
            x1={m.x}
            y1={0}
            x2={m.x}
            y2={HEADER_MONTH_H + HEADER_WEEK_H}
            className="stroke-slate-200"
            strokeWidth={0.8}
          />
          <text
            x={m.x + m.width / 2}
            y={HEADER_MONTH_H - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            className="fill-slate-600 select-none"
          >
            {m.label}
          </text>
        </g>
      ))}

      {/* Separator line between top and bottom header rows */}
      <line
        x1={0}
        y1={HEADER_MONTH_H}
        x2={totalWidth}
        y2={HEADER_MONTH_H}
        className="stroke-slate-200"
        strokeWidth={0.8}
      />

      {/* Bottom Header Row (e.g. Day number, Week start, Month name, or Quarter) */}
      {bottomHeaders.map((w, idx) => (
        <g key={`bottom-${idx}-${w.x}`}>
          <rect
            x={w.x}
            y={HEADER_MONTH_H}
            width={w.width}
            height={HEADER_WEEK_H}
            className={w.isToday ? "fill-rose-500/10" : "fill-none"}
          />
          <line
            x1={w.x}
            y1={HEADER_MONTH_H}
            x2={w.x}
            y2={HEADER_MONTH_H + HEADER_WEEK_H}
            className="stroke-slate-200/50"
            strokeWidth={0.6}
          />
          <text
            x={w.x + w.width / 2}
            y={HEADER_MONTH_H + HEADER_WEEK_H - 6}
            textAnchor="middle"
            fontSize={9.5}
            fontWeight={w.isToday ? 700 : 500}
            className={`select-none ${w.isToday ? "fill-rose-500" : "fill-slate-500"}`}
          >
            {w.label}
          </text>
        </g>
      ))}

      {/* Bottom border line */}
      <line
        x1={0}
        y1={HEADER_MONTH_H + HEADER_WEEK_H}
        x2={totalWidth}
        y2={HEADER_MONTH_H + HEADER_WEEK_H}
        className="stroke-slate-200"
        strokeWidth={1}
      />
    </svg>
  );
});

export const TIMELINE_HEADER_HEIGHT = HEADER_MONTH_H + HEADER_WEEK_H;
