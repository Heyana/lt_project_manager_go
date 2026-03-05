import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data;

    // 业务成功
    if (code === 200) {
      return data;
    }

    // 业务失败
    console.error(`API Error: ${msg}`);
    return Promise.reject(new Error(msg || "请求失败"));
  },
  (error) => {
    // HTTP 错误
    const message = error.response?.data?.msg || error.message || "网络错误";
    console.error(`HTTP Error: ${message}`);
    return Promise.reject(error);
  },
);

export default request;
