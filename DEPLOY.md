# 部署指南

本文档提供了将文件解析工具部署到生产环境的详细步骤。

## 📋 部署前准备

### 1. 环境变量配置

在部署之前，需要准备以下环境变量：

#### 必需的环境变量

- `PASSWORD`: 登录密码（建议使用强密码）
- `SESSION_SECRET`: Session 加密密钥（建议使用随机字符串，至少 32 个字符）

#### 可选的环境变量

- `LLM_API_KEY`: 大模型 API 密钥（用于翻译功能）
- `LLM_API_URL`: 大模型 API 地址（例如：`https://api.openai.com/v1/chat/completions`）
- `LLM_MODEL`: 模型名称（例如：`gpt-3.5-turbo`）
- `ALLOWED_ORIGINS`: 允许的前端域名，多个用逗号分隔（例如：`https://yourdomain.com,https://www.yourdomain.com`）
- `PORT`: 服务器端口（默认：3001，大多数平台会自动设置）
- `NODE_ENV`: 环境模式（设置为 `production`）

## 🚀 部署方式

### 方式一：Railway 部署（推荐）

Railway 是一个简单易用的部署平台，支持自动部署。

#### 步骤：

1. **注册 Railway 账号**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**
   - 在项目设置中添加所有必需的环境变量
   - 确保 `NODE_ENV=production`
   - 设置 `ALLOWED_ORIGINS` 为你的前端域名

4. **配置构建和启动**
   - Railway 会自动检测 `railway.json` 配置
   - 或者手动设置：
     - Build Command: `npm run install-all && cd frontend && npm run build`
     - Start Command: `cd backend && npm start`

5. **部署**
   - Railway 会自动部署
   - 部署完成后会提供一个 URL

#### 注意事项：
- Railway 会自动提供 HTTPS
- 需要安装 Python 运行时（用于 YouTube 字幕获取）
- 在 Railway 设置中添加 Python buildpack

---

### 方式二：Render 部署

Render 提供免费和付费的部署选项。

#### 步骤：

1. **注册 Render 账号**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New" -> "Web Service"
   - 连接你的 GitHub 仓库

3. **配置服务**
   - 使用 `render.yaml` 中的配置，或手动设置：
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Root Directory: 留空

4. **设置环境变量**
   - 在 Environment Variables 中添加所有必需变量

5. **部署**
   - 点击 "Create Web Service"
   - Render 会自动部署

#### 注意事项：
- Render 免费版有休眠限制
- 需要单独部署前端（静态站点）或使用 Docker

---

### 方式三：Vercel 部署

Vercel 非常适合前端部署，但后端需要单独处理。

#### 步骤：

1. **部署后端**
   - 使用 Railway 或 Render 部署后端 API

2. **部署前端**
   - 访问 https://vercel.com
   - 导入你的 GitHub 仓库
   - 设置：
     - Framework Preset: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **配置环境变量**
   - 在 Vercel 项目设置中添加：
     - `REACT_APP_API_URL`: 你的后端 API 地址（例如：`https://your-backend.railway.app`）

4. **部署**
   - Vercel 会自动部署

---

### 方式四：Docker 部署

使用 Docker 可以在任何支持 Docker 的平台上部署（如 AWS、Google Cloud、Azure 等）。

#### 步骤：

1. **构建 Docker 镜像**
   ```bash
   docker build -t file-parser-tool .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     -p 3001:3001 \
     -e PASSWORD=your-password \
     -e SESSION_SECRET=your-secret \
     -e NODE_ENV=production \
     -e ALLOWED_ORIGINS=https://yourdomain.com \
     file-parser-tool
   ```

3. **使用 Docker Compose**
   创建 `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - PASSWORD=${PASSWORD}
         - SESSION_SECRET=${SESSION_SECRET}
         - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
       volumes:
         - ./uploads:/app/uploads
         - ./word-groups.json:/app/word-groups.json
   ```

---

## 🔧 部署后配置

### 1. 配置前端 API 地址

如果前端和后端部署在不同的域名：

1. 在部署平台设置环境变量 `REACT_APP_API_URL`
2. 值为你的后端 API 地址（例如：`https://your-backend.railway.app`）

### 2. 配置 CORS

在后端环境变量中设置 `ALLOWED_ORIGINS`：
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com
```

### 3. 测试部署

1. 访问前端 URL
2. 使用设置的密码登录
3. 测试文件上传功能
4. 测试 YouTube 字幕获取功能

---

## 📝 常见问题

### Q: YouTube 字幕获取失败？
A: 确保服务器已安装 Python 3 和 `youtube-transcript-api`：
```bash
pip3 install youtube-transcript-api
```

### Q: 文件上传失败？
A: 检查：
- 上传目录权限
- 文件大小限制（默认 50MB）
- 服务器存储空间

### Q: CORS 错误？
A: 确保：
- `ALLOWED_ORIGINS` 环境变量包含前端域名
- 前端 `REACT_APP_API_URL` 指向正确的后端地址

### Q: Session 不工作？
A: 确保：
- `SESSION_SECRET` 已设置
- 生产环境使用 HTTPS（`secure: true`）
- Cookie 的 `sameSite` 设置正确

---

## 🔒 安全建议

1. **使用强密码**：设置复杂的 `PASSWORD`
2. **随机 Session Secret**：使用至少 32 个字符的随机字符串
3. **HTTPS 部署**：所有生产环境都应使用 HTTPS
4. **限制 CORS**：只允许必要的域名
5. **环境变量保护**：不要将敏感信息提交到代码仓库

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 服务器日志
2. 浏览器控制台错误
3. 网络请求状态

祝部署顺利！🎉

