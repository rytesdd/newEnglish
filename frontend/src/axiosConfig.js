// Axios 全局配置
import axios from 'axios';

// 设置默认配置，确保所有请求都携带 Cookie
axios.defaults.withCredentials = true;

// 设置默认请求头
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common['Pragma'] = 'no-cache';

export default axios;

