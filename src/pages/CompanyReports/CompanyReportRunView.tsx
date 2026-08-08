/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useRunCompanyReport from "@/features/api/Reports/useRunCompanyReport";
import { isColorDark } from "@/features/utils/color.utils";
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  SortAsc,
  PlayCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis as ChartXAxis,
  YAxis as ChartYAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
];

const COLUMN_LABEL_MAP: Record<string, string> = {
  taskName: "Task Name",
  taskDescription: "Description",
  status: "Status",
  priority: "Priority",
  dueDate: "Due Date",
  taskDeadline: "Deadline",
  taskActualEndDate: "Actual End Date",
  taskStartDate: "Start Date",
  assignedTo: "Assigned To",
  createdDatetime: "Created At",
  updatedDatetime: "Updated At",
  isNotApplicable: "Not Applicable",
  taskType: "Task Type",
};

const getSortDetails = (sort: unknown) => {
  if (!sort) return { field: "", order: "asc" };
  if (Array.isArray(sort)) {
    if (sort.length > 0) {
      const first = sort[0] as Record<string, unknown>;
      return {
        field: String(first?.field || ""),
        order: String(first?.order || "asc")
      };
    }
    return { field: "", order: "asc" };
  }
  const obj = sort as Record<string, unknown>;
  return {
    field: String(obj.field || ""),
    order: String(obj.order || "asc")
  };
};

const cleanChartTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/\s*\(\[object Object\]\)/gi, "").replace(/\[object Object\]/gi, "");
};

