import Axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import store from "../store";
import { size } from "lodash";

const axiosInstance = Axios.create({
  timeout: 900000,
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token;
  // const token = store.getState().user.token;
  if (config.headers && size(token)) {
    config.headers["authorization"] = token ? `Bearer ${token}` : "";
  }
  return config;
});

export default class Api {
  //   /**
  //    * GET METHOD
  //    * @param {AxiosRequestConfig} config
  //    * @returns {Promise<AxiosResponse<T>>}
  //    */
  static get<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, ...restConfig } = config;
    return axiosInstance.get<T>(url!, restConfig);
  }

  /**
   * POST METHOD
   * @param {AxiosRequestConfig} config
   * @returns {Promise<AxiosResponse<T>>}
   */
  static post<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, data, ...restConfig } = config;
    return axiosInstance.post<T>(url!, data, restConfig);
  }
  /**
   * DELETE METHOD
   * @param {AxiosRequestConfig} config
   * @returns {Promise<AxiosResponse<T>>}
   */
  static delete<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url } = config;
    return axiosInstance.delete<T>(url!);
  }

  /**
   * PUT METHOD
   * @param {AxiosRequestConfig} config
   * @returns {Promise<AxiosResponse<T>>}
   */
  static put<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, data, ...restConfig } = config;
    return axiosInstance.put<T>(url!, data, restConfig);
  }
}

// To cancel API

export const getNewAbortController = (): AbortController =>
  new AbortController();
