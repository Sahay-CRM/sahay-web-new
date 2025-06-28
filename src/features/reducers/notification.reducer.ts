import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/features/store";

// Change initialState to be an array
const initialState: AppNotification[] = [];

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      let isRead = false;
      if (typeof action.payload.isRead === "boolean") {
        isRead = action.payload.isRead;
      } else if (typeof action.payload.data?.isRead === "string") {
        isRead = action.payload.data.isRead === "true";
      }
      state.unshift({ ...action.payload, isRead });
    },
    setNotifications: (_state, action: PayloadAction<AppNotification[]>) => {
      return action.payload;
    },
    markNotificationRead: (state, action: PayloadAction<number>) => {
      if (state[action.payload]) {
        state[action.payload].isRead = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.forEach((n: AppNotification) => (n.isRead = true));
    },
    clearNotifications: () => {
      return [];
    },
  },
});

export const {
  addNotification,
  setNotifications,
  clearNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notification;

export default notificationSlice.reducer;
