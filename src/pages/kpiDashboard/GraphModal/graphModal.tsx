import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Process data for chart
  const chartData = (modalData ?? [])
    .map((item) => ({
      date: formatDate(item.startDate),
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

    const first = sorted[0].startDate;
    const last = sorted[sorted.length - 1].endDate;

    return {
      from: formatDate(first),
      to: formatDate(last),
    };
  };

  const dateRange = getDateRange();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">KPI Name:</span>{" "}
              <span className="text-gray-900 text-lg">{kpiData?.kpiName}</span>
            </div>
            {dateRange && (
              <div className="ml-6 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">Date Range:</span>{" "}
                <span className="text-gray-900">
                  {dateRange.from} to {dateRange.to}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={modalClose}
            className="text-gray-500 hover:text-gray-700 text-3xl p-2"
          >
            ×
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4">
          {chartData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No data available for this period
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => value}
                  labelFormatter={(label) => `Date: ${label}`}
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
