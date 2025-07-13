# Progress Lottery System 配置指南

## 🎯 功能特性

- **数据持久化**: 支持 GitHub 在线存储 + localStorage 离线备份
- **权限控制**: Query 参数控制 + 多密码验证
- **实时同步**: 在线/离线状态监测和数据同步
- **管理面板**: 文件上传、里程碑设置、数据管理

## 🔧 配置步骤

### 1. 基础配置

编辑 `src/projects/ProgressDraw/config.js` 文件：

```javascript
export const CONFIG = {
  // 修改为您的GitHub信息
  GITHUB: {
    OWNER: 'your-username', // 您的GitHub用户名
    REPO: 'lottery', // repository名称
    BRANCH: 'main', // 分支名称
    DATA_FILE: 'public/progress-data.json', // 数据文件路径
  },

  // 自定义管理员密码
  ADMIN_PASSWORDS: [
    'your-secure-password', // 添加您的密码
    'backup-password', // 备用密码
  ],

  // 自定义访问参数
  ADMIN_QUERY_PARAMS: {
    key: 'admin', // 可改为其他参数名
    value: 'true', // 可改为其他值
  },
};
```

### 2. GitHub Token 配置 (可选)

如果需要 GitHub 在线存储功能：

1. **生成 GitHub Token**:

   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 token

2. **配置环境变量**:

   - 在项目根目录创建 `.env` 文件
   - 添加: `REACT_APP_GITHUB_TOKEN=your_token_here`
   - **注意**: 不要将 token 提交到代码库

3. **部署到 GitHub Pages**:
   - 在 GitHub repository 的 Settings > Secrets 中添加 token
   - 在 GitHub Actions 中配置环境变量

## 🚀 使用方法

### 普通用户访问

```
https://your-site.com/progress
```

- 只能查看数据和搜索
- 看不到管理员按钮

### 管理员访问

```
https://your-site.com/progress?admin=true
```

- 显示设置按钮
- 需要密码验证
- 可以上传数据和管理系统

### 管理员功能

- 📁 **上传 CSV 文件**: 批量导入参与者数据
- 🏆 **设置里程碑**: 自定义奖品和门槛
- 🔄 **同步数据**: 手动刷新 GitHub 数据
- 🗑️ **清除数据**: 重置所有数据
- 🚪 **退出管理**: 注销管理员权限

## 📊 数据格式

CSV 文件格式：

```csv
username,ticket
player001,T001
player001,T002
player002,T003
```

## 🛡️ 安全特性

- **权限控制**: 只有特定 URL 才显示管理功能
- **多密码支持**: 可配置多个管理员密码
- **尝试限制**: 防止暴力破解
- **自动登出**: 可配置会话超时时间
- **本地备份**: 即使 GitHub 不可用也能工作

## 🌐 部署说明

### GitHub Pages 部署

1. 配置好所有设置
2. 提交代码到 GitHub
3. 在 repository 设置中启用 GitHub Pages
4. 访问 `https://username.github.io/lottery/progress?admin=true`

### 离线模式

- 即使没有配置 GitHub Token，系统也能正常工作
- 数据会保存在浏览器 localStorage 中
- 适合本地使用或简单部署

## 🔧 故障排除

### 常见问题

1. **无法保存到 GitHub**:

   - 检查 GitHub Token 是否正确
   - 确认 TOKEN 有 repo 权限
   - 检查 repository 和分支名称

2. **管理员按钮不显示**:

   - 确认 URL 包含 `?admin=true`
   - 检查 config.js 中的 ADMIN_QUERY_PARAMS 设置

3. **密码验证失败**:

   - 检查 config.js 中的 ADMIN_PASSWORDS 配置
   - 注意密码区分大小写

4. **数据丢失**:
   - 数据同时保存在 GitHub 和 localStorage
   - 可以通过"同步数据"按钮恢复

## 📱 浏览器兼容性

- ✅ Chrome (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE 不支持

## 🎮 自定义主题

系统使用电玩风格的霓虹灯主题，您可以在组件中自定义：

- 颜色方案
- 动画效果
- 布局样式

---

**🎯 技术支持**: 如有问题请检查浏览器控制台的错误信息
