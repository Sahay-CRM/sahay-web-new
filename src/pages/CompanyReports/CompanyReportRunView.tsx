import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useRunCompanyReport from "@/features/api/Reports/useRunCompanyReport";
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

  const reportName = runData?.reportName || runData?.report?.reportName || "";
  const reportDescription = runData?.reportDescription || runData?.report?.reportDescription || "";
  const columns = runData?.columns || runData?.report?.reportConfig?.columns || [];
  const results = runData?.rows || runData?.result || [];
  const reportConfig = runData?.reportConfig || runData?.report?.reportConfig;
  const moduleName = reportConfig?.module || "TASK";
  const sortObj = reportConfig?.sort;
  const filtersObj = reportConfig?.filters || [];
  const viewType = runData?.viewType || runData?.report?.viewType || "GRID";
  const summary = runData?.summary;
  const groups = summary?.groups || [];
  const totalCount = summary?.totalCount || 0;
  const chartConfigs = runData?.chartConfig || [];

  const handleExportCSV = () => {
    const isSummary = viewType === "SUMMARY";
    const dataToExport = isSummary ? groups : results;
    if (dataToExport.length === 0) return;

    let csvContent = "";

    if (isSummary) {
      const headers = ["Group", "Record Count", "Percentage"];
      const rows = groups.map((g: any) => [
        g.label || "",
        String(g.count || 0),
        `${g.percentage || 0}%`
      ]);
      csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
      ].join("\n");
    } else {
      // Build headers for grid view
      const headers = columns.map(col => COLUMN_LABEL_MAP[col] || col);
      // Build rows
      const rows = results.map(row => 
        columns.map(col => {
          const val = row[col];
          if (val === undefined || val === null) return "";
          if (typeof val === "object") {
            const obj = val as Record<string, unknown>;
            return String(obj.adminUserName || obj.name || obj.userName || JSON.stringify(val));
          }
          return String(val).replace(/"/g, '""'); // escape quotes
        })
      );
      csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(val => `"${val}"`).join(","))
      ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportName.replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const renderCell = (row: Record<string, unknown>, colKey: string) => {
    const val = row[colKey];
    if (val === undefined || val === null) return <span className="text-gray-400">—</span>;

    if (colKey === "status") {
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

      {viewType === "SUMMARY" ? (
        /* Summary Report Layout */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {/* Report metadata panel */}
          <div className="p-6 bg-slate-50 border-b border-gray-150 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {moduleName} Report (Summary)
                </span>
                <h1 className="text-xl font-bold text-gray-900 mt-2">{reportName}</h1>
                <p className="text-sm text-gray-500 mt-1">{reportDescription}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-gray-250 p-2.5 rounded-xl shadow-2xs">
                <PlayCircle className="w-5 h-5 text-indigo-500" />
                <span>{totalCount} total items</span>
              </div>
            </div>
          </div>

          {/* Charts & Visualization Panel */}
          {groups.length > 0 && chartConfigs.length > 0 && (
            <div className="p-6 border-b border-gray-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
              {chartConfigs.map((cfg: any, idx: number) => {
                if (cfg.type === "bar") {
                  return (
                    <div key={idx} className="border border-gray-150 rounded-2xl p-4 shadow-3xs flex flex-col h-[320px]">
                      <h3 className="text-sm font-bold text-gray-800 mb-4">{cfg.title || "Bar Chart"}</h3>
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
                      <h3 className="text-sm font-bold text-gray-800 mb-4">{cfg.title || "Pie Chart"}</h3>
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
                    <th className="px-6 py-3 font-semibold">Group (by {summary?.groupByField || "Field"})</th>
                    <th className="px-6 py-3 font-semibold">Record Count</th>
                    <th className="px-6 py-3 font-semibold">Percentage Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {groups.map((g: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 text-sm transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {g.label}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {g.count}
                      </td>
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
      ) : (
        /* Tabular Grid Report Layout */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {/* Report metadata panel */}
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
                <PlayCircle className="w-5 h-5 text-emerald-500" />
                <span>{results.length} records found</span>
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
                  <span>Active Rules: <strong className="text-gray-900">{(filtersObj || []).map(f => COLUMN_LABEL_MAP[f.field] || f.field).join(", ")}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto">
            {results.length === 0 ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-semibold">No data matches the report rules.</p>
                <p className="text-xs text-gray-400">Modify filters in the admin panel if you need to fetch more data.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                    {columns.map(col => (
                      <th key={col} className="px-5 py-3 font-semibold">
                        {COLUMN_LABEL_MAP[col] || col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 text-sm transition-colors">
                      {columns.map(col => (
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
        </div>
      )}
    </div>
  );
}
