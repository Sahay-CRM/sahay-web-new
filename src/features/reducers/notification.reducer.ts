import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/features/store";

const initialState: {
  notifications: AppNotification[];
  totalCount: number;
} = {
  notifications: [],
  totalCount: 0,
};

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
      state.notifications.unshift({ ...action.payload, isRead });
      // Keep only the latest 5 notifications
      if (state.notifications.length > 5) {
        state.notifications.length = 5;
      }
    },
    setNotifications: (
      _state,
      action: PayloadAction<{ data: AppNotification[]; totalCount: number }>,
    ) => {
      return {
        notifications: action.payload.data.slice(0, 5),
        totalCount: action.payload.totalCount,
      };
    },
    markNotificationRead: (state, action: PayloadAction<number>) => {
      if (state.notifications[action.payload]) {
        state.notifications[action.payload].isRead = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
    },
    clearNotifications: () => {
      return { notifications: [], totalCount: 0 };
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

export const selectNotifications = (state: RootState) =>
  state.notification.notifications;
export const selectNotificationTotalCount = (state: RootState) =>
  state.notification.totalCount;

export default notificationSlice.reducer;
