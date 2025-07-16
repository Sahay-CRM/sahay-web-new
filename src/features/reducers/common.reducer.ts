import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: MeetingState = {
  items: [],
};

export const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {
    setMeeting: (state, action: PayloadAction<MeetingItem[]>) => {
      state.items = action.payload;
    },
    clearMeeting: (state) => {
      state.items = [];
    },
  },
});

export const { setMeeting, clearMeeting } = meetingSlice.actions;
export default meetingSlice.reducer;
