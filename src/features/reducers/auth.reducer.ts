import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of your state
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
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = action.payload.isLoading;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    setUserPermission: (state, action: PayloadAction<PermissionsResponse>) => {
      state.userPermission = action.payload;
    },
    logout: () => initialState,
  },
});

// Export actions and reducer
export const { setAuth, setUserPermission, logout } = authSlice.actions;
export default authSlice.reducer;
