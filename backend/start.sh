#!/bin/bash
# Railway 启动脚本

echo "=== 启动信息 ==="
echo "当前工作目录: $(pwd)"
echo "Node 版本: $(node --version)"
echo "NPM 版本: $(npm --version)"
echo "PORT 环境变量: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "================"

# 检查 server.js 是否存在
if [ ! -f "server.js" ]; then
  echo "错误: server.js 不存在！"
  echo "当前目录内容:"
  ls -la
  exit 1
fi

# 启动服务器
echo "正在启动服务器..."
node server.js





