// 加载环境变量（支持从根目录或 backend 目录运行）
const path = require('path');
const fs = require('fs-extra');

// 安全加载 dotenv
try {
  const dotenvPath = fs.existsSync(path.join(__dirname, '../.env'))
    ? path.join(__dirname, '../.env')
    : path.join(__dirname, '../../.env');
  if (fs.existsSync(dotenvPath)) {
    require('dotenv').config({ path: dotenvPath });
  } else {
    require('dotenv').config(); // 尝试默认路径
  }
} catch (e) {
  console.warn('加载 .env 文件失败，使用环境变量:', e.message);
}

// 安全加载所有依赖
let express, cors, multer, execSync, pdfParse, mammoth, YoutubeTranscript, axios, parseString, DOMParser, ytdl, session, cookieParser;

try {
  express = require('express');
  cors = require('cors');
  multer = require('multer');
  execSync = require('child_process').execSync;
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
  const youtubeTranscriptModule = require('youtube-transcript');
  YoutubeTranscript = youtubeTranscriptModule.YoutubeTranscript || youtubeTranscriptModule;
  axios = require('axios');
  parseString = require('xml2js').parseString;
  DOMParser = require('@xmldom/xmldom').DOMParser;
  ytdl = require('ytdl-core');
  session = require('express-session');
  cookieParser = require('cookie-parser');
} catch (error) {
  console.error('加载依赖失败:', error.message);
  console.error('错误堆栈:', error.stack);
  console.error('当前工作目录:', process.cwd());
  console.error('__dirname:', __dirname);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// 密码配置（从环境变量读取）
const PASSWORD = process.env.PASSWORD || 'Wzy1996.';
const SESSION_SECRET = process.env.SESSION_SECRET || 'file-parser-secret-key-2024';

// 配置 CORS - 支持生产环境
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

// 中间件
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    // 检查 origin 是否在允许列表中
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // 临时允许所有 origin，生产环境建议严格限制
    }
  },
  credentials: true // 允许跨域携带 cookie
}));
app.use(express.json());
app.use(cookieParser());

// 配置生产环境标识
const isProduction = process.env.NODE_ENV === 'production';

// 在生产环境中，如果前端构建文件存在，提供静态文件服务
if (isProduction) {
  // 支持从根目录或 backend 目录运行
  const frontendBuildPath = fs.existsSync(path.join(__dirname, '../frontend/build'))
    ? path.join(__dirname, '../frontend/build')
    : path.join(__dirname, '../../frontend/build');
  
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    // 所有非 API 路由都返回前端应用
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      }
    });
  }
}

// 配置 session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // 生产环境使用 HTTPS 时设为 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 小时
    sameSite: isProduction ? 'none' : 'lax' // 生产环境跨域需要 none
  }
}));

// 登录验证中间件
const requireLogin = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ success: false, error: '请先登录' });
  }
};

// 确保上传目录存在（支持从根目录或 backend 目录运行）
const uploadsDir = fs.existsSync(path.join(__dirname, '../uploads'))
  ? path.join(__dirname, '../uploads')
  : path.join(__dirname, '../../uploads');
fs.ensureDirSync(uploadsDir);

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型。仅支持: txt, pdf, doc, docx'));
    }
  }
});

// 解析 TXT 文件
async function parseTxt(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, text: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 解析 PDF 文件
async function parsePdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return { success: true, text: data.text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 解析 Word 文件
async function parseWord(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return { success: true, text: result.value };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 登录接口（不需要验证）
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === PASSWORD) {
    req.session.isAuthenticated = true;
    res.json({ success: true, message: '登录成功' });
  } else {
    res.status(401).json({ success: false, error: '密码错误' });
  }
});

// 登出接口
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: '登出失败' });
    }
    res.json({ success: true, message: '已登出' });
  });
});

// 检查登录状态接口
app.get('/api/check-auth', (req, res) => {
  res.json({ 
    success: true, 
    isAuthenticated: !!req.session.isAuthenticated 
  });
});

