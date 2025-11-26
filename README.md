# 文件解析工具

一个支持上传和解析 TXT、PDF、Word 文件的 Web 应用。

## 功能特性

- ✅ 支持多种文件格式：TXT、PDF、DOC、DOCX
- ✅ 文件上传（点击或拖拽）
- ✅ **YouTube 字幕获取**（粘贴视频链接自动获取字幕）
- ✅ 自动解析文件内容
- ✅ 在页面中显示解析后的文本
- ✅ 单词和短语选择功能
- ✅ 现代化的用户界面

## 技术栈

### 后端
- Node.js + Express
- Multer（文件上传）
- pdf-parse（PDF 解析）
- mammoth（Word 解析）
- Python + youtube-transcript-api（YouTube 字幕获取，通过 Node.js 调用）

### 前端
- React
- Axios（HTTP 请求）

## 安装和运行

### 1. 安装依赖

```bash
npm run install-all

# 安装 Python 字幕获取库（必需）
pip3 install youtube-transcript-api
```

**注意**：需要 Python 3.6+ 和 pip3 已安装

### 2. 启动应用

开发模式（同时启动前后端）：
```bash
npm run dev
```

或者分别启动：

启动后端：
```bash
npm run server
```

启动前端（新终端）：
```bash
npm run client
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

后端 API 运行在：http://localhost:3001

## 使用说明

### 方式一：上传文件
1. 点击"上传文件"选项卡
2. 点击上传区域或拖拽文件到上传区域
3. 选择或拖入 TXT、PDF、DOC、DOCX 格式的文件
4. 等待文件解析完成
5. 查看解析后的文本内容

### 方式二：YouTube 字幕
1. 点击"YouTube 链接"选项卡
2. 粘贴 YouTube 视频链接（例如：https://www.youtube.com/watch?v=...）
3. 点击"获取字幕"按钮
4. 系统自动获取并显示字幕内容

### 文本操作
- **选择单词**：点击单词进行选中/取消选中
- **选择短语**：按住空格键，然后连续点击单词，会自动组合成短语
- **查看候选词**：选中的单词和短语会显示在右侧候选面板

## 文件大小限制

- 最大文件大小：50MB

## 项目结构

```
file-parser-tool/
├── backend/                      # 后端服务
│   ├── server.js                # Express 服务器
│   ├── get_youtube_transcript.py # Python 字幕获取脚本
│   └── package.json
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── FileUploader.js
│   │   │   ├── YouTubeInput.js
│   │   │   └── TextDisplay.js
│   │   └── ...
│   └── package.json
├── uploads/                      # 临时上传目录
└── package.json
```


