import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/features/store";

interface Notification {
  title?: string;
  body?: string;
  data?: { [key: string]: string };
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;

export const selectNotifications = (state: RootState) =>
  state.notification.notifications;

export default notificationSlice.reducer;
