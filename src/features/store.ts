import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.reducer";
import type { AuthState } from "./reducers/auth.reducer";

export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
