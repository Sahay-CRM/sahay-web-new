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

export type RepeatType =
  | "DAILY"
  | "DAILYALTERNATE"
  | "WEEKLY"
  | "MONTHLYDATE"
  | "YEARLY"
  | "CUSTOMTYPE";

// Main function for standard repeat types
export function getNextRepeatDates(
  repeatType: RepeatType,
  timeOrNextDate: string,
  timezone: string = "UTC",
): RepeatDatesResult {
  if (!repeatType) throw new Error("repeatType is required");
  if (!timeOrNextDate)
    throw new Error("Either time or nextDate must be provided");

  // Detect if this is a full UTC date or just time
  const isFullDate = timeOrNextDate.includes("T");
  let baseMomentUTC: moment.Moment;

  if (isFullDate) {
    baseMomentUTC = moment.utc(timeOrNextDate);
  } else {
    const [hour, minute] = timeOrNextDate.split(":").map(Number);
    const localNow = moment.tz(timezone);
    const localBase = localNow
      .clone()
      .set({ hour, minute, second: 0, millisecond: 0 });

    if (localBase.isBefore(localNow)) {
      localBase.add(1, "day");
    }
    baseMomentUTC = localBase.clone().utc();
  }

  const createDateUTC = baseMomentUTC.clone();

  // Determine nextDate based on repeat type
  const nextDateUTC = createDateUTC.clone();
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
    default:
      throw new Error("Invalid or unsupported repeatType");
  }

  return {
    createDateUTC: createDateUTC.format("YYYY-MM-DDTHH:mm:ss[Z]"),
    nextDateUTC: nextDateUTC.format("YYYY-MM-DDTHH:mm:ss[Z]"),
  };
}

// Custom repeat function
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
  let baseMomentUTC: moment.Moment;
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

    if (localMoment.isBefore(nowLocal)) {
      localMoment.add(1, "day");
    }
    baseMomentUTC = localMoment.clone().utc();
  }

  const findWeekday = (
    m: moment.Moment,
    week: number,
    dayName: string,
  ): moment.Moment => {
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

  const clampToEndOfMonth = (
    momentDate: moment.Moment,
    dayNum: number,
  ): number => {
    const daysInMonth = momentDate.daysInMonth();
    return Math.min(dayNum, daysInMonth);
  };

  let createDate = baseMomentUTC.clone();
  let nextDate: moment.Moment | null = null;

  if (!frequency) {
    throw new Error("frequency is required inside custom object");
  }

  const baseTz = baseMomentUTC.clone().tz(timezone);
  const [hour, minute] = [baseTz.hour(), baseTz.minute()];

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

    createDate = createLocal.clone().set({ hour, minute, second: 0 }).utc();
    nextDate = createLocal
      .clone()
      .add(interval, "weeks")
      .set({ hour, minute, second: 0 })
      .utc();
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
  } else if (frequency === "YEARLY") {
    // Handle month safely
    let monthIdx;
    if (typeof month === "string") {
      monthIdx = moment().month(month).month();
    } else if (typeof month === "number") {
      monthIdx = month;
    } else {
      monthIdx = baseTz.month(); // default to current month if not given
    }

    let m = baseTz
      .clone()
      .month(monthIdx)
      .set({ hour, minute, second: 0, millisecond: 0 });

    // Pick target date from `date` or first value in `dates`
    const targetDate = date ?? (dates?.length ? dates[0] : null);

    if (targetDate) {
      const day = clampToEndOfMonth(m, targetDate);
      m.date(day);
      // if the current year’s date has already passed, move to next year
      if (m.isBefore(baseTz)) m = m.add(interval, "years");

      createDate = m.clone().utc();
      nextDate = m.clone().add(interval, "years").utc(); // ✅ add next year
    } else {
      createDate = m.clone().utc();
      nextDate = createDate.clone().add(interval, "years").utc();
    }
  } else {
    throw new Error("Unsupported frequency type in custom object");
  }

  if (!nextDate) {
    throw new Error("Could not calculate next date");
  }

  return {
    createDateUTC: createDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
    nextDateUTC: nextDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
  };
}
