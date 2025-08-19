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

  return (
    <div className="flex flex-col items-center space-y-8 pt-4">
      <div className="flex flex-col items-center">
        <h2 className="text-xl mb-4 text-black font-semibold">
          Overall Company Health
        </h2>
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
          valueTextFontSize="24px"
          paddingVertical={20}
        />
        {reportData?.companyResult && (
          <div className="mt-2 text-center">
            <p className="text-lg text-black font-semibold">
              {reportData.companyResult.totalScore} /{" "}
              {reportData.companyResult.totalWeightage}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 items-center justify-center gap-8 w-full border-t pt-5">
        {individualDataList.map((param) => (
          <div
            key={param.coreParameterId}
            className="flex flex-col items-center border-b"
          >
            <h3 className="text-md mb-5 text-black font-semibold">
              {param.coreParameterName}
            </h3>
            <ReactSpeedometer
              value={param.healthPercentage}
              maxValue={maxValue}
              customSegmentLabels={customSegmentLabels}
              segments={10}
              dimensionUnit="px"
              width={380}
              height={230}
              ringWidth={15}
              currentValueText="${value}%"
              needleTransitionDuration={1000}
              startColor="#369143"
              endColor="#2f328e"
              textColor="#000"
              valueTextFontSize="24px"
              paddingVertical={20}
            />
            <div className="mt-1 mb-5 text-center">
              <p className="text-md text-black font-semibold">
                {param.totalScoreCP} / {param.totalWeightageCP}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