// 文件上传和解析接口（需要登录）
app.post('/api/upload', requireLogin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let result;

    // 根据文件类型选择解析方法
    switch (fileExt) {
      case '.txt':
        result = await parseTxt(filePath);
        break;
      case '.pdf':
        result = await parsePdf(filePath);
        break;
      case '.doc':
      case '.docx':
        result = await parseWord(filePath);
        break;
      default:
        result = { success: false, error: '不支持的文件类型' };
    }

    // 删除临时文件
    await fs.remove(filePath);

    if (result.success) {
      // 自动添加标点符号
      const textWithPunctuation = await addPunctuation(result.text);
      
      res.json({
        success: true,
        filename: req.file.originalname,
        text: textWithPunctuation,
        size: req.file.size
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || '文件解析失败'
      });
    }
  } catch (error) {
    // 确保删除临时文件
    if (req.file) {
      await fs.remove(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      error: error.message || '服务器错误'
    });
  }
});

// 自动添加标点符号功能（使用规则方式，不调用API）
async function addPunctuation(text) {
  if (!text || text.trim().length === 0) return text;
  
  // 检查文本是否已经有足够的标点符号
  const punctuationCount = (text.match(/[.!?]/g) || []).length;
  const wordCount = text.split(/\s+/).length;
  // 如果每50个词有至少一个句号，认为标点足够
  if (wordCount > 0 && punctuationCount / wordCount > 0.02) {
    console.log('文本已包含足够标点符号，跳过自动添加');
    return text;
  }

  // 直接使用规则方式添加标点（不调用大模型API）
  console.log('使用规则方式添加标点符号...');
  return addPunctuationByRules(text);
}

