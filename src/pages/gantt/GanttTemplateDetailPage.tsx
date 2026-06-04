/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Diamond,
  CheckSquare,
  GitBranch,
  Layers,
  ListTodo,
  GitMerge,
  Clock,
  User,
  CalendarDays,
  AlertCircle,
  GanttChartSquare,
  Columns3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGanttTemplateDetail } from "@/features/api/gantt";
import { SpinnerIcon } from "@/components/shared/Icons";
import { fmtDate } from "./utils/gantt.utils";
import type { GanttTemplateItem, GanttTemplatePhase } from "@/types/gantt";
import GanttCreateWorkspaceModal from "./components/GanttCreateWorkspaceModal";

// ── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  LOW: { label: "Low", color: "#64748b", bg: "#f1f5f9" },
  MEDIUM: { label: "Medium", color: "#d97706", bg: "#fef3c7" },
  HIGH: { label: "High", color: "#ea580c", bg: "#fff7ed" },
  CRITICAL: { label: "Critical", color: "#dc2626", bg: "#fef2f2" },
};

type ViewMode = "list" | "timeline" | "board";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function GanttTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data, isLoading, isError } = useGanttTemplateDetail(id);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "/dashboard/gantt/workspaces" },
      { label: "Templates", href: "/dashboard/gantt/templates" },
      { label: data?.template?.templateName ?? "Detail", href: "" },
    ]);
  }, [setBreadcrumbs, data?.template?.templateName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-primary">
        <SpinnerIcon />
      </div>
    );
  }

  const template =
    data?.template ?? ((data as any)?.templateName ? (data as any) : null);
  const phases = data?.phases ?? [];
  const itemsTree = data?.itemsTree ?? [];
  const dependencies = data?.dependencies ?? [];

  if (isError || !data || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">
          Template not found or could not be loaded.
        </p>
        <Link to="/dashboard/gantt/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Templates
          </Button>
        </Link>
      </div>
    );
  }

  const totalItems = countItems(itemsTree);

  return (
    <div className="min-h-full bg-muted/10">
      {/* ── Light Header Banner ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0">
        <Link
          to="/dashboard/gantt/templates"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Templates
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 border border-slate-200">
              <Layers className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-800">
                  {template.templateName}
                </h1>
                <span
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full animate-pulse"
                  style={
                    template.isPublished
                      ? {
                          background: "rgba(34,197,94,0.1)",
                          color: "#166534",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }
                      : {
                          background: "rgba(148,163,184,0.1)",
                          color: "#475569",
                          border: "1px solid rgba(148,163,184,0.2)",
                        }
                  }
                >
                  {template.isPublished ? "Published" : "Draft"}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  v{template.version}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {template.ownerType}
                </span>
              </div>
              {template.templateDescription && (
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {template.templateDescription}
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                <CalendarDays className="h-3 w-3" /> Created{" "}
                {fmtDate(template.createdDatetime)}
              </p>
            </div>
          </div>

          {template.isPublished && (
            <Button
              size="sm"
              className="shrink-0 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
              onClick={() => setCreateWsOpen(true)}
            >
              <GitBranch className="h-4 w-4 mr-1.5" /> Use Template
            </Button>
          )}
        </div>

        {/* Stat pills summary inline */}
        <div className="flex gap-4 mt-4 text-xs font-semibold text-slate-500">
          {[
            { icon: Layers, label: "Phases", value: phases.length },
            { icon: ListTodo, label: "Items", value: totalItems },
            {
              icon: GitMerge,
              label: "Dependencies",
              value: dependencies.length,
            },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <span className="text-slate-800 font-bold">{s.value}</span>{" "}
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── View Switcher ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Preview
          </span>
          <div className="h-px w-12 bg-border" />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border">
          {(
            [
              { mode: "list" as ViewMode, icon: ListTodo, label: "List" },
              {
                mode: "timeline" as ViewMode,
                icon: GanttChartSquare,
                label: "Timeline",
              },
              { mode: "board" as ViewMode, icon: Columns3, label: "Board" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={
                viewMode === mode
                  ? {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── View Content ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        {viewMode === "list" && (
          <ListView phases={phases} itemsTree={itemsTree} />
        )}
        {viewMode === "timeline" && (
          <TimelineView phases={phases} itemsTree={itemsTree} />
        )}
        {viewMode === "board" && (
          <BoardView phases={phases} itemsTree={itemsTree} />
        )}

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Dependencies
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">
                {dependencies.length}
              </span>
            </div>
            <div className="rounded-xl border bg-card divide-y overflow-hidden">
              {dependencies.map((dep) => {
                const pred = findItem(itemsTree, dep.predecessorItemId);
                const succ = findItem(itemsTree, dep.successorItemId);
                return (
                  <div
                    key={dep.ganttTemplateDependencyId}
                    className="px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-medium truncate max-w-[200px]">
                      {pred?.itemName ?? dep.predecessorItemId}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="truncate max-w-[200px] text-muted-foreground">
                      {succ?.itemName ?? dep.successorItemId}
                    </span>
                    <span className="text-xs ml-auto shrink-0 px-2 py-0.5 rounded border bg-muted font-mono">
                      {dep.dependencyType}
                      {dep.lagDays !== 0 &&
                        ` ${dep.lagDays > 0 ? "+" : ""}${dep.lagDays}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {createWsOpen && (
        <GanttCreateWorkspaceModal
          open={createWsOpen}
          onOpenChange={setCreateWsOpen}
          templateId={template.ganttTemplateId}
          templateName={template.templateName}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function countItems(items: GanttTemplateItem[]): number {
  return items.reduce(
    (acc, item) => acc + 1 + (item.children ? countItems(item.children) : 0),
    0,
  );
}

function findItem(
  items: GanttTemplateItem[],
  id: string,
): GanttTemplateItem | undefined {
  for (const item of items) {
    if (item.ganttTemplateItemId === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function flattenItems(items: GanttTemplateItem[]): GanttTemplateItem[] {
  return items.flatMap((i) => [
    i,
    ...(i.children ? flattenItems(i.children) : []),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2 — GANTT TIMELINE (interactive, with toolbar)
// ═══════════════════════════════════════════════════════════════════════════════

const TL_ROW_H = 36;
const TL_LEFT_W = 308;
const TL_HEADER_H = 54;

type TLRow =
  | {
      kind: "phase";
      phase: GanttTemplatePhase;
      count: number;
      isCollapsed: boolean;
    }
  | {
      kind: "item";
      item: GanttTemplateItem;
      depth: number;
      phaseColor: string;
      seq: number;
    };

function TimelineView({
  phases,
  itemsTree,
}: {
  phases: GanttTemplatePhase[];
  itemsTree: GanttTemplateItem[];
}) {
  const [dayW, setDayW] = useState(22);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const sortedPhases = useMemo(
    () => [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder),
    [phases],
  );

  const allFlat = useMemo(() => flattenItems(itemsTree), [itemsTree]);

  const maxDay = useMemo(() => {
    if (!allFlat.length) return 30;
    return (
      Math.max(
        ...allFlat.map(
          (i) => i.relativeStartDay + Math.max(i.relativeDurationDays, 1),
        ),
      ) + 5
    );
  }, [allFlat]);

  const [availWidth, setAvailWidth] = useState<number>(0);

  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAvailWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const adjustedMaxDay = useMemo(() => {
    if (availWidth <= 0 || dayW <= 0) return maxDay;
    const minDays = Math.ceil(availWidth / dayW) + 1;
    return Math.max(maxDay, minDays);
  }, [maxDay, dayW, availWidth]);

  // Build flat rows (phase headers + items)
  const rows = useMemo((): TLRow[] => {
    const result: TLRow[] = [];
    let seq = 0;
    for (const phase of sortedPhases) {
      const phaseItems = flattenItems(
        itemsTree.filter(
          (i) => i.ganttTemplatePhaseId === phase.ganttTemplatePhaseId,
        ),
      );
      const filtered = q
        ? phaseItems.filter((i) =>
            i.itemName.toLowerCase().includes(q.toLowerCase()),
          )
        : phaseItems;
      const isCollapsed = collapsed.has(phase.ganttTemplatePhaseId);
      result.push({
        kind: "phase",
        phase,
        count: filtered.length,
        isCollapsed,
      });
      if (!isCollapsed) {
        for (const item of filtered) {
          seq++;
          result.push({
            kind: "item",
            item,
            depth: 0,
            phaseColor: phase.color ?? "#6366f1",
            seq,
          });
        }
      }
    }
    // Unphased
    const unphased = flattenItems(
      itemsTree.filter((i) => !i.ganttTemplatePhaseId),
    ).filter((i) => !q || i.itemName.toLowerCase().includes(q.toLowerCase()));
    for (const item of unphased) {
      seq++;
      result.push({ kind: "item", item, depth: 0, phaseColor: "#94a3b8", seq });
    }
    return result;
  }, [sortedPhases, itemsTree, collapsed, q]);

  // Sync vertical scroll
  const handleRightScroll = useCallback(() => {
    if (leftRef.current && rightRef.current)
      leftRef.current.scrollTop = rightRef.current.scrollTop;
  }, []);

  // Zoom
  const zoomIn = () => setDayW((w) => Math.min(w * 1.45, 80));
  const zoomOut = () => setDayW((w) => Math.max(w / 1.45, 4));
  const zoomFit = useCallback(() => {
    if (!wrapRef.current) return;
    const avail = wrapRef.current.clientWidth - TL_LEFT_W - 24;
    setDayW(Math.max(avail / maxDay, 4));
  }, [maxDay]);
  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () =>
    setCollapsed(new Set(phases.map((p) => p.ganttTemplatePhaseId)));
  const togglePhase = (id: string) =>
    setCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  // Week groups for header
  const weeks: { label: string; startDay: number; days: number }[] = [];
  for (let d = 1; d < adjustedMaxDay; d += 7) {
    weeks.push({
      label: `Week ${Math.ceil(d / 7)}`,
      startDay: d,
      days: Math.min(7, adjustedMaxDay - d),
    });
  }

  const totalW = adjustedMaxDay * dayW;
  const bodyH = rows.length * TL_ROW_H;

  const tbBtn =
    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-colors";

  if (!phases.length && !itemsTree.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed">
        <ListTodo className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          No phases or items defined yet.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="flex flex-col rounded-xl border bg-card overflow-hidden"
      style={{ height: Math.min(Math.max(bodyH + TL_HEADER_H + 44, 260), 560) }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/20 shrink-0 flex-wrap">
        <button onClick={expandAll} className={tbBtn}>
          <ChevronsDownUp className="h-3.5 w-3.5" /> Expand All
        </button>
        <button onClick={collapseAll} className={tbBtn}>
          <ChevronsUpDown className="h-3.5 w-3.5" /> Collapse All
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button onClick={zoomIn} className={tbBtn}>
          <ZoomIn className="h-3.5 w-3.5" /> Zoom In
        </button>
        <button onClick={zoomOut} className={tbBtn}>
          <ZoomOut className="h-3.5 w-3.5" /> Zoom Out
        </button>
        <button onClick={zoomFit} className={tbBtn}>
          <Maximize2 className="h-3.5 w-3.5" /> Zoom to Fit
        </button>
        {/* Search */}
        <div className="ml-auto flex items-center gap-1.5 border rounded-md px-2 py-1 bg-background">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks…"
            className="outline-none bg-transparent w-28 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div
          className="flex flex-col border-r shrink-0 overflow-hidden bg-background"
          style={{ width: TL_LEFT_W }}
        >
          {/* Column header */}
          <div
            className="flex items-center border-b bg-muted/30 shrink-0 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
            style={{ height: TL_HEADER_H }}
          >
            <div className="w-8 h-full flex items-center justify-center border-r shrink-0">
              #
            </div>
            <div className="flex-1 px-3">Task Name</div>
          </div>
          {/* Rows (overflow hidden — synced by rightRef scroll) */}
          <div ref={leftRef} className="flex-1 overflow-y-hidden select-none">
            {rows.map((row, idx) => {
              if (row.kind === "phase") {
                const color = row.phase.color ?? "#94a3b8";
                return (
                  <div
                    key={`lph-${row.phase.ganttTemplatePhaseId}`}
                    className="flex items-center gap-2 border-b cursor-pointer transition-colors"
                    style={{
                      height: TL_ROW_H,
                      background: color + "12",
                      borderLeft: `3px solid ${color}`,
                    }}
                    onClick={() => togglePhase(row.phase.ganttTemplatePhaseId)}
                  >
                    <div className="w-7 h-full flex items-center justify-center shrink-0">
                      {row.isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className="text-xs font-bold truncate flex-1"
                      style={{ color }}
                    >
                      {row.phase.phaseName}
                    </span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mr-2 shrink-0"
                      style={{ background: color + "22", color }}
                    >
                      {row.count}
                    </span>
                  </div>
                );
              }
              // Item row
              const { item, phaseColor, seq, depth } = row;
              const isMilestone =
                item.itemType === "MILESTONE" || item.isMilestone;
              return (
                <div
                  key={`li-${item.ganttTemplateItemId}-${idx}`}
                  className="flex items-center border-b gap-1 pr-2 hover:bg-muted/20 transition-colors"
                  style={{
                    height: TL_ROW_H,
                    paddingLeft: `${28 + depth * 16}px`,
                  }}
                >
                  <span className="text-[10px] text-muted-foreground w-4 text-right shrink-0">
                    {seq}
                  </span>
                  <div className="w-5 flex items-center justify-center shrink-0">
                    {isMilestone ? (
                      <Diamond className="h-3 w-3 text-amber-500" />
                    ) : (
                      <CheckSquare
                        className="h-3 w-3"
                        style={{ color: phaseColor }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">
                      {item.itemName}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Day {item.relativeStartDay} ({item.relativeDurationDays}d)
                      {item.assigneeRoleHint
                        ? ` · ${item.assigneeRoleHint}`
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline (horizontally + vertically scrollable) */}
        <div
          ref={rightRef}
          onScroll={handleRightScroll}
          className="flex-1 overflow-auto"
        >
          {/* Timeline header — sticky */}
          <div
            className="sticky top-0 z-20 bg-card border-b"
            style={{
              minWidth: "100%",
              width: Math.max(totalW, 500),
              height: TL_HEADER_H,
            }}
          >
            {/* Week row */}
            <div className="relative border-b" style={{ height: 26 }}>
              {weeks.map((wk) => (
                <div
                  key={wk.startDay}
                  className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground border-r overflow-hidden px-1"
                  style={{
                    left: (wk.startDay - 1) * dayW,
                    width: wk.days * dayW,
                  }}
                >
                  {wk.days * dayW > 40 ? wk.label : ""}
                </div>
              ))}
            </div>
            {/* Day numbers row */}
            <div className="relative" style={{ height: 28 }}>
              {Array.from({ length: adjustedMaxDay - 1 }, (_, i) => i + 1).map(
                (d) => {
                  let showEvery = 1;
                  if (dayW >= 16) {
                    showEvery = 1;
                  } else if (dayW * 7 >= 35) {
                    showEvery = 7;
                  } else if (dayW * 14 >= 35) {
                    showEvery = 14;
                  } else if (dayW * 28 >= 35) {
                    showEvery = 28;
                  } else {
                    showEvery = 90;
                  }
                  if (d % showEvery !== 1 && d !== 1) return null;
                  return (
                    <div
                      key={d}
                      className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] text-muted-foreground"
                      style={{ left: (d - 1) * dayW, width: showEvery * dayW }}
                    >
                      {d}
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Bar area */}
          <div
            style={{
              minWidth: "100%",
              width: Math.max(totalW, 500),
              height: bodyH,
              position: "relative",
            }}
          >
            {/* Week separator grid lines */}
            {weeks.map((wk) => (
              <div
                key={wk.startDay}
                className="absolute top-0 bottom-0 border-l border-border/40"
                style={{ left: (wk.startDay - 1) * dayW }}
              />
            ))}
            {/* Fine day lines (only when zoomed in enough) */}
            {dayW >= 14 &&
              Array.from({ length: adjustedMaxDay - 1 }, (_, i) => i + 1).map(
                (d) => (
                  <div
                    key={d}
                    className="absolute top-0 bottom-0 border-l border-border/15"
                    style={{ left: (d - 1) * dayW }}
                  />
                ),
              )}

            {/* Rows */}
            {rows.map((row, idx) => {
              const y = idx * TL_ROW_H;
              if (row.kind === "phase") {
                return (
                  <div
                    key={`rph-${row.phase.ganttTemplatePhaseId}`}
                    className="absolute left-0 right-0 border-b"
                    style={{
                      top: y,
                      height: TL_ROW_H,
                      background: (row.phase.color ?? "#94a3b8") + "08",
                    }}
                  />
                );
              }
              const { item, phaseColor } = row;
              const isMilestone =
                item.itemType === "MILESTONE" || item.isMilestone;
              const barLeft = (item.relativeStartDay - 1) * dayW;
              const barWidth = Math.max(
                isMilestone ? 0 : item.relativeDurationDays * dayW,
                isMilestone ? 0 : Math.max(dayW, 4),
              );
              return (
                <div
                  key={`ri-${item.ganttTemplateItemId}-${idx}`}
                  className="absolute left-0 right-0 border-b hover:bg-muted/10 transition-colors"
                  style={{ top: y, height: TL_ROW_H }}
                >
                  {isMilestone ? (
                    // Milestone — rotated diamond ◆
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 cursor-default shadow-sm"
                            style={{
                              left: barLeft,
                              background: "#f59e0b",
                              border: "1.5px solid #d97706",
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-semibold">
                            {item.itemName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            🏁 Milestone · Day {item.relativeStartDay}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    // Task bar
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-[5px] bottom-[5px] rounded-md flex items-center overflow-hidden cursor-default shadow-sm hover:brightness-95 transition-all"
                            style={{
                              left: barLeft,
                              width: barWidth,
                              background: phaseColor + "cc",
                              border: `1.5px solid ${phaseColor}`,
                            }}
                          >
                            {barWidth > 48 && (
                              <span className="text-white text-[10px] font-semibold px-2 truncate whitespace-nowrap leading-none">
                                {item.itemName}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-semibold">
                            {item.itemName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Day {item.relativeStartDay} ·{" "}
                            {item.relativeDurationDays} days
                          </p>
                          {item.assigneeRoleHint && (
                            <p className="text-[10px]">
                              {item.assigneeRoleHint}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3 — LIST VIEW (tabular representation)
// ═══════════════════════════════════════════════════════════════════════════════
function ListView({
  phases,
  itemsTree,
}: {
  phases: GanttTemplatePhase[];
  itemsTree: GanttTemplateItem[];
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  const sortedPhases = useMemo(
    () => [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder),
    [phases],
  );

  const togglePhase = (id: string) => {
    setCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () =>
    setCollapsed(new Set(phases.map((p) => p.ganttTemplatePhaseId)));

  return (
    <div className="flex flex-col rounded-xl border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/20 shrink-0 flex-wrap">
        <button
          onClick={expandAll}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-colors"
        >
          <ChevronsDownUp className="h-3.5 w-3.5" /> Expand All
        </button>
        <button
          onClick={collapseAll}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-colors"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" /> Collapse All
        </button>
        {/* Search */}
        <div className="ml-auto flex items-center gap-1.5 border rounded-md px-2.5 py-1 bg-background">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks…"
            className="outline-none bg-transparent w-40 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-600 bg-white">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3 w-12 text-center font-bold">#</th>
              <th className="px-4 py-3 font-bold">Task Name</th>
              <th className="px-4 py-3 w-28 font-bold">Type</th>
              <th className="px-4 py-3 w-28 font-bold">Start Day</th>
              <th className="px-4 py-3 w-28 font-bold">Duration</th>
              <th className="px-4 py-3 w-32 font-bold">Priority</th>
              <th className="px-4 py-3 w-40 font-bold">Role Hint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedPhases.map((phase) => {
              const phaseItems = flattenItems(
                itemsTree.filter(
                  (i) => i.ganttTemplatePhaseId === phase.ganttTemplatePhaseId,
                ),
              );
              const filtered = q
                ? phaseItems.filter((i) =>
                    i.itemName.toLowerCase().includes(q.toLowerCase()),
                  )
                : phaseItems;
              const isCollapsed = collapsed.has(phase.ganttTemplatePhaseId);
              const color = phase.color ?? "#6366f1";

              return (
                <Fragment key={phase.ganttTemplatePhaseId}>
                  {/* Phase Row */}
                  <tr
                    onClick={() => togglePhase(phase.ganttTemplatePhaseId)}
                    className="cursor-pointer transition-colors bg-slate-50/40 hover:bg-slate-50 border-b border-slate-200"
                    style={{ background: color + "07" }}
                  >
                    <td className="px-4 py-3 text-center">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-slate-400 mx-auto" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 mx-auto" />
                      )}
                    </td>
                    <td
                      colSpan={6}
                      className="px-4 py-3 font-bold text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span>{phase.phaseName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                          {filtered.length}{" "}
                          {filtered.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Item Rows */}
                  {!isCollapsed &&
                    filtered.map((item, idx) => {
                      const isMilestone =
                        item.itemType === "MILESTONE" || item.isMilestone;
                      const priority =
                        PRIORITY_CONFIG[item.priority] ??
                        PRIORITY_CONFIG.MEDIUM;
                      return (
                        <tr
                          key={item.ganttTemplateItemId}
                          className="hover:bg-slate-50/30 transition-colors border-b border-slate-100"
                        >
                          <td className="px-4 py-3 text-center text-slate-400 font-mono font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isMilestone ? (
                                <Diamond className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <CheckSquare
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{ color }}
                                />
                              )}
                              <span className="font-semibold text-slate-700">
                                {item.itemName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {isMilestone ? (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                                Milestone
                              </span>
                            ) : (
                              <span className="text-slate-600 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                                Task
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            Day {item.relativeStartDay}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-500">
                            {isMilestone
                              ? "—"
                              : `${item.relativeDurationDays} days`}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{
                                background: priority.bg,
                                color: priority.color,
                                borderColor: `${priority.color}33`,
                              }}
                            >
                              {priority.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-500">
                            {item.assigneeRoleHint ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                {item.assigneeRoleHint}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-normal">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}

            {/* Unphased Items */}
            {(() => {
              const unphased = flattenItems(
                itemsTree.filter((i) => !i.ganttTemplatePhaseId),
              );
              const filtered = q
                ? unphased.filter((i) =>
                    i.itemName.toLowerCase().includes(q.toLowerCase()),
                  )
                : unphased;
              if (filtered.length === 0) return null;
              return (
                <Fragment>
                  {/* Unassigned Header */}
                  <tr className="bg-slate-50/40 border-b border-slate-200">
                    <td className="px-4 py-3 text-center">
                      <ChevronDown className="h-4 w-4 text-slate-400 mx-auto" />
                    </td>
                    <td
                      colSpan={6}
                      className="px-4 py-3 font-bold text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        <span>Unassigned / Other Tasks</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                          {filtered.length}{" "}
                          {filtered.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {filtered.map((item, idx) => {
                    const isMilestone =
                      item.itemType === "MILESTONE" || item.isMilestone;
                    const priority =
                      PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.MEDIUM;
                    return (
                      <tr
                        key={item.ganttTemplateItemId}
                        className="hover:bg-slate-50/30 transition-colors border-b border-slate-100"
                      >
                        <td className="px-4 py-3 text-center text-slate-400 font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isMilestone ? (
                              <Diamond className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <CheckSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            )}
                            <span className="font-semibold text-slate-700">
                              {item.itemName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {isMilestone ? (
                            <span className="text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                              Milestone
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                              Task
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          Day {item.relativeStartDay}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-500">
                          {isMilestone
                            ? "—"
                            : `${item.relativeDurationDays} days`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              background: priority.bg,
                              color: priority.color,
                              borderColor: `${priority.color}33`,
                            }}
                          >
                            {priority.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-500">
                          {item.assigneeRoleHint ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {item.assigneeRoleHint}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic font-normal">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 4 — KANBAN BOARD (one column per phase)
// ═══════════════════════════════════════════════════════════════════════════════
function BoardView({
  phases,
  itemsTree,
}: {
  phases: GanttTemplatePhase[];
  itemsTree: GanttTemplateItem[];
}) {
  const sortedPhases = [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder);
  const unphased = itemsTree.filter((i) => !i.ganttTemplatePhaseId);

  if (phases.length === 0 && itemsTree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed">
        <ListTodo className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          No phases or items defined yet.
        </p>
      </div>
    );
  }

  const allColumns = [
    ...sortedPhases.map((p) => ({
      id: p.ganttTemplatePhaseId,
      name: p.phaseName,
      color: p.color ?? "#94a3b8",
      items: flattenItems(
        itemsTree.filter(
          (i) => i.ganttTemplatePhaseId === p.ganttTemplatePhaseId,
        ),
      ),
    })),
    ...(unphased.length > 0
      ? [
          {
            id: "unphased",
            name: "Unassigned",
            color: "#94a3b8",
            items: flattenItems(unphased),
          },
        ]
      : []),
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="flex gap-3 items-start"
        style={{ minWidth: `${allColumns.length * 280}px` }}
      >
        {allColumns.map((col) => (
          <KanbanColumn key={col.id} col={col} />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  col,
}: {
  col: { id: string; name: string; color: string; items: GanttTemplateItem[] };
}) {
  return (
    <div className="flex flex-col w-64 shrink-0 rounded-xl border border-slate-200 bg-[#f8f9fa] overflow-hidden">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800 leading-none">
            {col.name}
          </span>
          <span className="text-[10px] font-bold h-5 w-5 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
            {col.items.length}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 overflow-y-auto min-h-[300px]">
        {col.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-xl border border-dashed border-slate-200 bg-white text-center my-auto mx-1">
            <span className="text-xs text-slate-400 font-medium">
              No tasks here
            </span>
          </div>
        ) : (
          col.items.map((item) => (
            <KanbanCard
              key={item.ganttTemplateItemId}
              item={item}
              phaseColor={col.color}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  item,
  phaseColor,
}: {
  item: GanttTemplateItem;
  phaseColor: string;
}) {
  const isMilestone = item.itemType === "MILESTONE" || item.isMilestone;
  const priority = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.MEDIUM;

  if (isMilestone) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 cursor-default shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5 group relative">
        <div className="flex items-start gap-2">
          <Diamond className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.itemName}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-0.5">
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-250/50 px-2 py-0.5 rounded-full">
            🏁 Milestone
          </span>
          <span className="text-[10px] text-slate-400">
            Day {item.relativeStartDay}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 cursor-default shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5 group relative">
      {/* Title */}
      <div className="flex items-start gap-2">
        <CheckSquare
          className="h-3.5 w-3.5 mt-0.5 shrink-0"
          style={{ color: phaseColor }}
        />
        <span className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {item.itemName}
        </span>
      </div>

      {/* Role details */}
      {item.assigneeRoleHint && (
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-medium text-slate-400">Role Hint:</span>
          <span className="text-[11px] text-slate-700 font-medium truncate">
            {item.assigneeRoleHint}
          </span>
        </div>
      )}

      {/* Timing details */}
      <div className="text-xs text-slate-500">
        <span className="font-medium text-slate-400">Start Day:</span>{" "}
        <span className="text-[11px] text-slate-700 font-semibold">
          Day {item.relativeStartDay}
        </span>
      </div>

      {/* Footer / priority & duration */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-0.5">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {item.relativeDurationDays}{" "}
            {item.relativeDurationDays === 1 ? "day" : "days"}
          </span>
        </div>

        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            background: priority.bg,
            color: priority.color,
            borderColor: `${priority.color}33`,
          }}
        >
          {priority.label}
        </span>
      </div>
    </div>
  );
}
