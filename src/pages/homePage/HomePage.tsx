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
    <div className="p-4 bg-slate-50/50 min-h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full items-stretch">
        {/* Overall Health Card (Spans 2 rows vertically) */}
        <div className="col-span-1 md:col-span-1 row-span-2 bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-start gap-3 shadow-sm hover:shadow-md transition-all duration-300 w-full">
          <div>
            <h2 className="text-xl mb-8 font-bold mt-5 text-slate-800   border-slate-100 pb-2 w-full text-center">
              Overall Company Health
            </h2>
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50/70 rounded-2xl border border-slate-100 my-1 w-full overflow-hidden">
              <ReactSpeedometer
                value={companyDisplayValue}
                maxValue={maxValue}
                customSegmentLabels={customSegmentLabels}
                segments={10}
                dimensionUnit="px"
                width={270}
                height={165}
                needleHeightRatio={0.9}
                ringWidth={12}
                currentValueText=" "
                needleTransitionDuration={1000}
                startColor="#369143"
                endColor="#2f328e"
                paddingVertical={12}
              />
              <div className="-mt-6 mb-1 text-center">
                <span className="text-3xl font-black text-primary tracking-tight">
                  {companyDisplayValue}%
                </span>
              </div>
            </div>
          </div>

          {reportData?.companyResult && (
            <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              {/* Score */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Overall Score
                </p>

                <div className="mt-1 flex items-end justify-center gap-2">
                  <span className="text-4xl font-extrabold text-primary leading-none">
                    {reportData.companyResult.totalScore}
                  </span>

                  <span className="pb-1 text-lg font-medium text-slate-400">
                    / {reportData.companyResult.totalWeightage}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Completion</span>
                  <span className="font-bold text-primary">
                    {companyDisplayValue}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary transition-all duration-700"
                    style={{ width: `${companyDisplayValue}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small Parameter Cards */}
        {individualDataList.map((param, idx) => (
          <div
            key={param.coreParameterId + idx}
            className="flex flex-col items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full min-h-[240px]"
          >
            <h2 className="text-base font-semibold text-slate-700 mb-2 text-center line-clamp-2 h-9 w-full" title={param.coreParameterName}>
              {param.coreParameterName}
            </h2>
            <div className="flex items-center justify-center p-1 bg-slate-50/50 rounded-xl mb-2 w-full overflow-hidden">
              <ReactSpeedometer
                value={Number(param.healthPercentage.toFixed(2))}
                maxValue={maxValue}
                customSegmentLabels={smallSegmentLabels}
                segments={10}
                dimensionUnit="px"
                width={200}
                height={125}
                ringWidth={10}
                currentValueText="${value}%"
                needleTransitionDuration={1000}
                startColor="#369143"
                endColor="#2f328e"
                textColor="#000"
                valueTextFontSize="15px"
                paddingVertical={12}
              />
            </div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-center w-full mt-auto">
              <p className="text-xs text-slate-600 font-semibold">
                Score: <span className="text-slate-800 font-bold">{param.totalScoreCP}</span> <span className="text-slate-400 font-normal">/ {param.totalWeightageCP}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
