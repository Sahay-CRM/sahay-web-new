import moment from "moment-timezone";

// Types
export interface RepeatDatesResult {
  createDateUTC: string;
  nextDateUTC: string;
}

export interface CustomRepeatConfig {
  frequency: string;
  interval?: number;
  daysOfWeek?: string[];
  dates?: number[];
  weekPatterns?: Array<{ week: number; day: string }>;
  endOfMonth?: boolean;
  month?: string;
  date?: number;
  timezone?: string;
}

export type RepeatType = string;

// Main function for standard repeat types
export function getNextRepeatDates(
  repeatType: RepeatType,
  timeOrNextDate: string,
  timezone = "UTC",
) {
  if (!repeatType) throw new Error("repeatType is required");
  if (!timeOrNextDate)
    throw new Error("Either time or nextDate must be provided");

  const isFullDate = timeOrNextDate.includes("T");
  let baseMomentUTC;

  if (isFullDate) {
    baseMomentUTC = moment.utc(timeOrNextDate);
  } else {
    const [hour, minute] = timeOrNextDate.split(":").map(Number);
    const localNow = moment.tz(timezone);
    const localBase = localNow
      .clone()
      .set({ hour, minute, second: 0, millisecond: 0 });
    if (localBase.isBefore(localNow)) localBase.add(1, "day");
    baseMomentUTC = localBase.clone().utc();
  }

  // ✅ Use let instead of const
  const createDateUTC = baseMomentUTC.clone();
  let nextDateUTC = createDateUTC.clone();

  switch (repeatType) {
    case "DAILY":
      nextDateUTC.add(1, "day");
      break;
    case "DAILYALTERNATE":
      nextDateUTC.add(2, "days");
      break;
    case "WEEKLY":
      nextDateUTC.add(1, "week");
      break;
    case "MONTHLYDATE":
      nextDateUTC.add(1, "month");
      break;
    case "YEARLY":
      nextDateUTC.add(1, "year");
      break;

    // 🆕 MONTHLYWEEKDAY
    case "MONTHLYNWEEKDAY": {
      const localBase = baseMomentUTC.clone().tz(timezone);

      // Detect weekday (0=Sunday ... 6=Saturday)
      const weekday = localBase.day();

      // Detect week number in month (1st, 2nd, 3rd, 4th, or last)
      const dayOfMonth = localBase.date();
      const weekNumber = Math.ceil(dayOfMonth / 7);

      // Move to next month and find same weekNumber + weekday
      const nextMonth = localBase.clone().add(1, "month").startOf("month");
      let target = nextMonth.clone().day(weekday);

      // If day() moves us back to previous month, push forward 1 week
      if (target.month() !== nextMonth.month()) target.add(7, "days");

      // Move to the same week number
      target.add((weekNumber - 1) * 7, "days");

      // If it goes beyond next month (e.g., 5th Friday that doesn't exist)
      if (target.month() !== nextMonth.month()) {
        // fallback to last occurrence of that weekday
        target = nextMonth.clone().endOf("month").day(weekday);
        if (target.month() !== nextMonth.month()) target.subtract(7, "days");
      }

      // Set time same as input
      const [hour, minute] = timeOrNextDate.split(":").map(Number);
      target.set({ hour, minute, second: 0, millisecond: 0 });

      nextDateUTC = target.clone().utc();
      break;
    }

    default:
      throw new Error("Invalid or unsupported repeatType");
  }

  return {
    createDateUTC: createDateUTC.format("YYYY-MM-DDTHH:mm:ss[Z]"),
    nextDateUTC: nextDateUTC.format("YYYY-MM-DDTHH:mm:ss[Z]"),
  };
}

