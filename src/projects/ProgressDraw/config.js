// Progress Draw 配置文件
export const CONFIG = {
  // 管理员密码配置 (可以设置多个密码)
  ADMIN_PASSWORDS: [
    'admin0713', // 默认密码
  ],

  // GitHub 配置 (用于数据存储)
  GITHUB: {
    OWNER: 'harrytothemoon', // 替换为您的GitHub用户名 (必填)
    REPO: 'lottery', // repository名称 (必填)
    BRANCH: 'main', // 分支名称
    DATA_FILE: 'public/progress-data.json', // 数据文件路径
    TOKEN: process.env.REACT_APP_GITHUB_TOKEN, // GitHub Personal Access Token (可选，但推荐)
  },

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
    ENABLE_OFFLINE_MODE: true, // 离线模式 (fallback到localStorage)
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

// GitHub API 辅助函数
export const githubAPI = {
  // 获取数据文件
  async getData() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${CONFIG.GITHUB.OWNER}/${CONFIG.GITHUB.REPO}/contents/${CONFIG.GITHUB.DATA_FILE}`,
        {
          headers: CONFIG.GITHUB.TOKEN
            ? {
                Authorization: `token ${CONFIG.GITHUB.TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
              }
            : {},
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        return { success: true, data: content, sha: data.sha };
      } else if (response.status === 404) {
        // 文件不存在，返回默认数据
        return {
          success: true,
          data: { accountList: {}, milestones: [] },
          sha: null,
        };
      } else {
        throw new Error(`GitHub API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('获取GitHub数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 保存数据到GitHub
  async saveData(data, sha = null) {
    if (!CONFIG.GITHUB.TOKEN) {
      throw new Error('需要配置GitHub Token才能保存数据');
    }

    try {
      const content = btoa(JSON.stringify(data, null, 2));
      const response = await fetch(
        `https://api.github.com/repos/${CONFIG.GITHUB.OWNER}/${CONFIG.GITHUB.REPO}/contents/${CONFIG.GITHUB.DATA_FILE}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${CONFIG.GITHUB.TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update progress data - ${new Date().toISOString()}`,
            content: content,
            branch: CONFIG.GITHUB.BRANCH,
            ...(sha && { sha }), // 只有在sha存在时才包含
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return { success: true, sha: result.content.sha };
      } else {
        throw new Error(`GitHub API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('保存GitHub数据失败:', error);
      return { success: false, error: error.message };
    }
  },
};
