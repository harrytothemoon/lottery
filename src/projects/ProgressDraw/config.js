// Progress Draw 配置文件
export const CONFIG = {
  // 管理员密码配置 (可以设置多个密码)
  ADMIN_PASSWORDS: [
    'admin0713', // 默认密码
  ],

  // 管理员访问控制
  ADMIN_QUERY_PARAMS: {
    key: 'admin', // query参数名
    value: 'true', // query参数值
    // 访问URL示例: /progress?admin=true
  },

  // 安全设置
  SECURITY: {
    PASSWORD_HASH_ENABLED: false, // 是否启用密码加密 (简单模式关闭)
    AUTO_LOGOUT_MINUTES: 60, // 自动登出时间 (分钟)
    MAX_LOGIN_ATTEMPTS: 3, // 最大尝试次数
  },

  // 应用设置
  APP: {
    DATA_CACHE_MINUTES: 5, // 数据缓存时间
  },
};

// 密码验证函数
export const verifyPassword = inputPassword => {
  return CONFIG.ADMIN_PASSWORDS.includes(inputPassword);
};

// 检查是否有管理员权限的query参数
export const hasAdminQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get(CONFIG.ADMIN_QUERY_PARAMS.key);
  return adminParam === CONFIG.ADMIN_QUERY_PARAMS.value;
};
