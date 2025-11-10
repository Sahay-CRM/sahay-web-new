import moment, { Moment } from "moment-timezone";

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

function getWeekNumberOfMonth(momentObj: Moment) {
  const firstOfMonth = momentObj.clone().startOf("month");
  const weekday = momentObj.day();
  const offset = (7 + weekday - firstOfMonth.day()) % 7;
  const firstOccurrenceDate = 1 + offset; // date of the first 'weekday' in the month
  return 1 + Math.floor((momentObj.date() - firstOccurrenceDate) / 7);
}

function getNthWeekdayOfMonth(momentObj: Moment, n: number, weekday: number) {
  const first = momentObj.clone().startOf("month");
  const offset = (7 + weekday - first.day()) % 7;
  const date = 1 + offset + (n - 1) * 7;
  return first.clone().date(date).set({
    hour: momentObj.hour(),
    minute: momentObj.minute(),
    second: 0,
    millisecond: 0,
  });
}

interface RepeatOptions {
  now?: string; // optional override for deterministic testing
}

export function getNextRepeatDates(
  repeatType: RepeatType,
  timeOrNextDate: string,
  timezone = "UTC",
  options: RepeatOptions = {},
) {
  if (!repeatType) throw new Error("repeatType is required");
  if (!timeOrNextDate)
    throw new Error("Either time or nextDate must be provided");

  const isFullDate = timeOrNextDate.includes("T");
  // allow deterministic demo 'now' override in options.now (ISO string or moment)
  const localNow = options.now
    ? moment.tz(options.now, timezone)
    : moment.tz(timezone);

  // --- Build initial local candidate for "today" at the requested time (or use full date) ---
  let localCandidate: Moment;
  if (isFullDate) {
    localCandidate = moment.tz(timeOrNextDate, timezone).clone();
  } else {
    const [hour, minute] = timeOrNextDate.split(":").map(Number);
    localCandidate = localNow
      .clone()
      .set({ hour, minute, second: 0, millisecond: 0 });
  }

  // Helper to set time on a moment (preserve hour/minute from localCandidate)
  function setCandidateTime(mom: Moment) {
    return mom.clone().set({
      hour: localCandidate.hour(),
      minute: localCandidate.minute(),
      second: 0,
      millisecond: 0,
    });
  }

  let createLocal = localCandidate.clone();
  let nextLocal = null;

  // --- Compute createLocal as the next occurrence >= localNow and compute nextLocal accordingly ---
  switch (repeatType) {
    case "DAILY": {
      if (createLocal.isBefore(localNow)) createLocal.add(1, "day");
      nextLocal = createLocal.clone().add(1, "day");
      break;
    }

    case "DAILYALTERNATE": {
      // If today's time already passed, shift create to the next alternate occurrence (skip one repeat interval)
      if (createLocal.isBefore(localNow)) createLocal.add(2, "days");
      nextLocal = createLocal.clone().add(2, "days");
      break;
    }

    case "WEEKLY": {
      if (createLocal.isBefore(localNow)) createLocal.add(1, "week");
      nextLocal = createLocal.clone().add(1, "week");
      break;
    }

    case "MONTHLYDATE": {
      // Use the current day-of-month as the monthly date
      createLocal = setCandidateTime(localNow.clone().date(localNow.date()));
      if (createLocal.isBefore(localNow)) createLocal.add(1, "month");
      nextLocal = createLocal.clone().add(1, "month");
      break;
    }

    case "MONTHLYEOM": {
      // End of current month at given time, or next month if passed
      let eom = localNow.clone().endOf("month");
      eom = setCandidateTime(eom);
      if (eom.isBefore(localNow)) {
        eom = setCandidateTime(localNow.clone().add(1, "month").endOf("month"));
      }
      createLocal = eom;
      nextLocal = setCandidateTime(
        createLocal.clone().add(1, "month").endOf("month"),
      );
      break;
    }

    case "MONTHLYNWEEKDAY": {
      // Use the same weekday and week-number as today (no extra options provided)
      const weekday = localNow.day();
      const n = getWeekNumberOfMonth(localNow); // which occurrence this week is
      // candidate in this month
      let candidate = getNthWeekdayOfMonth(localNow.clone(), n, weekday);
      candidate = setCandidateTime(candidate);
      if (candidate.isBefore(localNow)) {
        // move to next month and compute the same n-th weekday
        const nextMonth = localNow.clone().add(1, "month");
        candidate = getNthWeekdayOfMonth(nextMonth, n, weekday);
        candidate = setCandidateTime(candidate);
      }
      createLocal = candidate;
      // next occurrence: same n-th weekday next month
      const nextMonthBase = createLocal.clone().add(1, "month");
      nextLocal = getNthWeekdayOfMonth(nextMonthBase, n, weekday);
      nextLocal = setCandidateTime(nextLocal);
      break;
    }

    case "YEARLY": {
      // Same month and day as today, at provided time
      createLocal = setCandidateTime(
        localNow.clone().month(localNow.month()).date(localNow.date()),
      );
      if (createLocal.isBefore(localNow)) createLocal.add(1, "year");
      nextLocal = createLocal.clone().add(1, "year");
      break;
    }

    case "YEARLYXMONTHNWEEKDAY": {
      // No extra options given — assume same month, same weekday and week-number as current date
      const month = localNow.month(); // current month
      const weekday = localNow.day();
      const n = getWeekNumberOfMonth(localNow);
      // candidate for this year
      let candidateBase = localNow.clone().year(localNow.year()).month(month);
      let candidate = getNthWeekdayOfMonth(candidateBase, n, weekday);
      candidate = setCandidateTime(candidate);
      if (candidate.isBefore(localNow)) {
        // next year's same month/n/weekday
        candidateBase = localNow
          .clone()
          .add(1, "year")
          .year(localNow.year() + 1)
          .month(month);
        candidate = getNthWeekdayOfMonth(candidateBase, n, weekday);
        candidate = setCandidateTime(candidate);
      }
      createLocal = candidate;
      // next occurrence is same configuration +1 year
      const nextYearBase = createLocal.clone().add(1, "year");
      nextLocal = getNthWeekdayOfMonth(nextYearBase, n, weekday);
      nextLocal = setCandidateTime(nextLocal);
      break;
    }

    default:
      throw new Error("Invalid or unsupported repeatType");
  }

  // --- Convert to UTC ---
  const createDateUTC = createLocal
    .clone()
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss[Z]");
  const nextDateUTC = nextLocal.clone().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");

  return { createDateUTC, nextDateUTC };
}

