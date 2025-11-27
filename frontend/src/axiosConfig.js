// Axios 全局配置
import axios from 'axios';

// 请求拦截器：自动添加 Token 到请求头
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 Token 过期
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token 无效或过期，清除并跳转到登录
      localStorage.removeItem('authToken');
      // 可以在这里触发重新登录
    }
    return Promise.reject(error);
  }
);

export default axios;

