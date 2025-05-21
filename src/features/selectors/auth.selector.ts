export const getToken = (store: RootState): string | null => store.auth?.token;

export const getIsLoading = (store: RootState): boolean => store.auth.isLoading;
