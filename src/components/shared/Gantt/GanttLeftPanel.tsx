import { memo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Diamond,
  SquareCheck,
  Users,
} from "lucide-react";
import type { GanttFlatRow, CompanyGanttItem } from "@/types/gantt";
import {
  ITEM_STATUS_COLOR,
  ITEM_STATUS_BG,
  PRIORITY_COLOR,
  getInitials,
} from "@/pages/gantt/utils/gantt.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const ROW_HEIGHT = 36;
const LEFT_PANEL_WIDTH = 320;

interface Props {
  rows: GanttFlatRow[];
  headerHeight: number;
  onTogglePhase: (phaseId: string) => void;
  onToggleItem: (itemId: string) => void;
  onItemClick: (item: CompanyGanttItem) => void;
  hoveredRowId: string | null;
  onHoverRow: (id: string | null) => void;
}

export const GanttLeftPanel = memo(function GanttLeftPanel({
  rows,
  headerHeight,
  onTogglePhase,
  onToggleItem,
  onItemClick,
  hoveredRowId,
  onHoverRow,
}: Props) {
  return (
    <div
      style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
      className="flex-shrink-0 border-r border-border bg-background select-none"
    >
      {/* Header spacer */}
      {headerHeight > 0 && (
        <div
          style={{ height: headerHeight }}
          className="border-b border-border bg-muted/30 flex items-end px-3 pb-1"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Task
          </span>
        </div>
      )}

      {/* Rows */}
      {rows.map((row) => {
        const isHovered = hoveredRowId === row.id;
        if (row.type === "phase") {
          return (
            <PhaseRow
              key={row.id}
              row={row}
              height={ROW_HEIGHT}
              isHovered={isHovered}
              onToggle={() => row.phaseId && onTogglePhase(row.phaseId)}
              onMouseEnter={() => onHoverRow(row.id)}
              onMouseLeave={() => onHoverRow(null)}
            />
          );
        }
        if (!row.item) return null;
        return (
          <ItemRow
            key={row.id}
            row={row}
            height={ROW_HEIGHT}
            isHovered={isHovered}
            onToggle={() => onToggleItem(row.item!.ganttItemId)}
            onClick={() => onItemClick(row.item!)}
            onMouseEnter={() => onHoverRow(row.id)}
            onMouseLeave={() => onHoverRow(null)}
          />
        );
      })}
    </div>
  );
});

export { LEFT_PANEL_WIDTH };

// ── Phase row ────────────────────────────────────────────────────────────────

function PhaseRow({
  row,
  height,
  isHovered,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}: {
  row: GanttFlatRow;
  height: number;
  isHovered: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      style={{ height }}
      className={`flex items-center gap-1.5 px-2 border-b border-border cursor-pointer transition-colors ${
        isHovered ? "bg-muted/70" : "bg-muted/30 hover:bg-muted/50"
      }`}
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ background: row.phaseColor ?? "#6366f1" }}
      />
      {row.isCollapsed ? (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      <span className="text-xs font-semibold truncate">{row.phaseName}</span>
    </div>
  );
}

// ── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  row,
  height,
  isHovered,
  onToggle,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  row: GanttFlatRow;
  height: number;
  isHovered: boolean;
  onToggle: () => void;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const item = row.item!;
  const statusColor = ITEM_STATUS_COLOR[item.itemStatus];
  const statusBg = ITEM_STATUS_BG[item.itemStatus];
  const priorityColor = PRIORITY_COLOR[item.priority];

  return (
    <TooltipProvider>
      <div
        style={{
          height,
          paddingLeft: `${8 + row.depth * 16}px`,
        }}
        className={`flex items-center gap-1 border-b border-border transition-colors cursor-pointer pr-2 ${
          isHovered ? "bg-muted/40" : "hover:bg-muted/20"
        }`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Expand/collapse toggle for parent items */}
        {row.hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="shrink-0 p-0.5 hover:text-primary transition-colors"
          >
            {row.isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Type icon */}
        {item.itemType === "MILESTONE" || item.isMilestone ? (
          <Diamond className="h-3 w-3 text-yellow-500 shrink-0" />
        ) : (
          <SquareCheck
            className="h-3 w-3 shrink-0"
            style={{ color: statusColor }}
          />
        )}

        {/* Name */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs truncate flex-1 min-w-0">
              {item.itemName}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="font-medium">{item.itemName}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Badge className={`text-[10px] px-1 py-0 ${statusBg}`}>
                {item.itemStatus.replace("_", " ")}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] px-1 py-0 ${priorityColor}`}
              >
                {item.priority}
              </Badge>
            </div>
            <p className="text-[10px] mt-1 text-muted-foreground">
              {item.progressPercentage}% complete
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Assignee avatar */}
        {item.assignedEmployee?.employeeName ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[8px] font-bold shrink-0">
                {getInitials(item.assignedEmployee.employeeName)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {item.assignedEmployee.employeeName}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Users className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        )}
      </div>
    </TooltipProvider>
  );
}
