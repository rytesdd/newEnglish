# 🔍 检查 Cookie 传递的详细步骤

## ❌ 当前问题

GET 请求返回 401，说明认证失败。需要确认 Cookie 是否被正确发送。

---

## 🔍 检查步骤

### 步骤 1：查看 GET 请求的 Request Headers

1. 在浏览器 Network 标签中
2. 找到返回 401 的 `/api/word-groups` 请求（**GET 方法**，不是 OPTIONS）
3. 点击这个请求
4. 查看 **"Request Headers"**（请求头）部分
5. **关键检查**：查找 `Cookie:` 头

#### 情况 A：有 Cookie 头
如果看到：
```
Cookie: connect.sid=s%3Axxxxx...
```
说明 Cookie 被发送了，问题可能是：
- Session 没有正确保存
- Session ID 不匹配
- 需要查看 Railway 日志确认

#### 情况 B：没有 Cookie 头
如果完全没有 `Cookie:` 头，说明 Cookie 没有被浏览器发送，可能原因：
- Cookie 没有被正确保存
- Cookie 的 Domain 设置不正确
- 浏览器安全策略阻止了跨域 Cookie

---

### 步骤 2：检查 Application 标签中的 Cookie

1. 在浏览器开发者工具中，切换到 **"Application"**（应用）标签
2. 左侧菜单找到 **"Cookies"**
3. 展开以下域名，查看是否有 `connect.sid` Cookie：
   - `https://new-english-17tq.vercel.app`（前端域名）
   - `https://web-production-3aff5.up.railway.app`（后端域名）

#### 如果在前端域名下有 Cookie：
- **Name**: `connect.sid`
- **Value**: 应该是一个长字符串
- **Domain**: 应该是 `.vercel.app` 或 `new-english-17tq.vercel.app`
- **Path**: `/`
- **Expires**: 应该是一个未来的日期
- **HttpOnly**: `true`
- **Secure**: `true`
- **SameSite**: `None`

#### 如果 Cookie 的 Domain 是前端域名：
这可能是个问题！跨域 Cookie 应该：
- 要么 Domain 是后端域名
- 要么不设置 Domain（让浏览器自动处理）

---

### 步骤 3：查看 Railway 日志

1. 登录 Railway 控制台
2. 进入你的服务
3. 查看 **"Logs"**（日志）标签
4. 查找以下日志：

#### 登录时的日志：
```
🔑 登录请求: { ... }
✅ 登录成功，Session 已保存: { sessionId: '...', isAuthenticated: true }
```

#### 验证失败时的日志：
```
❌ 未通过登录验证: {
  hasSession: true/false,
  isAuthenticated: true/false,
  sessionId: '...',
  cookieHeader: '存在' 或 '不存在',
  cookieValue: '...' 或 undefined,
  origin: 'https://new-english-17tq.vercel.app',
  url: '/api/word-groups'
}
```

---

## 🔧 可能的问题和解决方案

### 问题 1：Cookie 没有被发送

**原因**：
- Cookie 的 Domain 设置不正确
- 浏览器安全策略阻止了跨域 Cookie

**解决方法**：
- 确保 Cookie 的 `sameSite: 'none'` 和 `secure: true`
- 不设置 `domain`，让浏览器自动处理

### 问题 2：Cookie 被发送了，但 Session 验证失败

**原因**：
- Session 没有正确保存
- Session ID 不匹配

**解决方法**：
- 检查 Railway 日志，确认 Session 是否保存
- 确认 `SESSION_SECRET` 环境变量已设置

### 问题 3：Cookie Domain 不匹配

**原因**：
- Cookie 的 Domain 是前端域名，但后端无法读取

**解决方法**：
- 确保 Cookie 的 Domain 是后端域名或不设置 Domain

---

## 📋 请提供以下信息

1. **GET 请求的 Request Headers**：
   - 特别是是否有 `Cookie:` 头
   - 如果有，Cookie 的值是什么

2. **Application 标签中的 Cookie 信息**：
   - `connect.sid` Cookie 的所有属性
   - 特别是 Domain、SameSite、Secure

3. **Railway 日志中的信息**：
   - 登录成功时的日志
   - 验证失败时的详细日志（特别是 `cookieValue`）

---

## 🚀 临时解决方案

如果急需使用，可以尝试：

1. **清除所有 Cookie 和缓存**
   - 清除浏览器缓存
   - 清除所有 Cookie
   - 重新登录

2. **检查浏览器设置**
   - 确保没有阻止第三方 Cookie
   - 尝试使用无痕模式测试

3. **检查环境变量**
   - 确保 Railway 中设置了正确的 `ALLOWED_ORIGINS`
   - 确保 `SESSION_SECRET` 已设置

---

请提供 GET 请求的 Request Headers（特别是 Cookie 头），我会根据这些信息帮你修复！




