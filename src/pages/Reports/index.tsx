import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useGetReports from "@/features/api/Reports/useGetReports";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Tag,
  Briefcase,
  Users,
  LucideIcon,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#7F77DD",
  "#1D9E75",
  "#EF9F27",
  "#E24B4A",
  "#D4537E",
  "#378ADD",
];

const parseDurationToDays = (duration: string): number => {
  if (!duration) return 0;
  const parts = duration.split(" ");
  const val = parseFloat(parts[0]);
  if (isNaN(val)) return 0;
  const unit = parts[1]?.toLowerCase() || "";
  if (unit.includes("year")) return val * 365;
  if (unit.includes("month")) return val * 30;
  if (unit.includes("week")) return val * 7;
  return val;
};

// ─── Panel wrapper ─────────────────────────────────────────────────────────────
const Panel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white border border-slate-100 rounded-xl shadow-sm px-4 py-3",
      className,
    )}
  >
    {children}
  </div>
);

// ─── Panel title ───────────────────────────────────────────────────────────────
const PanelTitle = ({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) => (
  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5" />
    {children}
  </p>
);

export default function ReportsPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: reportsData, isLoading } = useGetReports();

  useEffect(() => {
    setBreadcrumbs([{ label: "Performance Insights", href: "" }]);
  }, [setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-indigo-100 rounded-full" />
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">
          Loading report...
        </p>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="text-slate-300" size={36} />
        <p className="text-slate-500 text-sm">No report data available.</p>
      </div>
    );
  }

  const { tasks, projects, kpi, meetings, meetingNotes, agenda } = reportsData;

  const processedDelayData = projects.delayTop5.map((item) => ({
    ...item,
    delayDaysNumeric: parseDurationToDays(item.delayDays),
  }));

  const total = agenda.resolved + agenda.unresolved + agenda.parked || 1;
  const closureRate = ((agenda.resolved / total) * 100).toFixed(1);
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-indigo-600 rounded-full" />
      <span className="text-[12px] font-black text-slate-600 uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
  );
  const DashboardCard = ({
    title,
    value,
    icon: Icon,
    variant = "default",
    badge,
  }: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: "default" | "warning" | "danger" | "success";
    badge?: string;
  }) => {
    const styles = {
      default: "text-blue-600 bg-blue-50",
      success: "text-emerald-600 bg-emerald-50",
      warning: "text-amber-500 bg-amber-50",
      danger: "text-rose-500 bg-rose-50",
    };

    return (
      <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex flex-col gap-2 relative transition-transform hover:scale-[1.01]">
        {badge && (
          <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 rounded-md px-1.5 py-0.5">
            {badge}
          </span>
        )}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            styles[variant],
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-800 leading-none tabular-nums">
            {value}
          </h3>
        </div>
      </div>
    );
  };
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-8">
      <div className="max-w-[1600px] mx-auto px-5 pt-4 space-y-5">
        {/* ── PROJECTS SECTION ─────────────────────────────────────── */}
        <section>
          <SectionHeader label="Project Ecosystem" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <DashboardCard
              title="Total"
              value={projects.totalProjects}
              icon={Briefcase}
              variant="default"
            />
            <DashboardCard
              title="Active"
              value={projects.activeProjects}
              icon={Zap}
              variant="success"
            />
            <DashboardCard
              title="Delayed"
              value={projects.delayedProjects}
              icon={Clock}
              variant="danger"
            />
            <DashboardCard
              title="Ghost"
              value={projects.zeroTaskProjects}
              icon={AlertCircle}
              variant="warning"
              badge="No Tasks"
            />
            <DashboardCard
              title="Stale"
              value={projects.notUpdatedProjects}
              icon={FileText}
              variant="warning"
              badge="Old Updates"
            />
          </div>
        </section>

        {/* ── TASKS & PERFORMANCE ──────────────────────────────────── */}
        <section>
          <SectionHeader label="Task Analytics" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <DashboardCard
              title="Total Tasks"
              value={tasks.totalTasks}
              icon={FileText}
              variant="default"
            />
            <DashboardCard
              title="Delayed"
              value={tasks.delayedTasks}
              icon={Clock}
              variant="danger"
            />
            <DashboardCard
              title="Filing Rate"
              value={`${(kpi.fillingRate * 100).toFixed(0)}%`}
              icon={TrendingUp}
              variant="success"
            />
            <DashboardCard
              title="Active KPIs"
              value={kpi.totalKpi}
              icon={Zap}
              variant="default"
            />
            <DashboardCard
              title="Pending"
              value={tasks.notUpdatedTasks}
              icon={AlertCircle}
              variant="warning"
            />
          </div>
        </section>

        {/* ── MEETINGS SECTION ─────────────────────────────────────── */}
        <section>
          <SectionHeader label="Communication" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <DashboardCard
              title="Total Meetings"
              value={meetings.totalDetailed + meetings.totalNormal}
              icon={Users}
              variant="default"
            />
            <DashboardCard
              title="Detailed"
              value={meetings.totalDetailed}
              icon={FileText}
              variant="default"
            />
            <DashboardCard
              title="Sahay AI"
              value={meetings.sahayDetailed}
              icon={Zap}
              variant="success"
            />
            <DashboardCard
              title="Missed"
              value={meetings.missedDetailed}
              icon={AlertCircle}
              variant="danger"
            />
            <DashboardCard
              title="Daily Rate"
              value={meetings.creationRate}
              icon={TrendingUp}
              variant="default"
            />
          </div>
        </section>

        {/* ── ROW 4: Distributions + Agenda ───────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Both pie charts in one panel */}
          <Panel>
            <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100 h-full">
              {/* Notes Type */}
              <div className="pr-4">
                <PanelTitle icon={FileText}>Notes Type</PanelTitle>
                <div className="flex items-center gap-3">
                  <div className="w-[90px] h-[90px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={meetingNotes.noteTypeDistribution}
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="noteType"
                          stroke="none"
                        >
                          {meetingNotes.noteTypeDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {meetingNotes.noteTypeDistribution.map((item, i) => (
                      <div
                        key={item.noteType}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-slate-600 truncate">
                            {item.noteType}
                          </span>
                        </div>
                        <span className="text-sm font-black text-slate-900 shrink-0">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes Tag */}
              <div className="pl-4">
                <PanelTitle icon={Tag}>Notes Tag</PanelTitle>
                <div className="flex items-center gap-3">
                  <div className="w-[90px] h-[90px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={meetingNotes.noteTagDistribution}
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="noteTag"
                          stroke="none"
                        >
                          {meetingNotes.noteTagDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {meetingNotes.noteTagDistribution.map((item, i) => (
                      <div
                        key={item.noteTag}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-slate-600 truncate">
                            {item.noteTag}
                          </span>
                        </div>
                        <span className="text-sm font-black text-slate-900 shrink-0">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Agenda Resolution */}
          <Panel>
            <PanelTitle icon={AlertCircle}>Agenda Resolution</PanelTitle>
            <div className="flex items-center gap-5">
              <div className="flex gap-3">
                <div className="text-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <p className="text-2xl font-black text-emerald-700">
                    {agenda.resolved}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Resolved
                  </p>
                </div>
                <div className="text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-2xl font-black text-red-700">
                    {agenda.unresolved}
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">
                    Unresolved
                  </p>
                </div>
                <div className="text-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-2xl font-black text-amber-800">
                    {agenda.parked}
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">
                    Parked
                  </p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-slate-500 font-medium">
                    Closure Rate
                  </span>
                  <span className="text-sm font-black text-indigo-600">
                    {closureRate}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(agenda.resolved / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(agenda.unresolved / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(agenda.parked / total) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  {[
                    { label: "Resolved", color: "bg-emerald-500" },
                    { label: "Unresolved", color: "bg-red-500" },
                    { label: "Parked", color: "bg-amber-400" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
                      <span className="text-xs text-slate-400">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ── ROW 5: Longevity Lists + Delay Chart ────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Both longevity lists */}
          <Panel>
            <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
              <div className="pr-4">
                <PanelTitle icon={Briefcase}>Project Longevity</PanelTitle>
                <div className="space-y-2">
                  {projects.longDurationTop5.map((p, i) => (
                    <div
                      key={p.projectId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-300 shrink-0 w-4">
                          {i + 1}.
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700 font-semibold truncate">
                            {p.projectName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {format(parseISO(p.createdDatetime), "dd MMM yy")}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-blue-600 shrink-0">
                        {p.durationDays}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pl-4">
                <PanelTitle icon={Clock}>Task Longevity</PanelTitle>
                <div className="space-y-2">
                  {tasks.longDurationTop5.map((t, i) => (
                    <div
                      key={t.taskId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-300 shrink-0 w-4">
                          {i + 1}.
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700 font-semibold truncate">
                            {t.taskName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {format(parseISO(t.createdDatetime), "dd MMM yy")}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600 shrink-0">
                        {t.durationDays}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {/* Project Delay Bar Chart */}
          <Panel>
            <PanelTitle icon={Clock}>Project Delay Analysis</PanelTitle>
            <div className="h-[175px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedDelayData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="projectName"
                    type="category"
                    width={140}
                    fontSize={11}
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val.length > 22 ? val.substring(0, 20) + "…" : val
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                            <p className="font-bold">
                              {payload[0].payload.projectName}
                            </p>
                            <p className="text-red-400 font-bold">
                              {payload[0].payload.delayDays}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="delayDaysNumeric"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  >
                    {processedDelayData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "#E24B4A" : "#F09595"}
                        opacity={1 - i * 0.12}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* ── ROW 6: Agenda Trend (full width) ────────────────────── */}
        <Panel>
          <PanelTitle icon={TrendingUp}>Agenda Trends</PanelTitle>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={agenda.perMonth}
                margin={{ top: 4, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tick={{ fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    const [year, month] = val.split("-");
                    return format(
                      new Date(parseInt(year), parseInt(month) - 1),
                      "MMM yy",
                    );
                  }}
                />
                <YAxis
                  fontSize={11}
                  tick={{ fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 16px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#7F77DD"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  dot={{ fill: "#7F77DD", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
