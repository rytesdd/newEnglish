# 部署检查清单 ✅

在部署之前，请按照以下清单检查所有配置：

## 📦 代码准备

- [x] 前端 API 配置已更新为使用环境变量
- [x] 后端 CORS 配置支持生产环境
- [x] 后端端口配置支持环境变量
- [x] Session 配置适配生产环境（HTTPS）

## 🔐 环境变量配置

### 后端必需变量：
- [ ] `PASSWORD` - 登录密码（已设置强密码）
- [ ] `SESSION_SECRET` - Session 密钥（至少 32 字符的随机字符串）

### 后端可选变量：
- [ ] `ALLOWED_ORIGINS` - 允许的前端域名（多个用逗号分隔）
- [ ] `LLM_API_KEY` - 大模型 API 密钥（用于翻译功能）
- [ ] `LLM_API_URL` - 大模型 API 地址
- [ ] `LLM_MODEL` - 模型名称

### 前端环境变量：
- [ ] `REACT_APP_API_URL` - 后端 API 地址（如果前后端分离部署）

## 🚀 部署步骤

### Railway 部署：
1. [ ] 在 Railway 创建新项目
2. [ ] 连接 GitHub 仓库
3. [ ] 设置所有环境变量
4. [ ] 配置构建命令：`npm run install-all && cd frontend && npm run build`
5. [ ] 配置启动命令：`cd backend && npm start`
6. [ ] 添加 Python buildpack（用于 YouTube 字幕）
7. [ ] 部署并测试

### Render 部署：
1. [ ] 在 Render 创建 Web Service
2. [ ] 连接 GitHub 仓库
3. [ ] 设置环境变量
4. [ ] 配置构建和启动命令
5. [ ] 部署并测试

### Vercel 部署（前端）：
1. [ ] 在 Vercel 导入仓库
2. [ ] 设置 Root Directory 为 `frontend`
3. [ ] 设置 `REACT_APP_API_URL` 环境变量
4. [ ] 部署并测试

## ✅ 部署后测试

- [ ] 访问前端 URL，能正常加载
- [ ] 使用密码登录成功
- [ ] 上传 TXT 文件并解析成功
- [ ] 上传 PDF 文件并解析成功
- [ ] 上传 Word 文件并解析成功
- [ ] YouTube 字幕获取功能正常
- [ ] 单词选择功能正常
- [ ] 翻译功能正常（如果配置了 API）
- [ ] 背单词功能正常

## 🔍 故障排查

如果遇到问题，检查：

1. **服务器日志** - 查看部署平台的日志输出
2. **浏览器控制台** - 检查前端错误
3. **网络请求** - 使用浏览器开发者工具检查 API 请求
4. **环境变量** - 确认所有必需变量已正确设置
5. **CORS 配置** - 确认 `ALLOWED_ORIGINS` 包含前端域名

## 📝 快速命令

### 生成随机 Session Secret：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 本地测试生产构建：
```bash
# 构建前端
cd frontend && npm run build

# 启动后端（会自动提供前端静态文件）
cd ../backend && NODE_ENV=production npm start
```

---

完成所有检查项后，你的应用就可以成功部署了！🎉





