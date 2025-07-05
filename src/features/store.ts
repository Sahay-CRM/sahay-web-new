import { configureStore } from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

import authReducer from "./reducers/auth.reducer";
import notificationReducer from "./reducers/notification.reducer";
import meetingTimersReducer from "./reducers/meetingTimers.reducer";

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["notification"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
  meetingTimers: meetingTimersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export default store;
