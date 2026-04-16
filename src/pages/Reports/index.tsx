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
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Tag,
  Briefcase,
  Users,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subValue && (
          <p className="text-slate-400 text-xs mt-1 font-normal">{subValue}</p>
        )}
      </div>
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-slate-50 rounded-lg">
      <Icon className="w-5 h-5 text-slate-600" />
    </div>
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    <div className="h-px bg-slate-100 flex-1 ml-2"></div>
  </div>
);
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

export default function ReportsPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: reportsData, isLoading } = useGetReports();

  useEffect(() => {
    setBreadcrumbs([{ label: "Reports", href: "" }]);
  }, [setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Analyzing performance data...
        </p>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 border border-slate-100">
          <AlertCircle className="text-slate-300" size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">
            No report data found
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            We couldn't retrieve your performance metrics at this time.
          </p>
        </div>
      </div>
    );
  }

  const { tasks, projects, kpi, meetings, meetingNotes, agenda } = reportsData;

  const processedDelayData = projects.delayTop5.map((item) => ({
    ...item,
    delayDaysNumeric: parseDurationToDays(item.delayDays),
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-[1600px] mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Performance Insights
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Real-time analysis of operations, projects, and team engagement.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reporting Period
              </p>
              <p className="text-sm font-medium text-slate-700">
                {format(new Date(), "MMMM yyyy")}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-100 mx-2"></div>
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Projects"
            value={projects.totalProjects}
            subValue={`${projects.activeProjects} Active · ${projects.delayedProjects} Delayed · ${projects.notUpdatedProjects} Stale`}
            icon={Briefcase}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Total Tasks"
            value={tasks.totalTasks}
            subValue={`${tasks.delayedTasks} Delayed · ${tasks.notUpdatedTasks} Stale`}
            icon={CheckCircle2}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Meetings Held"
            value={meetings.totalDetailed + meetings.totalNormal}
            subValue={`${meetings.creationRate}/day avg · ${meetings.missedDetailed} missed`}
            icon={Users}
            colorClass="bg-purple-50 text-purple-600"
          />
          <StatCard
            title="KPI Filing Rate"
            value={`${(kpi.fillingRate * 100).toFixed(0)}%`}
            subValue={`${kpi.totalKpi} Active KPIs monitored`}
            icon={TrendingUp}
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Projects Delay Analysis */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <SectionHeader title="Project Delay Analysis" icon={Clock} />
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projects.delayTop5}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="projectName"
                    type="category"
                    width={150}
                    fontSize={11}
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border-none text-xs">
                            <p className="font-bold mb-1">
                              {payload[0].payload.projectName}
                            </p>
                            <p className="opacity-80">
                              Delay:{" "}
                              <span className="text-rose-400 font-bold">
                                {payload[0].payload.delayDays}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="delayDaysNumeric"
                    radius={[0, 8, 8, 0]}
                    barSize={24}
                  >
                    {processedDelayData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#ef4444" : "#fca5a5"}
                        opacity={1 - index * 0.15}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meeting Notes Type Distribution */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <SectionHeader title="Notes Distribution" icon={FileText} />
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={meetingNotes.noteTypeDistribution}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="noteType"
                  >
                    {meetingNotes.noteTypeDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {meetingNotes.noteTypeDistribution.map((item, index) => (
                <div key={item.noteType} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-slate-500 font-medium truncate">
                    {item.noteType}
                  </span>
                  <span className="text-xs text-slate-900 font-bold ml-auto">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Agenda Monthly Trends */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <SectionHeader title="Agenda Trends" icon={TrendingUp} />
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agenda.perMonth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                    tick={{ fill: "#64748b" }}
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
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    dot={{
                      fill: "#6366f1",
                      strokeWidth: 2,
                      r: 4,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Long Duration Tasks */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader title="Long Duration Focus" icon={Clock} />
            <div className="space-y-4">
              {tasks.longDurationTop5.map((task, idx) => (
                <div
                  key={task.taskId}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {task.taskName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Created{" "}
                        {format(parseISO(task.createdDatetime), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">
                      {task.durationDays}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[100px]">
                      Deadline: {format(parseISO(task.taskDeadline), "dd MMM")}
                    </p>
                  </div>
                </div>
              ))}
              {tasks.longDurationTop5.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-sm">No critical long duration tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Meeting Notes Tag Distribution */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <SectionHeader title="Note Tags Frequency" icon={Tag} />
            <div className="flex flex-wrap gap-3">
              {meetingNotes.noteTagDistribution.map((tag) => (
                <div
                  key={tag.noteTag}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-slate-600">
                    {tag.noteTag}
                  </span>
                  <span className="px-2 py-0.5 bg-white text-indigo-600 text-xs font-bold rounded-md border border-slate-100">
                    {tag.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Resolutions */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader title="Agenda Resolution" icon={AlertCircle} />
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  label: "Resolved",
                  value: agenda.resolved,
                  color: "bg-emerald-500",
                },
                {
                  label: "Unresolved",
                  value: agenda.unresolved,
                  color: "bg-rose-500",
                },
                {
                  label: "Parked",
                  value: agenda.parked,
                  color: "bg-amber-500",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative inline-flex flex-col items-center justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                      <span className="text-xl font-bold text-slate-900">
                        {item.value}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            {/* Resolution Progress Bar */}
            <div className="mt-8 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-slate-600">
                  Overall Closure
                </p>
                <p className="text-sm font-bold text-indigo-600">
                  {agenda.resolved + agenda.unresolved + agenda.parked > 0
                    ? (
                        (agenda.resolved /
                          (agenda.resolved +
                            agenda.unresolved +
                            agenda.parked)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                {agenda.resolved > 0 && (
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(agenda.resolved / (agenda.resolved + agenda.unresolved + agenda.parked || 1)) * 100}%`,
                    }}
                  />
                )}
                {agenda.unresolved > 0 && (
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${(agenda.unresolved / (agenda.resolved + agenda.unresolved + agenda.parked || 1)) * 100}%`,
                    }}
                  />
                )}
                {agenda.parked > 0 && (
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${(agenda.parked / (agenda.resolved + agenda.unresolved + agenda.parked || 1)) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
