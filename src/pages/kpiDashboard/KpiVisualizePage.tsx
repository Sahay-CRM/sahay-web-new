import { getKpiData } from "@/features/selectors/auth.selector";
import { isValidInput } from "@/features/utils/formatting.utils";
import { format } from "date-fns";
import { useSelector } from "react-redux";

export default function KpiVisualizePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const KpiData = useSelector(getKpiData);

  const kpiDataStatic = {
    dataPointId: "bee1d7ee-799d-4546-ba58-d7e29599131e",
    dataPointName: "Sales",
    dataPointLabel: "Sales (In Lakhs)",
    validationType: "LESS_THAN",
    frequencyType: "DAILY",
    employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
    employeeName: "Jay Joshi",
    dataArray: [
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-06-21T18:30:00.000Z",
        endDate: "2025-06-27T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-06-14T18:30:00.000Z",
        endDate: "2025-06-20T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-06-07T18:30:00.000Z",
        endDate: "2025-06-13T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-05-31T18:30:00.000Z",
        endDate: "2025-06-06T18:30:00.000Z",
        sum: 86.4545,
        avg: 12.350642857142857,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-05-24T18:30:00.000Z",
        endDate: "2025-05-30T18:30:00.000Z",
        sum: 91558377,
        avg: 13079768.142857144,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-05-17T18:30:00.000Z",
        endDate: "2025-05-23T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-05-10T18:30:00.000Z",
        endDate: "2025-05-16T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-05-03T18:30:00.000Z",
        endDate: "2025-05-09T18:30:00.000Z",
        sum: 100,
        avg: 14.285714285714286,
        validationValue: 70,
      },
      {
        dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
        startDate: "2025-04-26T18:30:00.000Z",
        endDate: "2025-05-02T18:30:00.000Z",
        sum: 0,
        avg: 0,
        validationValue: 70,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded shadow-sm bg-white space-y-2">
        <h2 className="text-xl font-semibold">KPI Details</h2>
        <div>
          <strong>Data Point:</strong> {kpiDataStatic?.dataPointName}
        </div>
        <div>
          <strong>Label:</strong> {kpiDataStatic?.dataPointLabel}
        </div>
        <div>
          <strong>Employee:</strong> {kpiDataStatic?.employeeName}
        </div>
        <div>
          <strong>Frequency:</strong> {kpiDataStatic?.frequencyType}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {kpiDataStatic?.dataArray?.map((item, index) => (
          <div
            key={index}
            className={`p-4 border rounded-md shadow-sm space-y-2 w-[250px] ${
              isValidInput(
                kpiDataStatic?.validationType,
                item?.validationValue,
                item.sum,
              )
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500"
            }`}
          >
            <div className="text-md text-gray-500">
              {format(new Date(item.startDate), "dd MMM yyyy")} -{" "}
              {format(new Date(item.endDate), "dd MMM yyyy")}
            </div>
            <div>
              <strong>Sum:</strong> {item.sum}
            </div>
            <div>
              <strong>Average:</strong> {item.avg}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
