/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { TooltipProvider} from "@/components/ui/tooltip";
import { useGetEmployeeToday } from "@/features/api/companyEmployee";
import { PendencyTask, PendencyProject } from "@/features/api/companyEmployee/useGetEmployeeToday";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Check,
  CalendarClock,
  Search,
  ArrowUpRight,
} from "lucide-react";

// Local Helper Formatting Functions
const fmtTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "—";
  }
};

const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "—";
  }
};

const daysBetween = (iso: string | null | undefined): number => {
  if (!iso) return 0;
  try {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetDate = new Date(iso);
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diff = targetMidnight.getTime() - todayMidnight.getTime();
    return Math.round(diff / 86400000);
  } catch {
    return 0;
  }
};

const formatMeetingStatus = (status: string | null | undefined): string => {
  if (!status) return "";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};



const isColorDark = (hex: string): boolean => {
  try {
    const c = hex.replace(/^#/, "");
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) < 128;
  } catch { return true; }
};
// Stamp Component for status badges
const STATUS_TONE: Record<string, string> = {
  Completed: "#2F6B45",
  "On Track": "#2F6B45",
  "In Progress": "#2E3090",
  "Planned & Assigned": "#2E3090",
  Delayed: "#B23A2A",
  "Yet to start": "#6B7280",
};

interface StampProps {
  status: string;
  statusColor?: string;
}

function Stamp({ status, statusColor }: StampProps) {
  const normalizedStatus = status ? status.trim() : "";
  let color = statusColor;
  if (!color) {
    const tone = STATUS_TONE[normalizedStatus];
    if (tone) {
      color = tone;
    } else {
      const lower = normalizedStatus.toLowerCase();
      if (lower.includes("complete") || lower === "on track") {
        color = STATUS_TONE["Completed"];
      } else if (lower.includes("progress") || lower.includes("plan") || lower.includes("assign")) {
        color = STATUS_TONE["In Progress"];
      } else if (lower.includes("delay")) {
        color = STATUS_TONE["Delayed"];
      } else {
        color = STATUS_TONE["Yet to start"];
      }
    }
  }

  // Determine text color based on background color luminance
  const textColor = isColorDark(color) ? "#ffffff" : "#000000";

  return (
    <span
      style={{
        backgroundColor: color,
        color: textColor,
      }}
      className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap shadow-sm"
    >
      {normalizedStatus}
    </span>
  );
}


interface SectionHeadingProps {
  title: string;
  count?: number;
}

function SectionHeading({ title, count }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="font-inter text-[1.15rem] font-semibold text-[#2E3090]">{title}</h2>
      {count !== undefined && (
        <span className="inline-flex items-center justify-center min-w-[1.4rem] h-[1.4rem] px-1.5 rounded-full bg-[#E3E3F6] text-[#2E3090] text-xs font-semibold">
          {count}
        </span>
      )}
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="p-6 bg-slate-50/30 min-h-screen w-full flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div className="h-8 bg-slate-200 rounded w-32" />
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="h-8 bg-slate-200 rounded w-20" />
        </div>
      </div>
      <div className="h-16 bg-slate-200 rounded w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 rounded w-full" />
        <div className="h-48 bg-slate-200 rounded w-full" />
        <div className="h-48 bg-slate-200 rounded w-full" />
      </div>
      <div className="h-64 bg-slate-200 rounded w-full" />
    </div>
  );
}

// Shared table head cell
function TH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left font-mono text-sm tracking-[0.1em] uppercase text-[#5C5FA8] pb-2 border-b border-[#2E3090] pr-4 ${className}`}>
      {children}
    </th>
  );
}

// Shared table data cell
function TD({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`py-2 pr-4 border-b border-[#D9D9F0] text-sm align-middle text-slate-800 ${className}`}>
      {children}
    </td>
  );
}

