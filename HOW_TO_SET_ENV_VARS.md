# 🔧 如何设置环境变量 - 详细步骤

## 📍 第一部分：在 Vercel 设置环境变量

### 步骤 1：打开 Vercel 项目

1. 访问：https://vercel.com
2. 登录你的账号
3. 在项目列表中找到你的项目（`new-english-17tq` 或类似名称）
4. 点击项目名称进入项目页面

### 步骤 2：进入环境变量设置

1. 在项目页面顶部，点击 **"Settings"** 标签
2. 在左侧菜单中，找到并点击 **"Environment Variables"**

### 步骤 3：添加环境变量

1. 点击 **"Add New"** 或 **"Add"** 按钮
2. 会弹出添加环境变量的表单

### 步骤 4：填写环境变量信息

在表单中填写：

**Key（键名）**：
```
REACT_APP_API_URL
```

**Value（值）**：
```
https://web-production-3aff5.up.railway.app
```

**Environment（环境）**：
- ✅ 勾选 `Production`
- ✅ 勾选 `Preview`
- ✅ 勾选 `Development`
（或者直接勾选 "All Environments"）

### 步骤 5：保存

1. 点击 **"Save"** 按钮
2. Vercel 会提示需要重新部署
3. 点击 **"Redeploy"** 或等待自动重新部署

---

## 📍 第二部分：在 Railway 设置环境变量

### 步骤 1：打开 Railway 项目

1. 访问：https://railway.app
2. 登录你的账号
3. 在项目列表中找到你的项目
4. 点击项目名称进入项目页面

### 步骤 2：进入服务设置

1. 在项目页面，点击你的服务（Service）
2. 点击 **"Variables"** 标签（在顶部导航栏）

### 步骤 3：添加/修改环境变量

#### 如果 `ALLOWED_ORIGINS` 不存在：

1. 点击 **"New Variable"** 或 **"Add Variable"** 按钮
2. 填写：
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://new-english-17tq.vercel.app`
3. 点击 **"Add"** 或 **"Save"**

#### 如果 `ALLOWED_ORIGINS` 已存在：

1. 找到 `ALLOWED_ORIGINS` 这一行
2. 点击右侧的 **"Edit"** 或编辑图标
3. 修改 **Value** 为：`https://new-english-17tq.vercel.app`
4. 点击 **"Save"**

### 步骤 4：确认保存

1. Railway 会自动保存
2. 会自动触发重新部署（无需手动操作）
3. 等待部署完成（通常 1-2 分钟）

---

## 📝 环境变量设置清单

### Vercel 需要设置：

| Key | Value | Environment |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://web-production-3aff5.up.railway.app` | Production, Preview, Development |

### Railway 需要设置：

| Key | Value |
|-----|-------|
| `ALLOWED_ORIGINS` | `https://new-english-17tq.vercel.app` |

**其他 Railway 环境变量**（应该已经设置）：
- `PASSWORD` - 你的登录密码
- `SESSION_SECRET` - Session 密钥
- `NODE_ENV` - `production`

---

## ✅ 验证设置

### 验证 Vercel 环境变量：

1. 在 Vercel 的 "Environment Variables" 页面
2. 应该能看到：
   ```
   REACT_APP_API_URL = https://web-production-3aff5.up.railway.app
   ```

### 验证 Railway 环境变量：

1. 在 Railway 的 "Variables" 页面
2. 应该能看到：
   ```
   ALLOWED_ORIGINS = https://new-english-17tq.vercel.app
   ```

---

## 🚀 设置后的操作

### 1. 等待自动重新部署

- **Vercel**：设置环境变量后会自动触发重新部署
- **Railway**：修改环境变量后会自动触发重新部署

### 2. 查看部署状态

**Vercel**：
1. 进入 "Deployments" 标签
2. 应该看到新的部署（显示 "Building" 或 "Ready"）

**Railway**：
1. 在服务页面查看部署状态
2. 应该看到新的部署（显示 "Building" 或 "Deployed"）

### 3. 测试前端

1. 等待部署完成（通常 1-2 分钟）
2. 打开前端网站：`https://new-english-17tq.vercel.app`
3. 应该不再显示"无法连接到服务器"错误
4. 尝试登录，应该能正常连接后端

---

## ⚠️ 重要提示

1. **Vercel 环境变量名称**：必须以 `REACT_APP_` 开头，React 才能读取
2. **URL 格式**：
   - ✅ 正确：`https://web-production-3aff5.up.railway.app`
   - ❌ 错误：`https://web-production-3aff5.up.railway.app/`（末尾不要有斜杠）
3. **环境变量生效**：需要重新部署才能生效
4. **CORS 配置**：Railway 的 `ALLOWED_ORIGINS` 必须包含前端域名

---

## 🆘 如果遇到问题

### 问题 1：Vercel 找不到 "Environment Variables"

**解决**：
- 确保在项目页面，不是账户设置页面
- 点击 "Settings" → "Environment Variables"

### 问题 2：Railway 找不到 "Variables"

**解决**：
- 确保点击了服务（Service），不是项目概览
- 在服务页面顶部应该有 "Variables" 标签

### 问题 3：设置后仍然无法连接

**解决**：
1. 确认环境变量值是否正确（没有多余空格）
2. 确认前端已重新部署（查看 Vercel Deployments）
3. 确认后端已重新部署（查看 Railway Deployments）
4. 清除浏览器缓存后重试

---

按照这些步骤操作，应该就能成功设置了！🚀




