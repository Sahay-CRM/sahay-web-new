import { useEffect, useState } from "react";

type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY";
type HalfType = number[];

export function useCustomModalFile(defaultValues?: CustomObj) {
  const [baseFrequency, setFrequency] = useState<FrequencyType>("WEEKLY");
  const [dateOrWeekly, setDateOrWeekly] = useState<DateOrWeeklyType>("date");
  const [selectedDate, setSelectedDate] = useState<number[] | null>(null);
  const [selectedHalf, setSelectedHalf] = useState<HalfType>([]);
  const [selectedMonth, setSelectedMonth] = useState<number[]>([]);

  const [selectedQuarter, setSelectedQuarter] = useState<number[]>([]);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([
    { week: null, daysOfWeek: [] },
  ]);

  const frequencies: { value: FrequencyType; label: string }[] = [
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "HALFYEARLY", label: "Half-Yearly" },
    { value: "YEARLY", label: "Yearly" },
  ];
  const halves: { value: number; label: string }[] = [
    { value: 1, label: "(Jan-Jul)" },
    { value: 2, label: "(Feb-Aug)" },
    { value: 3, label: "(Mar-Sep)" },
    { value: 4, label: "(Apr-Oct)" },
    { value: 5, label: "(May-Nov)" },
    { value: 6, label: "(Jun-Dec)" },
  ];

  const quarters: { value: number; label: string }[] = [
    { value: 1, label: "(Jan-Apr-Jul-Oct)" },
    { value: 2, label: "(Fab-May-Aug-Nov)" },
    { value: 3, label: "(Mar-Jun-Sep-Dec)" },
  ];
  const weeks: { value: number; label: string }[] = [
    { value: 1, label: " First Week" },
    { value: 2, label: " Second Week" },
    { value: 3, label: " Third Week" },
    { value: 4, label: " Fourth Week" },
    { value: 5, label: " Fifth Week" },
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
    if (!defaultValues) return;

    const { baseFrequency, repeatPattern } = defaultValues;

    if (baseFrequency) {
      setFrequency(baseFrequency as FrequencyType);
    }

    if (!repeatPattern) return;

    const { months, daysOfWeek, weekDaysMapping, dates, multiSelect } =
      repeatPattern;
    // console.log(weekDaysMapping, "weekDaysMapping");

    if (daysOfWeek?.length) {
      setSelectedDay(daysOfWeek);
      setDateOrWeekly("WEEKLY");
    }

    if (dates?.length) {
      setSelectedDate(dates);
      setDateOrWeekly("date");
    }

    if (weekDaysMapping?.length) {
      setWeeklyPatterns(weekDaysMapping);
      setDateOrWeekly("WEEKLY");

      if (weekDaysMapping.length === 1) {
        setSelectedWeek(weekDaysMapping[0].week);
        setSelectedDay(weekDaysMapping[0].daysOfWeek);
      }
    }

    if (months?.length) {
      if (baseFrequency === "YEARLY") {
        setSelectedMonth(months);
      } else if (baseFrequency === "QUARTERLY") {
        setSelectedQuarter(months);
      } else if (baseFrequency === "HALFYEARLY") {
        setSelectedHalf(months);
      }
    }

    if (multiSelect !== undefined) {
      setMultiSelect(multiSelect);
    }
  }, [defaultValues]);

  // useEffect(() => {
  //   if (!multiSelect && selectedDay.length > 1) {
  //     setSelectedDay([today]);
  //   }
  // }, [multiSelect, selectedDay.length]);

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

    let summary = "Summary :  ";

    switch (baseFrequency) {
      case "WEEKLY":
        if (selectedDay && selectedDay.length > 0) {
          const sortedDays = [...selectedDay].sort((a, b) => a - b);

          if (sortedDays.length === 1) {
            summary += `Every Week on ${dayNames[sortedDays[0]]}`;
          } else if (sortedDays.length === 2) {
            summary += `Every Week on ${dayNames[sortedDays[0]]} and ${dayNames[sortedDays[1]]}`;
          } else {
            const daysExceptLast = sortedDays
              .slice(0, -1)
              .map((d) => dayNames[d])
              .join(", ");
            const lastDay = dayNames[sortedDays[sortedDays.length - 1]];
            summary += `Every Week on ${daysExceptLast} and ${lastDay}`;
          }
        }
        break;

      case "MONTHLY":
        if (
          dateOrWeekly === "date" &&
          selectedDate &&
          selectedDate.length > 0
        ) {
          const datesText =
            selectedDate.length === 1
              ? `${selectedDate[0]}${getOrdinal(selectedDate[0])}`
              : selectedDate
                  .map((d, i) =>
                    i === selectedDate.length - 1
                      ? `and ${d}${getOrdinal(d)}`
                      : `${d}${getOrdinal(d)}`,
                  )
                  .join(", ");

          summary += `Every month on the ${datesText} date`;
        } else if (dateOrWeekly === "WEEKLY") {
          if (multiSelect && weeklyPatterns.length > 0) {
            const patternsText = weeklyPatterns
              .filter((p) => p.week && p.daysOfWeek && p.daysOfWeek.length > 0)
              .map((p) => {
                let weekLabel = getLabel(weeks, p.week!);
                if (weekLabel) {
                  weekLabel = weekLabel.replace(/^Every\s+/i, "");
                }
                const daysText = p.daysOfWeek
                  .sort((a, b) => a - b)
                  .map((d) => dayNames[d])
                  .join(", ");
                return `${weekLabel} ${daysText}`;
              })
              .join(" and ");

            summary += `Every month on the ${patternsText}`;
          } else if (
            !multiSelect &&
            selectedWeek &&
            selectedDay !== null &&
            selectedDay !== undefined
          ) {
            // ✅ Single-select case
            let weekLabel = getLabel(weeks, selectedWeek);
            if (weekLabel) {
              weekLabel = weekLabel.replace(/^Every\s+/i, "");
            }
            const daysText = selectedDay
              .sort((a, b) => a - b)
              .map((d) => dayNames[d])
              .join(", ");
            summary += `Every month on the ${weekLabel} ${daysText}`;
          }
        }
        break;
      case "QUARTERLY":
        if (selectedQuarter?.length > 0) {
          const quarterMonthsMap: Record<number, number[]> = {
            1: [1, 4, 7, 10], // Jan, Apr, Jul, Oct
            2: [2, 5, 8, 11], // Feb, May, Aug, Nov
            3: [3, 6, 9, 12], // Mar, Jun, Sep, Dec
          };

          // Map all selected quarters into month labels
          const quartersText = selectedQuarter
            .map((q) => {
              const monthsArr = quarterMonthsMap[q] ?? [];
              return `(${monthsArr
                .map((m) => getLabel(months, m)?.slice(0, 3) ?? "")
                .join("-")})`;
            })
            .join(" and ");

          summary += `Every quarter ${quartersText}`;

          if (
            dateOrWeekly === "date" &&
            selectedDate &&
            selectedDate?.length > 0
          ) {
            // ✅ Dates
            const datesText =
              selectedDate.length === 1
                ? `${selectedDate[0]}${getOrdinal(selectedDate[0])}`
                : selectedDate
                    .map((d, i) =>
                      i === selectedDate.length - 1
                        ? `and ${d}${getOrdinal(d)}`
                        : `${d}${getOrdinal(d)}`,
                    )
                    .join(", ");

            summary += ` on the ${datesText} date`;
          } else if (dateOrWeekly === "WEEKLY") {
            if (multiSelect && weeklyPatterns.length > 0) {
              // ✅ Multi-select (like MONTHLY)
              const patternsText = weeklyPatterns
                .filter(
                  (p) => p.week && p.daysOfWeek && p.daysOfWeek.length > 0,
                )
                .map((p) => {
                  let weekLabel = getLabel(weeks, p.week!);
                  if (weekLabel) {
                    weekLabel = weekLabel.replace(/^Every\s+/i, "");
                  }
                  const daysText = p.daysOfWeek
                    .sort((a, b) => a - b)
                    .map((d) => dayNames[d])
                    .join(", ");
                  return `${weekLabel} ${daysText}`;
                })
                .join(" and ");

              summary += ` on the ${patternsText}`;
            } else if (
              !multiSelect &&
              selectedWeek &&
              selectedDay !== null &&
              selectedDay !== undefined
            ) {
              // ✅ Single-select
              let weekLabel = getLabel(weeks, selectedWeek);
              if (weekLabel) {
                weekLabel = weekLabel.replace(/^Every\s+/i, "");
              }
              const daysText = selectedDay
                .sort((a, b) => a - b)
                .map((d) => dayNames[d])
                .join(", ");

              summary += ` on the ${weekLabel} ${daysText}`;
            }
          }
        }
        break;
      case "HALFYEARLY":
        if (selectedHalf?.length > 0) {
          const halfMonthsMap: Record<number, number[]> = {
            1: [1, 7], // Jan-Jul
            2: [2, 8], // Feb-Aug
            3: [3, 9], // Mar-Sep
            4: [4, 10], // Apr-Oct
            5: [5, 11], // May-Nov
            6: [6, 12], // Jun-Dec
          };

          const halvesText = selectedHalf
            .map((h) => {
              const monthsArr = halfMonthsMap[h] ?? [];
              return `(${monthsArr
                .map((m) => getLabel(months, m)?.slice(0, 3) ?? "")
                .join("-")})`;
            })
            .join(" and ");

          summary += ` Twice a year ${halvesText}`;

          if (
            dateOrWeekly === "date" &&
            selectedDate &&
            selectedDate?.length > 0
          ) {
            // ✅ Dates handling
            const datesText =
              selectedDate.length === 1
                ? `${selectedDate[0]}${getOrdinal(selectedDate[0])}`
                : selectedDate
                    .map((d, i) =>
                      i === selectedDate.length - 1
                        ? `and ${d}${getOrdinal(d)}`
                        : `${d}${getOrdinal(d)}`,
                    )
                    .join(", ");

            summary += ` on the ${datesText} date`;
          } else if (dateOrWeekly === "WEEKLY") {
            if (multiSelect && weeklyPatterns.length > 0) {
              // ✅ Multi-select weekly patterns
              const patternsText = weeklyPatterns
                .filter(
                  (p) => p.week && p.daysOfWeek && p.daysOfWeek.length > 0,
                )
                .map((p) => {
                  let weekLabel = getLabel(weeks, p.week!);
                  if (weekLabel) {
                    weekLabel = weekLabel.replace(/^Every\s+/i, "");
                  }
                  const daysText = p.daysOfWeek
                    .sort((a, b) => a - b)
                    .map((d) => dayNames[d])
                    .join(", ");
                  return `${weekLabel} ${daysText}`;
                })
                .join(" and ");

              summary += ` on the ${patternsText}`;
            } else if (
              !multiSelect &&
              selectedWeek &&
              selectedDay !== null &&
              selectedDay !== undefined
            ) {
              // ✅ Single weekly pattern
              let weekLabel = getLabel(weeks, selectedWeek);
              if (weekLabel) {
                weekLabel = weekLabel.replace(/^Every\s+/i, "");
              }
              const daysText = selectedDay
                .sort((a, b) => a - b)
                .map((d) => dayNames[d])
                .join(", ");

              summary += ` on the ${weekLabel} ${daysText}`;
            }
          }
        }
        break;

      case "YEARLY":
        if (selectedMonth?.length > 0) {
          const monthLabels = selectedMonth
            .map((m) => getLabel(months, m) ?? "")
            .filter(Boolean)
            .join(", ");

          if (
            dateOrWeekly === "date" &&
            selectedDate &&
            selectedDate?.length > 0
          ) {
            const datesText =
              selectedDate.length === 1
                ? `${selectedDate[0]}${getOrdinal(selectedDate[0])}`
                : selectedDate
                    .map((d, i) =>
                      i === selectedDate.length - 1
                        ? `and ${d}${getOrdinal(d)}`
                        : `${d}${getOrdinal(d)}`,
                    )
                    .join(", ");

            summary += ` yearly on the ${datesText} of ${monthLabels}`;
          } else if (dateOrWeekly === "WEEKLY") {
            if (multiSelect && weeklyPatterns.length > 0) {
              const patternsText = weeklyPatterns
                .filter(
                  (p) => p.week && p.daysOfWeek && p.daysOfWeek.length > 0,
                )
                .map((p) => {
                  let weekLabel = getLabel(weeks, p.week!);
                  if (weekLabel) {
                    weekLabel = weekLabel.replace(/^Every\s+/i, "");
                  }
                  const daysText = p.daysOfWeek
                    .sort((a, b) => a - b)
                    .map((d) => dayNames[d])
                    .join(", ");
                  return `${weekLabel} ${daysText}`;
                })
                .join(" and ");

              summary += ` yearly on the ${patternsText} of ${monthLabels}`;
            } else if (
              !multiSelect &&
              selectedWeek &&
              selectedDay !== null &&
              selectedDay !== undefined
            ) {
              let weekLabel = getLabel(weeks, selectedWeek);
              if (weekLabel) {
                weekLabel = weekLabel.replace(/^Every\s+/i, "");
              }
              const daysText = selectedDay
                .sort((a, b) => a - b)
                .map((d) => dayNames[d])
                .join(", ");

              summary += ` yearly on the ${weekLabel} ${daysText} of ${monthLabels}`;
            }
          } else {
            summary += ` yearly in ${monthLabels}`;
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
    weeklyPatterns,
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
    setWeeklyPatterns,
  };
}