export default function CompanyReportRunView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data: runData, isLoading, error } = useRunCompanyReport(id);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Tasks", href: "/dashboard/tasks" },
      { label: "Reports Library", href: "/dashboard/company-reports" },
      { label: "Run Report", href: "" }
    ]);
  }, [setBreadcrumbs]);

  const [activeTab, setActiveTab] = useState<"detailed" | "summary" | "comparison">("summary");

  const runDataAny = runData as any;
  const reportName = runDataAny?.reportName || runDataAny?.report?.reportName || "";
  const reportDescription = runDataAny?.reportDescription || runDataAny?.report?.reportDescription || "";
  const columns = runDataAny?.columns || runDataAny?.report?.reportConfig?.columns || [];
  const results = runDataAny?.rows || runDataAny?.result || [];
  const reportConfig = runDataAny?.reportConfig || runDataAny?.report?.reportConfig;
  const moduleName = runDataAny?.module || reportConfig?.module || "TASK";
  const sortObj = reportConfig?.sort;
  const filtersObj = reportConfig?.filters || [];
  const viewType = runDataAny?.viewType || runDataAny?.report?.viewType || "GRID";
  const summary = runDataAny?.summary;
  const groups = (summary?.groups || []) as any[];
  const totalCount = summary?.totalCount || 0;
  const chartConfigs = runDataAny?.chartConfig || [];
  const comparison = runDataAny?.comparison;
  const comparisonGroups = (comparison?.groups || []) as any[];

  useEffect(() => {
    if (viewType === "FULL" || viewType === "GRID") {
      setActiveTab("detailed");
    } else {
      setActiveTab("summary");
    }
  }, [viewType]);

  const handleExportCSV = () => {
    if (activeTab === "detailed") {
      if (results.length === 0) return;
      const headers = columns.map((col: any) => COLUMN_LABEL_MAP[col] || col);
      const rows = results.map((row: any) => 
        columns.map((col: any) => {
          const val = row[col];
          if (val === undefined || val === null) return "";
          if (typeof val === "object") {
            const obj = val as Record<string, unknown>;
            return String(obj.adminUserName || obj.name || obj.userName || JSON.stringify(val));
          }
          return String(val).replace(/"/g, '""');
        })
      );
      const csvContent = [
        headers.join(","),
        ...rows.map((r: any) => r.map((val: any) => `"${val}"`).join(","))
      ].join("\n");

      downloadCSV(csvContent, `${reportName.replace(/\s+/g, "_")}_detailed_export.csv`);
    } else if (activeTab === "summary") {
      if (groups.length === 0) return;
      
      const hasDetailedStats = groups[0]?.completedCount !== undefined;
      const headers = [
        "Group",
        "Record Count",
        ...(hasDetailedStats ? ["Completed", "Overdue", "Avg. Completion Days"] : []),
        "Percentage"
      ];

      const rows = groups.map((g: any) => [
        g.label || "",
        String(g.count || 0),
        ...(hasDetailedStats ? [String(g.completedCount || 0), String(g.overdueCount || 0), String(g.avgCompletionDays || 0)] : []),
        `${g.percentage || 0}%`
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      downloadCSV(csvContent, `${reportName.replace(/\s+/g, "_")}_summary_export.csv`);
    } else if (activeTab === "comparison") {
      if (comparisonGroups.length === 0) return;
      const headers = [
        "Group",
        comparison?.period1Label || "Period 1",
        comparison?.period2Label || "Period 2",
        "Difference",
        "Growth Percentage"
      ];

      const rows = comparisonGroups.map((g: any) => [
        g.label || "",
        String(g.period1Count || 0),
        String(g.period2Count || 0),
        String(g.difference || 0),
        `${g.growthPercentage || 0}%`
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r: any) => r.map((val: any) => `"${val.replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      downloadCSV(csvContent, `${reportName.replace(/\s+/g, "_")}_comparison_export.csv`);
    }
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const renderCell = (row: Record<string, unknown>, colKey: string) => {
    const val = row[colKey];
    if (val === undefined || val === null) return <span className="text-gray-400">—</span>;

    if (colKey === "status") {
      const statusColor = (row.statusColor || row.color || row.status_color) as string | undefined;
      if (statusColor) {
        const textColor = isColorDark(statusColor) ? "#ffffff" : "#000000";
        return (
          <span 
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
            style={{
              backgroundColor: statusColor,
              color: textColor,
              borderColor: statusColor
            }}
          >
            {String(val)}
          </span>
        );
      }
      const isCompleted = String(val).toUpperCase() === "COMPLETED";
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          isCompleted 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
        }`}>
          {String(val)}
        </span>
      );
    }

    if (colKey === "priority") {
      const isHigh = String(val).toUpperCase() === "HIGH";
      return (
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          isHigh ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-100 text-slate-700"
        }`}>
          {String(val)}
        </span>
      );
    }

    if (colKey === "assignedTo" || colKey === "employee") {
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        return <span className="font-medium text-gray-800">{String(obj.adminUserName || obj.name || obj.userName)}</span>;
      }
      return <span className="font-medium text-gray-800">{String(val)}</span>;
    }

    if (["dueDate", "taskDeadline", "taskActualEndDate", "taskStartDate", "createdDatetime", "updatedDatetime"].includes(colKey)) {
      try {
        return <span className="text-gray-600">{new Date(val as string).toLocaleDateString("en-GB")}</span>;
      } catch {
        return <span className="text-gray-600">{String(val)}</span>;
      }
    }

    if (typeof val === "boolean") {
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
          {val ? "Yes" : "No"}
        </span>
      );
    }

    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      return <span>{String(obj.name || obj.label || obj.title || JSON.stringify(val))}</span>;
    }

    return <span className="text-gray-700">{String(val)}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-indigo-50 rounded-full" />
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
          Executing Report Query...
        </p>
      </div>
    );
  }

  if (error || (!runData?.report && !runData?.reportId)) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-150">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="text-sm font-medium">Failed to run report. Verify the report configuration and try again.</span>
        </div>
        <button
          onClick={() => navigate("/dashboard/company-reports")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>
      </div>
    );
  }

  const hasData = (viewType === "SUMMARY" ? groups.length : results.length) > 0;

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/company-reports")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>

        {hasData && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Main Report Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {/* Unified Report Metadata Panel */}
        <div className="p-6 bg-slate-50 border-b border-gray-150 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {moduleName} Report
              </span>
              <h1 className="text-xl font-bold text-gray-900 mt-2">{reportName}</h1>
              <p className="text-sm text-gray-500 mt-1">{reportDescription}</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-gray-250 p-2.5 rounded-xl shadow-2xs">
              <PlayCircle className="w-5 h-5 text-indigo-500" />
              <span>{viewType === "SUMMARY" ? `${totalCount} total items` : `${results.length} records found`}</span>
            </div>
          </div>

          {/* Details/Rules summary */}
          <div className="flex flex-wrap gap-4 text-xs">
            {(() => {
              const s = getSortDetails(sortObj);
              if (!s.field) return null;
              return (
                <div className="flex items-center gap-1.5 bg-white border border-gray-150 px-3 py-1.5 rounded-lg text-gray-600">
                  <SortAsc className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sorted by: <strong className="text-gray-900">{COLUMN_LABEL_MAP[s.field] || s.field}</strong> ({s.order.toUpperCase()})</span>
                </div>
              );
            })()}

            {(filtersObj || []).length > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-150 px-3 py-1.5 rounded-lg text-gray-600">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Active Rules: <strong className="text-gray-900">{(filtersObj || []).map((f: any) => COLUMN_LABEL_MAP[f.field] || f.field).join(", ")}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-6">
          {(viewType === "FULL" || viewType === "GRID") && (
            <button
              onClick={() => setActiveTab("detailed")}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all uppercase tracking-wider ${
                activeTab === "detailed"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Detailed List
            </button>
          )}
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all uppercase tracking-wider ${
              activeTab === "summary"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Summary Analysis
          </button>
          {comparison && (
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all uppercase tracking-wider ${
                activeTab === "comparison"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Period Comparison
            </button>
          )}
        </div>

        {/* Tab Content Panels */}
        {activeTab === "detailed" && (
          /* Tabular Grid Table */
          <div className="overflow-x-auto">
            {results.length === 0 ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-semibold">No data matches the report rules.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                    {columns.map((col: any) => (
                      <th key={col} className="px-5 py-3 font-semibold">
                        {COLUMN_LABEL_MAP[col] || col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {results.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 text-sm transition-colors">
                      {columns.map((col: any) => (
                        <td key={col} className="px-5 py-3.5 font-normal">
                          {renderCell(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-0">
            {/* Charts & Visualization Panel (inside summary view) */}
            {groups.length > 0 && chartConfigs.length > 0 && (
              <div className="p-6 border-b border-gray-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                {chartConfigs.map((cfg: any, idx: number) => {
                  if (cfg.type === "bar") {
                    return (
                      <div key={idx} className="border border-gray-150 rounded-2xl p-4 shadow-3xs flex flex-col h-[320px]">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">{cleanChartTitle(cfg.title) || "Bar Chart"}</h3>
                        <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={groups.map((g: any) => ({
                                name: g.label,
                                count: g.count,
                              }))}
                              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <ChartXAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                              <ChartYAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                              <ChartTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (cfg.type === "pie") {
                    return (
                      <div key={idx} className="border border-gray-150 rounded-2xl p-4 shadow-3xs flex flex-col h-[320px]">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">{cleanChartTitle(cfg.title) || "Pie Chart"}</h3>
                        <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={groups.map((g: any) => ({
                                  name: g.label,
                                  value: g.count,
                                }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {groups.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#64748B" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Groups breakdown table */}
            <div className="overflow-x-auto">
              {groups.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                  <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-semibold">No summary data available.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-3 font-semibold">
                        Group (by {typeof summary?.groupByField === "object" && summary?.groupByField !== null ? ((summary.groupByField as any).field || "Field") : (summary?.groupByField || "Field")})
                      </th>
                      <th className="px-6 py-3 font-semibold text-center">Record Count</th>
                      {groups[0]?.completedCount !== undefined && <th className="px-6 py-3 font-semibold text-center">Completed</th>}
                      {groups[0]?.overdueCount !== undefined && <th className="px-6 py-3 font-semibold text-center">Overdue</th>}
                      {groups[0]?.avgCompletionDays !== undefined && <th className="px-6 py-3 font-semibold text-center">Avg. Completion (Days)</th>}
                      <th className="px-6 py-3 font-semibold">Percentage Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {groups.map((g: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 text-sm transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{g.label}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-center">{g.count}</td>
                        {g.completedCount !== undefined && <td className="px-6 py-4 font-medium text-emerald-600 text-center">{g.completedCount}</td>}
                        {g.overdueCount !== undefined && <td className="px-6 py-4 font-medium text-rose-600 text-center">{g.overdueCount}</td>}
                        {g.avgCompletionDays !== undefined && <td className="px-6 py-4 font-medium text-gray-700 text-center">{g.avgCompletionDays}</td>}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-40 bg-gray-100 rounded-full h-2 overflow-hidden shrink-0">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${g.percentage}%`,
                                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-600 w-12 shrink-0">{g.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "comparison" && comparison && (
          <div className="space-y-0">
            {/* Top comparison stats inside panel */}
            <div className="p-6 bg-slate-50/50 border-b border-gray-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200/85 p-4 rounded-xl shadow-3xs">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{comparison?.period1Label || "Period 1"}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{comparison?.totalPeriod1 ?? 0}</p>
                </div>
                <div className="bg-white border border-gray-200/85 p-4 rounded-xl shadow-3xs">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{comparison?.period2Label || "Period 2"}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{comparison?.totalPeriod2 ?? 0}</p>
                </div>
                <div className="bg-white border border-gray-200/85 p-4 rounded-xl shadow-3xs">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Difference</p>
                  <p className={`text-2xl font-bold mt-1 ${(comparison?.overallDifference ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {(comparison?.overallDifference ?? 0) >= 0 ? `+${comparison?.overallDifference}` : comparison?.overallDifference}
                  </p>
                </div>
                <div className="bg-white border border-gray-200/85 p-4 rounded-xl shadow-3xs">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Growth</p>
                  <p className={`text-2xl font-bold mt-1 ${(comparison?.overallGrowthPercentage ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {comparison?.overallGrowthPercentage ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Groups breakdown table */}
            <div className="overflow-x-auto">
              {comparisonGroups.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                  <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-semibold">No comparison data available.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-3 font-semibold">Group (by {comparison?.groupByField || "Field"})</th>
                      <th className="px-6 py-3 font-semibold text-center">{comparison?.period1Label || "Period 1"}</th>
                      <th className="px-6 py-3 font-semibold text-center">{comparison?.period2Label || "Period 2"}</th>
                      <th className="px-6 py-3 font-semibold text-center">Difference</th>
                      <th className="px-6 py-3 font-semibold text-center">Growth %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {comparisonGroups.map((g: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 text-sm transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{g.label}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-center">{g.period1Count ?? 0}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-center">{g.period2Count ?? 0}</td>
                        <td className={`px-6 py-4 font-semibold text-center ${(g.difference ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {(g.difference ?? 0) >= 0 ? `+${g.difference}` : g.difference}
                        </td>
                        <td className={`px-6 py-4 font-semibold text-center ${(g.growthPercentage ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {g.growthPercentage ?? 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
