import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetKpiVisualizeData } from "@/features/api/kpiDashboard";
import { getKpiData } from "@/features/selectors/auth.selector";
import { isValidInput } from "@/features/utils/formatting.utils";
import { format } from "date-fns";
import { useSelector } from "react-redux";

export default function KpiVisualizePage() {
  const KpiData = useSelector(getKpiData);

  const { data: kpiVisualizeData } = useGetKpiVisualizeData(KpiData);
  // const kpiVisualizeData = {
  //   dataPointId: "bee1d7ee-799d-4546-ba58-d7e29599131e",
  //   dataPointName: "Sales",
  //   dataPointLabel: "Sales (In Lakhs)",
  //   validationType: "LESS_THAN",
  //   frequencyType: "DAILY",
  //   employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
  //   employeeName: "Jay Joshi",
  //   dataArray: [
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-06-21T18:30:00.000Z",
  //       endDate: "2025-06-27T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-06-14T18:30:00.000Z",
  //       endDate: "2025-06-20T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-06-07T18:30:00.000Z",
  //       endDate: "2025-06-13T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-05-31T18:30:00.000Z",
  //       endDate: "2025-06-06T18:30:00.000Z",
  //       sum: 86.4545,
  //       avg: 12.350642857142857,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-05-24T18:30:00.000Z",
  //       endDate: "2025-05-30T18:30:00.000Z",
  //       sum: 91558377,
  //       avg: 13079768.142857144,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-05-17T18:30:00.000Z",
  //       endDate: "2025-05-23T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-05-10T18:30:00.000Z",
  //       endDate: "2025-05-16T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-05-03T18:30:00.000Z",
  //       endDate: "2025-05-09T18:30:00.000Z",
  //       sum: 100,
  //       avg: 14.285714285714286,
  //       validationValue: 70,
  //     },
  //     {
  //       dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
  //       startDate: "2025-04-26T18:30:00.000Z",
  //       endDate: "2025-05-02T18:30:00.000Z",
  //       sum: 0,
  //       avg: 0,
  //       validationValue: 70,
  //     },
  //   ],
  // };

  return (
    <div className="space-y-6">
      <div className="py-6 bg-primary px-6 space-y-2">
        <p className="text-white text-md font-semibold">
          <span className="text-sm font-normal">KPI Name: </span>{" "}
          {kpiVisualizeData?.data?.dataPointName}
          <span className="text-sm font-normal text-gray-200 ml-1">
            - {kpiVisualizeData?.data?.dataPointLabel}
          </span>
        </p>

        <p className="text-white text-md font-semibold">
          <span className="text-sm font-normal">Employee: </span>{" "}
          {kpiVisualizeData?.data?.employeeName}
        </p>

        <p className="text-white text-md font-semibold">
          <span className="text-sm font-normal">Frequency Type: </span>{" "}
          {kpiVisualizeData?.data?.frequencyType}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {kpiVisualizeData?.data?.dataArray?.map((item, index) => {
          const isValid = isValidInput(
            kpiVisualizeData?.data?.validationType,
            item?.validationValue,
            item.sum,
          );

          const formattedSum = item.sum?.toFixed(2);
          const formattedAvg = item.avg?.toFixed(2);

          return (
            <div
              key={index}
              className={`w-[220px] p-4 rounded-lg border text-sm shadow-sm transition-all duration-200 transform hover:scale-[1.03] ${
                isValid
                  ? "bg-green-50/70 border-green-200 hover:border-green-400"
                  : "bg-red-50/70 border-red-200 hover:border-red-400"
              }`}
            >
              {/* Date Range */}
              <div className="text-xs text-gray-600 mb-2 text-center">
                {format(new Date(item.startDate), "dd MMM yyyy")} -{" "}
                {format(new Date(item.endDate), "dd MMM yyyy")}
              </div>

              {/* Metrics */}
              <TooltipProvider>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Sum</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium text-gray-800 text-right truncate max-w-[120px] cursor-default">
                        {formattedSum}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{item.sum}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex justify-between flex-wrap break-words gap-x-2">
                  <span className="text-gray-500">Avg</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium text-gray-800 text-right break-words max-w-[120px] cursor-default">
                        {formattedAvg}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{item.avg}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
