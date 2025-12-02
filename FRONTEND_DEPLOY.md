# 🎨 前端部署到 Vercel - 详细步骤

本指南将一步一步教你如何将前端部署到 Vercel。

---

## 📋 部署前准备

### 1. 确认后端已启动

**后端 URL**：`https://web-production-3aff5.up.railway.app`

**测试后端**：
- 访问：`https://web-production-3aff5.up.railway.app/api/health`
- 应该返回：`{"status":"ok"}`

如果后端未启动，请先修复后端问题。

---

## 🚀 第一步：注册/登录 Vercel

### 1.1 访问 Vercel

1. 打开浏览器
2. 访问：https://vercel.com
3. 点击右上角 "Sign Up" 或 "Log In"

### 1.2 使用 GitHub 登录

1. 选择 "Continue with GitHub"
2. 授权 Vercel 访问你的 GitHub 账号
3. 完成登录

---

## 📦 第二步：导入项目

### 2.1 创建新项目

1. 登录后，点击右上角的 **"Add New..."** 按钮
2. 选择 **"Project"**

### 2.2 选择仓库

1. 在 "Import Git Repository" 页面
2. 找到你的仓库：`rytesdd/newEnglish`
3. 如果看不到，点击 "Adjust GitHub App Permissions" 授权
4. 点击仓库名称

### 2.3 配置项目

Vercel 会自动检测到 React 项目，但需要配置：

#### 项目设置：

1. **Framework Preset（框架预设）**
   - 应该自动选择：`Create React App`
   - 如果没有，手动选择：`Create React App`

2. **Root Directory（根目录）** ⚠️ **重要！**
   - 点击 "Edit" 按钮
   - 输入：`frontend`
   - 点击 "Continue"

3. **Build and Output Settings（构建和输出设置）**
   - Build Command: `npm run build`（应该自动填充）
   - Output Directory: `build`（应该自动填充）
   - Install Command: `npm install`（应该自动填充）

**确认这些设置正确后，点击 "Continue"**

---

## 🔐 第三步：设置环境变量

### 3.1 添加环境变量

在 "Environment Variables" 部分：

1. 点击 "Add" 或 "+" 按钮
2. 添加以下环境变量：

#### 必需的环境变量：

**REACT_APP_API_URL**
- Key: `REACT_APP_API_URL`
- Value: `https://web-production-3aff5.up.railway.app`
- Environment: 选择 `Production`, `Preview`, `Development`（全选）

**重要**：
- ✅ 确保 URL 以 `https://` 开头
- ✅ 确保 URL 没有末尾斜杠 `/`
- ✅ 确保 URL 是正确的后端地址

### 3.2 确认环境变量

添加后，应该看到：
```
REACT_APP_API_URL = https://web-production-3aff5.up.railway.app
```

---

## 🚀 第四步：部署

### 4.1 开始部署

1. 确认所有设置都正确
2. 点击 **"Deploy"** 按钮
3. 等待构建完成（通常需要 1-3 分钟）

### 4.2 查看构建进度

部署过程中，你会看到：
- "Building..." - 正在构建
- "Installing dependencies..." - 安装依赖
- "Building application..." - 构建应用
- "Deploying..." - 部署中

---

## ✅ 第五步：获取前端 URL

### 5.1 部署完成

部署成功后，Vercel 会显示：
- ✅ "Congratulations! Your project has been deployed."
- 你的项目 URL（例如：`https://file-parser-tool.vercel.app`）

### 5.2 复制前端 URL

1. 复制显示的 URL
2. **📝 记下这个 URL**，稍后会用到

**示例 URL**：`https://file-parser-tool-xxx.vercel.app`

---

## 🔗 第六步：更新后端 CORS 配置

### 6.1 回到 Railway

1. 打开 Railway 项目页面
2. 进入服务（Service）的 "Variables" 设置

### 6.2 更新 ALLOWED_ORIGINS

1. 找到 `ALLOWED_ORIGINS` 变量
2. 点击编辑
3. 输入你的 Vercel 前端 URL：
   ```
   https://你的项目.vercel.app
   ```
4. 如果有多个域名，用逗号分隔：
   ```
   https://你的项目.vercel.app,https://www.你的项目.vercel.app
   ```
5. 保存

### 6.3 重新部署后端（如果需要）

Railway 会自动检测到环境变量变化并重新部署。

---

## 🧪 第七步：测试部署

### 7.1 测试前端

1. 打开你的 Vercel 前端 URL
2. 应该能看到登录页面
3. 使用你在 Railway 设置的 `PASSWORD` 登录

### 7.2 测试功能

依次测试以下功能：

1. ✅ **登录功能**
   - 输入密码，应该能成功登录

2. ✅ **文件上传**
   - 点击 "上传文件" 标签
   - 上传一个 TXT 文件，检查是否能解析

3. ✅ **YouTube 字幕**
   - 点击 "YouTube 链接" 标签
   - 输入一个 YouTube 视频链接
   - 检查是否能获取字幕

4. ✅ **单词选择**
   - 在解析的文本中点击单词
   - 检查是否能选中

---

## ❓ 常见问题

### 问题 1：登录后显示 "无法连接到服务器"

**原因**：前端无法连接到后端 API

**解决方法**：
1. 检查 Vercel 的 `REACT_APP_API_URL` 是否正确
2. 检查后端是否正在运行
3. 检查浏览器控制台的错误信息（按 F12）

### 问题 2：CORS 错误

**原因**：后端没有允许前端域名

**解决方法**：
1. 在 Railway 的 `ALLOWED_ORIGINS` 中添加前端域名
2. 确保 URL 格式正确（包含 `https://`）
3. 重新部署后端

### 问题 3：构建失败

**原因**：可能是依赖问题或配置错误

**解决方法**：
1. 查看 Vercel 的构建日志
2. 检查是否有错误信息
3. 确保 Root Directory 设置为 `frontend`

---

## 📝 部署信息总结

### 后端信息
- **URL**: `https://web-production-3aff5.up.railway.app`
- **平台**: Railway
- **状态**: 应该正在运行

### 前端信息（部署后填写）
- **URL**: `https://你的项目.vercel.app`
- **平台**: Vercel
- **状态**: 待部署

---

## 🎉 完成！

如果所有测试都通过，恭喜你！你的应用已经成功部署到生产环境了！

### 你的应用地址：
- **前端**：`https://你的项目.vercel.app`
- **后端 API**：`https://web-production-3aff5.up.railway.app`

---

## 📞 需要帮助？

如果遇到问题：
1. 查看浏览器控制台的错误信息（按 F12）
2. 查看 Vercel 的构建日志
3. 检查环境变量是否正确设置

祝你部署顺利！🚀




