import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { isColorDark } from "@/features/utils/color.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetEmployeeToday } from "@/features/api/companyEmployee";
import {
  Users,
  Clock,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
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

const getOverdueDays = (deadlineStr: string | null | undefined): number => {
  if (!deadlineStr) return 0;
  try {
    const deadlineDate = new Date(deadlineStr);
    if (isNaN(deadlineDate.getTime())) return 0;
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deadlineMidnight = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    if (deadlineMidnight.getTime() >= todayMidnight.getTime()) return 0;
    const diff = todayMidnight.getTime() - deadlineMidnight.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};



const darkenHex = (hexColor: string, percent: number): string => {
  try {
    const hex = hexColor.replace(/^#/, "");
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return hexColor;
    }
    
    const factor = 1 - percent / 100;
    const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
    const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
    const newB = Math.max(0, Math.min(255, Math.round(b * factor)));
    
    const rHex = newR.toString(16).padStart(2, "0");
    const gHex = newG.toString(16).padStart(2, "0");
    const bHex = newB.toString(16).padStart(2, "0");
    
    return `#${rHex}${gHex}${bHex}`;
  } catch {
    return hexColor;
  }
};

const renderStatusBadge = (status: string, statusColor?: string) => {
  const sLower = status.trim().toLowerCase();
  const initial = status.trim().charAt(0).toUpperCase();
  const color = statusColor || (sLower.includes("complete") || sLower === "on track" || sLower === "data filled" ? "#10B981" : sLower.includes("progress") || sLower.includes("pending") || sLower === "upcoming" ? "#3B82F6" : "#64748B");
  
  const isDark = isColorDark(color);
  // Render solid background circles. If the color is light, darken it slightly to keep white text visible.
  const bgColor = isDark ? color : darkenHex(color, 20);
  const textColor = "#ffffff";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          style={{
            color: textColor,
            borderColor: bgColor,
            backgroundColor: bgColor,
          }}
          className="w-6 h-6 rounded-full border text-sm font-bold shadow-sm flex items-center justify-center shrink-0 cursor-help"
        >
          {initial}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-semibold">{status}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const getKpiTagTextColor = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("finance") || t.includes("growth") || t === "financial") {
    return "text-purple-600";
  }
  if (t.includes("market") || t.includes("operation")) {
    return "text-emerald-600";
  }
  if (t.includes("sales") || t.includes("customer")) {
    return "text-blue-600";
  }
  return "text-slate-600";
};


// Premium Table skeleton shimmer loader
function DashboardSkeleton() {
  return (
    <div className="p-6 bg-slate-50/30 min-h-screen w-full flex flex-col gap-6 animate-pulse">
      {/* Header shimmer */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div className="h-8 bg-slate-200 rounded w-32" />
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="h-8 bg-slate-200 rounded w-20" />
        </div>
      </div>
      {/* Control row shimmer */}
      <div className="flex justify-between items-center gap-4">
        <div className="h-10 bg-slate-200 rounded w-48" />
        <div className="h-10 bg-slate-200 rounded w-40" />
      </div>
      {/* 5 Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 h-24" />
        ))}
      </div>
      {/* 4 Columns Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 h-64" />
        ))}
      </div>
      {/* Pendency Shimmer */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 h-80" />
    </div>
  );
}

export default function MyDay() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([{ label: "My Day", href: "" }]);
  }, [setBreadcrumbs]);

  // Call the custom query hook
  const { data: apiResponse, isLoading: isApiLoading, error: apiError } = useGetEmployeeToday();

  // Local filters and states

  // Filters for Projects / Tasks
  const [typeFilter, setTypeFilter] = useState("All");

  const dataPayload = apiResponse?.data;

  // Compute filters and data maps
  const {
    myToday,
    filteredList,
  } = useMemo(() => {
    const payload = dataPayload;
    const defaultToday = {
      repeatTaskCount: 0,
      completedTaskCount: 0,
      pendingTaskCount: 0,
      todayMeetings: [],
      todayTasks: [],
      projects: [],
      kpis: [],
    };
    const defaultPendencies = { tasks: [], projects: [] };

    const today = payload?.myToday || defaultToday;
    const pends = payload?.myPendencies || defaultPendencies;

    // Combined list of projects and tasks pendencies
    const combinedList = [
      ...(pends.tasks || []).map(t => ({ ...t, type: "Task" as const })),
      ...(pends.projects || []).map(p => ({ ...p, type: "Project" as const }))
    ];

    // Status options for dropdown (aggregating across both tasks and projects)
    const uniqStatuses = Array.from(new Set(combinedList.map((i) => i.status)));

    // Filtering combined list
    const filtered = combinedList
      .filter((i) => typeFilter === "All" || i.type === typeFilter)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const overTasks = (pends.tasks || []).filter((t) => getOverdueDays(t.deadline) > 0).length;
    const overProjects = (pends.projects || []).filter((p) => getOverdueDays(p.deadline) > 0).length;

    return {
      myToday: today,
      myPendencies: pends,
      completedCount: today.completedTaskCount ?? 0,
      pendingCount: today.pendingTaskCount ?? 0,
      totalCount: today.repeatTaskCount ?? 0,
      overdueCount: overTasks + overProjects,
      statusOptions: uniqStatuses,
      filteredList: filtered,
    };
  }, [dataPayload, typeFilter]);

  const filteredKpis = useMemo(() => {
    return myToday?.kpis || [];
  }, [myToday]);

  if (isApiLoading) {
    return <DashboardSkeleton />;
  }

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
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <TooltipProvider>
      <div className="w-full h-[calc(100vh-90px)] bg-white text-slate-800 p-4 flex flex-col gap-4 overflow-hidden">
      {/* KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
        {/* Meetings Today Card */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600 font-semibold  tracking-wider font-medium tracking-widest">Meetings Today</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{myToday.todayMeetings?.length || 0}</p>
            <p className="text-sm text-emerald-600 font-semibold mt-0.5 font-medium">
              {myToday.todayMeetings?.filter(m => m.meetingStatus === "Completed" || m.detailMeetingStatus === "Completed").length || 0} Completed
            </p>
          </div>
        </div>

        {/* Tasks with Deadline Today Card */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600 font-semibold  tracking-wider font-medium  tracking-widest">Tasks with Deadline Today</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{myToday.todayTasks?.length || 0}</p>
            <p className="text-sm text-emerald-600 font-semibold mt-0.5 font-medium">
              {myToday.todayTasks?.filter(t => t.status === "Completed").length || 0} Completed
            </p>
          </div>
        </div>

        {/* Projects with Deadline Today Card */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600 font-semibold  tracking-wider font-medium  tracking-widest">Projects with Deadline Today</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{myToday.projects?.length || 0}</p>
            <p className="text-sm text-emerald-600 font-semibold mt-0.5 font-medium">
              {myToday.projects?.filter(p => p.status === "Completed").length || 0} Completed
            </p>
          </div>
        </div>

        {/* KPIs to be Filled Today Card */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600 font-semibold  tracking-wider font-medium  tracking-widest">KPIs to be Filled Today</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{myToday.kpis?.length || 0}</p>
            <p className="text-sm text-emerald-600 font-semibold mt-0.5 font-medium">
              {myToday.kpis?.filter(k => k.isTodayFillData).length || 0} Completed
            </p>
          </div>
        </div>

        {/* Card 5: Check-in / Check-out & Date (Colspan 1, Date top, Check-in/out bottom) */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition-all duration-300">
    
          <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
            <div>
              <p className="text-sm text-center items-center justify-center   text-slate-600 font-bold ">Today's Date {dateStr}</p>
            </div>
            
            {/* Buttons Row at the bottom */}
            <div className="flex gap-1.5 items-center w-full mt-1.5">
              <Button
                onClick={() => navigate("/dashboard/daily-planning/check-in")}
                type="button"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs rounded-lg text-sm font-bold py-1 whitespace-nowrap flex-1 justify-center"
              >
                <span>Check In</span>
              </Button>
              <Button
                onClick={() => navigate("/dashboard/daily-planning/check-out")}
                type="button"
                className="bg-[#2E3090] hover:bg-[#202270] text-white shadow-xs font-bold rounded-lg text-sm py-1 border-0 whitespace-nowrap flex-1 justify-center"
              >
                <span>Check Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Four Column Today List Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-[1.2] min-h-[220px] overflow-hidden">
        {/* Column 1: Meetings Today */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 shrink-0">
              <h3 className="text-lg font-bold text-primary">Meetings Today</h3>
              <span
                onClick={() => navigate("/dashboard/meetings")}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold cursor-pointer transition-all"
              >
                View All
              </span>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
              {!myToday.todayMeetings || myToday.todayMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600 italic">
                  <p className="text-sm">No meetings today</p>
                </div>
              ) : (
                myToday.todayMeetings.map((m) => (
                  <div
                    onClick={() => navigate(m.isDetailMeeting ? `/dashboard/meeting/detail/${m.meetingId}` : `/dashboard/meeting/edit/${m.meetingId}`)}
                    className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    key={m.meetingId}
                  >
                    <div className="min-w-0 flex-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-semibold text-slate-700 block truncate cursor-help">{m.meetingName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{m.meetingName}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm text-slate-600 block mt-0.5">{fmtTime(m.meetingDateTime)}</span>
                    </div>
                    {renderStatusBadge(m.detailMeetingStatus || m.meetingStatus, m.statusColor)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Tasks with Deadline Today */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 shrink-0">
              <h3 className="text-lg  text-primary">Tasks with Deadline Today</h3>
              <span
                onClick={() => navigate("/dashboard/tasks")}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold cursor-pointer transition-all"
              >
                View All
              </span>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
              {!myToday.todayTasks || myToday.todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600 italic">
                  <p className="text-sm">No tasks due today</p>
                </div>
              ) : (
                myToday.todayTasks.map((t) => (
                  <div
                    onClick={() => navigate(`/dashboard/tasks/edit/${t.taskId}`)}
                    className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    key={t.taskId}
                  >
                    <div className="min-w-0 flex-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-semibold text-slate-700 block truncate cursor-help">{t.taskName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{t.taskName}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm text-slate-600 block ">Deadline: {fmtTime(t.deadline)}</span>
                    </div>
                    {renderStatusBadge(t.status, t.statusColor)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Projects with Deadline Today */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 shrink-0">
              <h3 className="text-lg font-bold text-primary">Projects with Deadline Today</h3>
              <span
                onClick={() => navigate("/dashboard/projects")}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold cursor-pointer transition-all"
              >
                View All
              </span>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
              {!myToday.projects || myToday.projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600 italic">
                  <p className="text-sm">No projects due today</p>
                </div>
              ) : (
                myToday.projects.map((p) => (
                  <div
                    onClick={() => navigate(`/dashboard/projects/edit/${p.projectId}`)}
                    className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    key={p.projectId}
                  >
                    <div className="min-w-0 flex-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-semibold text-slate-700 block truncate cursor-help">{p.projectName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{p.projectName}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm text-slate-600 block mt-0.5">Due: {fmtDate(p.deadline)}</span>
                    </div>
                    {renderStatusBadge(p.status, p.statusColor)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 4: KPIs to be Filled Today */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 shrink-0">
              <h3 className="text-lg font-bold text-primary">KPIs to be Filled Today</h3>
              <span
                onClick={() => navigate("/dashboard/kpi")}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold cursor-pointer transition-all"
              >
                View All
              </span>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0">
              {!myToday.kpis || myToday.kpis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600 italic">
                  <p className="text-sm">No KPIs to fill today</p>
                </div>
              ) : (
                [...(myToday.kpis || [])]
                  .sort((a, b) => {
                    if (a.isTodayFillData && !b.isTodayFillData) return 1;
                    if (!a.isTodayFillData && b.isTodayFillData) return -1;
                    return 0;
                  })
                  .map((k) => (
                    <div
                      onClick={() => navigate(`/dashboard/kpi-dashboard?selectedType=${(k.frequency || "DAILY").toUpperCase()}`)}
                    className={`flex justify-between items-center gap-2 py-2 px-2 rounded-lg border-b border-slate-50 last:border-0 cursor-pointer transition-colors ${
                      k.isTodayFillData
                        ? "bg-emerald-100 border-emerald-100"
                        : "hover:bg-slate-50/50"
                    }`}
                    key={k.kpiId}
                  >
                    <div className="min-w-0 flex-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-semibold text-slate-700 block truncate cursor-help">{k.kpiName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{k.kpiName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {k.tag && (
                      <span className="text-sm font-medium text-slate-600 shrink-0 uppercase tracking-wider ml-2">
                        {k.tag}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Pendencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[180px] overflow-hidden">
        {/* Left Card: Projects / Tasks */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col h-full min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
            <h4 className="text-md font-bold text-primary">Projects / Tasks Where Updates Are Not Added</h4>
            
            {/* Pill Tab Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter("All")}
                className={`text-sm font-semibold px-2.5 py-1 rounded-md transition-all duration-200 ${
                  typeFilter === "All"
                    ? "bg-[#2E3090] text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("Project")}
                className={`text-sm font-semibold px-2.5 py-1 rounded-md transition-all duration-200 ${
                  typeFilter === "Project"
                    ? "bg-[#2E3090] text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("Task")}
                className={`text-sm font-semibold px-2.5 py-1 rounded-md transition-all duration-200 ${
                  typeFilter === "Task"
                    ? "bg-[#2E3090] text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tasks
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg min-h-0">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  {typeFilter === "All" && (
                    <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">Type</th>
                  )}
                  <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">Name</th>
                  <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">Deadline</th>
                  <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const name = item.type === "Task" ? item.taskName : item.projectName;
                  const id = item.type === "Task" ? item.taskId : item.projectId;
                  return (
                    <tr
                      key={id}
                      onClick={() => navigate(item.type === "Task" ? `/dashboard/tasks/edit/${id}` : `/dashboard/projects/edit/${id}`)}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      {typeFilter === "All" && (
                        <td className="py-2 px-3.5 align-middle">
                          <span className={`text-sm font-bold ${
                            item.type === "Project"
                              ? "text-primary/70"
                              : "text-gray-800"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                      )}
                      <td className="py-2 px-3.5 align-middle text-sm font-semibold text-slate-800">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate max-w-[280px] lg:max-w-[450px] cursor-help">{name}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="py-2 px-3.5 align-middle text-sm text-slate-500">{fmtDate(item.deadline)}</td>
                      <td className="py-2 px-3.5 align-middle">
                        {renderStatusBadge(item.status, item.statusColor)}
                      </td>
                    </tr>
                  );
                })}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={typeFilter === "All" ? 4 : 3} className="text-slate-600 py-6 text-sm text-center italic bg-white">
                      No matching pendencies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: KPIs with Data Not Filled Since 2 Days or More */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col h-full min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
            <h4 className="text-md font-bold text-primary">KPIs with Data Not Filled Since 2 Days or More</h4>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg min-h-0">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">KPI Name</th>
                  <th className="text-left text-sm font-semibold tracking-wider uppercase text-slate-500 py-2.5 px-3.5">KPI Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKpis.map((k) => (
                  <tr
                    key={k.kpiId}
                    onClick={() => navigate(`/dashboard/kpi-dashboard?selectedType=${(k.frequency || "DAILY").toUpperCase()}`)}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-3.5 align-middle text-sm font-semibold text-slate-800">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate max-w-[200px] lg:max-w-[280px]  cursor-help">{k.kpiName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{k.kpiName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-2 px-3.5 align-middle">
                      <span className={`text-xs font-bold ${getKpiTagTextColor(k.tag || "General")}`}>
                        {k.tag || "General"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredKpis.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-slate-600 py-6 text-sm text-center italic bg-white">
                      No KPIs found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
