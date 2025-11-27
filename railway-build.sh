#!/bin/bash
# Railway 构建脚本

# 安装 Node.js 依赖
cd backend
npm install

# 安装 Python 依赖（使用虚拟环境）
python3 -m venv venv
source venv/bin/activate
pip install youtube-transcript-api
deactivate

# 返回根目录
cd ..
