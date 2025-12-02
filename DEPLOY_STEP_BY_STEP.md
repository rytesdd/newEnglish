# 🚀 前后端分离部署 - 详细步骤指南

本指南将一步一步教你如何将项目部署到生产环境。

## 📋 部署架构

- **后端**：部署到 Railway（提供 API 服务）
- **前端**：部署到 Vercel（提供用户界面）

---

## 第一步：准备 GitHub 仓库

### 1.1 确保代码已提交到 GitHub

如果你还没有 GitHub 仓库，按以下步骤操作：

1. **在 GitHub 上创建新仓库**
   - 访问 https://github.com/new
   - 仓库名称：`file-parser-tool`（或你喜欢的名字）
   - 选择 Public 或 Private
   - 点击 "Create repository"

2. **将本地代码推送到 GitHub**

打开终端，执行以下命令：

```bash
cd /Users/cc/file-parser-tool

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "准备部署"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/file-parser-tool.git

# 推送到 GitHub
git push -u origin main
```

**注意**：如果遇到错误，可能需要先创建分支：
```bash
git branch -M main
```

---

## 第二步：部署后端到 Railway

### 2.1 注册 Railway 账号

1. 访问 https://railway.app
2. 点击右上角 "Login"
3. 选择 "Login with GitHub"
4. 授权 Railway 访问你的 GitHub 账号

### 2.2 创建新项目

1. 登录后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 在列表中找到你的 `file-parser-tool` 仓库
4. 点击仓库名称

### 2.3 配置后端服务

Railway 会自动检测到你的项目，但我们需要配置一下：

1. **点击项目进入详情页**
2. **点击服务（Service）的设置（Settings）**

#### 配置构建和启动命令：

1. 在设置中找到 "Build & Deploy" 部分
2. 设置以下内容：

   **Build Command（构建命令）：**
   ```
   cd backend && npm install
   ```

   **Start Command（启动命令）：**
   ```
   cd backend && npm start
   ```

   **Root Directory（根目录）：**
   ```
   （留空，使用项目根目录）
   ```

#### 添加 Python 支持（用于 YouTube 字幕）：

1. 在设置中找到 "Environment" 部分
2. 点击 "Add Variable"
3. 添加变量：
   - Key: `NIXPACKS_PYTHON_VERSION`
   - Value: `3.11`

### 2.4 设置环境变量

在 Railway 项目设置中，找到 "Variables" 标签页，添加以下环境变量：

#### 必需的环境变量：

1. **PASSWORD**（登录密码）
   - Key: `PASSWORD`
   - Value: 输入一个强密码，例如：`MySecurePass123!@#`

2. **SESSION_SECRET**（Session 密钥）
   - Key: `SESSION_SECRET`
   - Value: 生成一个随机字符串（至少 32 个字符）
   
   可以在终端运行以下命令生成：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   复制输出的字符串作为值

3. **NODE_ENV**（环境模式）
   - Key: `NODE_ENV`
   - Value: `production`

4. **ALLOWED_ORIGINS**（允许的前端域名）
   - Key: `ALLOWED_ORIGINS`
   - Value: 暂时留空，等前端部署后再填写
   - 格式：`https://your-frontend.vercel.app`（多个用逗号分隔）

#### 可选的环境变量（用于翻译功能）：

如果你有 OpenAI 或其他大模型 API，可以添加：

5. **LLM_API_KEY**
   - Key: `LLM_API_KEY`
   - Value: 你的 API 密钥

6. **LLM_API_URL**
   - Key: `LLM_API_URL`
   - Value: `https://api.openai.com/v1/chat/completions`

7. **LLM_MODEL**
   - Key: `LLM_MODEL`
   - Value: `gpt-3.5-turbo`

### 2.5 获取后端 URL

1. 部署完成后，Railway 会提供一个 URL
2. 点击服务（Service）的 "Settings"
3. 找到 "Domains" 部分
4. 会显示类似：`your-project.up.railway.app`
5. **复制这个 URL**，稍后会用到

**示例 URL**：`https://file-parser-backend-production.up.railway.app`

### 2.6 更新 ALLOWED_ORIGINS

等前端部署完成后，回到这里更新 `ALLOWED_ORIGINS` 环境变量，添加前端域名。

---

## 第三步：部署前端到 Vercel

### 3.1 注册 Vercel 账号

1. 访问 https://vercel.com
2. 点击右上角 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub 账号

### 3.2 导入项目

