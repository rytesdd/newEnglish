import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import { API_ENDPOINTS } from './config/api';
import './App.css';
import Login from './components/Login';
import FileUploader from './components/FileUploader';
import YouTubeInput from './components/YouTubeInput';
import TextDisplay from './components/TextDisplay';
import WordGroups from './components/WordGroups';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('parser'); // 'parser' 或 'wordgroups'
  const [parsedText, setParsedText] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('file'); // 'file' 或 'youtube'
  const [refreshWordGroups, setRefreshWordGroups] = useState(0);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_AUTH, {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = async () => {
    // 登录成功后，直接设置认证状态，然后验证
    setIsAuthenticated(true);
    // 延迟一下再验证，确保 Cookie 被浏览器保存
    setTimeout(async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CHECK_AUTH, {
          withCredentials: true
        });
        if (!response.data.isAuthenticated) {
          // 如果验证失败，重新设置为未登录
          setIsAuthenticated(false);
          message.error('登录状态验证失败，请重新登录');
        }
      } catch (error) {
        console.error('验证登录状态失败:', error);
        // 即使验证失败，也保持登录状态（因为登录接口已经成功了）
      }
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await axios.post(API_ENDPOINTS.LOGOUT, {}, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      message.success('已登出');
      // 清空当前内容
      setParsedText('');
      setFilename('');
      setError('');
    } catch (error) {
      message.error('登出失败');
    }
  };

  const handleFileParsed = (data) => {
    setParsedText(data.text);
    setFilename(data.filename);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setParsedText('');
    setFilename('');
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // 如果正在检查登录状态，显示加载中
  if (checkingAuth) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const handleWordsSaved = () => {
    // 当单词保存成功后，触发背单词页面刷新
    setRefreshWordGroups(prev => prev + 1);
  };

  // 已登录，显示主应用
  return (
    <div className="App">
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div className="tabs" style={{ flex: 1 }}>
            <button
              className={`tab-button ${currentPage === 'parser' ? 'active' : ''}`}
              onClick={() => setCurrentPage('parser')}
            >
              📄 文件解析
            </button>
            <button
              className={`tab-button ${currentPage === 'wordgroups' ? 'active' : ''}`}
              onClick={() => setCurrentPage('wordgroups')}
            >
              📚 背单词
            </button>
          </div>
          <Button 
            type="text" 
            onClick={handleLogout}
            style={{ marginLeft: '16px' }}
          >
            登出
          </Button>
        </div>

        {currentPage === 'wordgroups' ? (
          <WordGroups refreshTrigger={refreshWordGroups} />
        ) : (
          <>
            <div className="button-group" style={{ marginBottom: '20px' }}>
              <button
                className={`switch-button ${activeTab === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab('file')}
              >
                📄 上传文件
              </button>
              <button
                className={`switch-button ${activeTab === 'youtube' ? 'active' : ''}`}
                onClick={() => setActiveTab('youtube')}
              >
                🎥 YouTube 链接
              </button>
            </div>

            {activeTab === 'file' ? (
              <FileUploader
                onFileParsed={handleFileParsed}
                onError={handleError}
                onLoading={handleLoading}
              />
            ) : (
              <YouTubeInput
                onTranscriptParsed={handleFileParsed}
                onError={handleError}
                onLoading={handleLoading}
              />
            )}

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>{activeTab === 'file' ? '正在解析文件...' : '正在获取字幕...'}</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            )}

            {parsedText && (
              <TextDisplay
                text={parsedText}
                filename={filename}
                onWordsSaved={handleWordsSaved}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

