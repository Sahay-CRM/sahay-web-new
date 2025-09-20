import { Label } from "@/components/ui/label";
import { useEffect } from "react";

function DateSelector({
  condition,
  selectedDate,
  setSelectedDate,
  multiSelect,
}: {
  condition: boolean;
  selectedDate: number[] | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<number[] | null>>;
  multiSelect: boolean;
}) {
  useEffect(() => {
    if (!multiSelect && selectedDate && selectedDate.length > 1) {
      // keep only first date instead of clearing all
      setSelectedDate([]);
    }
  }, [multiSelect, selectedDate, setSelectedDate]);

  if (!condition) return null;

  return (
    <div>
      <Label className="text-sm font-medium mb-2">Select Date</Label>
      <div className="grid grid-cols-15 gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
          const isSelected = selectedDate?.includes(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() =>
                setSelectedDate(
                  multiSelect
                    ? isSelected
                      ? selectedDate!.filter((d) => d !== date)
                      : [...(selectedDate ?? []), date]
                    : [date],
                )
              }
              className={`w-10 h-10 rounded-md border flex items-center justify-center transition ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {date}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateSelector;