export default function MyDay() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([{ label: "My Day", href: "" }]);
  }, [setBreadcrumbs]);

  const { data: apiResponse, isLoading: isApiLoading, error: apiError } = useGetEmployeeToday();

  const [tab, setTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const dataPayload = apiResponse?.data;

  const { myToday, myPendencies, completedCount, pendingCount, totalCount, overdueCount } =
    useMemo(() => {
      const defaultToday = {
        repeatTaskCount: 0,
        completedTaskCount: 0,
        pendingTaskCount: 0,
        todayMeetings: [],
        todayTasks: [],
        projects: [],
        kpis: [],
      };
      const today = dataPayload?.myToday || defaultToday;
      const pends = dataPayload?.myPendencies || { tasks: [], projects: [] };
      const overTasks = (pends.tasks || []).filter((t) => daysBetween(t.deadline) < 0).length;
      const overProjects = (pends.projects || []).filter((p) => daysBetween(p.deadline) < 0).length;
      return {
        myToday: today,
        myPendencies: pends,
        completedCount: today.completedTaskCount ?? 0,
        pendingCount: today.pendingTaskCount ?? 0,
        totalCount: today.repeatTaskCount ?? 0,
        overdueCount: overTasks + overProjects,
      };
    }, [dataPayload]);

  const pendTasks = myPendencies?.tasks || [];
  const pendProjects = myPendencies?.projects || [];

  const statusOptions = useMemo<string[]>(() => {
    const list = tab === "tasks" ? pendTasks : pendProjects;
    return ["All", ...Array.from(new Set(list.map((i) => i.status)))];
  }, [tab, pendTasks, pendProjects]);

  const filteredList = useMemo(() => {
    if (tab === "tasks") {
      return (pendTasks )
        .filter((i) => statusFilter === "All" || i.status === statusFilter)
        .filter((i) => (i.taskName || "").toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else {
      return (pendProjects )
        .filter((i) => statusFilter === "All" || i.status === statusFilter)
        .filter((i) => (i.projectName || "").toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
  }, [tab, statusFilter, query, pendTasks, pendProjects]);

  if (isApiLoading) return <DashboardSkeleton />;

  if (apiError || !dataPayload || !dataPayload.myToday) {
    return (
      <div className="p-6 bg-slate-50/50 min-h-full w-full flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-md max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="bg-red-50 p-4 rounded-full border border-red-100">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Failed to Load Ledger</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {apiError instanceof Error ? apiError.message : "Dashboard data is currently unavailable."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2 bg-[#2E3090] hover:bg-[#202270] text-white font-semibold rounded-xl px-5 py-2 text-sm border-0"
          >
            Retry Fetch
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <TooltipProvider>
      <div className="bg-white text-slate-800 min-h-full px-6 pt-4 pb-16 font-sans">

        {/* ── Masthead ── */}
        <header className="w-full mb-8 border-b-2 border-[#2E3090] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Title */}
            <div>
              <h1 className="font-inter font-semibold  leading-[1.05] tracking-tight text-[#2E3090]">
                Today's Ledger
              </h1>
            </div>
            {/* Right: Date + Buttons below */}
            <div className="flex flex-col items-end gap-3">
              <div className="font-mono text-sm text-[#5C5FA8] text-right">
                <strong className="block text-base text-[#2E3090]">{dayName}</strong>
                {dateStr}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/dashboard/daily-planning/check-in")}
                  type="button"
                  className="bg-white border border-[#2E3090] hover:bg-[#E3E3F6] text-[#2E3090] rounded-lg text-sm font-semibold px-4 py-2 whitespace-nowrap flex items-center gap-1.5"
                >
                  Check In <ArrowUpRight  size={14} />
                </Button>
                <Button
                  onClick={() => navigate("/dashboard/daily-planning/check-out")}
                  type="button"
                  className="bg-[#2E3090] hover:bg-[#202270] text-white rounded-lg text-sm font-semibold px-4 py-2 border-0 whitespace-nowrap flex items-center gap-1.5"
                >
                  Check Out <ArrowUpRight size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Stat Strip */}
          <div className="mt-5 grid grid-cols-4 gap-px bg-[#D9D9F0] border border-[#D9D9F0]">
            {[
              { num: completedCount, label: "Completed Repeat", red: false },
              { num: pendingCount,   label: "Pending Repeat",   red: false },
              { num: totalCount,     label: "Total Repeat",    red: false },
              { num: overdueCount,   label: "Overdue items",   red: true  },
            ].map(({ num, label, red }) => (
              <div key={label} className="bg-white px-4 py-3.5">
                <div className={`font-mono text-[1.9rem] font-semibold leading-none ${red ? "text-[#B23A2A]" : "text-[#2E3090]"}`}>
                  {num}
                </div>
                <div className="font-mono text-sm tracking-[0.1em] uppercase text-[#5C5FA8] mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ── 3-col grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* I. Today's Schedule */}
          <div className="bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading  title="Today's Schedule Meeting" count={myToday.todayMeetings?.length || 0} />
            {/* Timeline */}
            <div className="relative pl-6 max-h-[310px] overflow-y-auto pr-2">
              <span className="absolute left-[5px] top-1 bottom-1 w-px bg-[#D9D9F0]" />
              {(!myToday.todayMeetings || myToday.todayMeetings.length === 0) ? (
                <p className="text-slate-500 italic text-sm py-2">No meetings today.</p>
              ) : myToday.todayMeetings.map((m) => (
                <div
                  key={m.meetingId}
                  className="relative pb-4 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(m.isDetailMeeting ? `/dashboard/meeting/detail/${m.meetingId}` : `/dashboard/meeting/edit/${m.meetingId}`)}
                >
                  <span className="absolute -left-6 top-[3px] w-2.5 h-2.5 rounded-full bg-white border-2 border-[#2E3090]" />
                  <p className="font-mono text-sm text-[#2E3090] tracking-wide">
                    {fmtTime(m.meetingDateTime)} · {formatMeetingStatus(m.detailMeetingStatus || m.meetingStatus)}
                  </p>
                  <p className="font-semibold text-sm mt-0.5 text-slate-800">{m.meetingName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{m.description || "No description"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* II. Today's Tasks */}
          <div className="bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading  title="Today's Tasks" count={myToday.todayTasks?.length || 0} />
            <div className="max-h-[310px] overflow-y-auto pr-2">
              {(!myToday.todayTasks || myToday.todayTasks.length === 0) ? (
                <p className="text-slate-500 italic text-sm py-2">No tasks due today.</p>
              ) : myToday.todayTasks.map((t) => (
                <div
                  key={t.taskId}
                  className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-[#D9D9F0] last:border-b-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/dashboard/tasks/edit/${t.taskId}`)}
                >
                  {t.status === "Completed"
                    ? <CheckCircle2 size={17} className="text-[#2F6B45] shrink-0" />
                    : <Circle size={17} className="text-[#2E3090] shrink-0" />}
                  <span className="flex-1 text-sm font-medium text-slate-800">{t.taskName}</span>
                  <span className="font-mono text-sm text-slate-500 shrink-0 flex items-center gap-1">
                    <Clock size={11} />
                    {fmtTime(t.deadline)}
                  </span>
                  <Stamp status={t.status} statusColor={t.statusColor} />
                </div>
              ))}
            </div>
          </div>

          {/* III. Today's Projects */}
          <div className="bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading  title="Today's Projects" count={myToday.projects?.length || 0} />
            <div className="max-h-[310px] overflow-y-auto pr-2">
              {(!myToday.projects || myToday.projects.length === 0) ? (
                <p className="text-slate-500 italic text-sm py-2">No projects due today.</p>
              ) : myToday.projects.map((p) => (
                <div
                  key={p.projectId}
                  className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-[#D9D9F0] last:border-b-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/dashboard/projects/edit/${p.projectId}`)}
                >
                  {p.status === "Completed"
                    ? <CheckCircle2 size={17} className="text-[#2F6B45] shrink-0" />
                    : <Circle size={17} className="text-[#2E3090] shrink-0" />}
                  <span className="flex-1 text-sm font-medium text-slate-800">{p.projectName}</span>
                  <span className="font-mono text-sm text-slate-500 shrink-0 flex items-center gap-1">
                    <CalendarClock size={11} />
                    {fmtDate(p.deadline)}
                  </span>
                  <Stamp status={p.status} statusColor={p.statusColor} />
                </div>
              ))}
            </div>
          </div>

          {/* IV. KPIs — Today (full-width) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading  title="KPI — Today" count={myToday.kpis?.length || 0} />
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TH>Indicator</TH>
                  <TH>Frequency</TH>
                  <TH>Tag</TH>
                  <TH>Filled today</TH>
                </tr>
              </thead>
              <tbody>
                {[...(myToday.kpis || [])]
                  .sort((a, b) => (a.isTodayFillData === b.isTodayFillData ? 0 : a.isTodayFillData ? 1 : -1))
                  .map((k) => (
                    <tr
                      key={k.kpiId}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/dashboard/kpi-dashboard?selectedType=${(k.frequency || "DAILY").toUpperCase()}`)}
                    >
                      <TD>{k.kpiName}</TD>
                      <TD><span className="font-mono text-sm text-slate-500">{k.frequency}</span></TD>
                      <TD><span className="font-mono text-sm text-slate-500">{k.tag || "—"}</span></TD>
                      <TD>
                        {k.isTodayFillData ? (
                          <Check size={16} className="text-[#2F6B45]" strokeWidth={2.5} />
                        ) : (
                          <Circle size={15} className="text-slate-300" strokeWidth={1.5} />
                        )}
                      </TD>
                    </tr>
                  ))}
                {(!myToday.kpis || myToday.kpis.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-slate-500 italic py-3 text-center text-sm">
                      No KPIs assigned for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* V. Outstanding Ledger (full-width) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading
              title="Outstanding Ledger"
              count={tab === "tasks" ? pendTasks.length : pendProjects.length}
            />

            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Tab switcher */}
              <div className="flex border border-[#2E3090] w-fit">
                {["tasks", "projects"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setStatusFilter("All"); }}
                    className={`font-mono text-sm tracking-[0.08em] uppercase px-4 py-1.5 border-0 cursor-pointer transition-colors ${
                      tab === t
                        ? "bg-[#2E3090] text-white"
                        : "bg-transparent text-[#2E3090] hover:bg-[#E3E3F6]"
                    } ${t === "projects" ? "border-l border-[#2E3090]" : ""}`}
                  >
                    {t === "tasks" ? "Tasks" : "Projects"}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 border border-[#D9D9F0] px-2.5 py-1.5 bg-white">
                <Search size={13} className="text-[#5C5FA8]" />
                <input
                  className="border-none bg-transparent outline-none text-sm text-slate-800 w-40 placeholder:text-slate-400"
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`font-mono text-sm tracking-[0.04em] px-3 py-1 border cursor-pointer transition-colors ${
                    statusFilter === s
                      ? "border-[#2E3090] text-[#2E3090] bg-[#E3E3F6]"
                      : "border-[#D9D9F0] text-[#5C5FA8] bg-white hover:border-[#2E3090]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Scrollable table */}
            <div className="max-h-[420px] overflow-y-auto mt-4">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <TH>{tab === "tasks" ? "Task" : "Project"}</TH>
                    <TH>Status</TH>
                    <TH>Deadline</TH>
                    {/* <TH>Timing</TH> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => {
                    // const d = daysBetween(item.deadline);
                    const name = tab === "tasks" ? (item as PendencyTask).taskName : (item as PendencyProject).projectName;
                    const id   = tab === "tasks" ? (item as PendencyTask).taskId   : (item as PendencyProject).projectId;
                    return (
                      <tr
                        key={id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(tab === "tasks" ? `/dashboard/tasks/edit/${id}` : `/dashboard/projects/edit/${id}`)}
                      >
                        <TD>{name}</TD>
                        <TD><Stamp status={item.status} statusColor={item.statusColor} /></TD>
                        <TD><span className="font-intel text-sm text-slate-500">{fmtDate(item.deadline)}</span></TD>
                        {/* <TD>
                          {d < 0 ? (
                            <span className="flex items-center gap-1 text-[#B23A2A] font-semibold text-sm">
                              <AlertTriangle size={11} />
                              {Math.abs(d)}d overdue
                            </span>
                          ) : (
                            <span className="font-mono text-sm text-slate-500">in {d}d</span>
                          )}
                        </TD> */}
                      </tr>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-slate-400 italic py-4 text-center text-sm">
                        No entries match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* VI. KPIs — Outstanding (full-width) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border border-[#D9D9F0] p-6 mb-8">
            <SectionHeading
              title="KPI — Outstanding"
              count={(myToday.kpis || []).filter((k) => !k.isTodayFillData).length}
            />
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TH>Indicator</TH>
                  <TH>Frequency</TH>
                  <TH>Tag</TH>
                </tr>
              </thead>
              <tbody>
                {[...(myToday.kpis || [])].filter((k) => !k.isTodayFillData).map((k) => (
                  <tr
                    key={k.kpiId}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/dashboard/kpi-dashboard?selectedType=${(k.frequency || "DAILY").toUpperCase()}`)}
                  >
                    <TD>{k.kpiName}</TD>
                    <TD><span className="font-mono text-sm text-slate-500">{k.frequency}</span></TD>
                    <TD><span className="font-mono text-sm text-slate-500">{k.tag || "—"}</span></TD>
                  </tr>
                ))}
                {!(myToday.kpis || []).some((k) => !k.isTodayFillData) && (
                  <tr>
                    <td colSpan={3} className="text-slate-500 italic py-3 text-center text-sm">
                      All KPIs are successfully filled for today!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
