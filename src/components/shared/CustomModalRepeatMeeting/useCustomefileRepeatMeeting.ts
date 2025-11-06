import { useEffect, useState } from "react";

type FrequencyType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALFYEARLY"
  | "YEARLY";
type DateOrWeeklyType = "date" | "WEEKLY" | "MONTHLYEND";

export function useCustomModalFile(defaultValues?: CustomObjREPT) {
  console.log(defaultValues, "defaultValues");

  const [baseFrequency, setFrequency] = useState<FrequencyType>("WEEKLY");
  const [dateOrWeekly, setDateOrWeekly] = useState<DateOrWeeklyType>("date");
  const [selectedDate, setSelectedDate] = useState<number[] | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number[]>([]);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number[]>([]);

  const [IntervalCount, setIntervalCount] = useState<number>(1);
  const [isMonthlyEnd, setIsMonthlyEnd] = useState<boolean>(false);
  // const [multiSelect, setMultiSelect] = useState(false);
  const multiSelect = true;
  const financialYear = "APRIL";
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([
    { week: null, daysOfWeek: [] },
  ]);
  const daysarr: { key: number; label: string; api: string }[] = [
    { key: 0, label: "Su", api: "SUN" },
    { key: 1, label: "Mo", api: "MON" },
    { key: 2, label: "Tu", api: "TUE" },
    { key: 3, label: "We", api: "WED" },
    { key: 4, label: "Th", api: "THU" },
    { key: 5, label: "Fr", api: "FRI" },
    { key: 6, label: "Sa", api: "SAT" },
  ];

  const convertDaysToAPI = (days: number[] = []): string[] => {
    return days
      .map((k) => daysarr.find((d) => d.key === k)?.api)
      .filter((v): v is string => Boolean(v));
  };

  const convertAPIDaysToKeys = (apiDays: string[] = []) => {
    return apiDays
      .map((api) => daysarr.find((d) => d.api === api)?.key)
      .filter((v) => v !== undefined) as number[];
  };

  const frequencies: { value: FrequencyType; label: string }[] = [
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  const weeks: { value: number; label: string }[] = [
    { value: 1, label: " First Week" },
    { value: 2, label: " Second Week" },
    { value: 3, label: " Third Week" },
    { value: 4, label: " Fourth Week" },
    { value: 5, label: " Fifth Week" },
  ];

  const months = [
    { label: "January", value: 0, api: "JAN" },
    { label: "February", value: 1, api: "FEB" },
    { label: "March", value: 2, api: "MAR" },
    { label: "April", value: 3, api: "APR" },
    { label: "May", value: 4, api: "MAY" },
    { label: "June", value: 5, api: "JUN" },
    { label: "July", value: 6, api: "JUL" },
    { label: "August", value: 7, api: "AUG" },
    { label: "September", value: 8, api: "SEP" },
    { label: "October", value: 9, api: "OCT" },
    { label: "November", value: 10, api: "NOV" },
    { label: "December", value: 11, api: "DEC" },
  ];

  // const getReorderedMonths = (financialStart: string) => {
  //   const startValue = financialStart === "MARCH" ? 2 : 3; // March index = 2, April index = 3

  //   return [...months.slice(startValue), ...months.slice(0, startValue)];
  // };
  const convertMonthToAPI = (monthNums: number[]) =>
    monthNums.map((m) => reorderedMonths.find((x) => x.value === m)?.api);

  const getReorderedMonths = (financialStart: string) => {
    const startValue = financialStart === "MARCH" ? 2 : 3; // MARCH=2, APRIL=3

    const reordered = [
      ...months.slice(startValue),
      ...months.slice(0, startValue),
    ];
    return reordered.map((m, i) => ({ ...m, value: i }));
  };
  const getActualMonthIndex = (
    financialStart: string,
    reorderedIndex: number,
  ) => {
    const start = financialStart === "MARCH" ? 2 : 3;
    return (start + reorderedIndex) % 12;
  };

  const reorderedMonths = getReorderedMonths(financialYear);
  const getDaysInMonth = (monthIndex: number) => {
    return new Date(2025, monthIndex + 1, 0).getDate();
  };

  const realMonthIndex = getActualMonthIndex(financialYear, selectedMonth[0]);
  const totalDays = getDaysInMonth(realMonthIndex);

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

    const {
      frequency,
      months,
      daysOfWeek,
      weekDaysMapping,
      weekPatterns,
      dates,
      interval,
      endOfMonth,
    } = defaultValues as CustomObjREPT & {
      weekPatterns?: { week: number; day: string }[];
    };

    // 🟢 Set frequency
    if (frequency) setFrequency(frequency as FrequencyType);

    // 🟢 Handle daysOfWeek (Weekly)
    if (daysOfWeek?.length) {
      setSelectedDay(convertAPIDaysToKeys(daysOfWeek));
      setDateOrWeekly("WEEKLY");
    }

    // 🟢 Handle dates (Monthly / Yearly by date)
    if (dates?.length) {
      setSelectedDate(dates);
      setDateOrWeekly("date");
    }
    if (interval) {
      setIntervalCount(interval);
    }
    if (endOfMonth) {
      setIsMonthlyEnd(endOfMonth);
      setDateOrWeekly("MONTHLYEND");
    }

    // 🟢 Unified logic: handle both weekDaysMapping and weekPatterns
    const weekData = weekDaysMapping?.length
      ? weekDaysMapping.map((wp) => ({
          week: wp.week,
          daysOfWeek: Array.isArray(wp.days)
            ? convertAPIDaysToKeys(wp.days)
            : convertAPIDaysToKeys([wp.days]),
        }))
      : weekPatterns?.length
        ? weekPatterns.map((wp) => ({
            week: wp.week,
            daysOfWeek: convertAPIDaysToKeys([wp.day]),
          }))
        : [];

    if (weekData.length > 0) {
      setWeeklyPatterns(weekData);
      setDateOrWeekly("WEEKLY");

      if (weekData.length === 1) {
        setSelectedWeek(weekData[0].week);
        setSelectedDay(weekData[0].daysOfWeek);
      }
    }

    if (months?.length && frequency === "YEARLY") {
      const numericMonth = reorderedMonths.find(
        (m) => m.api === months[0],
      )?.value;
      if (numericMonth !== undefined) setSelectedMonth([numericMonth]);
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
        } else if (dateOrWeekly === "MONTHLYEND") {
          summary += `Every month on the End Date `;
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

      case "YEARLY":
        if (selectedMonth?.length > 0) {
          const monthLabels = selectedMonth
            .map((m) => {
              const realMonth = getActualMonthIndex(financialYear, m);
              return getLabel(months, realMonth) ?? "";
            })
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
    frequencies,
    baseFrequency,
    dateOrWeekly,
    selectedDate,
    selectedMonth,
    selectedWeek,
    selectedDay,
    multiSelect,
    weeklyPatterns,
    setFrequency,
    setDateOrWeekly,
    setSelectedDate,
    setSelectedMonth,
    setSelectedWeek,
    setSelectedDay,
    // setMultiSelect,
    getScheduleSummary,
    setWeeklyPatterns,
    isMonthlyEnd,
    setIsMonthlyEnd,
    IntervalCount,
    setIntervalCount,
    reorderedMonths,
    totalDays,
    convertDaysToAPI,
    convertMonthToAPI,
  };
}
