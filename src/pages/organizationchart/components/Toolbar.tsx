import { useViewport, useReactFlow } from "@xyflow/react";
import { ChevronUp, ChevronDown, Minus, Plus, Search } from "lucide-react";

export function Toolbar({
  totalNodes,
  visibleLevel,
  maxLevel,
  onLevelChange,
  direction,
  onDirectionChange,
  onCollapseAll,
  onExpandAll,
  onFitView,
  onSearch,
  onAddSeat,
}: ToolbarProps) {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 z-20 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
            Organizational Chart
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {totalNodes} users in seats
          </p>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50/50">
            <button
              className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
              disabled={visibleLevel >= maxLevel}
              onClick={() => onLevelChange(visibleLevel + 1)}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2 min-w-[60px] text-center">
              {visibleLevel} levels
            </span>
            <button
              className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
              disabled={visibleLevel <= 1}
              onClick={() => onLevelChange(visibleLevel - 1)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onCollapseAll}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
          >
            Collapse all
          </button>
          <button
            onClick={onExpandAll}
            className="text-xs font-bold text-slate-400 cursor-not-allowed px-3 py-2"
          >
            Expand all
          </button>
        </div>
      </div>

      {/* Center Section: Zoom Slider Mockup */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border border-slate-200 rounded-full px-4 py-1.5 bg-white shadow-sm">
          <button
            onClick={() => zoomOut()}
            className="text-slate-400 hover:text-slate-600"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-24 h-1 bg-slate-100 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-slate-300 rounded-full"
              style={{ width: `${zoom * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md"
              style={{ left: `${zoom * 100}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-700 min-w-[40px]">
            {Math.round(zoom * 100)}% Zoom
          </span>
          <button
            onClick={() => zoomIn()}
            className="text-slate-400 hover:text-slate-600"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onFitView}
          className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-5 py-2 hover:bg-slate-50 transition-all"
        >
          Fit screen
        </button>

        <button
          onClick={() => window.print()}
          className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-5 py-2 hover:bg-slate-50 transition-all"
        >
          Print visible
        </button>

        <div className="relative group">
          <button
            onClick={() => onDirectionChange(direction === "TB" ? "LR" : "TB")}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-5 py-2 hover:bg-slate-50 transition-all"
          >
            <span>{direction === "TB" ? "Vertical" : "Horizontal"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => onSearch("")}
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={onAddSeat}
          className="flex items-center gap-2 bg-[#2e3090] text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-lg hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Add seat
        </button>
      </div>
    </div>
  );
}