// 使用大模型API添加标点
async function addPunctuationWithAPI(text, apiKey, apiUrl, model) {
  const prompt = `请为以下英文文本添加适当的标点符号（句号、逗号、问号、感叹号等），使其成为规范的英文文本。只返回添加了标点的文本，不要添加任何解释。

原文：
${text}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // 低温度以获得更准确的标点
        max_tokens: Math.min(text.length * 2, 4000)
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        timeout: 30000
      }
    );

    let resultText = '';
    if (response.data.choices && response.data.choices.length > 0) {
      resultText = response.data.choices[0].message?.content?.trim() || '';
    } else if (response.data.output && response.data.output.text) {
      resultText = response.data.output.text.trim();
    } else if (response.data.content) {
      resultText = response.data.content.trim();
    }

    if (resultText && resultText.length > text.length * 0.8) {
      return resultText;
    }
    
    // 如果API返回的文本太短，使用规则方式作为补充
    return addPunctuationByRules(text);
  } catch (error) {
    console.error('API添加标点失败:', error.message);
    return addPunctuationByRules(text);
  }
}

// 使用规则方式添加标点（只添加逗号，不添加句号，逗号后换行）
function addPunctuationByRules(text) {
  if (!text) return text;
  
  let result = text.trim();
  
  // 1. 在长句子中间添加逗号（在连接词前）
  result = result.replace(/\s+(and|but|or|so|because|although|while|when|if|though|since)\s+/gi, 
    (match, conj, offset, str) => {
      const before = str.substring(Math.max(0, offset - 50), offset);
      
      // 如果前面很长没有逗号，且前面有足够的词，添加逗号
      if (before.length > 30 && !before.includes(',')) {
        return `, ${conj} `;
      }
      return match;
    }
  );
  
  // 2. 在疑问句后添加问号（保留问号）
  result = result.replace(/\b(what|where|when|who|why|how|which|whose)\s+\w+\s+\w+([^?!]{20,}?)(?=\s|$)/gi, 
    (match, questionWord, rest) => {
      if (!/[?]$/.test(rest)) {
        return match.replace(/\s*$/, '?');
      }
      return match;
    }
  );
  
  // 3. 在感叹句后添加感叹号（保留感叹号）
  result = result.replace(/\b(wow|oh|ah|aha|oops|ouch|yay|hurray|amazing|incredible|great|wonderful)\s+([^!]{10,}?)(?=\s|$)/gi,
    (match, exclamation, rest) => {
      if (!/[!]$/.test(rest)) {
        return match.replace(/\s*$/, '!');
      }
      return match;
    }
  );
  
  // 4. 清理多余的空格
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/,\s*,/g, ','); // 多个逗号变成一个
  
  // 5. 在逗号后添加换行符（关键：逗号后换行）
  result = result.replace(/,\s+/g, ',\n');
  
  // 6. 在问号和感叹号后也添加换行（如果有的话）
  result = result.replace(/[!?]\s+/g, (match) => match.trim() + '\n');
  
  // 7. 清理多余的换行（连续的换行变成一个）
  result = result.replace(/\n{3,}/g, '\n\n');
  
  return result.trim();
}

// 从 YouTube URL 中提取视频 ID
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// 使用 ytdl-core 获取字幕（最可靠的方法）
async function getTranscriptWithYtdl(videoId, preferredLang = 'en') {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`使用 ytdl-core 获取视频信息: ${videoUrl}`);
    
    const info = await ytdl.getInfo(videoUrl);
    const captions = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captions || captions.length === 0) {
      console.log('没有找到字幕轨道');
      return null;
    }
    
    console.log(`找到 ${captions.length} 个字幕轨道`);
    
    // 优先使用指定语言，否则使用第一个
    let selectedTrack = captions.find(t => t.languageCode === preferredLang);
    if (!selectedTrack) {
      selectedTrack = captions[0];
    }
    
    // 构建简单的字幕 API URL（不依赖签名）
    const langCode = selectedTrack.languageCode || preferredLang;
    const simpleCaptionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}&fmt=xml3`;
    
    console.log(`下载字幕，语言: ${langCode}`);
    console.log(`使用简化字幕 URL: ${simpleCaptionUrl}`);
    
    // 先尝试简化 URL
    let captionResponse;
    try {
      captionResponse = await axios.get(simpleCaptionUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': videoUrl,
          'Accept': 'text/xml,application/xml,*/*'
        },
        timeout: 15000
      });
    } catch (err) {
      // 如果简化 URL 失败，尝试原始 URL
      console.log('简化 URL 失败，尝试原始 URL...');
      const originalUrl = selectedTrack.baseUrl || selectedTrack.url;
      if (originalUrl) {
        captionResponse = await axios.get(originalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': videoUrl
          },
          timeout: 15000
        });
      } else {
        throw err;
      }
    }
    
    const xmlData = captionResponse.data;
    if (!xmlData || xmlData.length === 0) {
      console.log('字幕数据为空');
      return null;
    }
    
    // 检查是否是错误响应
    if (typeof xmlData === 'string' && (xmlData.includes('<!DOCTYPE') || xmlData.includes('<html'))) {
      console.log('收到 HTML 响应而非 XML');
      return null;
    }
    
    console.log(`成功下载字幕 XML，长度: ${xmlData.length}`);
    const transcript = parseYouTubeTranscriptXML(xmlData);
    console.log(`解析到 ${transcript.length} 条字幕`);
    
    return transcript;
  } catch (error) {
    console.error('ytdl-core 获取字幕失败:', error.message);
    return null;
  }
}