export function getNextRepeatDatesCustom(
  repeatType: RepeatType,
  timeOrNextDate: string,
  custom: CustomRepeatConfig,
): RepeatDatesResult {
  if (repeatType !== "CUSTOMTYPE") {
    throw new Error("repeatType must be CUSTOMTYPE");
  }
  if (!timeOrNextDate) {
    throw new Error("Either time or nextDate must be provided");
  }
  const {
    frequency,
    interval = 1,
    daysOfWeek,
    dates,
    weekPatterns,
    endOfMonth,
    month,
    date,
    timezone = "UTC",
  } = custom;

  // Determine base moment (either full date or time)
  let baseMomentUTC;
  if (timeOrNextDate.includes("T")) {
    // full UTC datetime
    baseMomentUTC = moment.utc(timeOrNextDate);
  } else {
    // only time (HH:mm) → use today's date in timezone
    const [hour, minute] = timeOrNextDate.split(":").map(Number);
    const nowLocal = moment.tz(timezone);
    const localMoment = nowLocal
      .clone()
      .set({ hour, minute, second: 0, millisecond: 0 });
    if (localMoment.isBefore(nowLocal)) localMoment.add(1, "day");
    baseMomentUTC = localMoment.clone().utc();
  }

  const findWeekday = (m: moment.Moment, week: number, dayName: string) => {
    const dayIndex = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].indexOf(
      dayName,
    );
    let date = m.clone().startOf("month");
    if (week === -1) {
      date = m.clone().endOf("month");
      while (date.day() !== dayIndex) date.subtract(1, "day");
      return date;
    }
    while (date.day() !== dayIndex) date.add(1, "day");
    date.add((week - 1) * 7, "days");
    if (date.month() !== m.month()) {
      date = m.clone().endOf("month");
      while (date.day() !== dayIndex) date.subtract(1, "day");
    }
    return date;
  };

  const clampToEndOfMonth = (momentDate: moment.Moment, dayNum: number) => {
    const daysInMonth = momentDate.daysInMonth();
    return Math.min(dayNum, daysInMonth);
  };

  let createDate = baseMomentUTC.clone();
  let nextDate = null;

  if (!frequency) {
    throw new Error("frequency is required inside custom object");
  }

  const baseTz = baseMomentUTC.clone().tz(timezone);
  const [hour, minute] = [baseTz.hour(), baseTz.minute()];

  // -------------------- WEEKLY FIXED --------------------
  if (frequency === "WEEKLY") {
    const days = daysOfWeek || [];
    const dayIdx = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const sortedDays = days.map((d) => dayIdx.indexOf(d)).sort((a, b) => a - b);
    const currentDay = baseTz.day();
    const nowLocal = moment.tz(timezone);

    let createLocal;

    // Check if today's day matches one of the repeat days
    if (sortedDays.includes(currentDay)) {
      const todayCandidate = baseTz
        .clone()
        .set({ hour, minute, second: 0, millisecond: 0 });
      // If current time hasn't passed yet, schedule for today
      if (todayCandidate.isSameOrAfter(nowLocal)) {
        createLocal = todayCandidate;
      } else {
        // Otherwise, move to the next valid weekday
        const nextIdx = sortedDays.find((i) => i > currentDay);
        if (nextIdx === undefined) {
          createLocal = baseTz
            .clone()
            .add(interval, "weeks")
            .day(sortedDays[0]);
        } else {
          createLocal = baseTz.clone().day(nextIdx);
        }
      }
    } else {
      // Today is not one of the repeat days → find next valid weekday
      const nextIdx = sortedDays.find((i) => i > currentDay);
      if (nextIdx === undefined) {
        createLocal = baseTz.clone().add(interval, "weeks").day(sortedDays[0]);
      } else {
        createLocal = baseTz.clone().day(nextIdx);
      }
    }

    // ✅ Fixed next date logic
    let nextLocal;
    const nextDay = sortedDays.find((d) => d > createLocal.day());
    if (nextDay !== undefined) {
      // Next valid weekday in same week
      nextLocal = createLocal.clone().day(nextDay);
    } else {
      // Wrap to first day of next week (interval weeks later)
      nextLocal = createLocal.clone().add(interval, "weeks").day(sortedDays[0]);
    }

    createDate = createLocal.clone().set({ hour, minute, second: 0 }).utc();
    nextDate = nextLocal.clone().set({ hour, minute, second: 0 }).utc();

    // -------------------- MONTHLY --------------------
  } else if (frequency === "MONTHLY") {
    let m = baseTz.clone().set({ hour, minute, second: 0, millisecond: 0 });
    let nextM = m.clone().add(interval, "months");

    if (dates?.length) {
      const d = dates[0];
      const day = clampToEndOfMonth(m, d);
      if (m.date(day).isBefore(baseTz)) m = m.add(interval, "months");
      m.date(clampToEndOfMonth(m, d));
      nextM = m
        .clone()
        .add(interval, "months")
        .date(clampToEndOfMonth(m.clone().add(interval, "months"), d));
    } else if (weekPatterns?.length) {
      const { week, day } = weekPatterns[0];
      let candidate = findWeekday(m.clone(), week, day);
      const baseWeek = Math.ceil(baseTz.date() / 7);
      const baseDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
        baseTz.day()
      ];

      if (!(baseWeek === week && baseDay === day)) {
        if (candidate.isBefore(baseTz)) {
          candidate = findWeekday(m.clone().add(interval, "months"), week, day);
        }
      }

      createDate = candidate.clone().set({ hour, minute, second: 0 }).utc();
      const nextCandidate = findWeekday(
        candidate.clone().add(interval, "months"),
        week,
        day,
      );
      nextDate = nextCandidate.clone().set({ hour, minute, second: 0 }).utc();

      return {
        createDateUTC: createDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
        nextDateUTC: nextDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      };
    } else if (endOfMonth) {
      if (m.endOf("month").isBefore(baseTz)) m = m.add(interval, "months");
      m = m.endOf("month");
      nextM = m.clone().add(interval, "months").endOf("month");
    }

    createDate = m.clone().utc();
    nextDate = nextM.clone().utc();

    // -------------------- YEARLY --------------------
  } else if (frequency === "YEARLY") {
    let monthIdx;
    if (typeof month === "string") {
      monthIdx = moment().month(month).month();
    } else if (typeof month === "number") {
      monthIdx = month;
    } else {
      monthIdx = baseTz.month();
    }

    let m = baseTz
      .clone()
      .month(monthIdx)
      .set({ hour, minute, second: 0, millisecond: 0 });

    const targetDate = date ?? (dates?.length ? dates[0] : null);

    if (targetDate) {
      const day = clampToEndOfMonth(m, targetDate);
      m.date(day);
      if (m.isBefore(baseTz)) m = m.add(interval, "years");

      createDate = m.clone().utc();
      nextDate = m.clone().add(interval, "years").utc();
    } else {
      createDate = m.clone().utc();
      nextDate = createDate.clone().add(interval, "years").utc();
    }
  } else {
    throw new Error("Unsupported frequency type in custom object");
  }

  return {
    createDateUTC: createDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
    nextDateUTC: nextDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
  };
}
