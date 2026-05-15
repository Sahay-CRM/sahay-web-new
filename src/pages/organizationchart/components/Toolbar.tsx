import { useViewport, useReactFlow } from "@xyflow/react";
import {
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Search,
  Maximize2,
  Share2,
  Layers,
} from "lucide-react";

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
    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 shrink-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left Section: Title & Meta */}
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
            Company Hierarchy
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary uppercase">
              Admin
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {totalNodes} Total positions mapped
          </p>
        </div>

        <div className="h-8 w-px bg-slate-100" />

        {/* Level Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              disabled={visibleLevel <= 1}
              onClick={() => onLevelChange(visibleLevel - 1)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center px-3 min-w-[70px]">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">
                Levels
              </span>
              <span className="text-sm font-black text-slate-800 leading-none">
                {visibleLevel}
              </span>
            </div>
            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-all disabled:opacity-20 shadow-sm"
              disabled={visibleLevel >= maxLevel}
              onClick={() => onLevelChange(visibleLevel + 1)}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onCollapseAll}
              className="px-3 py-2 text-xs font-black text-slate-500 hover:text-primary transition-all"
            >
              Collapse
            </button>
            <button
              onClick={onExpandAll}
              className="px-3 py-2 text-xs font-black text-slate-500 hover:text-primary transition-all"
            >
              Expand
            </button>
          </div>
        </div>
      </div>

      {/* Center Section: Canvas Controls */}
      <div className="flex items-center gap-4 bg-slate-50/50 px-5 py-1.5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => zoomOut()}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-full transition-all shadow-sm"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">
              Zoom
            </span>
            <span className="text-sm font-black text-slate-800 leading-none">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            onClick={() => zoomIn()}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-full transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        <button
          onClick={onFitView}
          className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm group"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDirectionChange(direction === "TB" ? "LR" : "TB")}
          className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm group"
          title="Change Orientation"
        >
          <Layers
            className={`w-4 h-4 transition-transform duration-300 ${direction === "LR" ? "rotate-[-90deg]" : ""}`}
          />
        </button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hierarchy..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 w-[200px] transition-all"
          />
        </div>

        <button
          onClick={() => {}}
          className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onAddSeat}
          className="flex items-center gap-2 bg-primary text-white text-[13px] font-black px-6 py-2.5 rounded-xl shadow-[0_10px_20px_rgba(46,48,144,0.2)] hover:shadow-[0_15px_25px_rgba(46,48,144,0.3)] hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Position
        </button>
      </div>
    </div>
  );
}
