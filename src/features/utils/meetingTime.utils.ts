/**
 * Calculates 33% and 40% logs of spent time.
 * @param totalSeconds - Total spent time in seconds
 * @returns { log33: number, log40: number }
 */
export function getTimeLogs(totalSeconds?: number) {
  if (!totalSeconds || totalSeconds <= 0) {
    return { log33: 0, log40: 0 };
  }

  const log33 = Math.round(totalSeconds * 0.33);
  const log40 = Math.round(totalSeconds * 0.4);

  return {
    log33,
    log40,
  };
}
