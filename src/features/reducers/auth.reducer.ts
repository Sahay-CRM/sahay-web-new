import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  adminUserId?: string;
  employeeId?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userPermission: Record<string, unknown>;
}

// Define the initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  userPermission: {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state: AuthState, action: PayloadAction<AuthState>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = action.payload.isLoading;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    setUserPermission: (state: AuthState, action: PayloadAction<PermissionsResponse>) => {
      state.userPermission = action.payload;
    },
    logout: () => initialState,
  },
});

// Export actions and reducer
export const { setAuth, setUserPermission, logout } = authSlice.actions;
export default authSlice.reducer;
