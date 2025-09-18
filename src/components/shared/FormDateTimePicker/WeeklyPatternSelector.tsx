// WeeklyPatternSelector.tsx
import { PlusIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import FormSelect from "@/components/shared/Form/FormSelect";
import DaySelector from "./DaySelector";

interface WeeklyPatternSelectorProps {
  multiSelect: boolean;
  weeklyPatterns: WeeklyPattern[];
  setWeeklyPatterns: React.Dispatch<React.SetStateAction<WeeklyPattern[]>>;
  weeks: { value: number; label: string }[];
  selectedWeek?: number | null;
  setSelectedWeek?: (val: number | null) => void;
  selectedDay?: number[];
  setSelectedDay?: (val: number[]) => void;
}

export default function WeeklyPatternSelector({
  multiSelect,
  weeklyPatterns,
  setWeeklyPatterns,
  weeks,
  selectedWeek,
  setSelectedWeek,
  selectedDay,
  setSelectedDay,
}: WeeklyPatternSelectorProps) {
  if (multiSelect) {
    return (
      <div className="space-y-4">
        {weeklyPatterns.map((pattern, index) => {
          const usedWeeks = weeklyPatterns
            .map((p) => p.week)
            .filter((w) => w !== null);
          const canAddMore = usedWeeks.length < weeks.length;

          return (
            <div key={index} className="flex mt-3 items-center gap-2">
              <button
                type="button"
                disabled={pattern.week === null || !canAddMore}
                onClick={() => {
                  const newPatterns = [...weeklyPatterns];
                  newPatterns.splice(index + 1, 0, {
                    week: null,
                    daysOfWeek: [],
                  });
                  setWeeklyPatterns(newPatterns);
                }}
                className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                  pattern.week === null || !canAddMore
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-primary text-white"
                }`}
              >
                <PlusIcon size={14} />
              </button>

              <FormSelect
                value={pattern.week !== null ? String(pattern.week) : ""}
                onChange={(val) => {
                  const newPatterns = [...weeklyPatterns];
                  newPatterns[index].week = Number(val);
                  setWeeklyPatterns(newPatterns);
                }}
                options={weeks
                  .filter(
                    (week) =>
                      !weeklyPatterns.some(
                        (p, i) => i !== index && p.week === week.value,
                      ),
                  )
                  .map((week) => ({
                    value: String(week.value),
                    label: week.label,
                  }))}
                triggerClassName="h-8 p-1 px-3 w-50"
                placeholder="Select week"
              />

              {pattern.week !== null && (
                <DaySelector
                  value={pattern.daysOfWeek || []}
                  onChange={(newDays) => {
                    const newPatterns = [...weeklyPatterns];
                    newPatterns[index].daysOfWeek = newDays;
                    setWeeklyPatterns(newPatterns);
                  }}
                  multiSelectAllow
                />
              )}

              {/* Remove button */}
              {weeklyPatterns.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setWeeklyPatterns(
                      weeklyPatterns.filter((_, i) => i !== index),
                    )
                  }
                  className="ml-1 text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // --- SINGLE MODE ---
  return (
    <div className="flex items-start gap-6">
      <div className="w-50">
        <Label className="text-sm mb-2 font-medium">Select Week</Label>
        <FormSelect
          value={selectedWeek !== null ? String(selectedWeek) : ""}
          onChange={(val) => setSelectedWeek && setSelectedWeek(Number(val))}
          options={weeks.map((week) => ({
            value: String(week.value),
            label: week.label,
          }))}
          triggerClassName="h-8 p-1 px-3 w-50"
          placeholder="Select week"
        />
      </div>

      {selectedWeek && (
        <div className="flex-1 max-w-fit">
          <div className="flex mb-2 items-center justify-between">
            <Label htmlFor="multi-select" className="text-sm font-medium">
              Select Day
            </Label>
          </div>

          <DaySelector
            value={selectedDay || []}
            onChange={(newDays) => setSelectedDay && setSelectedDay(newDays)}
            multiSelectAllow={false}
          />
        </div>
      )}
    </div>
  );
}
