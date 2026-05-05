import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Minus, Plus, UserPlus, Check } from "lucide-react";

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
    isSelectionMode?: boolean;
  };
  selected?: boolean;
  id: string;
}

export default function CustomNode({ data, id, selected }: CustomNodeProps) {
  const { setNodes } = useReactFlow();
  const {
    label,
    position,
    isExpanded = true,
    onToggleExpand,
    // onEdit,
    onAddChild,
    hasChildren = false,
    isSelectionMode = false,
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

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, selected: !node.selected };
        }
        return node;
      }),
    );
  };

  return (
    <div
      className={`relative flex flex-col items-center pb-3 w-fit min-w-64 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "shadow-lg scale-[1.02]"
          : `${theme.border} ${theme.lightBg} border-opacity-50 shadow-sm`
      } group bg-white`}
      onClick={(e) => isSelectionMode && handleToggleSelect(e)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* Multi-Select Checkbox */}
      {isSelectionMode && (
        <div
          className={`absolute top-1 left-2 z-10 flex items-center justify-center h-4 w-4 rounded border transition-all ${
            selected
              ? "bg-blue-500 border-blue-500"
              : "bg-white border-gray-300 shadow-sm"
          }`}
          onClick={handleToggleSelect}
        >
          {selected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
        </div>
      )}

      {/* Selected Indicator Badge */}
      {isSelectionMode && selected && (
        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center shadow-md border-2 border-gray-400 bg-white animate-in zoom-in">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* User Avatar */}
      {/* <div className="absolute -top-8">
        <Avatar
          className={`h-12 w-12 border-2 bg-white shadow-sm transition-all ${selected ? "border-blue-500" : "border-primary"}`}
        >
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
      </div> */}

      <div
        className={`text-lg font-normal px-3 py-1 mb-2 rounded-t-lg  ${theme.bg} ${theme.text} w-full text-center truncate shadow-inner`}
        title={position}
      >
        {position}
      </div>

      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-2 w-full px-2">
          <h3
            className="text-3xl font-medium text-gray-800 truncate"
            title={label}
          >
            {label}
          </h3>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button> */}
        </div>
      </div>

      {/* Collapse/Expand Button (Left) */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.(id);
          }}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${theme.bg} text-white flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition-all z-10`}
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
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${theme.bg} text-white flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 transition-all z-20`}
      >
        <UserPlus className="h-3 w-3" />
      </button>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
