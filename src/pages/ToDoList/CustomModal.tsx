import React, { useEffect, useState } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ---------------- Types ----------------
type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY";
type WeekType = number;
type DayType = number | null;
// type QuarterType = number | null;
type HalfType = number;

const DaySelector: React.FC<{
  value: DayType | null;
  onChange: (value: DayType | null) => void;
}> = ({ value, onChange }) => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday ...
  const [selected, setSelected] = useState<DayType | null>(null);

  // On mount, set today as default if no value provided
  useEffect(() => {
    if (value === null) {
      setSelected(today);
      onChange(today); // notify parent
    } else {
      setSelected(value);
    }
  }, [value, onChange, today]);

  const days: { key: number; label: string }[] = [
    { key: 0, label: "Su" },
    { key: 1, label: "Mo" },
    { key: 2, label: "Tu" },
    { key: 3, label: "We" },
    { key: 4, label: "Th" },
    { key: 5, label: "Fr" },
    { key: 6, label: "Sa" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {days.map((day) => (
        <button
          key={day.key}
          type="button"
          onClick={() => {
            const newValue = selected === day.key ? null : day.key;
            setSelected(newValue);
            onChange(newValue);
          }}
          className={`w-10 h-10 rounded-md border flex items-center justify-center transition
            ${
              selected === day.key
                ? "bg-primary text-white" // selected day
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
};

export default function CustomModalFile({
  open,
  onOpenChange,
  onSave,
  defaultValues,
}: CustomModalFileProps) {
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues?.day !== undefined && defaultValues?.day !== null) {
        setSelectedDay(defaultValues.day);
      }

      if (defaultValues.baseFrequency) {
        setFrequency(defaultValues.baseFrequency as FrequencyType);
      }

      // date (agar hai)
      if (defaultValues.date) {
        setSelectedDate(defaultValues.date);
        setDateOrWeekly("date");
      }

      // week + day (agar dono hain)
      if (
        defaultValues.nWeek &&
        defaultValues?.day !== undefined &&
        defaultValues?.day !== null
      ) {
        setSelectedWeek(defaultValues.nWeek);
        setSelectedDay(defaultValues.day);
        setDateOrWeekly("WEEKLY");
      }

      // quarter (agar hai)
      if (defaultValues.qMonth) {
        setSelectedQuarter(defaultValues.qMonth);
      }

      // half (agar hai)
      if (defaultValues.hMonth) {
        setSelectedHalf(defaultValues.hMonth);
      }

      // yearly month (agar hai)
      if (defaultValues.month) {
        setSelectedMonth(defaultValues.month);
      }
    }
  }, [defaultValues]);

  const [baseFrequency, setFrequency] = useState<FrequencyType>("WEEKLY");
  const [dateOrWeekly, setDateOrWeekly] = useState<DateOrWeeklyType>("date");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedHalf, setSelectedHalf] = useState<HalfType | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "">("");
  const [selectedWeek, setSelectedWeek] = useState<WeekType | "">("");
  //   const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  //   const today = days[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);

  const frequencies: { value: FrequencyType; label: string }[] = [
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "HALFYEARLY", label: "Half-Yearly" },
    { value: "YEARLY", label: "Yearly" },
  ];
  const halves: { value: HalfType; label: string }[] = [
    { value: 1, label: "Every First  (Jan-Jul)" },
    { value: 2, label: "Every Second  (Feb-Aug)" },
    { value: 3, label: "Every Third  (Mar-Sep)" },
    { value: 4, label: "Every Fourth  (Apr-Oct)" },
    { value: 5, label: "Every Fifth  (May-Nov)" },
    { value: 6, label: "Every Sixth  (Jun-Dec)" },
  ];

  const quarters: { value: number; label: string }[] = [
    { value: 1, label: "Every First (Jan-Apr-Jul-Oct)" },
    { value: 2, label: "Every Second (Fab-May-Aug-Nov)" },
    { value: 3, label: "Every Third (Mar-Jun-Sep-Dec)" },
  ];
  const weeks: { value: WeekType; label: string }[] = [
    { value: 1, label: "Every First Week" },
    { value: 2, label: "Every Second Week" },
    { value: 3, label: "Every Third Week" },
    { value: 4, label: "Every Fourth Week" },
    { value: 5, label: "Every Fifth Week" },
  ];

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const renderFrequencyFields = () => {
    switch (baseFrequency) {
      case "WEEKLY":
        return (
          <div>
            <Label className="mb-2">Select Day</Label>
            <DaySelector value={selectedDay} onChange={setSelectedDay} />
          </div>
        );

      case "MONTHLY":
        return (
          <div className="space-y-4">
            <div>
              <RadioGroup
                value={dateOrWeekly}
                onValueChange={(value: DateOrWeeklyType) => {
                  setDateOrWeekly(value);

                  if (value === "date") {
                    // reset weekly fields
                    setSelectedWeek("");
                    setSelectedDay(null);
                  } else if (value === "WEEKLY") {
                    // reset date field
                    setSelectedDate(null);
                  }
                }}
                className="mt-2 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="MONTHLY-date" />
                  <Label htmlFor="MONTHLY-date">Specific Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="WEEKLY" id="MONTHLY-WEEKLY" />
                  <Label htmlFor="MONTHLY-WEEKLY">Weekly Pattern</Label>
                </div>
              </RadioGroup>
            </div>

            {dateOrWeekly === "date" && (
              <div>
                <Label className="text-sm font-medium mb-2">Select Date</Label>
                <div className=" grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border flex items-center justify-center transition
            ${
              selectedDate === date
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                {/* Week selector */}
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))} // convert to number
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day selector */}
                {selectedWeek && (
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Select Day</Label>
                    <div className="mt-2">
                      <DaySelector
                        value={selectedDay}
                        onChange={setSelectedDay}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "QUARTERLY":
        return (
          <div className="space-y-4">
            {/* Date or Weekly pattern */}
            {selectedQuarter && (
              <div>
                <RadioGroup
                  value={dateOrWeekly}
                  onValueChange={(value: DateOrWeeklyType) => {
                    setDateOrWeekly(value);

                    if (value === "date") {
                      // reset weekly fields
                      setSelectedWeek("");
                      setSelectedDay(null);
                    } else if (value === "WEEKLY") {
                      // reset date field
                      setSelectedDate(null);
                    }
                  }}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="QUARTERLY-date" />
                    <Label htmlFor="QUARTERLY-date">Specific Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WEEKLY" id="QUARTERLY-WEEKLY" />
                    <Label htmlFor="QUARTERLY-WEEKLY">Weekly Pattern</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Specific Date → 1–31 box selector */}
            {selectedQuarter && dateOrWeekly === "date" && (
              <div>
                <Label className="text-sm font-medium">Select Date</Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Pattern → Select week + day */}
            {selectedQuarter && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Select Day</Label>
                    <div className="mt-2">
                      <DaySelector
                        value={selectedDay}
                        onChange={(day: DayType) => setSelectedDay(day)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "HALFYEARLY":
        return (
          <div className="space-y-4">
            {selectedHalf && (
              <div>
                <RadioGroup
                  value={dateOrWeekly}
                  onValueChange={(value: DateOrWeeklyType) => {
                    setDateOrWeekly(value);

                    if (value === "date") {
                      // reset weekly fields
                      setSelectedWeek("");
                      setSelectedDay(null);
                    } else if (value === "WEEKLY") {
                      // reset date field
                      setSelectedDate(null);
                    }
                  }}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="MONTHLY-date" />
                    <Label htmlFor="MONTHLY-date">Specific Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WEEKLY" id="MONTHLY-WEEKLY" />
                    <Label htmlFor="MONTHLY-WEEKLY">Weekly Pattern</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedHalf && dateOrWeekly === "date" && (
              <div>
                <Label
                  htmlFor="HALFYEARLY-date-picker"
                  className="text-sm font-medium"
                >
                  Select Date
                </Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedHalf && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div>
                    <Label className="text-sm font-medium">Select Day</Label>
                    <div className="mt-2">
                      <DaySelector
                        value={selectedDay}
                        onChange={(day: DayType) => setSelectedDay(day)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "YEARLY":
        return (
          <div className="space-y-4">
            {selectedMonth && (
              <div>
                <RadioGroup
                  value={dateOrWeekly}
                  onValueChange={(value: DateOrWeeklyType) => {
                    setDateOrWeekly(value);

                    if (value === "date") {
                      // reset weekly fields
                      setSelectedWeek("");
                      setSelectedDay(null);
                    } else if (value === "WEEKLY") {
                      // reset date field
                      setSelectedDate(null);
                    }
                  }}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="MONTHLY-date" />
                    <Label htmlFor="MONTHLY-date">Specific Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WEEKLY" id="MONTHLY-WEEKLY" />
                    <Label htmlFor="MONTHLY-WEEKLY">Weekly Pattern</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedMonth && dateOrWeekly === "date" && (
              <div>
                <Label
                  htmlFor="HALFYEARLY-date-picker"
                  className="text-sm font-medium"
                >
                  Select Date
                </Label>
                <div className="mt-2 grid grid-cols-15 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(selectedDate === date ? null : date)
                      }
                      className={`w-10 h-10 rounded-md border text-xs flex items-center justify-center transition
                  ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMonth && dateOrWeekly === "WEEKLY" && (
              <div className="flex items-start gap-6">
                <div className="w-50">
                  <Label className="text-sm font-medium">Select Week</Label>
                  <Select
                    value={selectedWeek !== null ? String(selectedWeek) : ""} // UI ke liye string
                    onValueChange={(value) => setSelectedWeek(Number(value))}
                  >
                    <SelectTrigger className="mt-2 w-50">
                      <SelectValue placeholder="Choose week..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week.value} value={String(week.value)}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWeek && (
                  <div>
                    <Label className="text-sm font-medium">Select Day</Label>
                    <div className="mt-2">
                      <DaySelector
                        value={selectedDay}
                        onChange={(day: DayType) => setSelectedDay(day)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };
  const getLabel = (
    list: { value: number; label: string }[],
    value: number | null | "" | undefined,
  ): string | null => {
    if (value === null || value === "" || value === undefined) return null;
    const item = list.find((i) => i.value === value);
    return item ? item.label : String(value);
  };
  const getScheduleSummary = (): string => {
    const dayNames: Record<number, string> = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };
    const cleanWeekLabel = (
      weekValue: number | null | undefined,
    ): string | null => {
      if (!weekValue) return null;
      let weekLabel = getLabel(weeks, weekValue); // e.g., "Every First Week"
      if (weekLabel) {
        weekLabel = weekLabel.replace(/^Every\s+/i, ""); // Remove "Every "
      }
      return weekLabel;
    };
    let summary = "Summary :  ";

    switch (baseFrequency) {
      case "WEEKLY":
        if (selectedDay !== null && selectedDay !== undefined) {
          summary += `Every Week in ${dayNames[selectedDay]}`;
        }
        break;

      case "MONTHLY":
        if (dateOrWeekly === "date" && selectedDate) {
          summary += `Every month on the ${selectedDate}${getOrdinal(selectedDate)} date`;
        } else if (
          dateOrWeekly === "WEEKLY" &&
          selectedWeek &&
          selectedDay !== null &&
          selectedDay !== undefined
        ) {
          let weekLabel = getLabel(weeks, selectedWeek);
          if (weekLabel) {
            weekLabel = weekLabel.replace(/^Every\s+/i, ""); // Remove "Every"
          }
          summary += `Every month on the ${weekLabel} ${dayNames[selectedDay]}`;
        }
        break;

      case "QUARTERLY":
        if (selectedQuarter) {
          // Map quarter to months
          const quarterMonthsMap: Record<number, number[]> = {
            1: [1, 4, 7, 10], // Jan, Apr, Jul, Oct
            2: [2, 5, 8, 11], // Feb, May, Aug, Nov
            3: [3, 6, 9, 12], // Mar, Jun, Sep, Dec
          };

          const monthsArr = quarterMonthsMap[selectedQuarter];

          // Use 3-letter month abbreviations joined by dash
          const monthNames = monthsArr
            .map((m) => getLabel(months, m)?.slice(0, 3)) // First 3 letters
            .join("-");

          summary += `Every quarter on (${monthNames})`;

          if (dateOrWeekly === "date" && selectedDate) {
            summary += `  the ${selectedDate}${getOrdinal(selectedDate)} Date`;
          } else if (
            dateOrWeekly === "WEEKLY" &&
            selectedWeek &&
            selectedDay !== null
          ) {
            let weekLabel = getLabel(weeks, selectedWeek);
            if (weekLabel) {
              weekLabel = weekLabel.replace(/^Every\s+/i, ""); // Remove "Every"
            }
            summary += `  the ${weekLabel} ${dayNames[selectedDay]}`;
          }
        }
        break;

      case "HALFYEARLY":
        if (selectedHalf) {
          // Map half to months
          const halfMonthsMap: Record<number, number[]> = {
            1: [1, 7], // Jan-Jul
            2: [2, 8], // Feb-Aug
            3: [3, 9], // Mar-Sep
            4: [4, 10], // Apr-Oct
            5: [5, 11], // May-Nov
            6: [6, 12], // Jun-Dec
          };

          const monthsArr = halfMonthsMap[selectedHalf];
          const monthNames = monthsArr
            .map((m) => getLabel(months, m))
            .join(" - ");

          summary += ` Twice a year ( ${monthNames} )`;

          if (dateOrWeekly === "date" && selectedDate) {
            summary += ` on this ${selectedDate}${getOrdinal(selectedDate)} Date`;
          } else if (
            dateOrWeekly === "WEEKLY" &&
            selectedWeek &&
            selectedDay !== null
          ) {
            let weekLabel = getLabel(weeks, selectedWeek);
            if (weekLabel) {
              weekLabel = weekLabel.replace(/^Every\s+/i, ""); // Remove "Every"
            }
            summary += ` on the ${weekLabel} ${dayNames[selectedDay]}`;
          }
        }
        break;

      case "YEARLY":
        if (selectedMonth) {
          const monthLabel = getLabel(months, selectedMonth);
          if (dateOrWeekly === "date" && selectedDate) {
            summary += ` yearly on the ${selectedDate}${getOrdinal(selectedDate)} ${monthLabel}`;
          } else if (
            dateOrWeekly === "WEEKLY" &&
            selectedWeek &&
            selectedDay !== null
          ) {
            const weekLabel = cleanWeekLabel(selectedWeek);
            summary += ` yearly on the ${weekLabel} ${dayNames[selectedDay]} of ${monthLabel}`;
          } else {
            summary += ` yearly in ${monthLabel}`;
          }
        }
        break;
    }

    return summary;
  };

  // helper to add "st", "nd", "rd", "th"
  function getOrdinal(n: number): string {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  return (
    <ModalData
      isModalOpen={open}
      modalClose={() => onOpenChange(false)}
      modalTitle="Custom Repetition"
      containerClass="   min-w-[40%] "
      buttons={[
        {
          btnText: "Save",
          btnClick: () => {
            // console.log({
            //   baseFrequency,
            //   dateOrWeekly,
            //   date: selectedDate,
            //   nWeek: selectedWeek,
            //   day: selectedDay,
            // });
            const data = {
              baseFrequency,
              date: selectedDate,
              nWeek: selectedWeek,
              day: selectedDay,
              qMonth: selectedQuarter,
              hMonth: selectedHalf,
              month: selectedMonth,
            };

            onSave(data);
            onOpenChange(false);
          },
        },
        {
          btnText: "Cancel",
          btnClick: () => onOpenChange(false),
          buttonCss: "bg-gray-200 text-gray-700 hover:bg-gray-300",
        },
      ]}
    >
      <div className="space-y-4">
        {/* Frequency Selector */}
        <div className="flex items-end gap-6">
          {/* Repeat Type */}
          <div className="flex-1">
            <Label className="mb-2">Repeat Type</Label>
            <Select
              value={baseFrequency}
              onValueChange={(val: FrequencyType) => {
                setFrequency(val);

                // Reset all dependent selections
                setSelectedDate(null);
                setSelectedWeek("");
                setSelectedDay(null);
                setSelectedQuarter("");
                setSelectedHalf("");
                setSelectedMonth(null);

                // Optional: reset dateOrWeekly to default
                setDateOrWeekly("date");
              }}
            >
              <SelectTrigger className="w-80 mt-1">
                <SelectValue placeholder="Select requency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Quarter → only show if QUARTERLY */}
          {baseFrequency === "QUARTERLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Quarter</Label>
              <Select
                value={selectedQuarter !== null ? String(selectedQuarter) : ""}
                onValueChange={(value) => setSelectedQuarter(Number(value))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose quarter..." />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((quarter) => (
                    <SelectItem
                      key={quarter.value}
                      value={String(quarter.value)}
                    >
                      {quarter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {baseFrequency === "HALFYEARLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Half</Label>
              <Select
                value={selectedHalf !== null ? String(selectedHalf) : ""} // UI ke liye string
                onValueChange={(value) => setSelectedHalf(Number(value))}
                // value={selectedHalf}
                // onValueChange={(value: HalfType) => setSelectedHalf(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose half..." />
                </SelectTrigger>
                <SelectContent>
                  {halves.map((half) => (
                    <SelectItem key={half.value} value={String(half.value)}>
                      {half.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {baseFrequency === "YEARLY" && (
            <div className="flex-1">
              <Label className="text-sm font-medium">Select Month</Label>
              <Select
                value={selectedMonth ? String(selectedMonth) : ""}
                onValueChange={(val) => setSelectedMonth(Number(val))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose month..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Render Frequency Fields */}
        {renderFrequencyFields()}

        {/* Schedule Summary - always at bottom */}
        {/* Schedule Summary - only show if there is meaningful content */}
        {getScheduleSummary().trim() !== "Summary :" && (
          <div className="pt-4 border-gray-200">
            <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
              {getScheduleSummary()}
            </p>
          </div>
        )}
      </div>
    </ModalData>
  );
}
