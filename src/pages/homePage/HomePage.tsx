import useGetHealthScore from "@/features/api/healthDashboard/getHealthScore";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState } from "react";
import ReactSpeedometer, {
  CustomSegmentLabelPosition,
} from "react-d3-speedometer";

export default function HealthScoreDashboard() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", href: "" }]);
  }, [setBreadcrumbs]);

  const maxValue = 100;
  const [companyDisplayValue, setCompanyDisplayValue] = useState(0);
  const [individualDataList, setIndividualDataList] = useState<
    IndividualResult[]
  >([]);

  const { data: reportData } = useGetHealthScore();

  useEffect(() => {
    if (reportData) {
      setCompanyDisplayValue(reportData.companyResult.healthPercentage);
      setIndividualDataList(reportData.individualResult || []);
    }
  }, [reportData]);

  const customSegmentLabels = Array(10)
    .fill(undefined)
    .map((_, i) => ({
      text: `${(i + 1) * 10}%`,
      position: CustomSegmentLabelPosition.Outside,
      color: "#d5d5d5",
    }));

  const smallSegmentLabels = Array(10)
    .fill(undefined)
    .map((_, i) => ({
      text: i === 4 ? "50%" : i === 9 ? "100%" : "",
      position: CustomSegmentLabelPosition.Outside,
      color: "#d5d5d5",
    }));

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50/50 min-h-full lg:items-stretch items-start w-full">
      {/* Left Column: Overall Health */}
      <div className="w-full lg:w-[480px] shrink-0 flex flex-col">
        {/* Overall Health Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 w-full flex-1 min-h-[350px]">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 w-full text-center">
            Overall Company Health
          </h2>
          <div className="flex-1 flex items-center justify-center p-2 bg-slate-50 rounded-xl mb-4 w-full">
            <ReactSpeedometer
              value={companyDisplayValue}
              maxValue={maxValue}
              customSegmentLabels={customSegmentLabels}
              segments={10}
              dimensionUnit="px"
              width={400}
              height={240}
              needleHeightRatio={0.9}
              ringWidth={15}
              currentValueText="${value}%"
              needleTransitionDuration={1000}
              startColor="#369143"
              endColor="#2f328e"
              textColor="#000"
              valueTextFontSize="22px"
              paddingVertical={20}
            />
            
          </div>
          
         {reportData?.companyResult && (
  <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5">

    {/* Score */}
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Overall Score
      </p>

      <div className="mt-2 flex items-end justify-center gap-2">
        <span className="text-5xl font-extrabold text-indigo-600 leading-none">
          {reportData.companyResult.totalScore}
        </span>

        <span className="pb-1 text-xl font-medium text-slate-400">
          / {reportData.companyResult.totalWeightage}
        </span>
      </div>
    </div>

    {/* Progress */}
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">Completion</span>
        <span className="font-semibold text-slate-700">
          {companyDisplayValue}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 transition-all duration-700"
          style={{ width: `${companyDisplayValue}%` }}
        />
      </div>
    </div>

  </div>
)}
        </div>
      </div>

      {/* Right Column: Core Parameters Breakdown */}
      <div className="flex-1 w-full flex flex-col gap-4">
      
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {individualDataList.map((param, idx) => (
            <div
              key={param.coreParameterId + idx}
              className="flex flex-col items-center bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full"
            >
              <h2 className="text-lg font-semibold text-slate-700 mb-3 text-center line-clamp-2 h-10 w-full" title={param.coreParameterName}>
                {param.coreParameterName}
              </h2>
              <div className="flex items-center justify-center p-1 bg-slate-50/50 rounded-xl mb-3 w-full">
                <ReactSpeedometer
                  value={Number(param.healthPercentage.toFixed(2))}
                  maxValue={maxValue}
                  customSegmentLabels={smallSegmentLabels}
                  segments={10}
                  dimensionUnit="px"
                  width={210}
                  height={130}
                  ringWidth={10}
                  currentValueText="${value}%"
                  needleTransitionDuration={1000}
                  startColor="#369143"
                  endColor="#2f328e"
                  textColor="#000"
                  valueTextFontSize="15px"
                  paddingVertical={15}
                />
                
              </div>
              <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-center w-full">
                <p className="text-xs text-slate-600 font-semibold">
                  Score: <span className="text-slate-800 font-bold">{param.totalScoreCP}</span> <span className="text-slate-400 font-normal">/ {param.totalWeightageCP}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
