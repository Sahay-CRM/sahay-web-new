import Axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

// //   import store from "../data/store";
// import { get } from "lodash";

const axiosInstance = Axios.create({
  timeout: 900000,
});

// // Passing token if found in authorization
// axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   // const token = store.getState().auth.token;
//   // if (config.headers && size(token)) {
//   //   config.headers["Authorization"] = token ? token : "";
//   // }
//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (err) => {
//     // Dispatch logout action if request unauthorized
//     const status = get(err, "response.status", 0);
//     if (status === 401) {
//       // TODO: Clear all reducers and redirect to login
//     }
//     return Promise.reject(err);
//   }
// );

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
   * POST METHOD
   * @param {AxiosRequestConfig} config
   * @returns {Promise<AxiosResponse<T>>}
   */
  static delete<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url } = config;
    return axiosInstance.delete<T>(url!);
  }
}

// To cancel API

export const getNewAbortController = (): AbortController =>
  new AbortController();
