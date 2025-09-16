import React, { useEffect, useState } from "react";

const daysarr: { key: number; label: string }[] = [
  { key: 0, label: "Su" },
  { key: 1, label: "Mo" },
  { key: 2, label: "Tu" },
  { key: 3, label: "We" },
  { key: 4, label: "Th" },
  { key: 5, label: "Fr" },
  { key: 6, label: "Sa" },
];

interface DaySelectorProps {
  value: number[];
  onChange: (value: number[]) => void;
  multiSelectAllow?: boolean;
  alternateDay?: boolean;
  maxLength?: number;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  value,
  onChange,
  multiSelectAllow = false,
  alternateDay = false,
  maxLength,
}) => {
  const today = new Date().getDay();
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (!value || value.length === 0) {
      setSelected([today]);
      onChange([today]);
    } else {
      setSelected(value);
    }
  }, [value, onChange, today]);

  const isDisabled = (dayKey: number): boolean => {
    if (!multiSelectAllow) return false;

    if (maxLength && selected.length >= maxLength) {
      if (!selected.includes(dayKey)) return true;
    }

    if (alternateDay) {
      return selected.some(
        (d) =>
          d === dayKey - 1 ||
          d === dayKey + 1 ||
          (d === 6 && dayKey === 0) ||
          (d === 0 && dayKey === 6),
      );
    }

    return false;
  };

  const toggleDay = (dayKey: number) => {
    if (isDisabled(dayKey)) return;

    let newSelected: number[];

    if (multiSelectAllow) {
      if (selected.includes(dayKey)) {
        newSelected = selected.filter((d) => d !== dayKey);
      } else {
        if (maxLength && selected.length >= maxLength) {
          return;
        }
        newSelected = [...selected, dayKey];
      }
    } else {
      newSelected = selected.includes(dayKey) ? [] : [dayKey];
    }

    setSelected(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {daysarr.map((days) => (
        <button
          key={days.key}
          type="button"
          onClick={() => toggleDay(days.key)}
          disabled={isDisabled(days.key)}
          className={`w-10 h-10 rounded-md border flex items-center justify-center transition
            ${
              selected.includes(days.key)
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
            ${isDisabled(days.key) ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {days.label}
        </button>
      ))}
    </div>
  );
};
export default DaySelector;
