export function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function getOrdinalWeekday(date: Date) {
  const days = date.getDay();
  const dateOfMonth = date.getDate();
  const lastDateOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const ordinals = ["first", "second", "third", "fourth", "fifth"];

  const weekNumber = Math.ceil(dateOfMonth / 7);
  const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
  const isLastWeek = daysLeftInMonth < 7;
  const ordinalLabel = isLastWeek ? "last" : ordinals[weekNumber - 1];

  return `${ordinalLabel} ${weekdayNames[days]}`;
}

export function getOrdinalDate(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function buildRepetitionOptions(taskDeadline?: string | Date | null) {
  if (!taskDeadline) return [];

  try {
    const dateObj = new Date(taskDeadline);
    if (isNaN(dateObj.getTime())) return [];

    const dayName = getDayName(dateObj);
    const ordinalWeekday = getOrdinalWeekday(dateObj);
    const lastDateOfMonth = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      0,
    ).getDate();

    const dateOfMonth = dateObj.getDate();
    const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
    const isLastWeek = daysLeftInMonth < 7;
    const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });
    const isLastDayOfMonth = dateOfMonth === lastDateOfMonth;

    return [
      { value: "DAILY", label: "Daily" },
      { value: "DAILYALTERNATE", label: "Daily (Every Other Day)" },
      { value: "WEEKLY", label: `Weekly on ${dayName}` },

      ...(isLastWeek
        ? [
            {
              value: "MONTHLYLASTWEEKDAY",
              label: `Monthly on the last ${dayName}`,
            },
          ]
        : [
            {
              value: "MONTHLYNWEEKDAY",
              label: `Monthly on the ${ordinalWeekday}`,
            },
          ]),

      {
        value: "MONTHLYDATE",
        label: `Monthly on the ${getOrdinalDate(dateOfMonth)} date`,
      },

      ...(isLastDayOfMonth
        ? [
            {
              value: "MONTHLYEOM",
              label: `Monthly on the last days (${getOrdinalDate(
                lastDateOfMonth,
              )})`,
            },
          ]
        : []),

      {
        value: "YEARLYXMONTHDATE",
        label: `Yearly on ${monthName} ${getOrdinalDate(dateOfMonth)}`,
      },

      ...(!isLastDayOfMonth
        ? [
            {
              value: "YEARLYXMONTHNWEEKDAY",
              label: `Yearly on the ${ordinalWeekday} of ${monthName}`,
            },
          ]
        : []),

      ...(isLastDayOfMonth
        ? [
            {
              value: "YEARLYXMONTHLASTWEEKDAY",
              label: `Yearly on the last ${dayName} of ${monthName}`,
            },
          ]
        : []),
      { value: "CUSTOMTYPE", label: "Custom" },
    ];
  } catch {
    return [];
  }
}

// function isTodayMatchingDay(days?: number | number[]): boolean {
//   if (days === undefined) return false;
//   const todayDay = new Date().getDay();
//   if (Array.isArray(days)) {
//     if (days.length === 1) {
//       return days[0] === todayDay;
//     }
//     return false;
//   }
//   return days === todayDay;
// }

// export function getRepeatTypeOrCustom(data: TodoItem): string {
//   if (!data?.repeatType) return "";

//   const today = new Date();

//   switch (data.repeatType) {
//     case "DAILY":
//       return "DAILY";
//     case "DAILYALTERNATE":
//       return "DAILYALTERNATE";

//     case "WEEKLY": {
//       const sameDay = isTodayMatchingDay(data.customObj?.days);
//       // const sameDay = data.customObj?.days === today.getDay();
//       return sameDay ? "WEEKLY" : "CUSTOMTYPE";
//     }

//     case "MONTHLYNWEEKDAY": {
//       const weekNumber = Math.ceil(today.getDate() / 7);
//       const sameWeek = data.customObj?.nWeek === weekNumber;
//       const sameDay = isTodayMatchingDay(data.customObj?.days);
//       return sameWeek && sameDay ? "MONTHLYNWEEKDAY" : "CUSTOMTYPE";
//     }

//     case "MONTHLYDATE": {
//       return data.customObj?.date === today.getDate()
//         ? "MONTHLYDATE"
//         : "CUSTOMTYPE";
//     }

//     case "MONTHLYEOM": {
//       const lastDate = new Date(
//         today.getFullYear(),
//         today.getMonth() + 1,
//         0
//       ).getDate();
//       return today.getDate() === lastDate ? "MONTHLYEOM" : "CUSTOMTYPE";
//     }

//     case "MONTHLYLASTWEEKDAY": {
//       const lastDate = new Date(
//         today.getFullYear(),
//         today.getMonth() + 1,
//         0
//       ).getDate();
//       const todayWeek = Math.ceil(today.getDate() / 7);
//       const lastWeek = Math.ceil(lastDate / 7);
//       const sameDay = isTodayMatchingDay(data.customObj?.days);
//       const sameWeek = todayWeek === lastWeek;
//       return sameDay && sameWeek ? "MONTHLYLASTWEEKDAY" : "CUSTOMTYPE";
//     }

//     case "YEARLYXMONTHDATE": {
//       const sameDate = data.customObj?.date === today.getDate();
//       const sameMonth = data.customObj?.month === today.getMonth() + 1;
//       return sameDate && sameMonth ? "YEARLYXMONTHDATE" : "CUSTOMTYPE";
//     }

//     case "YEARLYXMONTHNWEEKDAY": {
//       const weekNumber = Math.ceil(today.getDate() / 7);
//       const sameWeek = data.customObj?.nWeek === weekNumber;
//       const sameDay = isTodayMatchingDay(data.customObj?.days);
//       const sameMonth = data.customObj?.month === today.getMonth() + 1;
//       return sameWeek && sameDay && sameMonth
//         ? "YEARLYXMONTHNWEEKDAY"
//         : "CUSTOMTYPE";
//     }

