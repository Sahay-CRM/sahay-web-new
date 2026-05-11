import React from "react";
import { useGetDashboardRegistryData } from "@/features/api/DashboardRegistry/useGetDashboardRegistryData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutGrid,
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
} from "lucide-react";

const COLORS = [
  "#2e3090",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

interface WidgetValueItem {
  name?: string;
  count?: number;
}

interface Widget {
  id?: string;
  widgetName: string;
  visualization: string;
  value: number | WidgetValueItem[];
  metric: string;
}

const DashboardReportView: React.FC = () => {
  const { data: response, isLoading, error } = useGetDashboardRegistryData();

  // Get all widgets from all modules (TASK, etc.)
  const allWidgets = React.useMemo(() => {
    if (!response?.data) return [];
    return Object.values(response.data).flat();
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#2e3090] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        Error loading dashboard data. Please try again.
      </div>
    );
  }

  const renderWidgetValue = (widget: Widget) => {
    const { value, visualization } = widget;

    // 1. Render Simple Numeric Card
    if (typeof value === "number") {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <span className="text-5xl font-black text-[#2e3090] tracking-tight">
            {value.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest">
            Total Count
          </span>
        </div>
      );
    }

    // 2. Render Charts/Tables if value is an array
    if (Array.isArray(value)) {
      const chartData = (value as WidgetValueItem[]).map((item) => ({
        name: item.name || "Unknown",
        count: item.count || 0,
      }));

      if (visualization === "pie") {
        return (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {chartData.map((_, index) => (
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
        );
      }

      if (visualization === "bar") {
        return (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  hide={chartData.length > 5}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#2e3090"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      if (visualization === "table") {
        return (
          <div className="mt-2 space-y-2 max-h-[200px] overflow-auto pr-2 custom-scrollbar">
            {chartData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 group/item hover:bg-white transition-colors"
              >
                <span className="text-xs font-bold text-gray-600 truncate mr-2">
                  {item.name}
                </span>
                <span className="text-xs font-black text-[#2e3090] shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        );
      }
    }

    return (
      <div className="text-gray-400 italic text-sm">
        Unsupported data format
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Real-time task performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button className="p-2 bg-blue-50 text-[#2e3090] rounded-lg shadow-sm">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allWidgets.map((widget: Widget, idx: number) => (
          <Card
            key={widget.id || idx}
            className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300 rounded-2xl"
          >
            <CardHeader className="pb-2 space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-blue-50 group-hover:text-[#2e3090] transition-colors">
                  {widget.visualization === "pie" ? (
                    <PieChartIcon className="w-4 h-4" />
                  ) : widget.visualization === "table" ? (
                    <TableIcon className="w-4 h-4" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                  {widget.metric.replace(/_/g, " ")}
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-gray-800 line-clamp-1">
                {widget.widgetName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderWidgetValue(widget)}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                  {widget.visualization}
                </span>
                <button className="text-[10px] font-bold text-blue-500 hover:underline">
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardReportView;
