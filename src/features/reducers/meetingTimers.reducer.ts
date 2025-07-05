import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TimerState = {
  [meetingId: string]: {
    [tabName: string]: { remainingSeconds: number };
  };
};

const initialState: TimerState = {};

const meetingTimersSlice = createSlice({
  name: "meetingTimers",
  initialState,
  reducers: {
    setTimer: (
      state,
      action: PayloadAction<{
        meetingId: string;
        tabName: string;
        remainingSeconds: number;
      }>,
    ) => {
      const { meetingId, tabName, remainingSeconds } = action.payload;
      if (!state[meetingId]) state[meetingId] = {};
      state[meetingId][tabName] = { remainingSeconds };
    },
    setAllTimers: (
      state,
      action: PayloadAction<{
        meetingId: string;
        timers: { [tabName: string]: number };
      }>,
    ) => {
      const { meetingId, timers } = action.payload;
      state[meetingId] = {};
      Object.entries(timers).forEach(([tabName, remainingSeconds]) => {
        state[meetingId][tabName] = { remainingSeconds };
      });
    },
    resetTimers: (state, action: PayloadAction<{ meetingId: string }>) => {
      delete state[action.payload.meetingId];
    },
  },
});

export const { setTimer, setAllTimers, resetTimers } =
  meetingTimersSlice.actions;
export default meetingTimersSlice.reducer;
