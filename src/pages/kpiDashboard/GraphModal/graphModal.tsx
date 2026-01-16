import { useEffect, useRef, useState, useMemo } from "react";
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
import DateRangePicker from "@/components/shared/DateRange";
import { getUTCEndOfDay, getUTCStartOfDay } from "@/features/utils/app.utils";
import { DateRange } from "react-day-picker";
import useGetKpiChartData from "@/features/api/kpiDashboard/useGetKpiChartData";

/** ====================== TYPES ====================== **/

interface GraphModalProps {
  modalData: KpiDataCell[];
  isModalOpen: boolean;
  modalClose: () => void;
  kpiData?: KpiType;
  selectedPeriod?: string;
}

export default function GraphModal({
  modalData,
  isModalOpen,
  modalClose,
  kpiData,
  selectedPeriod,
}: GraphModalProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  /** ====================== DEFAULT DATE CALCULATION ====================== **/
  const defaultRange = useMemo(() => {
    if (!modalData || modalData.length === 0)
      return { from: undefined, to: undefined };

    const sorted = [...modalData].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    return {
      from: new Date(sorted[0].startDate),
      to: new Date(
        sorted[sorted.length - 1].endDate ||
          sorted[sorted.length - 1].startDate,
      ),
    };
  }, [modalData]);

  /** ====================== STATE ====================== **/
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [applyFilter, setApplyFilter] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSelectedRange({
        from: defaultRange.from,
        to: defaultRange.to,
      });
      setApplyFilter(false);
    }
  }, [isModalOpen, defaultRange]);

  /** ====================== FORMATTERS ====================== **/
  const formatDateDaily = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    return `${day} ${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
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
  /** ====================== HANDLERS ====================== **/
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedRange({
      from: range?.from,
      to: range?.to || range?.from,
    });
  };

  const handleDateRangeApply = (range: DateRange | undefined) => {
    setSelectedRange({ from: range?.from, to: range?.to || range?.from });
    setApplyFilter(true);
  };

  const handleDateRangeReset = () => {
    setSelectedRange({ from: defaultRange.from, to: defaultRange.to });
    setApplyFilter(false);
  };

  /** ====================== API CALL ====================== **/
  const { data: chartApiData } = useGetKpiChartData({
    filter: {
      frequencyType: selectedPeriod,
      startDate: selectedRange.from
        ? getUTCStartOfDay(selectedRange.from)
        : null,
      endDate: selectedRange.to ? getUTCEndOfDay(selectedRange.to) : null,
    },
    enable: applyFilter,
  });

  /** ====================== CHART DATA ====================== **/
  const apiList = useMemo((): KpiDataCell[] => {
    if (chartApiData?.data?.[0] && Array.isArray(chartApiData.data[0])) {
      return chartApiData.data[0] as KpiDataCell[];
    }
    return modalData || [];
  }, [chartApiData, modalData]);

  const chartData = apiList.map((item, idx) => ({
    date: getFormattedDate(item, idx),
    actual: item.data ? Number(item.data) : 0,
    goal: Number(item.goalValue || 0),
  }));

  /** ====================== DOWNLOAD ====================== **/
  const downloadChart = async () => {
    if (chartRef.current) {
      const dataUrl = await toJpeg(chartRef.current, {
        quality: 0.95,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `${kpiData?.kpiName || "chart"}.jpg`;
      link.href = dataUrl;
      link.click();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">KPI Name:</span>{" "}
              <span className="text-gray-900 text-lg">{kpiData?.kpiName}</span>
            </div>

            <DateRangePicker
              value={{ from: selectedRange.from, to: selectedRange.to }}
              onChange={handleDateRangeChange}
              onApply={handleDateRangeApply}
              onSaveApply={handleDateRangeApply}
              defaultDate={{
                startDate: selectedRange.from,
                deadline: selectedRange.to,
              }}
              isClear
              handleClear={handleDateRangeReset}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadChart}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                margin={{ top: 5, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12, fill: "#666" }}
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
