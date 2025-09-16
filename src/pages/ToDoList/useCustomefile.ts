import { useEffect, useState } from "react";

type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY";
type WeekType = number;
type HalfType = number;

const today = new Date().getDay();

export function useCustomModalFile(defaultValues?: CustomObj) {
  const [baseFrequency, setFrequency] = useState<FrequencyType>("WEEKLY");
  const [dateOrWeekly, setDateOrWeekly] = useState<DateOrWeeklyType>("date");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedHalf, setSelectedHalf] = useState<HalfType | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "">("");
  const [selectedWeek, setSelectedWeek] = useState<WeekType | "">("");
  const [selectedDay, setSelectedDay] = useState<number[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);

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

  const dayNames: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues?.days !== undefined && defaultValues?.days !== null) {
        setSelectedDay(defaultValues.days);
      }

      if (defaultValues.baseFrequency) {
        setFrequency(defaultValues.baseFrequency as FrequencyType);
      }

      if (defaultValues.date) {
        setSelectedDate(defaultValues.date);
        setDateOrWeekly("date");
      }

      if (
        defaultValues.nWeek &&
        defaultValues?.days !== undefined &&
        defaultValues?.days !== null
      ) {
        setSelectedWeek(defaultValues.nWeek);
        setSelectedDay(defaultValues.days);
        setDateOrWeekly("WEEKLY");
      }

      if (defaultValues.qMonth) {
        setSelectedQuarter(defaultValues.qMonth);
      }

      if (defaultValues.hMonth) {
        setSelectedHalf(defaultValues.hMonth);
      }

      if (defaultValues.month) {
        setSelectedMonth(defaultValues.month);
      }
    }
  }, [defaultValues]);

  useEffect(() => {
    if (!multiSelect && selectedDay.length > 1) {
      setSelectedDay([today]);
    }
  }, [multiSelect, selectedDay.length]);

  const getLabel = (
    list: { value: number; label: string }[],
    value: number | null | "" | undefined,
  ): string | null => {
    if (value === null || value === "" || value === undefined) return null;
    const item = list.find((i) => i.value === value);
    return item ? item.label : String(value);
  };

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
      let weekLabel = getLabel(weeks, weekValue);
      if (weekLabel) {
        weekLabel = weekLabel.replace(/^Every\s+/i, "");
      }
      return weekLabel;
    };
    let summary = "Summary :  ";

    switch (baseFrequency) {
      case "WEEKLY":
        if (selectedDay && selectedDay.length > 0) {
          if (selectedDay.length === 1) {
            summary += `Every Week on ${dayNames[selectedDay[0]]}`;
          } else {
            const daysText = selectedDay.map((d) => dayNames[d]).join(" & ");
            summary += `Every Week on ${daysText}`;
          }
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
            weekLabel = weekLabel.replace(/^Every\s+/i, "");
          }
          const daysText = selectedDay.map((d) => dayNames[d]).join(" & ");
          summary += `Every month on the ${weekLabel} ${daysText}`;
        }
        break;

      case "QUARTERLY":
        if (selectedQuarter) {
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
            const daysText = selectedDay.map((d) => dayNames[d]).join(" & ");
            summary += `  the ${weekLabel} ${daysText}`;
          }
        }
        break;

      case "HALFYEARLY":
        if (selectedHalf) {
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
            const daysText = selectedDay.map((d) => dayNames[d]).join(" & ");
            summary += ` on the ${weekLabel} ${daysText}`;
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
            const daysText = selectedDay.map((d) => dayNames[d]).join(" & ");
            const weekLabel = cleanWeekLabel(selectedWeek);
            summary += ` yearly on the ${weekLabel} ${daysText} of ${monthLabel}`;
          } else {
            summary += ` yearly in ${monthLabel}`;
          }
        }
        break;
    }

    return summary;
  };

  return {
    dayNames,
    months,
    weeks,
    quarters,
    halves,
    frequencies,
    baseFrequency,
    dateOrWeekly,
    selectedDate,
    selectedHalf,
    selectedMonth,
    selectedQuarter,
    selectedWeek,
    selectedDay,
    multiSelect,
    setFrequency,
    setDateOrWeekly,
    setSelectedDate,
    setSelectedHalf,
    setSelectedMonth,
    setSelectedQuarter,
    setSelectedWeek,
    setSelectedDay,
    setMultiSelect,
    getScheduleSummary,
  };
}
