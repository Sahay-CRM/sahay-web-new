import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { MoreHorizontal, Minus, Plus, UserMinus } from "lucide-react";
import { getInitials, avatarColor } from "../utils/orgChartUtils";
import { NodeContextMenu } from "./NodeContextMenu";
import { Button } from "@/components/ui/button";

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

  const employees = data.employees || [];
  const isUnassigned = employees.length === 0;

  return (
    <div
      className={`group relative bg-white border transition-all flex flex-col ${
        selected
          ? "border-primary shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
      style={{ width: 220, minHeight: 72, borderRadius: 10 }}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-300 !border !border-white !top-[-4px]"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <p
            className="text-[11px] font-semibold text-gray-800 truncate leading-none"
            title={data.seatTitle || "Position"}
          >
            {data.seatTitle || "Position"}
          </p>
          {data.isManager && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200/60 uppercase shrink-0 text-[9px] tracking-wider leading-none">
              Manager
            </span>
          )}
          {/* {data.isDeptHead && (
            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200/60 uppercase shrink-0 text-[9px] tracking-wider leading-none">
              Dept Head
            </span>
          )} */}
        </div>

        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setMenuPos({ x: e.clientX, y: e.clientY });
          }}
          className="w-5 h-5 p-0 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition border-none cursor-pointer shadow-none"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Employees */}
      <div className="p-2 space-y-1.5 flex-1">
        {employees.map((emp) => {
          const initials = getInitials(emp.employeeName);
          const bgColor = avatarColor(emp.employeeName);

          return (
            <div
              key={emp.employeeId}
              className="group/emp flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-gray-50 transition relative"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <p
                  className="text-[11px] font-medium text-gray-800 truncate"
                  title={emp.employeeName}
                >
                  {emp.employeeName}
                </p>

                <p
                  className="text-[10px] text-gray-500 truncate"
                  title={emp.designationName || emp.employeeType || "Employee"}
                >
                  {emp.designationName || emp.employeeType || "Employee"}
                </p>
              </div>

              {data.onRemoveEmployee && (
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onRemoveEmployee?.(emp.employeeId);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/emp:opacity-100 text-red-500 hover:text-red-700 transition p-0 w-fit h-fit border-none cursor-pointer shadow-none"
                >
                  <UserMinus className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {isUnassigned && (
          <div className="text-center py-2">
            <span className="text-[10px] text-amber-600 font-medium">
              Open Position
            </span>
          </div>
        )}
      </div>

      {/* Expand Collapse */}
      {data.hasChildren && (
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand?.(id);
          }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 p-0 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:border-primary hover:text-primary transition cursor-pointer shadow-none"
        >
          {data.isExpanded ? (
            <Minus className="w-3 h-3" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </Button>
      )}

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-300 !border !border-white !bottom-[-4px]"
      />

      {/* Context Menu */}
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
