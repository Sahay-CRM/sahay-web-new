import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CompanyBasicInfo {
  companyId: string;
  name: string;
  isCurrentCompany?: boolean;
}

const initialState: CompanyBasicInfo[] = [];

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompaniesList: (_state, action: PayloadAction<CompanyBasicInfo[]>) => {
      return action.payload;
    },
    clearCompaniesList: () => {
      return [];
    },
  },
});

export const { setCompaniesList, clearCompaniesList } = companySlice.actions;
export default companySlice.reducer;