// 从 YouTube 页面实时获取字幕 URL 并下载（最可靠的方法）
async function getTranscriptDirectly(videoId, preferredLang = 'en') {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`正在获取 YouTube 页面以提取字幕 URL...`);
    
    // 获取页面
    const pageResponse = await axios.get(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    const html = pageResponse.data;
    
    // 提取 ytInitialPlayerResponse
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/s);
    if (!playerResponseMatch) {
      console.log('未找到 ytInitialPlayerResponse');
      return null;
    }
    
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      console.log('未找到字幕轨道');
      return null;
    }
    
    console.log(`找到 ${captionTracks.length} 个字幕轨道`);
    
    // 优先使用指定语言，否则使用第一个
    let selectedTrack = captionTracks.find(t => t.languageCode === preferredLang);
    if (!selectedTrack) {
      selectedTrack = captionTracks[0];
    }
    
    let captionUrl = selectedTrack.baseUrl || selectedTrack.url;
    if (!captionUrl) {
      console.log('字幕 URL 不存在');
      return null;
    }
    
    // 清理 URL（移除转义字符）
    captionUrl = captionUrl.replace(/\\u0026/g, '&');
    
    // 确保 URL 包含 fmt 参数（指定 XML 格式）
    if (!captionUrl.includes('fmt=')) {
      captionUrl += (captionUrl.includes('?') ? '&' : '?') + 'fmt=xml3';
    }
    
    console.log(`正在下载字幕，语言: ${selectedTrack.languageCode || preferredLang}`);
    console.log(`字幕 URL: ${captionUrl.substring(0, 150)}...`);
    
    // 立即下载字幕（URL 有时效性，需要快速使用）
    const captionResponse = await axios.get(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': videoUrl,
        'Accept': 'text/xml,application/xml,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      maxRedirects: 5
    });
    
    const xmlData = captionResponse.data;
    console.log(`字幕响应状态: ${captionResponse.status}, 内容类型: ${captionResponse.headers['content-type']}, 数据长度: ${xmlData ? xmlData.length : 0}`);
    
    if (!xmlData || xmlData.length === 0) {
      console.log('字幕数据为空');
      return null;
    }
    
    // 检查是否是错误页面
    if (typeof xmlData === 'string' && (xmlData.includes('<!DOCTYPE') || xmlData.includes('<html'))) {
      console.log('收到 HTML 响应而非 XML，URL 可能无效');
      return null;
    }
    
    // 解析 XML
    const transcript = parseYouTubeTranscriptXML(xmlData);
    console.log(`解析到 ${transcript.length} 条字幕`);
    
    return transcript;
  } catch (error) {
    console.error('直接获取字幕失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
    }
    return null;
  }
}

// 从 YouTube 页面提取字幕 URL 并获取字幕（备用方法）
async function getTranscriptFromYouTubePage(videoId, preferredLang = 'en') {
  try {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`正在获取 YouTube 页面: ${pageUrl}`);
    
    const pageResponse = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    const html = pageResponse.data;
    
    // 从 ytInitialPlayerResponse 中提取字幕信息
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/s);
    if (playerResponseMatch) {
      try {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        if (captionTracks && captionTracks.length > 0) {
          console.log(`找到 ${captionTracks.length} 个字幕轨道`);
          
          // 优先使用指定语言，否则使用第一个
          let selectedTrack = captionTracks.find(t => t.languageCode === preferredLang);
          if (!selectedTrack) {
            selectedTrack = captionTracks[0];
          }
          
          const captionUrl = selectedTrack.baseUrl || selectedTrack.url;
          if (captionUrl) {
            console.log(`使用字幕语言: ${selectedTrack.languageCode || preferredLang}, URL: ${captionUrl.substring(0, 100)}...`);
            
            // 下载字幕 XML
            const captionResponse = await axios.get(captionUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': `https://www.youtube.com/watch?v=${videoId}`
              },
              timeout: 15000,
              maxRedirects: 5
            });
            
            const xmlData = captionResponse.data;
            console.log(`下载字幕响应状态: ${captionResponse.status}, 内容类型: ${captionResponse.headers['content-type']}, 数据长度: ${xmlData ? xmlData.length : 0}`);
            
            // 检查响应类型
            if (!xmlData || xmlData.length === 0) {
              console.log('字幕数据为空');
              return null;
            }
            
            // 如果是 HTML 错误页面，说明 URL 无效
            if (typeof xmlData === 'string' && xmlData.includes('<!DOCTYPE html>')) {
              console.log('收到 HTML 响应，URL 可能无效');
              return null;
            }
            
            // 解析 XML
            const transcript = parseYouTubeTranscriptXML(xmlData);
            console.log(`解析到 ${transcript.length} 条字幕`);
            
            if (transcript.length > 0) {
              return transcript;
            }
          }
        }
      } catch (parseError) {
        console.error('解析 playerResponse 失败:', parseError.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('从 YouTube 页面获取字幕失败:', error.message);
    return null;
  }
}

