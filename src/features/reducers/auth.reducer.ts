import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface AuthState {
  token: string | null;
  user: unknown | null;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}
// Define the structure of your state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = action.payload.isLoading;
      state.isAuthenticated = action.payload.isAuthenticated;
    },

    logout: () => initialState,
  },
});

// Export actions and reducer
export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
