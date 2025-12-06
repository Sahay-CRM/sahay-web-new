import { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { toJpeg } from "html-to-image";

interface GraphModalProps {
  modalData: KpiDataCell[];
  isModalOpen: boolean;
  modalClose: () => void;
  kpiData?: KpiType;
}

export default function GraphModal({
  modalData,
  isModalOpen,
  modalClose,
  kpiData,
}: GraphModalProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const formatDateDaily = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    return `${day} ${date.toLocaleString("en-US", { month: "short" })}`;
  };

  const formatDateWeekly = (startStr: string, endStr: string) => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const startDay = String(startDate.getDate()).padStart(2, "0");
    const startMonth = startDate.toLocaleString("en-US", { month: "short" });
    const startYear = startDate.getFullYear();
    const endDay = String(endDate.getDate()).padStart(2, "0");
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
      return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
    }
    return `${startDay} ${startMonth} ${startYear} to ${endDay} ${endMonth} ${endYear}`;
  };

  const formatDateMonthly = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${monthName}\n${year}`;
  };

  const formatDateQuarterly = (startStr: string, endStr: string) => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const startMonth = startDate.toLocaleString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
      return `${startMonth}-${endMonth}\n${startYear}`;
    }
    return `${startMonth}-${endMonth}\n${endYear}`;
  };

  const formatDateHalfYearly = (startStr: string, endStr: string) => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const startMonth = startDate.toLocaleString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
      return `${startMonth}-${endMonth}\n${startYear}`;
    }
    return `${startMonth}-${endMonth}\n${endYear}`;
  };

  const formatDateYearly = (startStr: string, endStr: string) => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    return `${startYear}-${endYear}`;
  };

  // Format date for X-axis based on validation type
  const getFormattedDate = (item: KpiDataCell, index: number): string => {
    // If labels are available in kpiData, use them
    if (kpiData?.labels && kpiData.labels[index]) {
      const labelData = kpiData.labels[index];
      return `${labelData.label} - ${labelData.year}`;
    }

    const validationType = kpiData?.validationType || item.validationType;

    switch (validationType) {
      case "DAILY":
        return formatDateDaily(item.startDate);
      case "WEEKLY":
        return formatDateWeekly(item.startDate, item.endDate);
      case "MONTHLY":
        return formatDateMonthly(item.startDate);
      case "QUARTERLY":
        return formatDateQuarterly(item.startDate, item.endDate);
      case "HALFYEARLY":
        return formatDateHalfYearly(item.startDate, item.endDate);
      case "YEARLY":
        return formatDateYearly(item.startDate, item.endDate);
      default:
        return formatDateDaily(item.startDate);
    }
  };

  // Process data for chart
  const chartData = (modalData ?? [])
    .map((item, index) => ({
      date: getFormattedDate(item, index),
      actual: item.data ? parseInt(String(item.data)) : 0,
      goal: parseInt(String(item.goalValue)),
      isSunday: item.isSunday,
      isSkipDay: item.isSkipDay,
      isHoliday: item.isHoliday,
      note: item.note,
    }))
    .reverse();

  const getDateRange = () => {
    if (!modalData || modalData.length === 0) return null;

    const sorted = [...modalData].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const validationType = kpiData?.validationType || first.validationType;

    switch (validationType) {
      case "DAILY":
        return {
          from: formatDateDaily(first.startDate),
          to: formatDateDaily(last.startDate),
        };
      case "WEEKLY":
        return {
          from: formatDateWeekly(first.startDate, first.endDate),
          to: formatDateWeekly(last.startDate, last.endDate),
        };
      case "MONTHLY":
        return {
          from: formatDateMonthly(first.startDate).replace("\n", " "),
          to: formatDateMonthly(last.startDate).replace("\n", " "),
        };
      case "QUARTERLY":
        return {
          from: formatDateQuarterly(first.startDate, first.endDate).replace(
            "\n",
            " ",
          ),
          to: formatDateQuarterly(last.startDate, last.endDate).replace(
            "\n",
            " ",
          ),
        };
      case "HALFYEARLY":
        return {
          from: formatDateHalfYearly(first.startDate, first.endDate).replace(
            "\n",
            " ",
          ),
          to: formatDateHalfYearly(last.startDate, last.endDate).replace(
            "\n",
            " ",
          ),
        };
      case "YEARLY":
        return {
          from: formatDateYearly(first.startDate, first.endDate),
          to: formatDateYearly(last.startDate, last.endDate),
        };
      default:
        return {
          from: formatDateDaily(first.startDate),
          to: formatDateDaily(last.startDate),
        };
    }
  };

  const dateRange = getDateRange();

  const downloadChart = async () => {
    if (chartRef.current) {
      const dataUrl = await toJpeg(chartRef.current, {
        quality: 0.95,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `${kpiData?.kpiName || "chart"}-${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">KPI Name:</span>{" "}
              <span className="text-gray-900 text-lg">{kpiData?.kpiName}</span>
            </div>
            {dateRange && (
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="font-semibold text-gray-700">Date Range:</span>{" "}
                <span className="text-gray-900">
                  {dateRange.from}
                  {dateRange.to && ` to ${dateRange.to}`}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadChart}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Download chart as PNG"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={modalClose}
              className="text-gray-500 hover:text-gray-700 text-3xl p-2"
            >
              ×
            </button>
          </div>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-lg p-2 mb-4"
          ref={chartRef}
        >
          {chartData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No data available for this period
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 30, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 13, fill: "#666" }}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => value}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#dc2626", r: 4 }}
                  name="Goal"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
