import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPeriodDate } from "@/features/utils/formatting.utils";
import useSubmitKpiValues from "@/features/api/kpiDashboard/SubmitKpiGoalValues";
import { resetkpivalidationValue } from "@/features/api/kpiDashboard";
interface KpiDetail {
  startDate: string;
  endDate: string;
  validationType?: string;
  value1?: string | number | null;
  value2?: string | number | null;
}
interface KpiSubmitPayload {
  kpiId: string;
  startDate: string;
  endDate: string;
  validationValue1: string;
  validationValue2: string;
  frequencyType: string;
}
interface SelectedKpi {
  kpiId: string;
  kpiName: string;
  startDate?: string;
  endDate?: string;
  selectedPeriod: string;
  details: KpiDetail[];
}

interface KpiDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKpi: SelectedKpi | null;
}

const KpiDetailsSheet: React.FC<KpiDetailsSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedKpi,
}) => {
  const [values, setValues] = useState<Record<string, number>>({});

  const selectedPeriod = selectedKpi?.selectedPeriod;
  const { mutate: submitKpi } = useSubmitKpiValues();
  const { mutate: resetKpiValue } = resetkpivalidationValue();
  const handleInputChange = (key: string, val: string) => {
    const num = parseFloat(val);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const showGoal2 = selectedKpi?.details.some(
    (d) => d.validationType === "BETWEEN",
  );

  const [initialValues, setInitialValues] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    if (!selectedKpi) return;

    const init: Record<string, number> = {};

    selectedKpi.details.forEach((item) => {
      const goalKey = `${item.startDate}_goal`;
      const val2Key = `${item.startDate}_val2`;

      if (item.value1 != null) init[goalKey] = Number(item.value1);
      if (item.value2 != null) init[val2Key] = Number(item.value2);
    });

    setInitialValues(init); // <-- store original values
    setValues(init); // <-- fill input values
  }, [selectedKpi]);

  const handleReset = async () => {
    if (!selectedKpi) return;
    const payload = selectedKpi.details.map((item) => {
      return {
        kpiId: selectedKpi.kpiId,
        startDate: item.startDate,
        endDate: item.endDate,
        frequencyType: selectedKpi.selectedPeriod,
      };
    });
    resetKpiValue(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleSubmit = async () => {
    if (!selectedKpi) return;

    const payload = selectedKpi.details
      .map((item) => {
        const goalKey = `${item.startDate}_goal`;
        const val2Key = `${item.startDate}_val2`;

        const oldVal1 = initialValues[goalKey];
        const oldVal2 = initialValues[val2Key];

        const newVal1 = values[goalKey];
        const newVal2 = values[val2Key];

        const changed =
          String(newVal1 ?? "") !== String(oldVal1 ?? "") ||
          String(newVal2 ?? "") !== String(oldVal2 ?? "");

        if (!changed) return null;

        return {
          kpiId: selectedKpi.kpiId,
          startDate: item.startDate,
          endDate: item.endDate,
          validationValue1: String(newVal1 ?? oldVal1 ?? 0),
          validationValue2: String(newVal2 ?? oldVal2 ?? 0),
          frequencyType: selectedKpi.selectedPeriod,
        };
      })
      .filter((item): item is KpiSubmitPayload => item !== null);

    submitKpi(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 flex flex-col h-full">
        {/* HEADER */}
        <SheetHeader className="p-4 mr-6 border-b flex flex-row items-center justify-between">
          <SheetTitle className="text-base">
            {selectedKpi?.kpiName ?? "KPI Details"}
          </SheetTitle>

          <Button
            className="bg-primary text-white"
            size="sm"
            onClick={handleReset}
          >
            Reset
          </Button>
        </SheetHeader>

        {/* HEADER ROW */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 border-b">
          <div>Date</div>
          <div className="text-start">Goal Value 1</div>
          {showGoal2 && <div className="text-start">Goal Value 2</div>}
        </div>

        {/* BODY ROWS */}
        <div className="overflow-auto flex-1 px-0">
          {selectedKpi?.details.map((item) => {
            const goalKey = `${item.startDate}_goal`;
            const val2Key = `${item.startDate}_val2`;

            return (
              <div
                key={goalKey}
                className="grid grid-cols-3 gap-2 px-4 py-2 border-b items-center text-sm"
              >
                {/* DATE */}
                <span className="flex flex-col leading-tight">
                  {(() => {
                    const formatted = formatPeriodDate(
                      item.startDate,
                      item.endDate,
                      selectedPeriod!,
                    );
                    return (
                      <>
                        <span className="font-medium text-sm">
                          {formatted.label}
                        </span>
                        {formatted.year && (
                          <span className="text-[11px] text-gray-500 ">
                            {formatted.year}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </span>

                {/* GOAL INPUT */}
                <Input
                  type="number"
                  value={values[goalKey] ?? ""}
                  onChange={(e) => handleInputChange(goalKey, e.target.value)}
                  className="h-8 text-sm px-2"
                />

                {/* GOAL VALUE 2 */}
                {item.validationType === "BETWEEN" && (
                  <Input
                    type="number"
                    value={values[val2Key] ?? ""}
                    onChange={(e) => handleInputChange(val2Key, e.target.value)}
                    className="h-8 text-sm px-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="p-4 border-t">
          <Button className="w-full" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default KpiDetailsSheet;
