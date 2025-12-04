// API 配置
// 在生产环境中，使用环境变量 REACT_APP_API_URL
// 在开发环境中，默认使用 localhost:3001

const getApiUrl = () => {
  // 如果设置了环境变量，使用环境变量
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 开发环境默认使用 localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // 生产环境：如果前端和后端部署在同一域名下，使用相对路径
  // 如果部署在不同域名，需要设置 REACT_APP_API_URL 环境变量
  return window.location.origin;
};

export const API_BASE_URL = getApiUrl();

// API 端点
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  CHECK_AUTH: `${API_BASE_URL}/api/check-auth`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  YOUTUBE_TRANSCRIPT: `${API_BASE_URL}/api/youtube-transcript`,
  TRANSLATE: `${API_BASE_URL}/api/translate`,
  WORD_GROUPS: `${API_BASE_URL}/api/word-groups`,
  WORD_GROUPS_ADD: `${API_BASE_URL}/api/word-groups/add`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;