export function getNextRepeatDatesCustom(
  repeatType: RepeatType,
  timeOrNextDate: string,
  custom: CustomRepeatConfig,
) {
  if (repeatType !== "CUSTOMTYPE")
    throw new Error("repeatType must be CUSTOMTYPE");
  if (!timeOrNextDate)
    throw new Error("Either time or nextDate must be provided");

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
      // const baseWeek = Math.ceil(baseTz.date() / 7);
      // const baseDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
      //   baseTz.day()
      // ];

      // Find all candidate dates for current month
      const currentMonthCandidates = weekPatterns.map(({ week, day }) => {
        return findWeekday(m.clone(), week, day)
          .set({ hour, minute, second: 0 })
          .utc();
      });

      // Find all candidate dates for next month
      const nextMonthCandidates = weekPatterns.map(({ week, day }) => {
        return findWeekday(m.clone().add(interval, "months"), week, day)
          .set({ hour, minute, second: 0 })
          .utc();
      });

      // Combine and sort all candidates
      const allCandidates = [...currentMonthCandidates, ...nextMonthCandidates]
        .filter(
          (candidate) => candidate.isAfter(baseTz) || candidate.isSame(baseTz),
        )
        .sort((a, b) => a.valueOf() - b.valueOf());

      // Find the nearest future dates
      let createDate = baseMomentUTC.clone();
      let nextDate = null;

      if (allCandidates.length >= 2) {
        createDate = allCandidates[0];
        nextDate = allCandidates[1];
      } else if (allCandidates.length === 1) {
        createDate = allCandidates[0];
        // For next date, look further into future months
        const futureCandidates = [];
        for (let i = 1; i <= 2; i++) {
          const futureMonthCandidates = weekPatterns.map(({ week, day }) => {
            return findWeekday(m.clone().add(interval * i, "months"), week, day)
              .set({ hour, minute, second: 0 })
              .utc();
          });
          futureCandidates.push(...futureMonthCandidates);
        }
        futureCandidates.sort((a, b) => a.valueOf() - b.valueOf());
        nextDate = futureCandidates.find((candidate) =>
          candidate.isAfter(createDate),
        );
      } else {
        // No future candidates found, use fallback
        const fallbackDate = findWeekday(
          m.clone(),
          weekPatterns[0].week,
          weekPatterns[0].day,
        )
          .set({ hour, minute, second: 0 })
          .utc();
        createDate = fallbackDate;
        nextDate = findWeekday(
          m.clone().add(interval, "months"),
          weekPatterns[0].week,
          weekPatterns[0].day,
        )
          .set({ hour, minute, second: 0 })
          .utc();
      }

      return {
        createDateUTC: createDate.format("YYYY-MM-DDTHH:mm:ss[Z]"),
        nextDateUTC: nextDate?.format("YYYY-MM-DDTHH:mm:ss[Z]"),
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
    nextDateUTC: nextDate ? nextDate.format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
  };
}
