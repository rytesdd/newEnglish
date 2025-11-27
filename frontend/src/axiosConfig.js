// Axios 全局配置
import axios from 'axios';

// 设置默认配置，确保所有请求都携带 Cookie
axios.defaults.withCredentials = true;

// 注意：不设置默认的 Cache-Control 头，因为 CORS 预检请求可能不允许
// 如果需要禁用缓存，可以在具体的请求中设置
// axios.defaults.headers.common['Cache-Control'] = 'no-cache';
// axios.defaults.headers.common['Pragma'] = 'no-cache';

export default axios;

