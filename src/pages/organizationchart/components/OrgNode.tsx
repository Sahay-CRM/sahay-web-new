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
      className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${
        selected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
      style={{ width: 220, minHeight: 120 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-300 !border-none !top-0"
      />

      {/* Card Header: Department */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate flex-1">
          {data.department || data.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuPos({ x: e.clientX, y: e.clientY });
          }}
          className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Body: Avatar + Name + Title */}
      <div className="px-3 pb-2 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">
            {data.label}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{data.title}</p>
        </div>
      </div>

      {/* Unassigned badge */}
      {isUnassigned && (
        <div className="px-3 pb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
            Open
          </span>
        </div>
      )}

      {/* Expand/Collapse */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand?.(id);
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-md text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all z-10"
        >
          {data.isExpanded ? (
            <Minus className="w-3 h-3" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-300 !border-none !bottom-0"
      />

      {menuPos && (
        <NodeContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onAddChild={() => data.onAddChild?.(id)}
          onEdit={() => data.onEdit?.(id)}
          onDelete={() => data.onDelete?.(id)}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
};
