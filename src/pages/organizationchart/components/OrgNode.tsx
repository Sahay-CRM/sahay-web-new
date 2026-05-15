import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { MoreVertical, Minus, Plus } from "lucide-react";
import { getInitials, avatarColor } from "../utils/orgChartUtils";
import { NodeContextMenu } from "./NodeContextMenu";

export const OrgNode = ({
  data,
  id,
  selected,
}: {
  data: OrgNodeData;
  id: string;
  selected?: boolean;
}) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const isUnassigned = !data.employeeId;
  const initials = getInitials(data.label);
  const bgColor = isUnassigned ? "#94a3b8" : avatarColor(data.label);

  return (
    <div
      className={`group bg-white border rounded-2xl transition-all duration-300 ${
        selected
          ? "border-primary shadow-[0_0_20px_rgba(46,48,144,0.15)] ring-2 ring-primary/10"
          : "border-slate-100 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      }`}
      style={{ width: 240, minHeight: 130 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-200 !border-2 !border-white !top-[-5px] transition-colors group-hover:!bg-primary"
      />

      {/* Card Header: Department/Title */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] truncate">
            {data.department || "Department"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuPos({ x: e.clientX, y: e.clientY });
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Card Body: Avatar + Name + Title */}
      <div className="px-4 pb-4 flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
          style={{
            background: isUnassigned
              ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
              : `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 truncate leading-tight mb-0.5">
            {data.label}
          </p>
          <p className="text-[11px] font-medium text-slate-500 truncate">
            {data.title}
          </p>
        </div>
      </div>

      {/* Unassigned badge */}
      {isUnassigned && (
        <div className="px-4 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Open Position
          </div>
        </div>
      )}

      {/* Expand/Collapse */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand?.(id);
          }}
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all z-10 group/btn"
        >
          {data.isExpanded ? (
            <Minus className="w-3.5 h-3.5 stroke-[3px]" />
          ) : (
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
          )}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-200 !border-2 !border-white !bottom-[-5px] transition-colors group-hover:!bg-primary"
      />

      {menuPos && (
        <NodeContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onAddChild={() => data.onAddChild?.(id)}
          onEdit={() => data.onEdit?.(id)}
          onDelete={() => data.onDelete?.(id)}
          onRemoveEmployee={
            data.employeeId
              ? () => data.onRemoveEmployee?.(data.employeeId!)
              : undefined
          }
          onSeparatePosition={() => data.onSeparatePosition?.(id)}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
};