//     case "YEARLYXMONTHLASTWEEKDAY": {
//       const lastDate = new Date(
//         today.getFullYear(),
//         today.getMonth() + 1,
//         0
//       ).getDate();
//       const todayWeek = Math.ceil(today.getDate() / 7);
//       const lastWeek = Math.ceil(lastDate / 7);
//       const sameDay = isTodayMatchingDay(data.customObj?.days);
//       const sameMonth = data.customObj?.month === today.getMonth() + 1;
//       return sameDay && sameMonth && todayWeek === lastWeek
//         ? "YEARLYXMONTHLASTWEEKDAY"
//         : "CUSTOMTYPE";
//     }

//     default:
//       return "CUSTOMTYPE";
//   }
// }

export function getRepeatTypeOrCustom(data: TodoItem | Task): string {
  if (!data?.repeatType) return "";

  const today = new Date();
  const rp = data.customObj?.repeatPattern;

  switch (data.repeatType) {
    case "DAILY":
      return "DAILY";
    case "DAILYALTERNATE":
      return "DAILYALTERNATE";

    case "WEEKLY": {
      const days = rp?.daysOfWeek ?? [];
      const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday

      const isWeekly = days.length === 1 && days[0] === today; // only one day AND matches today

      return isWeekly ? "WEEKLY" : "CUSTOMTYPE";
    }

    case "MONTHLYNWEEKDAY": {
      const mappings = rp?.weekDaysMapping ?? [];
      const weekNumber = Math.ceil(today.getDate() / 7);
      const todayDay = today.getDay();

      // ✅ only single mapping + single day + same week + same day
      if (
        mappings.length === 1 &&
        mappings[0].daysOfWeek.length === 1 &&
        mappings[0].week === weekNumber &&
        mappings[0].daysOfWeek[0] === todayDay
      ) {
        return "MONTHLYNWEEKDAY";
      }

      return "CUSTOMTYPE";
    }
    case "MONTHLYDATE": {
      // agar customObj ya repeatPattern hi nahi hai -> direct MONTHLYDATE
      if (!rp?.dates) {
        return "MONTHLYDATE";
      }

      const dates = rp.dates ?? [];
      const todayDate = today.getDate();

      // ✅ single date aur wahi current date match kare
      if (dates.length === 1 && dates[0] === todayDate) {
        return "MONTHLYDATE";
      }

      return "CUSTOMTYPE";
    }

    case "MONTHLYEOM": {
      const lastDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
      return today.getDate() === lastDate ? "MONTHLYEOM" : "CUSTOMTYPE";
    }

    case "MONTHLYLASTWEEKDAY": {
      if (!rp?.weekDaysMapping?.length) return "MONTHLYLASTWEEKDAY"; // customObj missing case

      const lastDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
      const todayWeek = Math.ceil(today.getDate() / 7);
      const lastWeek = Math.ceil(lastDate / 7);

      if (rp.weekDaysMapping.length !== 1) return "CUSTOMTYPE";

      const w = rp.weekDaysMapping[0];
      const sameDay =
        w.daysOfWeek.length === 1 && w.daysOfWeek[0] === today.getDay();
      const sameWeek = todayWeek === lastWeek;

      return sameDay && sameWeek ? "MONTHLYLASTWEEKDAY" : "CUSTOMTYPE";
    }

    case "YEARLYXMONTHDATE": {
      if (!rp?.dates || !rp?.months) return "YEARLYXMONTHDATE"; // customObj missing

      if (rp.dates.length !== 1 || rp.months.length !== 1) return "CUSTOMTYPE";

      const sameDate = rp.dates[0] === today.getDate();
      const sameMonth = rp.months[0] === today.getMonth() + 1;

      return sameDate && sameMonth ? "YEARLYXMONTHDATE" : "CUSTOMTYPE";
    }

    case "YEARLYXMONTHNWEEKDAY": {
      if (!rp?.weekDaysMapping?.length || !rp?.months?.length)
        return "YEARLYXMONTHNWEEKDAY";

      if (rp.weekDaysMapping.length !== 1 || rp.months.length !== 1)
        return "CUSTOMTYPE";

      const w = rp.weekDaysMapping[0];
      const weekNumber = Math.ceil(today.getDate() / 7);

      const sameWeek = w.week === weekNumber;
      const sameDay =
        w.daysOfWeek.length === 1 && w.daysOfWeek[0] === today.getDay();
      const sameMonth = rp.months[0] === today.getMonth() + 1;

      return sameWeek && sameDay && sameMonth
        ? "YEARLYXMONTHNWEEKDAY"
        : "CUSTOMTYPE";
    }

    case "YEARLYXMONTHLASTWEEKDAY": {
      if (!rp?.weekDaysMapping?.length || !rp?.months?.length)
        return "YEARLYXMONTHLASTWEEKDAY";

      if (rp.weekDaysMapping.length !== 1 || rp.months.length !== 1)
        return "CUSTOMTYPE";

      const w = rp.weekDaysMapping[0];

      const lastDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
      const todayWeek = Math.ceil(today.getDate() / 7);
      const lastWeek = Math.ceil(lastDate / 7);

      const sameDay =
        w.daysOfWeek.length === 1 && w.daysOfWeek[0] === today.getDay();
      const sameMonth = rp.months[0] === today.getMonth() + 1;

      return sameDay && sameMonth && todayWeek === lastWeek
        ? "YEARLYXMONTHLASTWEEKDAY"
        : "CUSTOMTYPE";
    }

    default:
      return "CUSTOMTYPE";
  }
}
