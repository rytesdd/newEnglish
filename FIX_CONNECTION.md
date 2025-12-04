# 🔧 修复前后端连接问题

## ❌ 当前问题

前端显示错误："无法连接到服务器,请确保后端服务正在运行"

**前端 URL**: `https://new-english-17tq.vercel.app`  
**后端 URL**: `https://web-production-3aff5.up.railway.app`

---

## 🔍 问题分析

可能的原因：
1. Vercel 的 `REACT_APP_API_URL` 环境变量没有设置或设置错误
2. Railway 的 `ALLOWED_ORIGINS` 没有包含前端域名
3. CORS 配置问题

---

## ✅ 解决步骤

### 步骤 1：检查 Vercel 环境变量

1. 打开 Vercel 项目页面
2. 进入 "Settings" -> "Environment Variables"
3. 检查是否有 `REACT_APP_API_URL`
4. 如果没有或值不对，添加/修改：
   - Key: `REACT_APP_API_URL`
   - Value: `https://web-production-3aff5.up.railway.app`
   - Environment: 全选（Production、Preview、Development）
5. **重要**：修改后需要重新部署

### 步骤 2：更新 Railway CORS 配置

1. 打开 Railway 项目页面
2. 进入服务（Service）的 "Variables" 设置
3. 找到 `ALLOWED_ORIGINS` 变量
4. 点击编辑
5. 输入前端域名：
   ```
   https://new-english-17tq.vercel.app
   ```
6. 如果有多个域名，用逗号分隔：
   ```
   https://new-english-17tq.vercel.app,https://www.new-english-17tq.vercel.app
   ```
7. 保存（Railway 会自动重新部署）

### 步骤 3：重新部署前端（如果修改了环境变量）

1. 在 Vercel 项目页面
2. 进入 "Deployments" 标签
3. 点击最新的部署
4. 点击 "Redeploy"
5. 等待部署完成

---

## 🔍 验证修复

### 1. 检查环境变量

在 Vercel 中确认：
- ✅ `REACT_APP_API_URL = https://web-production-3aff5.up.railway.app`

### 2. 检查 CORS 配置

在 Railway 中确认：
- ✅ `ALLOWED_ORIGINS = https://new-english-17tq.vercel.app`

### 3. 测试连接

1. 打开前端网站：`https://new-english-17tq.vercel.app`
2. 按 `F12` 打开开发者工具
3. 切换到 "Network" 标签
4. 尝试登录
5. 查看是否有请求到后端：
   - 应该看到请求到 `https://web-production-3aff5.up.railway.app/api/login`
   - 状态码应该是 `200` 或 `401`（不是 `502` 或 `CORS error`）

---

## 📝 快速检查清单

- [ ] Vercel 的 `REACT_APP_API_URL` 已设置
- [ ] Railway 的 `ALLOWED_ORIGINS` 包含前端域名
- [ ] 前端已重新部署（如果修改了环境变量）
- [ ] 后端已重新部署（如果修改了 CORS）
- [ ] 浏览器控制台没有 CORS 错误

---

## 🚀 如果还有问题

如果修复后仍然无法连接：

1. **查看浏览器控制台**（按 F12）
   - 查看具体的错误信息
   - 查看 Network 标签中的请求详情

2. **检查请求 URL**
   - 应该请求到：`https://web-production-3aff5.up.railway.app/api/...`
   - 如果请求到其他地址，说明环境变量设置错误

3. **检查 CORS 错误**
   - 如果看到 CORS 错误，说明 `ALLOWED_ORIGINS` 配置不对
   - 确保 URL 格式正确（包含 `https://`，没有末尾斜杠）

---

修复完成后，告诉我结果！





