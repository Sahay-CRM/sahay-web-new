export const getToken = (store: RootState): string | null => store.auth?.token;

export const getIsLoading = (store: RootState): boolean => store.auth.isLoading;

export const getUserDetail = (store: RootState): User =>
  store.auth.user as User;

export const getUserPermission = (store: RootState): PermissionsResponse =>
  store.auth.userPermission as PermissionsResponse;

export const getKpiData = (store: RootState): KpiData =>
  store.auth.kpiData as KpiData;
