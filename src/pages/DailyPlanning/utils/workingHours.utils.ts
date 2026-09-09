export interface WorkingHoursInfo {
  startTime: string | null;
  endTime: string | null;
  breakDuration: number;
  totalWorkingMinutes: number;
  isWorkingTimeDefined: boolean;
  timeSource: "TIME_SHIFT" | "COMPANY_TIME" | "NONE";
}

/**
 * Calculates working hours and working minutes for Daily Planning.
 * Priority:
 * 1. Employee Time Shift (timeShift.startTime & timeShift.endTime)
 * 2. Company Working Time (companyStartTime & companyEndTime)
 * 3. None (isWorkingTimeDefined = false, totalWorkingMinutes = 0)
 */
export const calculateWorkingHours = (user?: User | null): WorkingHoursInfo => {
  if (!user) {
    return {
      startTime: null,
      endTime: null,
      breakDuration: 0,
      totalWorkingMinutes: 0,
      isWorkingTimeDefined: false,
      timeSource: "NONE",
    };
  }

  const timeShift = user.timeShift;
  if (timeShift?.startTime && timeShift?.endTime) {
    const [startH, startM] = timeShift.startTime.split(":").map(Number);
    const [endH, endM] = timeShift.endTime.split(":").map(Number);

    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      let diff = endH * 60 + endM - (startH * 60 + startM);
      if (diff < 0) diff += 24 * 60;

      const breakMins = Number(timeShift.breakDuration) || 0;

      diff = Math.max(0, diff - breakMins);

      return {
        startTime: timeShift.startTime,
        endTime: timeShift.endTime,
        breakDuration: breakMins,
        totalWorkingMinutes: diff,
        isWorkingTimeDefined: true,
        timeSource: "TIME_SHIFT",
      };
    }
  }

  if (user.companyStartTime && user.companyEndTime) {
    const [startH, startM] = user.companyStartTime.split(":").map(Number);
    const [endH, endM] = user.companyEndTime.split(":").map(Number);

    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      let diff = endH * 60 + endM - (startH * 60 + startM);
      if (diff < 0) diff += 24 * 60;

      let breakMins = Number(user.breakDuration) || 0;
      if (!breakMins && user.breakStartTime && user.breakEndTime) {
        const [bStartH, bStartM] = user.breakStartTime.split(":").map(Number);
        const [bEndH, bEndM] = user.breakEndTime.split(":").map(Number);
        if (!isNaN(bStartH) && !isNaN(bStartM) && !isNaN(bEndH) && !isNaN(bEndM)) {
          let bDiff = bEndH * 60 + bEndM - (bStartH * 60 + bStartM);
          if (bDiff < 0) bDiff += 24 * 60;
          breakMins = bDiff;
        }
      }

      diff = Math.max(0, diff - breakMins);

      return {
        startTime: user.companyStartTime,
        endTime: user.companyEndTime,
        breakDuration: breakMins,
        totalWorkingMinutes: diff,
        isWorkingTimeDefined: true,
        timeSource: "COMPANY_TIME",
      };
    }
  }

  return {
    startTime: null,
    endTime: null,
    breakDuration: 0,
    totalWorkingMinutes: 0,
    isWorkingTimeDefined: false,
    timeSource: "NONE",
  };
};
