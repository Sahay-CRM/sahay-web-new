import Axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import store from "../store";
import { size } from "lodash";
import { logout } from "@/features/reducers/auth.reducer";

const axiosInstance = Axios.create({
  timeout: 900000,
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token;
  if (config.headers && size(token)) {
    config.headers["authorization"] = token ? `Bearer ${token}` : "";
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (
      status === 401 ||
      message === "Invalid jwt token" ||
      message === "Unauthorized"
    ) {
      localStorage.clear();
      store.dispatch(logout());
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default class Api {
  static get<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, ...restConfig } = config;
    return axiosInstance.get<T>(url!, restConfig);
  }

  static post<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, data, ...restConfig } = config;
    return axiosInstance.post<T>(url!, data, restConfig);
  }

  static delete<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url } = config;
    return axiosInstance.delete<T>(url!);
  }

  static put<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, data, ...restConfig } = config;
    return axiosInstance.put<T>(url!, data, restConfig);
  }
}

// To cancel API
export const getNewAbortController = (): AbortController =>
  new AbortController();