1. 登录后，点击 "Add New..." -> "Project"
2. 在 "Import Git Repository" 中找到你的 `file-parser-tool` 仓库
3. 点击 "Import"

### 3.3 配置前端项目

Vercel 会自动检测到 React 项目，但需要配置：

#### 项目设置：

1. **Framework Preset（框架预设）**
   - 选择：`Create React App`

2. **Root Directory（根目录）**
   - 点击 "Edit"
   - 输入：`frontend`
   - 点击 "Continue"

3. **Build and Output Settings（构建和输出设置）**
   - Build Command: `npm run build`（应该自动填充）
   - Output Directory: `build`（应该自动填充）
   - Install Command: `npm install`（应该自动填充）

### 3.4 设置环境变量

在 "Environment Variables" 部分，添加：

1. **REACT_APP_API_URL**
   - Key: `REACT_APP_API_URL`
   - Value: 你的 Railway 后端 URL（第二步获取的）
   - 例如：`https://file-parser-backend-production.up.railway.app`

**重要**：确保 URL 以 `https://` 开头，且没有末尾斜杠 `/`

### 3.5 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 1-3 分钟）
3. 部署成功后，Vercel 会提供一个 URL

**示例 URL**：`https://file-parser-tool.vercel.app`

### 3.6 获取前端 URL

1. 部署完成后，在项目页面可以看到你的域名
2. **复制这个 URL**，格式类似：`https://your-project.vercel.app`

---

## 第四步：更新后端 CORS 配置

### 4.1 回到 Railway

1. 打开你的 Railway 项目
2. 进入服务（Service）的 "Variables" 设置

### 4.2 更新 ALLOWED_ORIGINS

1. 找到 `ALLOWED_ORIGINS` 变量
2. 点击编辑
3. 输入你的 Vercel 前端 URL：
   ```
   https://your-project.vercel.app
   ```
4. 如果有多个域名，用逗号分隔：
   ```
   https://your-project.vercel.app,https://www.your-project.vercel.app
   ```
5. 保存

### 4.3 重新部署

Railway 会自动检测到环境变量变化并重新部署。

---

## 第五步：测试部署

### 5.1 测试前端

1. 打开你的 Vercel 前端 URL
2. 应该能看到登录页面
3. 使用你在 Railway 设置的 `PASSWORD` 登录

### 5.2 测试功能

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

### 5.3 检查错误

如果遇到问题：

1. **打开浏览器开发者工具**（按 F12）
2. **查看 Console 标签**，看是否有错误
3. **查看 Network 标签**，检查 API 请求是否成功

---

## 常见问题解决

### ❌ 问题 1：登录后显示 "无法连接到服务器"

**原因**：前端无法连接到后端 API

**解决方法**：
1. 检查 Vercel 的 `REACT_APP_API_URL` 是否正确
2. 检查 Railway 后端是否正在运行
3. 检查浏览器控制台的错误信息

### ❌ 问题 2：CORS 错误

**原因**：后端没有允许前端域名

**解决方法**：
1. 在 Railway 的 `ALLOWED_ORIGINS` 中添加前端域名
2. 确保 URL 格式正确（包含 `https://`）
3. 重新部署后端

### ❌ 问题 3：YouTube 字幕获取失败

**原因**：Railway 没有安装 Python

**解决方法**：
1. 在 Railway 设置中添加环境变量：
   - Key: `NIXPACKS_PYTHON_VERSION`
   - Value: `3.11`
2. 重新部署

### ❌ 问题 4：文件上传失败

**原因**：可能是文件大小或权限问题

**解决方法**：
1. 检查文件大小是否超过 50MB
2. 检查文件格式是否支持（TXT、PDF、DOC、DOCX）

---

## 🎉 完成！

如果所有测试都通过，恭喜你！你的应用已经成功部署到生产环境了！

### 你的应用地址：
- **前端**：`https://your-project.vercel.app`
- **后端 API**：`https://your-backend.up.railway.app`

### 后续维护：

1. **更新代码**：
   - 在本地修改代码
   - 提交到 GitHub
   - Railway 和 Vercel 会自动重新部署

2. **查看日志**：
   - Railway：在服务页面查看 "Deployments" -> "View Logs"
   - Vercel：在项目页面查看 "Deployments" -> 点击部署 -> "View Function Logs"

3. **环境变量更新**：
   - 在各自平台的项目设置中修改
   - 修改后会自动重新部署

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看浏览器控制台的错误信息
2. 查看 Railway 和 Vercel 的部署日志
3. 检查环境变量是否正确设置

祝你部署顺利！🚀




