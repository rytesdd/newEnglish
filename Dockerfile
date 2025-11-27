# 多阶段构建 Dockerfile
FROM node:18-alpine AS frontend-builder

# 构建前端
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 后端运行时
FROM node:18-alpine

# 安装 Python 和 pip（用于 YouTube 字幕获取）
RUN apk add --no-cache python3 py3-pip

# 安装 Python 依赖
RUN pip3 install youtube-transcript-api

WORKDIR /app

# 复制后端代码
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/build ./public

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server.js"]