// 解析 YouTube 字幕 XML
function parseYouTubeTranscriptXML(xmlString) {
  try {
    if (!xmlString || typeof xmlString !== 'string') {
      console.log('字幕数据不是字符串类型');
      return [];
    }
    
    // 支持多种格式：<text> 标签可能使用单引号或双引号
    // 匹配格式: <text start="X" dur="Y">内容</text> 或 <text start='X' dur='Y'>内容</text>
    const textRegex = /<text[^>]*start=["']([^"']*)["'][^>]*dur=["']([^"']*)["'][^>]*>(.*?)<\/text>/gs;
    const transcript = [];
    let match;
    
    while ((match = textRegex.exec(xmlString)) !== null) {
      const start = parseFloat(match[1]) || 0;
      const duration = parseFloat(match[2]) || 0;
      let text = match[3] || '';
      
      // 清理 HTML 实体和标签
      text = text.replace(/<[^>]+>/g, ''); // 移除 HTML 标签
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&apos;/g, "'");
      text = text.trim();
      
      if (text) {
        transcript.push({
          text: text,
          offset: start * 1000, // 转换为毫秒
          duration: duration * 1000
        });
      }
    }
    
    // 如果正则匹配失败，尝试更宽松的匹配
    if (transcript.length === 0) {
      console.log('标准匹配失败，尝试更宽松的匹配...');
      const looseRegex = /<text[^>]*>(.*?)<\/text>/gs;
      let looseMatch;
      while ((looseMatch = looseRegex.exec(xmlString)) !== null) {
        let text = looseMatch[1] || '';
        text = text.replace(/<[^>]+>/g, '');
        text = text.replace(/&quot;/g, '"');
        text = text.replace(/&amp;/g, '&');
        text = text.trim();
        if (text) {
          transcript.push({
            text: text,
            offset: 0,
            duration: 0
          });
        }
      }
    }
    
    return transcript;
  } catch (error) {
    console.error('解析字幕 XML 失败:', error.message);
    console.error('XML 前 500 字符:', xmlString ? xmlString.substring(0, 500) : 'null');
    return [];
  }
}

