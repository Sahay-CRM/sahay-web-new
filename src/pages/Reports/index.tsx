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
} from "recharts";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useGetReports from "@/features/api/Reports/useGetReports";
import { format, parseISO } from "date-fns";
import { CheckCircle2, AlertCircle, Calendar, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps status to subtle styling patterns.
 */
const getStatusStyles = (status: string) => {
  switch (status) {
    case "Done":
    case "Completed":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
      };
    case "None":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
      };
    case "No Tasks":
    case "No Projects":
    case "No Meetings":
      return {
        bg: "bg-slate-50 text-slate-400 border-slate-100",
        dot: "bg-slate-300",
      };
    default:
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
      };
  }
};

const getChartColor = (status: string) => {
  switch (status) {
    case "Done":
    case "Completed":
      return "#10b981"; // emerald-500
    case "None":
      return "#f59e0b"; // amber-500
    case "No Tasks":
    case "No Projects":
    case "No Meetings":
      return "#e2e8f0"; // slate-200
    default:
      return "#3b82f6"; // blue-500
  }
};

export default function ReportsPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: reportsData, isLoading } = useGetReports();

  useEffect(() => {
    setBreadcrumbs([{ label: "Reports", href: "" }]);
  }, [setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">
          Loading report insights...
        </p>
      </div>
    );
  }

  const dailyReport = reportsData?.dailyReport || [];
  const formattedDates = dailyReport.map((d) => {
    try {
      return format(parseISO(d.date), "dd MMM");
    } catch {
      return d.date;
    }
  });

  const categories = [
    { key: "task", name: "Tasks", icon: <CheckCircle2 size={16} /> },
    { key: "project", name: "Projects", icon: <Hash size={16} /> },
    { key: "meeting", name: "Meetings", icon: <Calendar size={16} /> },
  ] as const;

  return (
    <div className="w-full px-4 py-8 space-y-10 bg-white min-h-screen">
      {/* Refined Header */}
      <div className="max-w-7xl mx-auto border-b border-slate-100 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            {reportsData?.companyName || "Operational"} Report
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-normal max-w-md">
            Overview of daily activity cycles across tasks, projects, and
            meetings.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
            Company ID: {reportsData?.companyId?.split("-")[0] || "N/A"}
          </span>
        </div>
      </div>

      {reportsData && dailyReport.length > 0 ? (
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Table - Simplified Design */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left border-r border-slate-200 min-w-[200px] sticky left-0 z-20 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Metric / Timeline
                    </th>
                    {formattedDates.map((date, idx) => (
                      <th
                        key={idx}
                        className="p-4 text-center border-r border-slate-100 min-w-[110px] text-[11px] font-semibold text-slate-500 uppercase"
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr
                      key={cat.key}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="p-6 border-r border-slate-200 sticky left-0 z-10 bg-white text-sm font-medium text-slate-700 shadow-[1px_0_4px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{cat.icon}</span>
                          {cat.name}
                        </div>
                      </td>
                      {dailyReport.map((day, dIdx) => {
                        const metric = day[cat.key];
                        const styles = getStatusStyles(metric.status);

                        return (
                          <td
                            key={dIdx}
                            className="p-3 border-r border-slate-100 text-center"
                          >
                            <div
                              className={cn(
                                "inline-flex flex-col items-center justify-center min-w-[85px] py-2 px-3 rounded-lg border transition-all hover:scale-[1.03]",
                                styles.bg,
                              )}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <div
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    styles.dot,
                                  )}
                                ></div>
                                <span className="text-[9px] font-bold uppercase tracking-tight">
                                  {metric.status}
                                </span>
                              </div>
                              {metric.total > 0 && (
                                <span className="text-[10px] font-medium opacity-80">
                                  {metric.completed}/{metric.total} Done
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualization Section - More spacing and cleaner charts */}
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Trend Visualization
              </h2>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {categories.map((cat) => (
                <div key={cat.key} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      {cat.name} Activity
                    </h3>
                  </div>

                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...dailyReport].reverse().map((day) => ({
                          date: format(parseISO(day.date), "dd"),
                          fullDate: format(parseISO(day.date), "dd MMM"),
                          total: day[cat.key].total,
                          completed: day[cat.key].completed,
                          color: getChartColor(day[cat.key].status),
                        }))}
                        margin={{ top: 0, right: 0, left: -35, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f8fafc"
                        />
                        <XAxis
                          dataKey="date"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#94a3b8", fontWeight: 500 }}
                        />
                        <YAxis
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#cbd5e1" }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc", radius: 4 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-[11px] min-w-[100px]">
                                  <p className="font-semibold text-slate-900 border-b border-slate-50 pb-2 mb-2">
                                    {data.fullDate}
                                  </p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">
                                        Total
                                      </span>
                                      <span className="font-semibold text-slate-800">
                                        {data.total}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600">
                                      <span>Done</span>
                                      <span className="font-semibold">
                                        {data.completed}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={16}>
                          {[...dailyReport].reverse().map((day, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                day[cat.key].total > 0
                                  ? getChartColor(day[cat.key].status)
                                  : "#f1f5f9"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-32 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100">
            <AlertCircle className="text-slate-200" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-900">
              No report data found
            </h3>
            <p className="text-slate-500 text-sm mx-auto">
              We couldn't coordinate with the server to pull your performance
              metrics. Please check back shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
