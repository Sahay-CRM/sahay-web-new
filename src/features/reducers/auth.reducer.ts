import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of your state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  userPermission: {},
  userId: "",
  kpiData: {
    dataPointEmpId: "",
    startDate: "",
    endDate: "",
    selectFrequency: "",
  },
  fireBaseToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.token = action.payload.token;
      state.isLoading = action.payload.isLoading;
      state.userId = action.payload.userId;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserPermission: (state, action: PayloadAction<PermissionsResponse>) => {
      state.userPermission = action.payload;
    },
    setKpiData: (state, action: PayloadAction<KpiData>) => {
      state.kpiData = action.payload;
    },
    setFireBaseToken: (state, action: PayloadAction<string>) => {
      state.fireBaseToken = action.payload;
    },
    logout: () => initialState,
  },
});

// Export actions and reducer
export const {
  setAuth,
  setUserPermission,
  setUser,
  logout,
  setKpiData,
  setUserId,
  setFireBaseToken,
} = authSlice.actions;
export default authSlice.reducer;