// YouTube 字幕获取接口
app.post('/api/youtube-transcript', requireLogin, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: '请提供 YouTube 视频链接' });
    }

    // 提取视频 ID（用于文件名）
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, error: '无效的 YouTube 链接格式' });
    }

    try {
      // 使用 Python youtube-transcript-api（最可靠的方法）
      console.log(`开始获取视频 ${videoId} 的字幕...`);
      
      let transcriptText = null;
      let transcriptCount = 0;
      
      // 使用 Python 脚本获取字幕（最可靠）
      const pythonScript = path.join(__dirname, 'get_youtube_transcript.py');
      
      try {
        console.log('使用 Python youtube-transcript-api 获取字幕...');
        // 尝试使用虚拟环境的 Python，如果不存在则使用系统 Python
        const pythonCmd = fs.existsSync('/opt/venv/bin/python3') 
          ? '/opt/venv/bin/python3' 
          : 'python3';
        const result = execSync(`${pythonCmd} "${pythonScript}" "${videoId}" "en,zh"`, {
          encoding: 'utf-8',
          timeout: 30000,
          maxBuffer: 10 * 1024 * 1024 // 10MB
        });
        
        const pythonResult = JSON.parse(result.trim());
        if (pythonResult.success) {
          transcriptText = pythonResult.text;
          transcriptCount = pythonResult.count || 0;
          console.log(`✅ Python 脚本成功获取字幕！语言: ${pythonResult.language}, 数量: ${transcriptCount}`);
        } else {
          console.log(`Python 脚本返回错误: ${pythonResult.error}`);
        }
      } catch (pythonError) {
        console.log(`Python 脚本执行失败: ${pythonError.message}`);
        // 继续尝试其他方法
      }
      
      // 如果 Python 方法失败，尝试其他方法
      if (!transcriptText) {
        console.log('Python 方法失败，尝试其他方法...');
        let transcript = null;
        
        // 尝试使用 ytdl-core
        transcript = await getTranscriptWithYtdl(videoId, 'en');
        
        // 如果 ytdl-core 失败，尝试直接方法
        if (!transcript || transcript.length === 0) {
          console.log('尝试直接方法...');
          const languagesToTry = ['en', 'zh', 'zh-Hans', 'zh-Hant'];
          
          for (const lang of languagesToTry) {
            transcript = await getTranscriptDirectly(videoId, lang);
            if (transcript && transcript.length > 0) {
              console.log(`✅ 成功获取字幕！语言: ${lang}, 数量: ${transcript.length}`);
              break;
            }
          }
        }
        
        // 将 transcript 转换为文本
        if (transcript && transcript.length > 0) {
          transcriptText = transcript.map(item => item.text || '').filter(text => text.trim().length > 0).join(' ');
          transcriptCount = transcript.length;
        }
      }
      
      // 检查字幕是否为空
      if (!transcriptText || transcriptText.trim().length === 0) {
        return res.status(200).json({ 
          success: false, 
          error: '该视频没有可用的字幕（包括自动生成的字幕）。请确认视频已启用字幕功能。' 
        });
      }
      
      // 清理文本
      let text = transcriptText.replace(/\s+/g, ' ').trim();
      
      // 自动添加标点符号
      text = await addPunctuation(text);

      res.json({
        success: true,
        text: text,
        filename: `youtube-${videoId}-transcript.txt`,
        videoId: videoId,
        transcriptCount: transcriptCount
      });
    } catch (transcriptError) {
      // 处理字幕获取错误
      console.error('YouTube transcript error:', transcriptError);
      let errorMessage = '无法获取视频字幕';
      const errorType = transcriptError.constructor?.name || '';
      const errorMsg = transcriptError.message || '';
      
      // 根据错误类型设置友好的错误信息
      if (errorType === 'YoutubeTranscriptDisabledError' || errorMsg.includes('disabled')) {
        errorMessage = '该视频已禁用字幕';
      } else if (errorType === 'YoutubeTranscriptNotAvailableError' || errorMsg.includes('No transcript') || errorMsg.includes('not available')) {
        errorMessage = '该视频没有字幕（视频可能未启用字幕功能）';
      } else if (errorType === 'YoutubeTranscriptVideoUnavailableError' || errorMsg.includes('Video unavailable') || errorMsg.includes('unavailable')) {
        errorMessage = '视频不可用（可能已删除或为私有视频）';
      } else if (errorType === 'YoutubeTranscriptNotAvailableLanguageError' || errorMsg.includes('language')) {
        errorMessage = '该视频没有指定语言的字幕';
      } else {
        errorMessage = errorMsg || '获取字幕失败，请检查视频链接是否正确';
      }

      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '服务器错误'
    });
  }
});

// 翻译接口
app.post('/api/translate', requireLogin, async (req, res) => {
  try {
    const { items, context } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供要翻译的单词或短语列表' 
      });
    }

    if (!context || typeof context !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: '请提供上下文原文' 
      });
    }

    console.log(`开始翻译 ${items.length} 个条目...`);

    // TODO: 这里需要配置大模型API
    // 从环境变量或配置文件读取API配置
    const API_KEY = process.env.LLM_API_KEY || '';
    const API_URL = process.env.LLM_API_URL || '';
    const API_MODEL = process.env.LLM_MODEL || 'gpt-3.5-turbo';

    if (!API_KEY || !API_URL) {
      return res.status(500).json({
        success: false,
        error: '翻译服务未配置。请在环境变量中设置 LLM_API_KEY 和 LLM_API_URL'
      });
    }

    // 准备翻译请求：结合上下文进行翻译
    const translations = await translateWithContext(items, context, {
      apiKey: API_KEY,
      apiUrl: API_URL,
      model: API_MODEL
    });

    res.json({
      success: true,
      translations: translations
    });

  } catch (error) {
    console.error('翻译接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '翻译失败'
    });
  }
});

