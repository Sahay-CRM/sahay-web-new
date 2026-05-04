import { Handle, Position } from "@xyflow/react";
import { Edit2, Minus, Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomNodeProps {
  data: {
    label: string;
    position: string;
    image?: string;
    isExpanded?: boolean;
    onToggleExpand?: (id: string) => void;
    onEdit?: (id: string) => void;
    onAddChild?: (id: string) => void;
    hasChildren?: boolean;
  };
  id: string;
}

export default function CustomNode({ data, id }: CustomNodeProps) {
  const {
    label,
    position,
    image,
    isExpanded = true,
    onToggleExpand,
    onEdit,
    onAddChild,
    hasChildren = false,
  } = data;

  const colorMap: Record<
    string,
    { border: string; bg: string; text: string; lightBg: string }
  > = {
    primary: {
      border: "border-primary",
      bg: "bg-primary",
      text: "text-white",
      lightBg: "bg-primary/10",
    },
    green: {
      border: "border-emerald-400",
      bg: "bg-emerald-500",
      text: "text-white",
      lightBg: "bg-emerald-50",
    },
    yellow: {
      border: "border-amber-400",
      bg: "bg-amber-500",
      text: "text-white",
      lightBg: "bg-amber-50",
    },
    purple: {
      border: "border-purple-400",
      bg: "bg-purple-500",
      text: "text-white",
      lightBg: "bg-purple-50",
    },
    red: {
      border: "border-rose-400",
      bg: "bg-rose-500",
      text: "text-white",
      lightBg: "bg-rose-50",
    },
  };

  const color = "primary";
  const theme = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`relative flex flex-col items-center p-3 pb-5 w-64 rounded-xl border ${theme.border} ${theme.lightBg} shadow-sm group`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* User Avatar */}
      <div className="absolute -top-8">
        <Avatar className="h-12 w-12 border border-primary bg-white shadow-sm">
          <AvatarImage src={image} alt={label} />
          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
            {label
              ? label
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "??"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-6 flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-2 mb-1 w-full">
          <h3
            className="text-sm font-semibold text-gray-800 truncate"
            title={label}
          >
            {label}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>

        <div
          className={`text-[10px] font-normal px-3 py-1 rounded-full ${theme.bg} ${theme.text} w-full text-center truncate`}
          title={position}
        >
          {position}
        </div>
      </div>

      {/* Collapse/Expand Button (Left) */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.(id);
          }}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${theme.bg} text-white flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition-all`}
        >
          {isExpanded ? (
            <Minus className="h-3 w-3 text-white" />
          ) : (
            <Plus className="h-3 w-3 text-white" />
          )}
        </button>
      )}

      {/* Add Child Button (Bottom) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddChild?.(id);
        }}
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${theme.bg} text-white flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition-all`}
      >
        <UserPlus className="h-3 w-3" />
      </button>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
