# 🚀 快速开始 - 5 步部署指南

这是最简化的部署步骤，适合小白用户。

---

## ⚡ 第一步：准备 GitHub 仓库（5 分钟）

### 1. 创建 GitHub 仓库

1. 访问：https://github.com/new
2. 仓库名：`file-parser-tool`
3. 选择 Public
4. 点击 "Create repository"

### 2. 上传代码到 GitHub

打开终端（Terminal），执行：

```bash
cd /Users/cc/file-parser-tool
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/file-parser-tool.git
git push -u origin main
```

**替换** `你的用户名` 为你的 GitHub 用户名

---

## 🔧 第二步：部署后端到 Railway（10 分钟）

### 1. 注册并登录

- 访问：https://railway.app
- 点击 "Login with GitHub"

### 2. 创建项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的 `file-parser-tool` 仓库

### 3. 配置服务

在服务设置中：

**Build Command（构建命令）：**
```
cd backend && npm install
```

**Start Command（启动命令）：**
```
cd backend && npm start
```

### 4. 添加环境变量

在 "Variables" 标签页，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PASSWORD` | `你的密码` | 登录密码，例如：`MyPass123!` |
| `SESSION_SECRET` | `随机字符串` | 运行命令生成：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` | 固定值 |
| `NIXPACKS_PYTHON_VERSION` | `3.11` | 用于 YouTube 字幕 |

### 5. 获取后端 URL

部署完成后，在服务设置中找到 "Domains"，复制 URL
例如：`https://file-parser-production.up.railway.app`

**📝 记下这个 URL，下一步要用！**

---

## 🎨 第三步：部署前端到 Vercel（5 分钟）

### 1. 注册并登录

- 访问：https://vercel.com
- 点击 "Sign Up" -> "Continue with GitHub"

### 2. 导入项目

1. 点击 "Add New..." -> "Project"
2. 选择你的 `file-parser-tool` 仓库
3. 点击 "Import"

### 3. 配置项目

在项目设置中：

**Root Directory（根目录）：**
```
frontend
```

**Environment Variables（环境变量）：**

添加一个变量：
- Key: `REACT_APP_API_URL`
- Value: 第二步获取的 Railway URL（例如：`https://file-parser-production.up.railway.app`）

### 4. 部署

点击 "Deploy"，等待完成

### 5. 获取前端 URL

部署完成后，复制你的 Vercel URL
例如：`https://file-parser-tool.vercel.app`

**📝 记下这个 URL！**

---

## 🔗 第四步：连接前后端（2 分钟）

### 回到 Railway

1. 打开你的 Railway 项目
2. 进入 "Variables" 设置
3. 找到 `ALLOWED_ORIGINS` 变量（如果没有就添加）
4. 值设置为你的 Vercel URL：
   ```
   https://file-parser-tool.vercel.app
   ```
5. 保存（会自动重新部署）

---

## ✅ 第五步：测试（3 分钟）

### 1. 打开前端 URL

在浏览器中打开你的 Vercel URL

### 2. 登录

使用你在 Railway 设置的 `PASSWORD` 登录

### 3. 测试功能

- ✅ 上传一个 TXT 文件
- ✅ 测试 YouTube 字幕获取
- ✅ 测试单词选择功能

---

## 🎉 完成！

你的应用已经部署成功！

**前端地址**：`https://你的项目.vercel.app`  
**后端地址**：`https://你的项目.up.railway.app`

---

## ❓ 遇到问题？

### 问题：登录后显示错误

**解决**：
1. 检查 Vercel 的 `REACT_APP_API_URL` 是否正确
2. 检查 Railway 后端是否运行（查看 Deployments）

### 问题：CORS 错误

**解决**：
1. 在 Railway 的 `ALLOWED_ORIGINS` 中添加前端 URL
2. 确保 URL 以 `https://` 开头

### 问题：YouTube 字幕失败

**解决**：
1. 在 Railway 添加 `NIXPACKS_PYTHON_VERSION=3.11`
2. 重新部署

---

## 📚 详细文档

如果需要更详细的说明，查看：`DEPLOY_STEP_BY_STEP.md`