// 翻译函数：结合上下文进行翻译
async function translateWithContext(items, context, apiConfig) {
  const { apiKey, apiUrl, model } = apiConfig;
  
  // 构建提示词，要求结合上下文进行翻译
  const itemsWithIndex = items.map((item, index) => `${index + 1}. ${item.text}`).join('\n');
  
  const prompt = `你是一个专业的翻译助手。请根据以下上下文语境，将英文单词或短语翻译成最贴切的中文。

【上下文原文】
${context.substring(0, 3000)}${context.length > 3000 ? '...' : ''}

【需要翻译的内容】
${itemsWithIndex}

【翻译要求】
1. 结合上下文语境，给出最合适、最贴切的中文翻译
2. 如果是短语或句子，保持整体的流畅性和自然性
3. 如果单词有多种含义，根据上下文选择最合适的翻译
4. 只返回翻译结果，严格按照编号顺序，每行一个翻译，不要包含序号

【输出格式示例】
翻译1
翻译2
翻译3

请直接输出翻译结果，不要添加任何其他文字说明：`;

  try {
    // 调用大模型API
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // 较低的温度以获得更准确的翻译
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable' // 阿里云API禁用SSE
        },
        timeout: 60000 // 增加超时时间到60秒
      }
    );

    // 解析API响应（兼容多种API格式）
    let translationText = '';
    
    // OpenAI兼容格式
    if (response.data.choices && response.data.choices.length > 0) {
      translationText = response.data.choices[0].message?.content?.trim() || '';
    }
    // 阿里云原生格式
    else if (response.data.output && response.data.output.text) {
      translationText = response.data.output.text.trim();
    }
    // 其他可能的格式
    else if (response.data.content) {
      translationText = response.data.content.trim();
    }
    // 直接字符串响应
    else if (typeof response.data === 'string') {
      translationText = response.data.trim();
    }
    
    if (!translationText) {
      console.error('API响应格式:', JSON.stringify(response.data, null, 2));
      throw new Error('无法从API响应中获取翻译结果，请检查API响应格式');
    }

    // 解析翻译结果 - 支持多种格式
    const translations = [];
    let lines = translationText.split('\n').filter(line => {
      const trimmed = line.trim();
      // 过滤掉空行和明显的说明文字
      return trimmed && 
             !trimmed.startsWith('翻译') && 
             !trimmed.startsWith('输出') &&
             !trimmed.startsWith('示例') &&
             !trimmed.match(/^[【【]/) && // 过滤掉中文括号开头
             trimmed.length > 0;
    });

    // 清理每行的内容（移除序号、分隔符等）
    lines = lines.map(line => {
      let cleaned = line.trim();
      // 移除行首的数字序号（如 "1. " 或 "1、"）
      cleaned = cleaned.replace(/^\d+[\.、]\s*/, '');
      // 如果包含分隔符 "|"，取后面的部分
      if (cleaned.includes('|')) {
        const parts = cleaned.split('|');
        cleaned = parts.length > 1 ? parts.slice(1).join('|').trim() : parts[0].trim();
      }
      // 移除可能的引号
      cleaned = cleaned.replace(/^["'「]|["'」]$/g, '');
      return cleaned.trim();
    }).filter(line => line.length > 0);

    // 按顺序分配翻译结果
    for (let i = 0; i < items.length; i++) {
      if (i < lines.length) {
        translations.push({
          key: items[i].key,
          translation: lines[i]
        });
      } else {
        // 如果翻译结果不足，尝试从已有结果中复用或使用原始文本
        translations.push({
          key: items[i].key,
          translation: items[i].text // 暂时使用原文，或可以提示翻译失败
        });
      }
    }

    console.log(`✅ 成功翻译 ${translations.length} 个条目`);
    return translations;

  } catch (error) {
    console.error('调用大模型API失败:', error.response?.data || error.message);
    throw new Error(`翻译服务调用失败: ${error.response?.data?.error?.message || error.message}`);
  }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 背单词数据存储文件路径（支持从根目录或 backend 目录运行）
const wordGroupsFile = fs.existsSync(path.join(__dirname, '../word-groups.json'))
  ? path.join(__dirname, '../word-groups.json')
  : path.join(__dirname, '../../word-groups.json');

// 确保背单词数据文件存在
if (!fs.existsSync(wordGroupsFile)) {
  fs.writeFileSync(wordGroupsFile, JSON.stringify([]));
}

// 读取背单词数据
function readWordGroups() {
  try {
    const data = fs.readFileSync(wordGroupsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取背单词数据失败:', error);
    return [];
  }
}

// 保存背单词数据
function saveWordGroups(groups) {
  try {
    fs.writeFileSync(wordGroupsFile, JSON.stringify(groups, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('保存背单词数据失败:', error);
    return false;
  }
}

// 添加候选词到背单词（需要登录）
app.post('/api/word-groups/add', requireLogin, (req, res) => {
  try {
    const { groupName, words } = req.body;

    if (!groupName || !words || !Array.isArray(words)) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供分组名称和单词列表' 
      });
    }

    const groups = readWordGroups();
    
    // 查找是否已存在该分组
    let groupIndex = groups.findIndex(g => g.groupName === groupName);
    
    if (groupIndex === -1) {
      // 创建新分组
      groups.push({
        groupName: groupName,
        words: [],
        createdAt: new Date().toISOString()
      });
      groupIndex = groups.length - 1;
    }

    // 合并单词，避免重复
    const existingWords = new Set(groups[groupIndex].words.map(w => w.key || w.text));
    words.forEach(word => {
      const wordKey = word.key || word.text;
      if (!existingWords.has(wordKey)) {
        groups[groupIndex].words.push({
          ...word,
          addedAt: new Date().toISOString()
        });
        existingWords.add(wordKey);
      }
    });

    // 更新修改时间
    groups[groupIndex].updatedAt = new Date().toISOString();

    if (saveWordGroups(groups)) {
      res.json({ 
        success: true, 
        message: '已添加到背单词',
        group: groups[groupIndex]
      });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    console.error('添加背单词失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有背单词分组（需要登录）
app.get('/api/word-groups', requireLogin, (req, res) => {
  try {
    const groups = readWordGroups();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('获取背单词分组失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取指定分组的单词（需要登录）
app.get('/api/word-groups/:groupName', requireLogin, (req, res) => {
  try {
    const { groupName } = req.params;
    const groups = readWordGroups();
    const group = groups.find(g => g.groupName === groupName);
    
    if (group) {
      res.json({ success: true, group });
    } else {
      res.status(404).json({ success: false, error: '分组不存在' });
    }
  } catch (error) {
    console.error('获取分组单词失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除分组（需要登录）
app.delete('/api/word-groups/:groupName', requireLogin, (req, res) => {
  try {
    const { groupName } = req.params;
    const groups = readWordGroups();
    const filteredGroups = groups.filter(g => g.groupName !== groupName);
    
    if (filteredGroups.length === groups.length) {
      return res.status(404).json({ success: false, error: '分组不存在' });
    }

    if (saveWordGroups(filteredGroups)) {
      res.json({ success: true, message: '分组已删除' });
    } else {
      res.status(500).json({ success: false, error: '删除失败' });
    }
  } catch (error) {
    console.error('删除分组失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 从分组中删除指定单词（需要登录）
app.delete('/api/word-groups/:groupName/words/:wordKey', requireLogin, (req, res) => {
  try {
    const { groupName, wordKey } = req.params;
    const groups = readWordGroups();
    const groupIndex = groups.findIndex(g => g.groupName === groupName);
    
    if (groupIndex === -1) {
      return res.status(404).json({ success: false, error: '分组不存在' });
    }

    groups[groupIndex].words = groups[groupIndex].words.filter(
      w => (w.key || w.text) !== wordKey
    );

    if (saveWordGroups(groups)) {
      res.json({ success: true, message: '单词已删除' });
    } else {
      res.status(500).json({ success: false, error: '删除失败' });
    }
  } catch (error) {
    console.error('删除单词失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`📁 当前工作目录: ${process.cwd()}`);
  console.log(`📂 __dirname: ${__dirname}`);
  console.log(`🌐 监听地址: 0.0.0.0:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 访问地址: http://localhost:${PORT}`);
  }
  console.log(`🚀 服务器已启动，等待请求...`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  console.error('Promise:', promise);
});


