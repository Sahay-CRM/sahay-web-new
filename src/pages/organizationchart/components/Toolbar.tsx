import {
  ChevronUp,
  ChevronDown,
  Plus,
  Search,
  Activity,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function Toolbar({
  // totalNodes,
  visibleLevel,
  maxLevel,
  onLevelChange,
  onSearch,
  onAddSeat,
  spanOfControl,
  permission,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 shrink-0 z-50 gap-4 shadow-xs">
      {/* Left Section: Title & Meta */}
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            {/* <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Organization Structure
            </h1> */}
            {spanOfControl && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-primary   flex items-center cursor-pointer">
                    <Activity className="w-3.5 h-3.5" />
                    Span of Control: {spanOfControl.type} ({spanOfControl.ratio}
                    )
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-80 p-4 bg-white rounded-xl shadow-xl border border-indigo-100 z-[9999]"
                >
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 pb-2 border-b border-indigo-50">
                    <Activity className="w-4 h-4 text-primary" />
                    <span>Span of Control Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-2.5 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-500 block">Type</span>
                      <span className="font-bold text-slate-800">
                        {spanOfControl.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ratio</span>
                      <span className="font-bold text-slate-800">
                        {spanOfControl.ratio}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Managers</span>
                      <span className="font-bold text-slate-800">
                        {spanOfControl.totalManagers}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Non-Managers</span>
                      <span className="font-bold text-slate-800">
                        {spanOfControl.totalNonManagers}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
                      <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />{" "}
                      Description
                    </div>
                    {spanOfControl.description}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          {/* <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {totalNodes} Total positions
          </div> */}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Level Controls */}
        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 ">
          <Button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-primary transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={visibleLevel <= 1}
            onClick={() => onLevelChange(visibleLevel - 1)}
            title="Decrease Level"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <div className="min-w-[60px] text-center text-sm font-semibold text-gray-700">
            Level {visibleLevel}
          </div>

          <Button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-primary transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={visibleLevel >= maxLevel}
            onClick={() => onLevelChange(visibleLevel + 1)}
            title="Increase Level"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-full max-w-sm">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4 text-muted-foreground" />
          </span>
          <Input
            type="text"
            placeholder="Search hierarchy..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-2 w-64 lg:w-80 h-10 py-2 text-sm bg-transparent"
          />
        </div>

        {permission.Add && (
          <Button
            onClick={onAddSeat}
            className="flex py-2 w-fit items-center  cursor-pointer  "
          >
            <Plus className="w-4 h-4" />
            Add Position
          </Button>
        )}
      </div>
    </div>
  );
}
