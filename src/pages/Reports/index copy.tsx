import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Updated to use a primary-focused palette
const COLORS = [
  "#7F77DD",
  "#94a3b8",
  "#6366f1",
  "#4f46e5",
  "#c7d2fe",
  "#312e81",
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

const Panel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4",
      className,
    )}
  >
    {children}
  </div>
);

const PanelTitle = ({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) => (
  <div className="mb-5">
    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
      {children}
    </p>
    {subtitle && (
      <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
    )}
  </div>
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
          <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-base text-slate-500 font-medium animate-pulse">
          Loading reports...
        </p>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="text-slate-300" size={48} />
        <p className="text-slate-500 text-base">No report data available.</p>
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

  const SectionHeader = ({
    label,
    count,
  }: {
    label: string;
    count?: number | string;
  }) => (
    <div className="flex items-baseline gap-4 mb-2  border-slate-200 pb-3">
      <h2 className="text-lg ">{label}</h2>
      {count !== undefined && (
        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
          {count} Total
        </span>
      )}
    </div>
  );

  const DashboardCard = ({
    title,
    value,
    subValue,
  }: {
    title: string;
    value: string | number;
    subValue?: string;
    badge?: string;
  }) => {
    return (
      <div
        className={cn(
          "bg-slate-50 h-24 border border-slate-200 rounded-xl px-2 py-4 text-center",
        )}
      >
        <p className="text-sm font-semibold text-slate-500  tracking-tight mb-2 ">
          {title}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-xl font-bold text-slate-900 leading-none tabular-nums">
            {value}
          </h3>
          {subValue && (
            <span className="text-[10px] font-medium text-slate-400">
              {subValue}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="bg-white min-h-screen pb-12">
        <div className="max-w-[1600px] mx-auto px-6 pt-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* PROJECTS SECTION */}
            <section>
              <SectionHeader label="Project" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <DashboardCard
                  title="Not Updated Projects"
                  value={projects.notUpdatedProjects}
                />
                <DashboardCard
                  title="Zero Task Projects"
                  value={projects.zeroTaskProjects}
                />
                <DashboardCard
                  title="Delayed"
                  value={projects.delayedProjects}
                />
                <DashboardCard title="Active" value={projects.activeProjects} />
                <DashboardCard
                  title="Creation Rate"
                  value={projects.creationRate}
                />
                <DashboardCard
                  title="Total Projects"
                  value={projects.totalProjects}
                />
              </div>
            </section>

            {/* TASKS SECTION */}
            <section>
              <SectionHeader label="Task" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <DashboardCard
                  title="Delayed Tasks"
                  value={tasks.delayedTasks}
                />
                <DashboardCard
                  title="Not Updated Tasks"
                  value={tasks.notUpdatedTasks}
                />
                <DashboardCard title="Total Tasks" value={tasks.totalTasks} />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* MEETINGS SECTION */}
            <section>
              <SectionHeader label="Meetings" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <DashboardCard
                  title="Total Detailed"
                  value={meetings.totalDetailed}
                />
                <DashboardCard
                  title="Sahay Detailed"
                  value={meetings.sahayDetailed}
                />
                <DashboardCard
                  title="Total Normal"
                  value={meetings.totalNormal}
                />
                <DashboardCard
                  title="Last 30 Days"
                  value={meetings.normalLast30Days}
                />
                <DashboardCard
                  title="Missed Detailed"
                  value={meetings.missedDetailed}
                />
                <DashboardCard
                  title="Creation Rate"
                  value={meetings.creationRate}
                />
                <DashboardCard
                  title="Notes Density"
                  value={meetingNotes.notesPerMeeting}
                />
              </div>
            </section>

            {/* KPI SECTION */}
            <section>
              <SectionHeader label="KPI" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <DashboardCard
                  title="Filling Rate"
                  value={`${(kpi.fillingRate * 100).toFixed(0)}%`}
                />
                <DashboardCard title="Total KPI" value={`${kpi.totalKpi}`} />
              </div>
            </section>
          </div>

          {/* DISTRIBUTIONS + AGENDA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-x-0 md:divide-x divide-slate-100">
                <div className="pr-0 md:pr-6">
                  <PanelTitle>Notes Type Distribution</PanelTitle>
                  <div className="flex items-center gap-6">
                    <div className="w-[110px] h-[110px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={meetingNotes.noteTypeDistribution}
                            innerRadius={32}
                            outerRadius={50}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="noteType"
                            stroke="none"
                          >
                            {meetingNotes.noteTypeDistribution.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 flex-1">
                      {meetingNotes.noteTypeDistribution.map((item, i) => (
                        <div
                          key={item.noteType}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                            <span className="text-sm text-slate-600 font-medium">
                              {item.noteType}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pl-0 md:pl-6 pt-6 md:pt-0">
                  <PanelTitle>Notes Tag Distribution</PanelTitle>
                  <div className="flex items-center gap-6">
                    <div className="w-[110px] h-[110px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={meetingNotes.noteTagDistribution}
                            innerRadius={32}
                            outerRadius={50}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="noteTag"
                            stroke="none"
                          >
                            {meetingNotes.noteTagDistribution.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 flex-1">
                      {meetingNotes.noteTagDistribution.map((item, i) => (
                        <div
                          key={item.noteTag}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                            <span className="text-sm text-slate-600 font-medium">
                              {item.noteTag}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelTitle>Agenda Resolution</PanelTitle>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex gap-4">
                  <div className="text-center bg-primary/5 border border-primary/5 rounded-2xl px-5 py-4 min-w-[100px]">
                    <p className="text-3xl font-black text-primary">
                      {agenda.resolved}
                    </p>
                    <p className="text-xs text-primary font-bold mt-1 uppercase">
                      Resolved
                    </p>
                  </div>
                  <div className="text-center bg-primary/5 border border-primary/5 rounded-2xl px-5 py-4 min-w-[100px]">
                    <p className="text-3xl font-black text-primary">
                      {agenda.unresolved}
                    </p>
                    <p className="text-xs text-primary font-bold mt-1 uppercase">
                      Unresolved
                    </p>
                  </div>
                  <div className="text-center bg-primary/5 border border-primary/5 rounded-2xl px-5 py-4 min-w-[100px]">
                    <p className="text-3xl font-black text-primary">
                      {agenda.parked}
                    </p>
                    <p className="text-xs text-primary font-bold mt-1 uppercase">
                      Parked
                    </p>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600 font-bold">
                      Overall Closure Rate
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {closureRate}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(agenda.resolved / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(agenda.unresolved / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(agenda.parked / total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* LISTS + BAR CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-0 md:divide-x divide-slate-100">
                <div className="pr-0 md:pr-4">
                  <PanelTitle>Project Durations</PanelTitle>
                  <div className="space-y-3">
                    {projects.longDurationTop5.map((p, i) => (
                      <div
                        key={p.projectId}
                        className="flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-300 w-4">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-slate-800 font-bold truncate group-hover:text-black transition-colors cursor-help">
                                  {p.projectName}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{p.projectName}</TooltipContent>
                            </Tooltip>
                            <p className="text-xs text-slate-400">
                              {format(
                                parseISO(p.createdDatetime),
                                "dd MMM yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-primary shrink-0">
                          {p.durationDays}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-0 md:px-6 pt-6 md:pt-0 border-slate-100">
                  <PanelTitle>Task Lifecycle</PanelTitle>
                  <div className="space-y-3">
                    {tasks.longDurationTop5.map((t, i) => (
                      <div
                        key={t.taskId}
                        className="flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-300 w-4">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-slate-800 font-bold truncate group-hover:text-black transition-colors cursor-help">
                                  {t.taskName}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{t.taskName}</TooltipContent>
                            </Tooltip>
                            <p className="text-xs text-slate-400">
                              {format(
                                parseISO(t.createdDatetime),
                                "dd MMM yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-primary shrink-0">
                          {t.durationDays}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pl-0 md:pl-6 pt-6 md:pt-0 border-slate-100">
                  <PanelTitle>Agenda Aging</PanelTitle>
                  <div className="space-y-3">
                    {agenda.longestTop5.length > 0 ? (
                      agenda.longestTop5.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-300 w-4">
                              {i + 1}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-slate-800 font-bold truncate group-hover:text-black cursor-help flex-1">
                                  {a.agendaName || "Untitled"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                {a.agendaName || "Untitled"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-black text-rose-500 shrink-0">
                            {a.duration}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-6">
                        Clean slate.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelTitle>Project Delay Top 5</PanelTitle>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedDelayData}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="projectName"
                      type="category"
                      width={100}
                      fontSize={12}
                      tick={{ fill: "#64748b", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val.length > 15 ? val.substring(0, 12) + "…" : val
                      }
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#f1f5f9" }}
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm shadow-2xl border border-slate-700">
                              <p className="font-bold">
                                {payload[0].payload.projectName}
                              </p>
                              <p className="text-rose-400 font-black">
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
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    >
                      {processedDelayData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? "#E24B4A" : "#7F77DD"}
                          opacity={1 - i * 0.15}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* ACTIVITY TREND */}
          <Panel>
            <PanelTitle subtitle="Monthly Growth">Activity Momentum</PanelTitle>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={agenda.perMonth}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.2} />
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
                    fontSize={12}
                    tick={{ fill: "#64748b", fontWeight: 600 }}
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
                    fontSize={12}
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                      fontSize: "14px",
                      padding: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#7F77DD"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    dot={{ fill: "#7F77DD", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </TooltipProvider>
  );
}
